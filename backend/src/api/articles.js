import express from 'express';
import { supabase } from '../db/supabase-client.js';

export const articlesRouter = express.Router();

// Get all articles for a user with filters
articlesRouter.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'];

  console.log(`📖 GET /api/articles - User: ${userId}, Filters:`, req.query);

  if (!userId) {
    return res.status(401).json({ error: 'User ID required in headers' });
  }

  try {
    let query = supabase
      .from('articles')
      .select('*, categories(name)')
      .eq('user_id', userId);

    // Apply filters
    if (req.query.category) {
      query = query.eq('category_id', req.query.category);
    }

    if (req.query.source) {
      query = query.eq('source', req.query.source);
    }

    if (req.query.search) {
      const searchTerm = `%${req.query.search}%`;
      query = query.or(`title.ilike.${searchTerm},url.ilike.${searchTerm},notes.ilike.${searchTerm}`);
    }

    if (req.query.from_date) {
      query = query.gte('created_at', req.query.from_date);
    }

    if (req.query.to_date) {
      query = query.lte('created_at', req.query.to_date);
    }

    // Sort
    const sort = req.query.sort === 'oldest' ? 'created_at' : 'created_at';
    const ascending = req.query.sort === 'oldest';
    query = query.order(sort, { ascending });

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Create a new article
articlesRouter.post('/', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { url, title, thumbnail_url, source, category_id, notes } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required in headers' });
  }

  if (!title || !source) {
    return res.status(400).json({ error: 'Title and source are required' });
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .insert({
        user_id: userId,
        url,
        title,
        thumbnail_url,
        source,
        category_id,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update an article
articlesRouter.put('/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id } = req.params;
  const { title, category_id, notes } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required in headers' });
  }

  try {
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete an article
articlesRouter.delete('/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required in headers' });
  }

  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});
