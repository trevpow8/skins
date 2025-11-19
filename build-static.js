#!/usr/bin/env node

// Build a static version of the NFL Skins tracker
// This creates a version that can be hosted on any static hosting platform

const fs = require('fs');
const path = require('path');

console.log('🏗️  Building static version of NFL Skins Tracker...');

// Read the current HTML
let html = fs.readFileSync('index.html', 'utf8');

// Read the current data files
const picks = JSON.parse(fs.readFileSync('data/picks.json', 'utf8'));
const results = JSON.parse(fs.readFileSync('data/results.json', 'utf8'));
const debts = JSON.parse(fs.readFileSync('data/debts.json', 'utf8'));

// Inject the data directly into the HTML
const dataScript = `
<script>
// Embedded data for static hosting
window.SKINS_DATA = {
    picks: ${JSON.stringify(picks, null, 2)},
    results: ${JSON.stringify(results, null, 2)},
    debts: ${JSON.stringify(debts, null, 2)}
};
</script>`;

// Insert the data script before the main script
html = html.replace('<script src="script.js"></script>', dataScript + '\n    <script src="script-static.js"></script>');

// Create a modified script.js that uses embedded data
let script = fs.readFileSync('script.js', 'utf8');

// Replace the fetch calls with direct data access
script = script.replace(
    /await Promise\.all\(\[\s*fetch\('\.\/data\/picks\.json'\),\s*fetch\('\.\/data\/results\.json'\),\s*fetch\('\.\/data\/debts\.json'\)\s*\]\);/,
    'await Promise.resolve([{json: () => window.SKINS_DATA.picks}, {json: () => window.SKINS_DATA.results}, {json: () => window.SKINS_DATA.debts}]);'
);

script = script.replace(
    /this\.picks = await picksResponse\.json\(\);\s*this\.results = await resultsResponse\.json\(\);\s*this\.debts = await debtsResponse\.json\(\);/,
    'this.picks = await picksResponse.json();\n            this.results = await resultsResponse.json();\n            this.debts = await debtsResponse.json();'
);

// Create build directory
if (!fs.existsSync('build')) {
    fs.mkdirSync('build');
}

// Write the static files
fs.writeFileSync('build/index.html', html);
fs.writeFileSync('build/script-static.js', script);
fs.writeFileSync('build/styles.css', fs.readFileSync('styles.css', 'utf8'));

// Create a simple update script for static hosting
const updateScript = `#!/usr/bin/env node

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
`;

fs.writeFileSync('build/update-static.js', updateScript);
fs.chmodSync('build/update-static.js', '755');

// Copy player pages
const playersDir = path.join('build', 'players');
if (!fs.existsSync(playersDir)) {
    fs.mkdirSync(playersDir);
}

if (fs.existsSync('players')) {
    const playerFiles = fs.readdirSync('players');
    playerFiles.forEach(file => {
        if (file.endsWith('.html')) {
            fs.copyFileSync(path.join('players', file), path.join(playersDir, file));
        }
    });
    console.log(`📄 Copied ${playerFiles.length} player biography pages`);
}

console.log('✅ Static build complete!');
console.log('📁 Files created in build/ directory:');
console.log('   • index.html (with embedded data)');
console.log('   • script-static.js (modified for static hosting)');
console.log('   • styles.css (copied)');
console.log('   • players/ (biography pages)');
console.log('   • update-static.js (manual update script)');
console.log('');
console.log('📤 Upload the build/ folder to any static hosting platform:');
console.log('   • GitHub Pages');
console.log('   • Netlify');
console.log('   • Vercel');
console.log('   • Surge.sh');
console.log('   • Firebase Hosting');
console.log('');
console.log('🔄 To update: run ./build/update-static.js then re-upload build/');
