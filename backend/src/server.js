import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { bot } from './bot/telegram-bot.js';
import { categoriesRouter } from './api/categories.js';
import { articlesRouter } from './api/articles.js';
import { statsRouter } from './api/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-id']
}));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Pitki backend is running' });
});

// API routes
app.use('/api/categories', categoriesRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/stats', statsRouter);

// Start Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start Telegram bot
bot.launch()
  .then(() => {
    console.log('Telegram bot started successfully');
  })
  .catch((error) => {
    console.error('Error starting bot:', error);
  });

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  process.exit(0);
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  process.exit(0);
});
