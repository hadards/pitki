import { supabase } from '../db/supabase-client.js';

/**
 * Create default categories for a new user
 * @param {string} userId - Telegram user ID
 */
export async function createDefaultCategories(userId) {
  const defaultCategories = ['Tech', 'Business', 'Health', 'Personal', 'Uncategorized'];

  const categories = defaultCategories.map(name => ({
    user_id: userId,
    name
  }));

  const { error } = await supabase
    .from('categories')
    .insert(categories);

  if (error && error.code !== '23505') { // Ignore unique constraint violations
    console.error('Error creating default categories:', error);
    throw error;
  }

  return defaultCategories;
}

/**
 * Get all categories for a user
 * @param {string} userId - Telegram user ID
 */
export async function getUserCategories(userId) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new category for a user
 * @param {string} userId - Telegram user ID
 * @param {string} categoryName - Category name
 */
export async function addCategory(userId, categoryName) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name: categoryName
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Category "${categoryName}" already exists.`);
    }
    console.error('Error adding category:', error);
    throw error;
  }

  return data;
}

/**
 * Handle /start command
 */
export async function handleStart(ctx) {
  const userId = ctx.from.id.toString();

  try {
    await createDefaultCategories(userId);

    await ctx.reply(
      '👋 Welcome to Pitki!\n\n' +
      'I help you collect and organize articles from around the web.\n\n' +
      '📌 Just send me a link, and I\'ll help you categorize it.\n' +
      '⏱️ You have 60 seconds to pick a category, or I\'ll save it to "Uncategorized".\n\n' +
      'Commands:\n' +
      '/addcategory <name> - Add a new category\n' +
      '/categories - List all your categories\n' +
      '/help - Show this message'
    );
  } catch (error) {
    await ctx.reply('Welcome back to Pitki! Send me a link to get started.');
  }
}

/**
 * Handle /addcategory command
 */
export async function handleAddCategory(ctx) {
  const userId = ctx.from.id.toString();
  const text = ctx.message.text;
  const categoryName = text.replace('/addcategory', '').trim();

  if (!categoryName) {
    await ctx.reply('Please provide a category name.\n\nUsage: /addcategory Finance');
    return;
  }

  try {
    await addCategory(userId, categoryName);
    await ctx.reply(`✅ Category "${categoryName}" added!`);
  } catch (error) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
}

/**
 * Handle /categories command
 */
export async function handleCategories(ctx) {
  const userId = ctx.from.id.toString();

  try {
    const categories = await getUserCategories(userId);

    if (categories.length === 0) {
      await ctx.reply('You don\'t have any categories yet. Use /start to create default ones.');
      return;
    }

    const categoryList = categories.map(cat => `• ${cat.name}`).join('\n');
    await ctx.reply(`📁 Your categories:\n\n${categoryList}`);
  } catch (error) {
    await ctx.reply('❌ Error fetching categories.');
  }
}

/**
 * Handle /help command
 */
export async function handleHelp(ctx) {
  await ctx.reply(
    '🤖 Pitki - Article Collection Bot\n\n' +
    'Send me any link, and I\'ll help you organize it!\n\n' +
    'Commands:\n' +
    '/start - Initialize your account\n' +
    '/addcategory <name> - Add a new category\n' +
    '/categories - List all your categories\n' +
    '/help - Show this message\n\n' +
    'Just send a URL or text, and I\'ll ask you to categorize it. ' +
    'You have 60 seconds to choose, or it goes to "Uncategorized".'
  );
}
