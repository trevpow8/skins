#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class NFLResultsUpdater {
    constructor() {
        this.dataDir = path.join(__dirname, 'data');
        // 2025 NFL season (started Sept 2024, ends Feb 2025)
        this.currentSeason = 2025;
        this.currentWeek = this.getCurrentNFLWeek();
    }

    getCurrentNFLWeek() {
        // More accurate NFL week calculation
        const now = new Date();
        
        // 2025 NFL season started September 5, 2024 (Week 1)
        // This handles cross-year seasons properly
        const seasonStart = new Date(2024, 8, 5); // September 5, 2024
        
        // Calculate weeks since season start
        const daysSinceStart = Math.floor((now - seasonStart) / (24 * 60 * 60 * 1000));
        const weeksSinceStart = Math.floor(daysSinceStart / 7);
        
        // NFL season is 18 weeks (weeks 1-18), then playoffs (weeks 19-22)
        const calculatedWeek = Math.max(1, Math.min(22, weeksSinceStart + 1));
        
        console.log(`Current date: ${now.toDateString()}`);
        console.log(`Season start: ${seasonStart.toDateString()}`);
        console.log(`Days since start: ${daysSinceStart}`);
        console.log(`Calculated NFL week: ${calculatedWeek}`);
        
        return calculatedWeek;
    }

    async loadJSON(filename) {
        try {
            const filePath = path.join(this.dataDir, filename);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error loading ${filename}:`, error.message);
            return null;
        }
    }

    async saveJSON(filename, data) {
        try {
            const filePath = path.join(this.dataDir, filename);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            console.log(`Saved ${filename} successfully`);
        } catch (error) {
            console.error(`Error saving ${filename}:`, error.message);
        }
    }

    async fetchNFLResults(week) {
        try {
            // Using ESPN API for NFL scores
            const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}&seasontype=2&dates=${this.currentSeason}`;
            
            console.log(`Fetching NFL results for week ${week}...`);
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'NFL-Skins-Tracker/1.0'
                }
            });

            return this.parseESPNResponse(response.data, week);
        } catch (error) {
            console.error(`Error fetching NFL results for week ${week}:`, error.message);
            return null;
        }
    }

    parseESPNResponse(data, week) {
        const games = [];
        
        if (!data.events) {
            console.log(`No events found for week ${week}`);
            return games;
        }

        data.events.forEach(event => {
            if (event.competitions && event.competitions[0]) {
                const competition = event.competitions[0];
                const competitors = competition.competitors;
                
                if (competitors && competitors.length === 2) {
                    const homeTeam = competitors.find(c => c.homeAway === 'home');
                    const awayTeam = competitors.find(c => c.homeAway === 'away');
                    
                    if (homeTeam && awayTeam && competition.status.type.completed) {
                        const homeScore = parseInt(homeTeam.score);
                        const awayScore = parseInt(awayTeam.score);
                        
                        // Add both teams' results
                        const homeResult = homeScore > awayScore ? 'win' : homeScore < awayScore ? 'loss' : 'tie';
                        const awayResult = awayScore > homeScore ? 'win' : awayScore < homeScore ? 'loss' : 'tie';
                        
                        games.push({
                            team: homeTeam.team.abbreviation,
                            opponent: awayTeam.team.abbreviation,
                            result: homeResult,
                            score: `${homeScore}-${awayScore}`
                        });
                        
                        games.push({
                            team: awayTeam.team.abbreviation,
                            opponent: homeTeam.team.abbreviation,
                            result: awayResult,
                            score: `${awayScore}-${homeScore}`
                        });
                    }
                }
            }
        });

        return games;
    }

    async updateResults() {
        console.log('Starting NFL results update...');
        
        // Load existing data
        const picks = await this.loadJSON('picks.json');
        const results = await this.loadJSON('results.json');
        
        if (!picks || !results) {
            console.error('Failed to load required data files');
            return;
        }

        // Get teams we need to track
        const trackedTeams = new Set();
        picks.players.forEach(player => {
            player.picks.forEach(pick => {
                trackedTeams.add(pick.team);
            });
        });

        console.log(`Tracking ${trackedTeams.size} teams:`, Array.from(trackedTeams).join(', '));

        // Update results for all weeks from 1 to current week
        const weeksToCheck = Array.from({length: this.currentWeek}, (_, i) => i + 1);
        console.log(`Checking weeks 1-${this.currentWeek} (current week: ${this.currentWeek})`);
        
        for (const week of weeksToCheck) {
            const newGames = await this.fetchNFLResults(week);
            
            if (newGames && newGames.length > 0) {
                // Filter to only tracked teams
                const relevantGames = newGames.filter(game => trackedTeams.has(game.team));
                
                if (relevantGames.length > 0) {
                    // Update or add week data
                    const existingWeek = results.weeks.find(w => w.week === week);
                    
                    if (existingWeek) {
                        // Merge with existing games
                        relevantGames.forEach(newGame => {
                            const existingGame = existingWeek.games.find(g => g.team === newGame.team);
                            if (existingGame) {
                                Object.assign(existingGame, newGame);
                            } else {
                                existingWeek.games.push(newGame);
                            }
                        });
                    } else {
                        // Add new week
                        results.weeks.push({
                            week: week,
                            games: relevantGames
                        });
                    }
                    
                    console.log(`Updated ${relevantGames.length} games for week ${week}`);
                }
            }
        }

        // Sort weeks
        results.weeks.sort((a, b) => a.week - b.week);

        // Save updated results
        await this.saveJSON('results.json', results);

        // Recalculate debts
        await this.calculateDebts(picks, results);
        
        const totalGames = results.weeks.reduce((sum, week) => sum + week.games.length, 0);
        console.log(`✅ NFL results update completed - ${results.weeks.length} weeks, ${totalGames} games processed`);
    }

    async calculateDebts(picks, results) {
        console.log('Recalculating debts...');
        
        const weeklyResults = [];
        const playerTotals = {};

        // Initialize player totals
        picks.players.forEach(player => {
            playerTotals[player.id] = {
                playerId: player.id,
                playerName: player.name,
                totalOwed: 0,
                totalOwing: 0,
                netPosition: 0
            };
        });

        // Process each week
        results.weeks.forEach(week => {
            const hits = [];
            
            // Check each player's picks against this week's results
            picks.players.forEach(player => {
                player.picks.forEach(pick => {
                    const game = week.games.find(g => g.team === pick.team);
                    
                    if (game && game.result !== 'tie') {
                        const pickHit = (pick.type === 'wins' && game.result === 'win') ||
                                       (pick.type === 'losses' && game.result === 'loss');
                        
                        if (pickHit) {
                            const amountOwed = (picks.players.length - 1) * 7; // $7 from each other player
                            
                            hits.push({
                                playerId: player.id,
                                playerName: player.name,
                                team: pick.team,
                                type: pick.type,
                                result: game.result,
                                amountOwed: amountOwed
                            });
                            
                            // Update totals
                            playerTotals[player.id].totalOwed += amountOwed;
                            
                            // Each other player owes $7
                            picks.players.forEach(otherPlayer => {
                                if (otherPlayer.id !== player.id) {
                                    playerTotals[otherPlayer.id].totalOwing += 7;
                                }
                            });
                        }
                    }
                });
            });
            
            if (hits.length > 0) {
                weeklyResults.push({
                    week: week.week,
                    hits: hits
                });
            }
        });

        // Calculate net positions
        Object.values(playerTotals).forEach(player => {
            player.netPosition = player.totalOwed - player.totalOwing;
        });

        // Create debts object
        const debts = {
            season: picks.season,
            lastUpdated: new Date().toISOString(),
            weeklyResults: weeklyResults,
            netDebts: Object.values(playerTotals)
        };

        await this.saveJSON('debts.json', debts);
        console.log('Debts recalculated successfully');
    }
}

// Main execution
async function main() {
    const updater = new NFLResultsUpdater();
    
    try {
        await updater.updateResults();
        
        // Regenerate player pages with updated data
        console.log('🔄 Regenerating player biography pages...');
        const { exec } = require('child_process');
        exec('node generate-player-pages.js', (error, stdout, stderr) => {
            if (error) {
                console.error('⚠️  Warning: Failed to regenerate player pages:', error.message);
            } else {
                console.log('✅ Player biography pages updated');
            }
        });
        
        console.log('✅ Update completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Update failed:', error.message);
        
        // Don't fail the workflow for common issues
        if (error.message.includes('timeout') || 
            error.message.includes('ENOTFOUND') || 
            error.message.includes('ECONNRESET') ||
            error.message.includes('No games found')) {
            console.log('⚠️  This appears to be a temporary network issue or no games scheduled. Exiting gracefully.');
            process.exit(0);
        }
        
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = NFLResultsUpdater;
