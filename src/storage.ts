import { AppData } from './types';

const STORAGE_KEY = 'nfl-skins-data';

/**
 * Save data to localStorage
 */
export function saveToLocalStorage(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Load data from localStorage
 */
export function loadFromLocalStorage(): AppData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Export data as JSON file
 */
export function exportToJSON(data: AppData): void {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `nfl-skins-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 */
export function importFromJSON(): Promise<AppData | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          console.error('Failed to parse JSON:', error);
          resolve(null);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  });
}

/**
 * Get default/sample data
 */
export function getDefaultData(): AppData {
  return {
    players: [
      { id: '1', name: 'Player 1', photoUrl: 'https://via.placeholder.com/100x100?text=P1' },
      { id: '2', name: 'Player 2', photoUrl: 'https://via.placeholder.com/100x100?text=P2' },
      { id: '3', name: 'Player 3', photoUrl: 'https://via.placeholder.com/100x100?text=P3' },
      { id: '4', name: 'Player 4', photoUrl: 'https://via.placeholder.com/100x100?text=P4' },
    ],
    picks: [
      // Week 1
      { playerId: '1', week: 1, teamCode: 'KC' },
      { playerId: '2', week: 1, teamCode: 'BUF' },
      { playerId: '3', week: 1, teamCode: 'KC' },
      { playerId: '4', week: 1, teamCode: 'DAL' },
      // Week 2
      { playerId: '1', week: 2, teamCode: 'SF' },
      { playerId: '2', week: 2, teamCode: 'PHI' },
      { playerId: '3', week: 2, teamCode: 'SF' },
      { playerId: '4', week: 2, teamCode: 'LAR' },
    ],
    gameResults: [
      { week: 1, winningTeamCodes: ['KC'] },
      { week: 2, winningTeamCodes: ['SF', 'PHI'] },
    ]
  };
}

