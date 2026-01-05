# Pitki Deployment Guide - Render (All-in-One)

This guide walks through deploying Pitki to production using **only Render** - backend serves the frontend.

## Architecture

- **Render Web Service**: Serves both Angular frontend + Node.js backend API + Telegram bot
- **Database (Supabase)**: PostgreSQL (free tier, already configured)
- **Cron Service (cron-job.org)**: Pings backend every 10 minutes to prevent sleep (free)

**Total Cost: $0/month**

---

## Part 1: Prepare Code for Deployment

### 1.1 Build Frontend Locally (Test)

First, make sure the frontend builds correctly:

```bash
cd C:\Coding\Pitki\frontend\pitki-web
npm run build
```

Should complete without errors and create `dist/pitki-web/browser/` folder.

### 1.2 Test Backend Serving Frontend Locally

```bash
# Build frontend
cd C:\Coding\Pitki\backend
npm run build

# Start backend (serves both API and frontend)
npm start
```

Open browser: `http://localhost:3200`
- Should show your Angular app
- Test that it works (articles load, filters work)

Kill the server when done testing.

---

## Part 2: Push Code to GitHub

### 2.1 Create .gitignore

Make sure these files are NOT committed:

```bash
cd C:\Coding\Pitki

# Create/update .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
*.log
.DS_Store
frontend/pitki-web/dist/
frontend/pitki-web/.angular/
EOF
```

### 2.2 Commit and Push

```bash
git add .
git commit -m "Configure backend to serve frontend"
git push origin main
```

If you haven't set up git yet:

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit - Pitki article manager"

# Create GitHub repo and push
# Go to github.com, create new PUBLIC repository "pitki"
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/pitki.git
git branch -M main
git push -u origin main
```

---

## Part 3: Deploy to Render

### 3.1 Create Render Account

1. Go to https://render.com
2. Click **Get Started**
3. Sign up with **GitHub** (easiest - links your repos)
4. Authorize Render to access your GitHub repos

### 3.2 Create New Web Service

1. Click **New +** button (top right)
2. Select **Web Service**
3. Find and select your **pitki** repository
4. Click **Connect**

### 3.3 Configure Web Service

Fill in these settings:

**Basic Settings:**
- **Name**: `pitki` (or any name you like)
- **Region**: Choose closest to you (Frankfurt, Oregon, etc.)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node src/server.js`

**Instance Type:**
- Select **Free** (not Starter!)

**Environment Variables:**

Click **Add Environment Variable** and add these:

| Key | Value |
|-----|-------|
| `TELEGRAM_BOT_TOKEN` | your_bot_token_from_botfather |
| `SUPABASE_URL` | https://your-project.supabase.co |
| `SUPABASE_KEY` | your_supabase_anon_key |
| `PORT` | 10000 |
| `NODE_ENV` | production |

**Important**: Render uses port 10000, not 3200!

**Auto-Deploy:**
- Keep **Auto-Deploy** enabled (deploys on git push)

### 3.4 Deploy

1. Click **Create Web Service**
2. Wait 3-5 minutes for initial deployment (builds frontend + backend)
3. Watch the logs:
   - Should see npm install in frontend
   - Should see Angular build
   - Should see "Server running on port 10000"
   - Should see "Telegram bot started successfully"
4. **Copy your Render URL**: `https://pitki.onrender.com` (or whatever name you chose)

### 3.5 Test Deployment

**Test Web UI:**
```
https://pitki.onrender.com
```
Should show your Angular app.

**Test API:**
```
https://pitki.onrender.com/api/categories
```
Should return JSON with categories.

**Test Telegram Bot:**
Send a URL to your bot, should respond with category buttons.

---

## Part 4: Setup Cron Ping Service (Keep Backend Awake)

Render's free tier spins down after 15 minutes of inactivity. To keep it awake 24/7, we'll ping it every 10 minutes.

### 4.1 Create cron-job.org Account

1. Go to https://cron-job.org
2. Click **Sign up** (top right)
3. Create free account (no credit card needed)
4. Verify your email

### 4.2 Create Cron Job

1. After login, click **Cronjobs** in top menu
2. Click **Create cronjob**

**Settings:**

- **Title**: `Keep Pitki Awake`
- **Address (URL)**: `https://pitki.onrender.com/api/categories`
  - Replace `pitki` with YOUR Render service name
- **Schedule**:
  - **Every**: `10 minutes`
  - Or use advanced: `*/10 * * * *`
- **Request method**: `GET`
- **Request timeout**: `30 seconds`

**Notifications** (Optional):
- Enable "Notify me on failures" if you want email alerts

3. Click **Create cronjob**

### 4.3 Verify Cron Works

1. Wait 10 minutes
2. Check **Execution history** in cron-job.org
3. Should see successful pings (Status 200)
4. Your backend will now stay awake 24/7!

---

## Part 5: Testing

### 5.1 Test Web UI

1. Open `https://pitki.onrender.com`
2. Articles should load
3. Test filters, search, delete
4. Test "Remove All" button

### 5.2 Test Telegram Bot

1. Send a URL to your Telegram bot
2. Check Render logs:
   - Render Dashboard → pitki → Logs
   - Should see: "[BOT] Received message from user..."
3. Select a category
4. Verify article saved to Supabase
5. Refresh web UI
6. Article should appear

### 5.3 Test from Phone

1. Open Render URL on phone: `https://pitki.onrender.com`
2. Send article via Telegram
3. Refresh web UI
4. Article should appear

### 5.4 Verify Cron is Working

1. Wait 15+ minutes without using the app
2. Send article to Telegram bot
3. Should respond immediately (not wait 30-60 seconds)
4. If instant response, cron is working!

---

## Part 6: Monitoring & Maintenance

### View Logs

**Render Dashboard:**
1. Go to https://dashboard.render.com
2. Click **pitki**
3. Click **Logs** tab
4. See real-time logs (bot messages, API requests)

**Cron Logs:**
1. Go to https://cron-job.org
2. Click your cronjob
3. View **Execution history**

### Update Code

```bash
cd C:\Coding\Pitki

# Make your changes
git add .
git commit -m "Your changes"
git push origin main

# Render auto-deploys in 3-5 minutes
# (rebuilds frontend + restarts backend)
```

### Restart Service

If needed:
1. Render Dashboard → pitki
2. Click **Manual Deploy** → **Deploy latest commit**
3. Or use the restart button

### Check Service Status

**Render Dashboard shows:**
- Build status (success/failed)
- Deployment history
- CPU/Memory usage
- Response times

---

## Troubleshooting

### Frontend Shows 404

**Check:**
1. Frontend was built correctly (check Render build logs)
2. `dist/pitki-web/browser/` exists after build
3. Restart the service

### API Works but Frontend Doesn't

**Check Render build logs:**
```
Render Dashboard → Logs → Build logs
```

Should see:
```
cd ../frontend/pitki-web && npm install && npm run build
✔ Building...
Initial chunk files | Names | Raw size
main.js | main | 66.45 kB
...
```

If frontend build fails, fix the error and push again.

### Bot Not Receiving Messages

**Check:**
1. Render logs for errors
2. Service is running (green dot in dashboard)
3. TELEGRAM_BOT_TOKEN is correct
4. Try `/start` command

### Backend Sleeping Despite Cron

**Solutions:**
1. Check cron execution history for failures
2. Verify URL in cron matches Render URL exactly
3. Reduce ping interval to 5 minutes

### Frontend Calls Wrong API URL

If you see CORS errors or 404s:
1. Check `environment.prod.ts` has `apiUrl: '/api'` (relative URL)
2. Rebuild frontend: `cd backend && npm run build`
3. Push to GitHub
4. Render will redeploy

---

## Important Notes

### Render Free Tier Limits

- 750 hours/month runtime (enough for 24/7 with one app)
- Spins down after 15 min inactivity (prevented by cron)
- 512MB RAM (enough for your app)
- No credit card required
- Public GitHub repo required

### First Request After Sleep

If cron fails or you disable it:
- First request takes 30-60 seconds (cold start)
- Subsequent requests are instant
- This is why cron is important!

### Build Time

Initial deploy takes 3-5 minutes:
- Install backend dependencies (1 min)
- Install frontend dependencies (1-2 min)
- Build Angular (1-2 min)
- Start server (30 sec)

Updates usually take 2-3 minutes.

### Render URL is Permanent

Your URL won't change unless you delete the service.

Format: `https://SERVICE_NAME.onrender.com`

---

## Project Structure

After deployment, your Render service contains:

```
backend/
├── src/
│   ├── server.js          # Serves API + frontend
│   ├── bot/               # Telegram bot handlers
│   └── api/               # REST API endpoints
├── package.json           # Backend + build script
└── node_modules/

frontend/
└── pitki-web/
    └── dist/
        └── pitki-web/
            └── browser/   # Built Angular app (served by backend)
                ├── index.html
                ├── main.js
                └── ...
```

---

## URLs Summary

After deployment:

- **Everything**: `https://pitki.onrender.com`
  - Frontend: `https://pitki.onrender.com`
  - API: `https://pitki.onrender.com/api`
  - Categories: `https://pitki.onrender.com/api/categories`
  - Articles: `https://pitki.onrender.com/api/articles`
  - Stats: `https://pitki.onrender.com/api/stats`

- **Telegram Bot**: Works automatically (no URL)
- **Supabase Dashboard**: `https://app.supabase.com`
- **Cron Monitor**: `https://cron-job.org/members/jobs/`

---

## Cost Breakdown

- **Render (Everything)**: Free tier - $0/month
- **Supabase (Database)**: Free tier - $0/month
- **cron-job.org (Ping)**: Free - $0/month
- **GitHub (Code hosting)**: Free - $0/month

**Total: $0/month forever**

---

## Advantages of This Setup

1. **Single URL**: Everything on one domain
2. **Simpler**: Only one service to manage (not two)
3. **No CORS issues**: Frontend and API on same origin
4. **Faster**: No extra network hop between frontend and backend
5. **Free**: Still completely free

---

## Next Steps

1. Share the URL with friends
2. Add custom domain (optional - Render supports it)
3. Add more Telegram bot commands
4. Enhance the web UI
5. Setup error monitoring (Sentry free tier)

Enjoy your free, always-on article manager!
