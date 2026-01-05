import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { bot } from './bot/telegram-bot.js';
import { categoriesRouter } from './api/categories.js';
import { articlesRouter } from './api/articles.js';
import { statsRouter } from './api/stats.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-id']
}));
app.use(express.json());

// API routes (must come before static file serving)
app.use('/api/categories', categoriesRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/stats', statsRouter);

// Serve Angular static files
const frontendPath = path.join(__dirname, '../../frontend/pitki-web/dist/pitki-web/browser');
app.use(express.static(frontendPath));

// All non-API routes serve index.html (for Angular routing)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

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
