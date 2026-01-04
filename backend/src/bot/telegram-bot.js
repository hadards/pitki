import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import {
  handleStart,
  handleAddCategory,
  handleCategories,
  handleHelp
} from './commands.js';
import { handleMessage, handleCategorySelection } from './handlers.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

export const bot = new Telegraf(token);

// Command handlers
bot.command('start', handleStart);
bot.command('addcategory', handleAddCategory);
bot.command('categories', handleCategories);
bot.command('help', handleHelp);

// Message handlers
bot.on('text', handleMessage);

// Callback query handlers (for inline keyboard buttons)
bot.on('callback_query', handleCategorySelection);

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('An error occurred. Please try again.');
});

console.log('Telegram bot initialized');
