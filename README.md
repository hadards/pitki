# Pitki - Article Collection Bot

Save and organize articles from anywhere using a Telegram bot and browse them with a beautiful web interface.

## Features

- 📱 Save articles via Telegram from any app (Facebook, LinkedIn, Medium, WhatsApp, etc.)
- 🗂️ Organize articles with categories
- ⏱️ Auto-save to "Uncategorized" after 60 seconds if no category selected
- 🔍 Search and filter your collection
- 🖼️ Automatic thumbnail extraction from articles
- 🌐 Web interface for browsing and managing your collection

## Setup Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- npm
- A Supabase account (free tier works fine)
- A Telegram account

### 2. Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the **bot token** - you'll need it later

### 3. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to the SQL Editor in your Supabase dashboard
4. Copy the contents of `database/schema.sql` and run it in the SQL Editor
5. Go to Project Settings → API
6. Copy your **Project URL** and **anon/public key**

### 4. Install Backend

```bash
cd backend
npm install
```

### 5. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` file and add your credentials:

```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
NODE_ENV=development
```

### 6. Run the Backend

```bash
cd backend
npm start
```

You should see:
```
Server running on port 3000
Telegram bot started successfully
```

### 7. Test Your Bot

1. Open Telegram
2. Search for your bot (the username you created with BotFather)
3. Send `/start`
4. Try sending a link!

### 8. Set Up Frontend (Coming Next)

The Angular frontend setup will be in the `frontend/` directory.

## Usage

### Telegram Bot Commands

- `/start` - Initialize your account with default categories
- `/addcategory <name>` - Add a new category (e.g., `/addcategory Finance`)
- `/categories` - List all your categories
- `/help` - Show help message

### Saving Articles

1. Find an article on any platform (Facebook, LinkedIn, Medium, etc.)
2. Copy the link or text
3. Send it to your Telegram bot
4. Select a category from the buttons
5. Done! Article is saved

**Note:** If you don't select a category within 60 seconds, the article is automatically saved to "Uncategorized"

## Project Structure

```
pitki/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── bot/         # Telegram bot logic
│   │   ├── api/         # REST API routes
│   │   ├── db/          # Database connection
│   │   └── utils/       # Utilities (metadata scraper, source detector)
│   └── package.json
├── frontend/            # Angular web app (coming soon)
├── database/            # Database schema
└── docs/               # Documentation
```

## Tech Stack

- **Backend:** Node.js + Express + Telegraf
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Angular (coming soon)
- **Deployment:** Fly.io (instructions coming soon)

## Deployment to Fly.io

Instructions for deploying to Fly.io will be added after frontend is complete.

## Contributing

This is an open-source project. Feel free to fork and customize for your own use!

## License

MIT
