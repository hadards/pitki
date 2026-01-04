import express from 'express';
import { supabase } from '../db/supabase-client.js';

export const statsRouter = express.Router();

// Get statistics for a user
statsRouter.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID required in headers' });
  }

  try {
    // Get total articles count
    const { count: totalArticles, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) throw countError;

    // Get articles by category
    const { data: articlesByCategory, error: categoryError } = await supabase
      .from('articles')
      .select('category_id, categories(name)')
      .eq('user_id', userId);

    if (categoryError) throw categoryError;

    const categoryStats = articlesByCategory.reduce((acc, article) => {
      const categoryName = article.categories?.name || 'Unknown';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    const by_category = Object.entries(categoryStats).map(([category, count]) => ({
      category,
      count
    }));

    // Get articles by source
    const { data: articlesBySource, error: sourceError } = await supabase
      .from('articles')
      .select('source')
      .eq('user_id', userId);

    if (sourceError) throw sourceError;

    const sourceStats = articlesBySource.reduce((acc, article) => {
      const source = article.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const by_source = Object.entries(sourceStats).map(([source, count]) => ({
      source,
      count
    }));

    res.json({
      total_articles: totalArticles || 0,
      by_category,
      by_source
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});
