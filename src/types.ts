export interface Player {
  id: string;
  name: string;
  photoUrl?: string;
}

export interface Pick {
  playerId: string;
  week: number;
  teamCode: string; // NFL team code (e.g., "KC", "BUF", "DAL")
}

export interface GameResult {
  week: number;
  winningTeamCodes: string[]; // Can have multiple winners in a week
}

export interface WeeklyResult {
  week: number;
  winners: string[]; // Player IDs
  losers: string[]; // Player IDs
}

export interface Debt {
  from: string; // Player ID who owes
  to: string; // Player ID who is owed
  amount: number;
}

export interface AppData {
  players: Player[];
  picks: Pick[];
  gameResults: GameResult[];
}

export interface RunningTab {
  playerDebts: Record<string, Debt[]>; // Netted debts for each player
  totalOwed: Record<string, number>; // Total amount each player owes
  totalOwedTo: Record<string, number>; // Total amount each player is owed
}

