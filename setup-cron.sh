#!/bin/bash

# NFL Skins Tracker - Cron Job Setup Script
# This script sets up automated updates every hour during NFL season

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPDATE_SCRIPT="$SCRIPT_DIR/update-results.js"

echo "Setting up NFL Skins Tracker cron job..."
echo "Script directory: $SCRIPT_DIR"

# Create a temporary cron file
TEMP_CRON=$(mktemp)

# Get existing crontab (if any)
crontab -l 2>/dev/null > "$TEMP_CRON"

# Check if our job already exists
if grep -q "update-results.js" "$TEMP_CRON"; then
    echo "Cron job already exists. Updating..."
    # Remove existing entry
    grep -v "update-results.js" "$TEMP_CRON" > "${TEMP_CRON}.new"
    mv "${TEMP_CRON}.new" "$TEMP_CRON"
fi

# Add our cron job - runs every hour during typical NFL game times
# Sundays: 1 PM - 11 PM ET (18:00 - 04:00 UTC)
# Mondays: 8 PM - 11 PM ET (01:00 - 04:00 UTC)
# Thursdays: 8 PM - 11 PM ET (01:00 - 04:00 UTC)
echo "# NFL Skins Tracker - Update every hour during game times" >> "$TEMP_CRON"
echo "0 18-23,0-4 * 9-12,1-2 0,1,4 cd $SCRIPT_DIR && node update-results.js >> $SCRIPT_DIR/update.log 2>&1" >> "$TEMP_CRON"

# Install the new crontab
crontab "$TEMP_CRON"

# Clean up
rm "$TEMP_CRON"

echo "Cron job installed successfully!"
echo "The script will run every hour during NFL game times (Sun/Mon/Thu evenings)"
echo "Logs will be written to: $SCRIPT_DIR/update.log"
echo ""
echo "To view current cron jobs: crontab -l"
echo "To remove the cron job: crontab -e (then delete the NFL Skins line)"
echo ""
echo "You can also run updates manually with: npm run update"
