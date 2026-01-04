import express from 'express';
import { supabase } from '../db/supabase-client.js';

export const categoriesRouter = express.Router();

// Get all categories for a user
categoriesRouter.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID required in headers' });
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create a new category
categoriesRouter.post('/', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { name } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required in headers' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Category already exists' });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Delete a category
categoriesRouter.delete('/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required in headers' });
  }

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});
