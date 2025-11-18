const express = require('express');
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static(__dirname));

// API endpoint to manually trigger update
app.post('/api/update', (req, res) => {
    exec('node update-results.js', (error, stdout, stderr) => {
        if (error) {
            console.error('Update error:', error);
            return res.status(500).json({ error: 'Update failed', details: error.message });
        }
        console.log('Update output:', stdout);
        res.json({ success: true, output: stdout });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Schedule automatic updates
// Run every hour during NFL game times (Sundays, Mondays, Thursdays)
// Times are in UTC (NFL games typically 18:00-04:00 UTC on game days)
cron.schedule('0 18-23,0-4 * 9-12,1-2 0,1,4', () => {
    console.log('Running scheduled NFL results update...');
    exec('node update-results.js', (error, stdout, stderr) => {
        if (error) {
            console.error('Scheduled update error:', error);
            return;
        }
        console.log('Scheduled update completed:', stdout);
    });
}, {
    timezone: "UTC"
});

// Also run a daily update at 6 AM UTC to catch any missed games
cron.schedule('0 6 * * *', () => {
    console.log('Running daily NFL results update...');
    exec('node update-results.js', (error, stdout, stderr) => {
        if (error) {
            console.error('Daily update error:', error);
            return;
        }
        console.log('Daily update completed:', stdout);
    });
}, {
    timezone: "UTC"
});

app.listen(PORT, () => {
    console.log(`🏈 NFL Skins Tracker running on port ${PORT}`);
    console.log(`📅 Cron jobs scheduled for automatic updates`);
    
    // Run initial update on startup
    console.log('Running initial update...');
    exec('node update-results.js', (error, stdout, stderr) => {
        if (error) {
            console.error('Initial update error:', error);
            return;
        }
        console.log('Initial update completed');
    });
});
