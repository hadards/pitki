# Pitki - Article Collection Bot Design Document

## Overview

Pitki is an article collection and organization system that allows users to save links and text from various sources (Facebook, LinkedIn, Medium, WhatsApp, etc.) via a Telegram bot and browse them through an Angular web interface.

## Goals

- Quick and easy way to save articles/links from any source without cluttering WhatsApp
- Organize saved content by categories
- Browse and search saved articles via web interface
- Share as open-source project for others to self-host

## System Architecture

### Components

1. **Telegram Bot** - Interface for saving articles
2. **Node.js Backend** (Express) - REST API + Telegram bot logic (single application)
3. **Supabase** (PostgreSQL) - Database for storing articles and categories
4. **Angular Frontend** - Web interface for browsing and managing articles

### Technology Stack

- **Backend:** Node.js + Express + Telegraf (Telegram bot library)
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Angular
- **Hosting:** Local development → Fly.io deployment
- **Metadata Extraction:** open-graph-scraper or metascraper

## User Flows

### Saving an Article

1. User finds article on Facebook/LinkedIn/Medium/etc.
2. User copies link or text
3. User sends to Telegram bot
4. Bot extracts:
   - URL
   - Title (from Open Graph metadata)
   - Thumbnail image (from Open Graph metadata)
   - Source (auto-detected from domain)
5. Bot displays category selection buttons
6. User selects category OR waits 60 seconds
7. If timeout (60 seconds): Article auto-saved to "Uncategorized"
8. If user selects: Article saved to chosen category
9. Bot confirms: "✅ Saved to [Category]!"

### Adding New Category

**Via Telegram Bot:**
1. User types: `/addcategory Finance`
2. Bot checks if category exists
3. Bot creates new category
4. Bot confirms: "✅ Category 'Finance' added!"

**Via Web Interface:**
1. User opens Settings page
2. User enters new category name
3. User clicks Add
4. Category created and available immediately

### Browsing Articles (Web Interface)

1. User opens Angular web app
2. User sees article list with filters:
   - Category dropdown
   - Source dropdown
   - Date range picker (Today, This Week, This Month, Custom)
   - Search box
3. User clicks article to open original link
4. User can delete articles

## Database Schema

### Tables

#### categories
```sql
id              UUID PRIMARY KEY
user_id         TEXT NOT NULL (Telegram user ID)
name            TEXT NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
```

#### articles
```sql
id              UUID PRIMARY KEY
user_id         TEXT NOT NULL (Telegram user ID)
url             TEXT (nullable for text-only entries)
title           TEXT NOT NULL
thumbnail_url   TEXT (nullable - Open Graph image)
source          TEXT NOT NULL
category_id     UUID REFERENCES categories(id)
notes           TEXT (nullable - optional user notes)
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### Default Categories

When a new user first messages the bot, automatically create:
- Tech
- Business
- Health
- Personal
- Uncategorized (for timeout auto-saves)

## API Design

### Endpoints

```
Authentication: Telegram user_id in headers

Categories:
GET    /api/categories              - Get all categories for user
POST   /api/categories              - Create new category
       Body: { name: string }
DELETE /api/categories/:id          - Delete category

Articles:
GET    /api/articles                - Get all articles with filters
       ?category=<id>                  Filter by category
       ?source=<name>                  Filter by source
       ?search=<query>                 Search in title/notes/url
       ?from_date=<date>               Articles from this date
       ?to_date=<date>                 Articles until this date
       ?sort=newest|oldest             Sort by date (default: newest)
POST   /api/articles                - Create new article
       Body: { url, title, thumbnail_url, source, category_id, notes }
PUT    /api/articles/:id            - Update article
       Body: { title?, category_id?, notes? }
DELETE /api/articles/:id            - Delete article

Statistics:
GET    /api/stats                   - Get user statistics
       Response: {
         total_articles,
         by_category: [{ category, count }],
         by_source: [{ source, count }]
       }
```

## Telegram Bot Behavior

### Message Processing

**When user sends a URL:**
1. Extract URL from message
2. Detect source from domain:
   - `facebook.com/*` → "Facebook"
   - `linkedin.com/*` → "LinkedIn"
   - `medium.com/*` → "Medium"
   - `twitter.com/*` or `x.com/*` → "Twitter/X"
   - `youtube.com/*` → "YouTube"
   - Unknown domains → domain name
3. Fetch metadata using open-graph-scraper:
   - Extract title from `og:title`
   - Extract thumbnail from `og:image`
4. Query user's categories from database
5. Send inline keyboard with category buttons
6. Start 60-second timeout timer
7. Handle response:
   - User clicks category → Save article, cancel timer
   - Timeout expires → Save to "Uncategorized", notify user

**When user sends text (no URL):**
1. Detect no URL in message
2. Set source = "Text/WhatsApp"
3. Use message text as title
4. Show category buttons (same flow as URL)

### Bot Commands

```
/start          - Welcome message, create default categories
/addcategory    - Add new category
                  Usage: /addcategory Finance
/categories     - List all categories
/help           - Show help message
```

### Timeout Behavior

When category selection buttons are shown:
- Start 60-second timer
- If user clicks button before timeout → normal save flow
- If timeout expires:
  - Save article to "Uncategorized" category
  - Send message: "⏱️ No category selected. Saved to 'Uncategorized'"
  - User can later recategorize via web interface

## Angular Web Interface

### Pages

#### 1. Articles List (Home Page)

**Header:**
- App name: "Pitki"
- Navigation: [Articles] [Settings]

**Filter Bar:**
- Category dropdown (All, Tech, Business, Health, etc.)
- Source dropdown (All, Facebook, LinkedIn, Medium, etc.)
- Date quick filters: [Today] [This Week] [This Month] [All Time]
- Custom date range picker
- Search box (searches title, URL, notes)

**Article Display:**
- Card layout showing:
  - Thumbnail image (if available, otherwise just text)
  - Title (clickable - opens URL in new tab)
  - Source badge
  - Category badge
  - Date saved (relative: "2 hours ago", "3 days ago")
  - Delete button
- Pagination or infinite scroll
- Empty state when no articles match filters

**Layout Examples:**

With thumbnail:
```
┌─────────────────────────────────────┐
│ [Thumbnail]  Title of Article       │
│  Image       Source: Medium          │
│              Category: Tech          │
│              Saved: 2 hours ago      │
│              [Delete]                │
└─────────────────────────────────────┘
```

Without thumbnail:
```
┌─────────────────────────────────────┐
│ Title of Article                    │
│ Source: WhatsApp                    │
│ Category: Personal                  │
│ Saved: 2 hours ago                  │
│ [Delete]                            │
└─────────────────────────────────────┘
```

#### 2. Settings Page

**Manage Categories Section:**
- List of all categories
- Add new category input field + button
- Delete button next to each category (with confirmation dialog)
- Warning when deleting category with articles

**Statistics Section:**
- Total articles saved
- Articles by category (list or chart)
- Articles by source (list or chart)

#### 3. Optional: Article Detail/Edit Page

- Full article information
- Edit title
- Edit/add notes
- Change category
- View thumbnail (if available)
- Open original URL button

### Design Principles

- **Mobile-first:** Primary usage will be on iPhone
- **Responsive:** Works on desktop too
- **Fast loading:** Lazy load thumbnails
- **Clean UI:** Minimal, focused on content
- **No icons/placeholders:** Only show thumbnails if they exist

## Source Detection Logic

Auto-detect source from URL domain:

```javascript
const detectSource = (url) => {
  if (!url) return 'Text/WhatsApp';

  const domain = new URL(url).hostname;

  if (domain.includes('facebook.com')) return 'Facebook';
  if (domain.includes('linkedin.com')) return 'LinkedIn';
  if (domain.includes('medium.com')) return 'Medium';
  if (domain.includes('twitter.com') || domain.includes('x.com')) return 'Twitter/X';
  if (domain.includes('youtube.com')) return 'YouTube';

  // Return domain name for unknown sources
  return domain.replace('www.', '');
};
```

## Deployment Strategy

### Phase 1: Local Development
- Run Node.js backend on local machine
- Use ngrok for Telegram webhook (if needed)
- Supabase cloud database
- Angular dev server

### Phase 2: Production (Fly.io)
- Deploy Node.js backend to Fly.io
- Configure Telegram webhook to Fly.io URL
- Keep using Supabase cloud database
- Build and serve Angular from same Node.js server OR deploy to Netlify/Vercel

### For Other Users (Open Source)
- GitHub repository with README
- Installation instructions:
  1. Install Node.js and npm
  2. Clone repository
  3. Create Supabase project
  4. Create Telegram bot via BotFather
  5. Configure environment variables
  6. Run `npm install` and `npm start`
- Users run their own instance on their own infrastructure

## Environment Variables

```
TELEGRAM_BOT_TOKEN=<from BotFather>
SUPABASE_URL=<your Supabase project URL>
SUPABASE_KEY=<your Supabase anon key>
PORT=3000
NODE_ENV=development|production
```

## Project Structure

```
pitki/
├── backend/
│   ├── src/
│   │   ├── bot/
│   │   │   ├── telegram-bot.js      # Main bot logic
│   │   │   ├── handlers.js          # Message handlers
│   │   │   └── commands.js          # Bot commands
│   │   ├── api/
│   │   │   ├── categories.js        # Category routes
│   │   │   ├── articles.js          # Article routes
│   │   │   └── stats.js             # Statistics routes
│   │   ├── db/
│   │   │   └── supabase-client.js   # Supabase connection
│   │   ├── utils/
│   │   │   ├── metadata-scraper.js  # Open Graph scraper
│   │   │   └── source-detector.js   # Source detection logic
│   │   └── server.js                # Main application entry
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── articles/            # Articles list component
│   │   │   ├── settings/            # Settings component
│   │   │   ├── services/            # API services
│   │   │   └── app.component.ts
│   │   └── environments/
│   ├── angular.json
│   └── package.json
├── database/
│   └── schema.sql                   # Database schema
├── docs/
│   └── plans/
│       └── 2026-01-04-pitki-design.md
└── README.md
```

## Future Enhancements (Not in MVP)

- Mark articles as read/unread
- Favorite/star articles
- Export articles to CSV/JSON
- Share articles with other users
- Browser extension for saving
- Archive old articles
- Full-text search in article content
- Tags/labels (in addition to categories)
- Article recommendations
- Read later integration (Pocket, Instapaper)

## Success Criteria

- User can save an article in under 5 seconds
- Bot responds within 2 seconds
- Web interface loads in under 3 seconds
- Search returns results instantly
- Works reliably on iPhone Safari
- Easy for others to self-host from GitHub

## Notes

- Keep it simple - avoid over-engineering
- Mobile experience is priority
- Self-hosted, privacy-focused
- No tracking or analytics
- Open source for community use
