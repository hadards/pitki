# Pitki - Article Collection Bot

Save and organize articles from anywhere using a Telegram bot and browse them with a beautiful web interface.

## Features

- Save articles via Telegram from any app (Facebook, LinkedIn, Medium, WhatsApp, etc.)
- Organize articles with categories
- Auto-save to "Uncategorized" after 60 seconds if no category selected
- Cancel button to abort saving
- Search and filter your collection by category, source, date range
- Automatic thumbnail extraction from articles
- Source detection (Facebook, LinkedIn, Medium, Twitter, YouTube, etc.)
- Web interface for browsing and managing your collection
- Remove all articles functionality
- Fully responsive design for phone and desktop

## Live Demo

- Deployed on Render (free tier)
- Frontend and backend served from single URL
- Always available at your Render URL

## Tech Stack

- **Backend:** Node.js + Express + Telegraf
- **Frontend:** Angular 20
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Render (free tier)
- **Keep-alive:** cron-job.org (prevents cold starts)

**Total Cost: $0/month**

---

## Quick Start (Local Development)

### Prerequisites

- Node.js v18 or higher
- npm
- A Supabase account (free tier)
- A Telegram account

### 1. Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the **bot token** - you'll need it later

### 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to the SQL Editor in your Supabase dashboard
4. Copy the contents of `database/schema.sql` and run it
5. Go to Project Settings → API
6. Copy your **Project URL** (REST API URL, not PostgreSQL connection string)
7. Copy your **anon/public key**

### 3. Configure Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and add your credentials:

```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
PORT=3200
NODE_ENV=development
```

### 4. Configure Frontend

Edit `frontend/pitki-web/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3200/api',
  userId: 'YOUR_TELEGRAM_USER_ID'  // Get this from backend logs when you message the bot
};
```

### 5. Build and Run

```bash
# From backend folder
cd backend

# Build frontend
npm run build

# Start server (serves both API and frontend)
npm start
```

Open browser: `http://localhost:3200`

### 6. Test Your Bot

1. Open Telegram
2. Search for your bot (the username you created with BotFather)
3. Send `/start` to initialize default categories
4. Send a URL to test article saving

---

## Deployment to Render (Free)

See detailed guide: **[docs/DEPLOYMENT-RENDER-SIMPLE.md](docs/DEPLOYMENT-RENDER-SIMPLE.md)**

### Quick Deploy Steps:

1. Push code to **public** GitHub repository
2. Sign up at [render.com](https://render.com) with GitHub
3. Create new Web Service:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `node src/server.js`
   - Add environment variables (TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_KEY, NODE_ENV=production)
4. Set up cron-job.org to ping your app every 10 minutes (keeps it awake)

**Your app will be live at:** `https://your-app-name.onrender.com`

---

## Usage

### Telegram Bot Commands

- `/start` - Initialize your account with default categories
- `/addcategory <name>` - Add a new category (e.g., `/addcategory Finance`)
- `/categories` - List all your categories
- `/help` - Show help message

### Saving Articles

1. Find an article on any platform (Facebook, LinkedIn, Medium, etc.)
2. Copy the link
3. Send it to your Telegram bot
4. Select a category from the buttons (or click Cancel to abort)
5. Done! Article is saved with thumbnail and source

**Note:** If you don't select a category within 60 seconds, the article is automatically saved to "Uncategorized"

### Web Interface

Access your deployed URL or `http://localhost:3200` locally:

- **Browse** all saved articles
- **Filter** by category, source, or date range
- **Search** by title
- **Delete** individual articles
- **Remove All** articles at once
- **Sort** by newest or oldest

---

## Project Structure

```
pitki/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── server.js          # Express server (serves API + frontend)
│   │   ├── bot/               # Telegram bot handlers
│   │   │   ├── telegram-bot.js
│   │   │   ├── handlers.js    # Message handlers
│   │   │   └── commands.js    # Bot commands
│   │   ├── api/               # REST API endpoints
│   │   │   ├── categories.js
│   │   │   ├── articles.js
│   │   │   └── stats.js
│   │   ├── db/                # Database connection
│   │   │   └── supabase.js
│   │   └── utils/             # Utilities
│   │       ├── metadata-scraper.js
│   │       └── source-detector.js
│   └── package.json
│
├── frontend/                   # Angular web app
│   └── pitki-web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/
│       │   │   │   ├── articles-list/
│       │   │   │   └── settings/
│       │   │   ├── services/
│       │   │   │   └── api.ts
│       │   │   ├── app.ts
│       │   │   └── app.routes.ts
│       │   ├── environments/
│       │   │   ├── environment.ts       # Development config
│       │   │   └── environment.prod.ts  # Production config
│       │   └── styles.css
│       └── package.json
│
├── database/                   # Database schema
│   └── schema.sql
│
├── docs/                       # Documentation
│   ├── DEPLOYMENT-RENDER-SIMPLE.md  # Render deployment guide
│   └── plans/
│
└── README.md
```

---

## Features in Detail

### Telegram Bot Features

- URL detection and metadata extraction
- Auto-detects source (Facebook, LinkedIn, Medium, Twitter, YouTube, etc.)
- Extracts article title and thumbnail using Open Graph
- 60-second timeout with auto-save to Uncategorized
- Cancel button to abort saving
- Category management via commands
- Error handling and user feedback

### Web Interface Features

- Clean, modern UI with custom CSS
- Responsive design (mobile and desktop)
- Filter by category, source, date range
- Text search across article titles
- Date range picker with presets (today, this week, this month)
- Delete individual articles
- Bulk delete all articles
- Article cards with thumbnails
- Time ago display (e.g., "2 hours ago")
- Statistics page with category and source breakdowns

### API Endpoints

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/articles` - List articles (with filters)
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `GET /api/stats` - Get statistics

---

## Environment Variables

### Backend (.env)

```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
PORT=3200                    # 3200 for local, Render sets this automatically
NODE_ENV=production          # production for deployed, development for local
```

### Frontend (environment files)

**Development** (`environment.ts`):
```typescript
{
  production: false,
  apiUrl: 'http://localhost:3200/api',
  userId: 'YOUR_TELEGRAM_USER_ID'
}
```

**Production** (`environment.prod.ts`):
```typescript
{
  production: true,
  apiUrl: '/api',  // Relative URL (same domain)
  userId: 'YOUR_TELEGRAM_USER_ID'
}
```

---

## Troubleshooting

### Bot not receiving messages
- Check backend logs for errors
- Verify TELEGRAM_BOT_TOKEN is correct
- Make sure bot is running (check Render logs)

### Articles not appearing in web UI
- Check browser console for errors
- Verify userId in environment files matches your Telegram ID
- Check Supabase for saved articles

### Frontend shows 404
- Make sure frontend was built: `npm run build` in backend folder
- Check Render build logs for errors
- Verify `dist/pitki-web/browser/` folder exists after build

### API errors
- Check Supabase URL and key are correct
- Verify RLS is disabled in Supabase tables
- Check backend logs for database errors

---

## Contributing

This is an open-source project. Feel free to fork and customize for your own use!

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

---

## License

MIT

---

## Acknowledgments

- Built with [Telegraf](https://telegraf.js.org/) for Telegram bot
- [Angular](https://angular.io/) for frontend
- [Supabase](https://supabase.com/) for database
- [Render](https://render.com/) for free hosting
- [cron-job.org](https://cron-job.org/) for keep-alive service (prevents cold starts)
- [open-graph-scraper](https://github.com/jshemas/openGraphScraper) for metadata extraction
