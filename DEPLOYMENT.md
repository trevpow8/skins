# NFL Skins Tracker - Deployment Guide

## 🚀 Free Hosting Options

### Option 1: Render (Recommended)
- ✅ **750 hours/month free** (31+ days of 24/7 hosting)
- ✅ **Free cron jobs**
- ✅ **GitHub integration**
- ✅ **Automatic HTTPS**

### Option 2: Vercel + GitHub Actions  
- ✅ **Unlimited free hosting**
- ✅ **GitHub Actions for updates** (2000 minutes/month)
- ✅ **Excellent performance**

### Option 3: Netlify + GitHub Actions
- ✅ **Free hosting**
- ✅ **GitHub Actions for updates**
- ✅ **Easy setup**

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

### Step 2A: Deploy to Render

1. **Sign up at Render**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

3. **Add Cron Job (Optional)**
   - Click "New +" → "Cron Job"
   - Connect same repository
   - **Build Command**: `npm install`
   - **Start Command**: `node update-results.js`
   - **Schedule**: `0 */1 * * *` (every hour)

### Step 2B: Deploy to Vercel

1. **Sign up at Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Node.js settings

3. **Enable GitHub Actions**
   - The `.github/workflows/update-nfl-results.yml` will handle updates
   - No additional setup needed

### Step 2C: Deploy to Netlify

1. **Sign up at Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with your GitHub account

2. **Deploy Site**
   - "Add new site" → "Import from Git"
   - Choose your repository
   - **Build command**: `npm run build` (if needed)
   - **Publish directory**: `.` (root)

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
