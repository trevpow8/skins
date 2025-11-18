# NFL Skins Tracker

A simple web application to track NFL "Skins" betting pools with automated game result updates.

## What are NFL Skins?

In NFL Skins, players draft teams before the season starts, choosing either:
- **Team Wins**: You get paid when that team wins
- **Team Losses**: You get paid when that team loses

When your pick hits, every other player owes you $7. The app tracks all picks and calculates net debts throughout the season.

## Features

- 📊 **Live Standings**: See current net positions for all players
- 📅 **Weekly Results**: Expandable view of which picks hit each week
- 🏈 **Team Tracking**: Monitor win/loss records for all drafted teams
- 🔄 **Auto Updates**: Automated fetching of NFL game results via ESPN API
- 💰 **Debt Calculation**: Automatic calculation of who owes whom

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Your Pool

Edit `data/picks.json` to add your players and their picks:

```json
{
  "season": "2024",
  "players": [
    {
      "id": "player1",
      "name": "John",
      "picks": [
        {
          "team": "BUF",
          "type": "wins",
          "teamName": "Buffalo Bills"
        }
      ]
    }
  ]
}
```

**Pick Types:**
- `"wins"`: Player gets paid when team wins
- `"losses"`: Player gets paid when team loses

**NFL Team Codes:**
ARI, ATL, BAL, BUF, CAR, CHI, CIN, CLE, DAL, DEN, DET, GB, HOU, IND, JAX, KC, LV, LAC, LAR, MIA, MIN, NE, NO, NYG, NYJ, PHI, PIT, SF, SEA, TB, TEN, WAS

### 3. Start the Web Server
```bash
npm start
```

The app will be available at `http://localhost:8080` (production) or `http://localhost:9000` (development)

### 4. Deploy to Production (Recommended)

For automatic updates and 24/7 availability:

```bash
./deploy.sh
```

This will guide you through deploying to Railway with automatic cron jobs.

**OR** for local cron jobs:
```bash
./setup-cron.sh
```

## Manual Operations

### Update Results Manually
```bash
npm run update
```

### Test the Update Script
```bash
node update-results.js
```

## File Structure

```
/
├── index.html          # Main web page
├── styles.css          # Styling
├── script.js           # Frontend JavaScript
├── update-results.js   # Automated update script
├── setup-cron.sh       # Cron job setup
├── data/
│   ├── picks.json      # Player picks configuration
│   ├── results.json    # NFL game results
│   └── debts.json      # Calculated debts and standings
└── package.json        # Node.js dependencies
```

## How It Works

1. **Data Sources**: 
   - Player picks are stored in `picks.json`
   - NFL results are fetched from ESPN's free API
   - Calculated debts are stored in `debts.json`

2. **Debt Calculation**:
   - When a pick hits, that player is owed $7 from each other player
   - Net positions are calculated (total owed minus total owing)
   - Results are updated in real-time on the web page

3. **Automation**:
   - Cron job runs during NFL game times
   - Fetches latest scores for tracked teams
   - Recalculates all debts automatically
   - Web page refreshes every 5 minutes

## Customization

### Change the Payout Amount
Edit the `$7` amounts in `update-results.js` (search for `* 7`)

### Add More Players
Add entries to the `players` array in `data/picks.json`

### Modify Update Schedule
Edit the cron schedule in `setup-cron.sh` or run `crontab -e`

## Troubleshooting

### Web Page Not Loading
- Make sure you're running `npm start`
- Check that port 8000 isn't in use
- Verify all JSON files are valid

### Updates Not Working
- Check `update.log` for error messages
- Test manually with `npm run update`
- Verify internet connection for ESPN API

### Cron Job Issues
- Check if cron is running: `ps aux | grep cron`
- View cron jobs: `crontab -l`
- Check system logs: `tail -f /var/log/cron`

## API Usage

The app uses ESPN's free NFL API:
- No API key required
- Rate limits apply (be respectful)
- Updates only during NFL season (September-February)

## License

MIT License - feel free to modify and distribute.
