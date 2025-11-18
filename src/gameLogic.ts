import { Player, Pick, GameResult, WeeklyResult, Debt, RunningTab } from './types';

export const AMOUNT_PER_LOSS = 7;

/**
 * Calculate winners and losers for a specific week
 */
export function calculateWeeklyResults(
  week: number,
  players: Player[],
  picks: Pick[],
  gameResults: GameResult[]
): WeeklyResult {
  const gameResult = gameResults.find(gr => gr.week === week);
  
  if (!gameResult || gameResult.winningTeamCodes.length === 0) {
    return { week, winners: [], losers: [] };
  }

  const weekPicks = picks.filter(pick => pick.week === week);
  const winners: string[] = [];
  const losers: string[] = [];

  weekPicks.forEach(pick => {
    if (gameResult.winningTeamCodes.includes(pick.teamCode)) {
      winners.push(pick.playerId);
    } else {
      losers.push(pick.playerId);
    }
  });

  return { week, winners, losers };
}

/**
 * Calculate all weekly results across the season
 */
export function calculateAllWeeklyResults(
  players: Player[],
  picks: Pick[],
  gameResults: GameResult[]
): WeeklyResult[] {
  const weeks = Array.from(new Set(picks.map(pick => pick.week))).sort((a, b) => a - b);
  return weeks.map(week => calculateWeeklyResults(week, players, picks, gameResults));
}

/**
 * Calculate running tab with netted debts
 */
export function calculateRunningTab(
  players: Player[],
  picks: Pick[],
  gameResults: GameResult[]
): RunningTab {
  const weeklyResults = calculateAllWeeklyResults(players, picks, gameResults);
  
  // Track gross debts between each pair of players
  const grossDebts = new Map<string, Map<string, number>>();
  
  // Initialize debt maps
  players.forEach(player => {
    grossDebts.set(player.id, new Map());
  });

  // Calculate gross debts for each week
  weeklyResults.forEach(({ winners, losers }) => {
    if (winners.length === 0) return; // No winners, no debts
    
    // Each loser owes each winner $7
    losers.forEach(loserId => {
      winners.forEach(winnerId => {
        const loserDebts = grossDebts.get(loserId)!;
        const currentDebt = loserDebts.get(winnerId) || 0;
        loserDebts.set(winnerId, currentDebt + AMOUNT_PER_LOSS);
      });
    });
  });

  // Net the debts (if A owes B $20 and B owes A $15, then A owes B $5)
  const playerDebts: Record<string, Debt[]> = {};
  const totalOwed: Record<string, number> = {};
  const totalOwedTo: Record<string, number> = {};

  players.forEach(player => {
    playerDebts[player.id] = [];
    totalOwed[player.id] = 0;
    totalOwedTo[player.id] = 0;
  });

  // Calculate netted debts
  players.forEach(playerA => {
    players.forEach(playerB => {
      if (playerA.id === playerB.id) return;
      
      const aOwesB = grossDebts.get(playerA.id)?.get(playerB.id) || 0;
      const bOwesA = grossDebts.get(playerB.id)?.get(playerA.id) || 0;
      
      if (aOwesB > bOwesA) {
        const netAmount = aOwesB - bOwesA;
        playerDebts[playerA.id].push({
          from: playerA.id,
          to: playerB.id,
          amount: netAmount
        });
        totalOwed[playerA.id] += netAmount;
        totalOwedTo[playerB.id] += netAmount;
      }
    });
  });

  return { playerDebts, totalOwed, totalOwedTo };
}

/**
 * Get NFL team codes for dropdown/selection
 */
export const NFL_TEAMS = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
  'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
  'LV', 'LAC', 'LAR', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
  'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WAS'
];

/**
 * Get team name from code
 */
export const TEAM_NAMES: Record<string, string> = {
  'ARI': 'Arizona Cardinals',
  'ATL': 'Atlanta Falcons',
  'BAL': 'Baltimore Ravens',
  'BUF': 'Buffalo Bills',
  'CAR': 'Carolina Panthers',
  'CHI': 'Chicago Bears',
  'CIN': 'Cincinnati Bengals',
  'CLE': 'Cleveland Browns',
  'DAL': 'Dallas Cowboys',
  'DEN': 'Denver Broncos',
  'DET': 'Detroit Lions',
  'GB': 'Green Bay Packers',
  'HOU': 'Houston Texans',
  'IND': 'Indianapolis Colts',
  'JAX': 'Jacksonville Jaguars',
  'KC': 'Kansas City Chiefs',
  'LV': 'Las Vegas Raiders',
  'LAC': 'Los Angeles Chargers',
  'LAR': 'Los Angeles Rams',
  'MIA': 'Miami Dolphins',
  'MIN': 'Minnesota Vikings',
  'NE': 'New England Patriots',
  'NO': 'New Orleans Saints',
  'NYG': 'New York Giants',
  'NYJ': 'New York Jets',
  'PHI': 'Philadelphia Eagles',
  'PIT': 'Pittsburgh Steelers',
  'SF': 'San Francisco 49ers',
  'SEA': 'Seattle Seahawks',
  'TB': 'Tampa Bay Buccaneers',
  'TEN': 'Tennessee Titans',
  'WAS': 'Washington Commanders'
};

