-- Pitki Database Schema for Supabase (PostgreSQL)

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    url TEXT,
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    source TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for multi-user support
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view their own categories"
    ON categories FOR SELECT
    USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can insert their own categories"
    ON categories FOR INSERT
    WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can delete their own categories"
    ON categories FOR DELETE
    USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can view their own articles"
    ON articles FOR SELECT
    USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can insert their own articles"
    ON articles FOR INSERT
    WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can update their own articles"
    ON articles FOR UPDATE
    USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can delete their own articles"
    ON articles FOR DELETE
    USING (user_id = current_setting('app.current_user_id', TRUE));
