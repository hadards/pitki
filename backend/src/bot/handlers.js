import { supabase } from '../db/supabase-client.js';
import { detectSource } from '../utils/source-detector.js';
import { extractMetadata } from '../utils/metadata-scraper.js';
import { getUserCategories } from './commands.js';

// Store pending articles waiting for category selection
const pendingArticles = new Map();

/**
 * Check if text contains a URL
 * @param {string} text
 * @returns {string|null} - URL if found, null otherwise
 */
function extractUrl(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

/**
 * Handle incoming text messages
 */
export async function handleMessage(ctx) {
  const userId = ctx.from.id.toString();
  const messageText = ctx.message.text;
  const url = extractUrl(messageText);

  console.log(`[BOT] Received message from user ${userId}: ${messageText}`);

  let articleData = {
    userId,
    url: url || null,
    title: '',
    thumbnail: null,
    source: '',
    text: messageText
  };

  // Show typing indicator
  await ctx.sendChatAction('typing');

  if (url) {
    // Extract metadata from URL
    try {
      const metadata = await extractMetadata(url);
      articleData.title = metadata.title;
      articleData.thumbnail = metadata.thumbnail;
      articleData.source = detectSource(url);
    } catch (error) {
      console.error('Error extracting metadata:', error);
      articleData.title = url;
      articleData.source = detectSource(url);
    }
  } else {
    // No URL, treat as text
    articleData.title = messageText.substring(0, 100);
    articleData.source = 'Text/WhatsApp';
  }

  // Get user categories
  const categories = await getUserCategories(userId);

  if (categories.length === 0) {
    await ctx.reply('Please use /start first to create your categories.');
    return;
  }

  // Create inline keyboard with category buttons
  const keyboard = categories.map(cat => [{
    text: cat.name,
    callback_data: `category_${cat.id}`
  }]);

  // Add Cancel button at the end
  keyboard.push([{
    text: '❌ Cancel',
    callback_data: 'cancel'
  }]);

  // Send message with category selection
  const sentMessage = await ctx.reply(
    `Article: ${articleData.title}\nSource: ${articleData.source}\n\nSelect a category:`,
    {
      reply_markup: {
        inline_keyboard: keyboard
      }
    }
  );

  // Store pending article
  const articleId = `${userId}_${Date.now()}`;
  pendingArticles.set(articleId, articleData);

  // Set 60-second timeout
  setTimeout(async () => {
    if (pendingArticles.has(articleId)) {
      // Timeout expired, save to Uncategorized
      const data = pendingArticles.get(articleId);
      pendingArticles.delete(articleId);

      // Find Uncategorized category
      const uncategorized = categories.find(cat => cat.name === 'Uncategorized');

      if (uncategorized) {
        await saveArticle(data, uncategorized.id);
        await ctx.telegram.sendMessage(
          userId,
          'Timeout: No category selected. Saved to "Uncategorized"'
        );
      }
    }
  }, 60000); // 60 seconds
}

/**
 * Handle category selection (callback query)
 */
export async function handleCategorySelection(ctx) {
  const userId = ctx.from.id.toString();
  const callbackData = ctx.callbackQuery.data;

  console.log(`[BOT] User ${userId} callback: ${callbackData}`);

  // Find the pending article
  let articleData = null;
  let articleId = null;

  for (const [id, data] of pendingArticles.entries()) {
    if (data.userId === userId) {
      articleData = data;
      articleId = id;
      break;
    }
  }

  if (!articleData) {
    await ctx.answerCbQuery('Article already saved or expired.');
    return;
  }

  // Handle cancel
  if (callbackData === 'cancel') {
    pendingArticles.delete(articleId);
    await ctx.answerCbQuery();
    await ctx.editMessageText('Cancelled. Article not saved.');
    return;
  }

  const categoryId = callbackData.replace('category_', '');

  // Remove from pending
  pendingArticles.delete(articleId);

  // Save article
  try {
    await saveArticle(articleData, categoryId);

    // Get category name for confirmation
    const { data: category } = await supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .single();

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `Saved to "${category.name}"\n\nTitle: ${articleData.title}\nSource: ${articleData.source}`
    );
  } catch (error) {
    console.error('Error saving article:', error);
    await ctx.answerCbQuery('Error saving article. Please try again.');
  }
}

/**
 * Save article to database
 * @param {Object} articleData
 * @param {string} categoryId
 */
async function saveArticle(articleData, categoryId) {
  console.log(`[DB] Saving article: ${articleData.title} to category ${categoryId}`);

  const { error } = await supabase
    .from('articles')
    .insert({
      user_id: articleData.userId,
      url: articleData.url,
      title: articleData.title,
      thumbnail_url: articleData.thumbnail,
      source: articleData.source,
      category_id: categoryId,
      notes: articleData.url ? null : articleData.text
    });

  if (error) {
    console.error('[DB] Error saving article:', error);
    throw error;
  }

  console.log('[DB] Article saved successfully');
}
