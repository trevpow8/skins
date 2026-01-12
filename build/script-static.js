// NFL Skins Tracker Frontend Logic

class SkinsTracker {
    constructor() {
        this.picks = null;
        this.results = null;
        this.debts = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.renderAll();
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load data');
        }
    }

    async loadData() {
        try {
            const [picksResponse, resultsResponse, debtsResponse] = await Promise.resolve([{json: () => window.SKINS_DATA.picks}, {json: () => window.SKINS_DATA.results}, {json: () => window.SKINS_DATA.debts}]);

            this.picks = await picksResponse.json();
            this.results = await resultsResponse.json();
            this.debts = await debtsResponse.json();
        } catch (error) {
            throw new Error('Failed to fetch data files');
        }
    }

    renderAll() {
        this.renderHeader();
        this.renderPicks();
        this.renderDebts();
        this.renderWeeklyResults();
    }

    renderHeader() {
        const seasonYear = document.getElementById('season-year');
        const currentWeek = document.getElementById('current-week');
        const updateTime = document.getElementById('update-time');

        if (seasonYear) seasonYear.textContent = `${this.picks.season} Season`;
        
        if (currentWeek) {
            const latestWeek = Math.max(...this.results.weeks.map(w => w.week));
            currentWeek.textContent = `Week ${latestWeek}`;
        }

        if (updateTime && this.debts.lastUpdated) {
            const date = new Date(this.debts.lastUpdated);
            updateTime.textContent = date.toLocaleString();
        }
    }

    renderPicks() {
        const tbody = document.getElementById('picks-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.picks.players.forEach(player => {
            player.picks.forEach(pick => {
                const row = document.createElement('tr');
                
                // Calculate current record for this pick
                const record = this.calculatePickRecord(player.id, pick.team, pick.type);
                
                row.innerHTML = `
                    <td>
                        <div class="player-info">
                            <img src="${player.photoUrl || 'https://via.placeholder.com/32x32?text=?'}" 
                                 alt="${player.name}" class="player-photo">
                            <a href="players/${player.id}.html" class="player-link">${player.name}</a>
                        </div>
                    </td>
                    <td>${pick.team} - ${pick.teamName}</td>
                    <td><span class="pick-${pick.type}">${pick.type}</span></td>
                    <td>${record.hits}-${record.misses}</td>
                `;
                
                tbody.appendChild(row);
            });
        });
    }

    calculatePickRecord(playerId, team, pickType) {
        let hits = 0;
        let misses = 0;

        this.results.weeks.forEach(week => {
            const game = week.games.find(g => g.team === team);
            if (game && game.result !== 'tie') {
                const pickHit = (pickType === 'wins' && game.result === 'win') ||
                               (pickType === 'losses' && game.result === 'loss');
                
                if (pickHit) {
                    hits++;
                } else {
                    misses++;
                }
            }
        });

        return { hits, misses };
    }

    renderDebts() {
        const tbody = document.getElementById('debts-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Calculate skins-based standings
        const standings = this.calculateSkinsStandings();
        
        // Sort by net position (highest first)
        const sortedStandings = standings.sort((a, b) => b.netPosition - a.netPosition);

        sortedStandings.forEach(standing => {
            const row = document.createElement('tr');
            
            const netClass = standing.netPosition > 0 ? 'net-positive' : 
                           standing.netPosition < 0 ? 'net-negative' : 'net-zero';
            
            const netSymbol = standing.netPosition > 0 ? '+' : '';
            
            // Find player photo
            const player = this.picks.players.find(p => p.id === standing.playerId);
            const photoUrl = player?.photoUrl || 'https://via.placeholder.com/32x32?text=?';
            
            row.innerHTML = `
                <td>
                    <div class="player-info">
                        <img src="${photoUrl}" alt="${standing.playerName}" class="player-photo">
                        <a href="players/${standing.playerId}.html" class="player-link">${standing.playerName}</a>
                    </div>
                </td>
                <td>${standing.totalSkins}</td>
                <td class="${netClass}">${netSymbol}$${Math.abs(standing.netPosition)}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    calculateSkinsStandings() {
        const standings = [];
        
        // Count total skins for each player
        const playerSkins = {};
        let totalSkinsAcrossAllPlayers = 0;
        
        // Initialize player skins count
        this.picks.players.forEach(player => {
            playerSkins[player.id] = {
                playerId: player.id,
                playerName: player.name,
                totalSkins: 0
            };
        });
        
        // Count skins from weekly results
        this.debts.weeklyResults.forEach(week => {
            week.hits.forEach(hit => {
                if (playerSkins[hit.playerId]) {
                    playerSkins[hit.playerId].totalSkins++;
                    totalSkinsAcrossAllPlayers++;
                }
            });
        });
        
        // Calculate net positions
        Object.values(playerSkins).forEach(player => {
            // Each skin earns $42 (6 other players × $7)
            // Each other player's skin costs you $7
            const otherPlayersTotalSkins = totalSkinsAcrossAllPlayers - player.totalSkins;
            const netPosition = (player.totalSkins * 42) - (otherPlayersTotalSkins * 7);
            
            standings.push({
                playerId: player.playerId,
                playerName: player.playerName,
                totalSkins: player.totalSkins,
                netPosition: netPosition
            });
        });
        
        return standings;
    }

    renderWeeklyResults() {
        const container = document.getElementById('weekly-results');
        if (!container) return;

        container.innerHTML = '';

        // Sort weeks in descending order (most recent first)
        const sortedWeeks = [...this.debts.weeklyResults].sort((a, b) => b.week - a.week);

        sortedWeeks.forEach(weekData => {
            const weekCard = this.createWeekCard(weekData);
            container.appendChild(weekCard);
        });
    }

    createWeekCard(weekData) {
        const card = document.createElement('div');
        card.className = 'week-card';

        const header = document.createElement('div');
        header.className = 'week-header';
        
        // Display playoff weeks differently
        let weekLabel;
        if (weekData.week >= 19) {
            const playoffWeek = weekData.week - 18;
            const playoffNames = ['Wild Card', 'Divisional', 'Conference Championship', 'Super Bowl'];
            weekLabel = playoffWeek <= 4 ? `Playoff - ${playoffNames[playoffWeek - 1]}` : `Playoff Week ${playoffWeek}`;
        } else {
            weekLabel = `Week ${weekData.week}`;
        }
        
        header.innerHTML = `
            <span>${weekLabel} - ${weekData.hits.length} Hit${weekData.hits.length !== 1 ? 's' : ''}</span>
            <span class="expand-icon">▼</span>
        `;

        const content = document.createElement('div');
        content.className = 'week-content';

        if (weekData.hits.length === 0) {
            content.innerHTML = '<p>No picks hit this week.</p>';
        } else {
            weekData.hits.forEach(hit => {
                const hitItem = document.createElement('div');
                hitItem.className = 'hit-item';
                
                // Find player photo
                const player = this.picks.players.find(p => p.id === hit.playerId);
                const photoUrl = player?.photoUrl || 'https://via.placeholder.com/24x24?text=?';
                
                hitItem.innerHTML = `
                    <div class="hit-details">
                        <div class="player-info">
                            <img src="${photoUrl}" alt="${hit.playerName}" class="player-photo-small">
                            <a href="players/${hit.playerId}.html" class="player-link"><strong>${hit.playerName}</strong></a>
                        </div>
                        <span class="team-badge">${hit.team}</span>
                        <span class="pick-${hit.type}">${hit.type}</span>
                        <span>${hit.result}</span>
                    </div>
                    <div class="amount-owed">+$${hit.amountOwed}</div>
                `;
                
                content.appendChild(hitItem);
            });
        }

        // Add click handler for expand/collapse
        header.addEventListener('click', () => {
            const isExpanded = content.classList.contains('expanded');
            const icon = header.querySelector('.expand-icon');
            
            if (isExpanded) {
                content.classList.remove('expanded');
                icon.classList.remove('expanded');
            } else {
                content.classList.add('expanded');
                icon.classList.add('expanded');
            }
        });

        card.appendChild(header);
        card.appendChild(content);
        
        return card;
    }

    showError(message) {
        const container = document.querySelector('.container');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        container.insertBefore(errorDiv, container.firstChild);
    }

    // Method to refresh data (can be called periodically)
    async refresh() {
        try {
            await this.loadData();
            this.renderAll();
            console.log('Data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.skinsTracker = new SkinsTracker();
    
    // Auto-refresh every 5 minutes
    setInterval(() => {
        window.skinsTracker.refresh();
    }, 5 * 60 * 1000);
});

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}
