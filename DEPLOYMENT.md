# NFL Skins Tracker - Deployment Guide

## 🚀 Deploy to Railway (Recommended)

Railway provides free hosting with automatic cron jobs - perfect for the NFL Skins tracker.

### Step 1: Prepare Your Code

1. **Create a GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: NFL Skins Tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/nfl-skins-tracker.git
   git push -u origin main
   ```

### Step 2: Deploy to Railway

1. **Sign up at Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `nfl-skins-tracker` repository

3. **Configure Environment**
   - Railway will automatically detect it's a Node.js project
   - The `railway.json` file will configure the deployment
   - No additional environment variables needed

4. **Deploy**
   - Railway will automatically build and deploy
   - You'll get a URL like `https://your-app-name.railway.app`

### Step 3: Verify Deployment

1. **Check the App**
   - Visit your Railway URL
   - Verify the NFL Skins tracker loads correctly
   - Check that all data displays properly

2. **Test Manual Update**
   - Visit `https://your-app-name.railway.app/api/update` (POST request)
   - Or use the Railway logs to see automatic updates

3. **Monitor Cron Jobs**
   - Check Railway logs to see scheduled updates running
   - Updates run every hour during NFL game times
   - Daily update at 6 AM UTC

## 🔄 Automatic Updates Schedule

The app automatically updates NFL results:

- **Game Times**: Every hour during NFL games (Sun/Mon/Thu evenings)
- **Daily Backup**: 6 AM UTC every day to catch missed games
- **Manual Trigger**: POST to `/api/update` endpoint

## 🛠 Alternative: Deploy to Render

If you prefer Render:

1. **Sign up at Render**
   - Go to [render.com](https://render.com)
   - Connect your GitHub account

2. **Create Web Service**
   - New → Web Service
   - Connect your repository
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Cron Job**
   - Create a new "Cron Job" service
   - Command: `node update-results.js`
   - Schedule: `0 */1 * * *` (every hour)

## 🔧 Local Development

For local development, use:
```bash
npm run start:dev  # Starts Python server on port 9000
```

For production testing:
```bash
npm start  # Starts Express server with cron jobs
```

## 📊 Monitoring

- **Health Check**: `GET /api/health`
- **Manual Update**: `POST /api/update`
- **Logs**: Check your hosting platform's logs for cron job execution

## 🏈 NFL Season Schedule

The cron jobs are configured for:
- **Months**: September-December, January-February
- **Days**: Sunday (0), Monday (1), Thursday (4)
- **Times**: 6 PM - 4 AM UTC (covers all US time zones)

## 🚨 Troubleshooting

**If updates aren't working:**
1. Check hosting platform logs
2. Verify ESPN API is accessible
3. Test manual update endpoint
4. Check team abbreviations in `picks.json`

**If app won't load:**
1. Check that all dependencies are in `package.json`
2. Verify `server.js` is the start command
3. Check hosting platform build logs

## 💰 Cost

- **Railway**: Free tier includes 500 hours/month (enough for 24/7)
- **Render**: Free tier includes 750 hours/month
- **Heroku**: Free tier discontinued, paid plans start at $7/month

Railway is recommended for the best free tier experience with cron jobs.
