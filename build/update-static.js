#!/usr/bin/env node

// Simple update script for static hosting
// Run this locally and then upload the build/ folder

const { exec } = require('child_process');
const fs = require('fs');

console.log('🔄 Updating NFL results...');

exec('node update-results.js', (error, stdout, stderr) => {
    if (error) {
        console.error('Update failed:', error);
        return;
    }
    
    console.log('✅ Results updated');
    console.log('🏗️  Rebuilding static site...');
    
    exec('node build-static.js', (error, stdout, stderr) => {
        if (error) {
            console.error('Build failed:', error);
            return;
        }
        
        console.log('✅ Static site rebuilt in build/ directory');
        console.log('📤 Upload the build/ folder to your hosting platform');
    });
});
