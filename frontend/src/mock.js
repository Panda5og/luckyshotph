// Mock data and state management for Lucky Shot Pool Hall
export const mockState = {
  tables: [
    { id: 1, name: 'Table 1', players: [] },
    { id: 2, name: 'Table 2', players: [] },
    { id: 3, name: 'Table 3', players: [] },
    { id: 4, name: 'Table 4', players: [] },
    { id: 5, name: 'Table 5', players: [] }
  ],
  revenue: {
    current: 0,
    daily: 0
  },
  nextTableId: 6
};

// Helper function to format time in hh:mm:ss
export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Helper function to calculate elapsed seconds
export const calculateElapsedTime = (player) => {
  if (!player.startTime) return 0;
  
  let totalElapsed = 0;
  const now = new Date();
  
  if (player.isPaused) {
    // If currently paused, add time up to last pause
    totalElapsed = player.totalElapsedSeconds || 0;
  } else {
    // If running, add previous elapsed time plus current session
    const previousElapsed = player.totalElapsedSeconds || 0;
    const currentSessionStart = player.lastResumeTime || player.startTime;
    const currentSessionElapsed = Math.floor((now - currentSessionStart) / 1000);
    totalElapsed = previousElapsed + currentSessionElapsed;
  }
  
  return Math.max(0, totalElapsed);
};

// Mock functions to simulate backend operations
export const mockAPI = {
  addPlayer: (tableId, playerData) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const newPlayer = {
        id: Date.now(),
        name: playerData.name,
        rate: playerData.rate,
        rateType: playerData.rateType, // 'Adult' or 'Child'
        startTime: new Date(),
        lastResumeTime: new Date(),
        totalElapsedSeconds: 0,
        isPaused: false,
        additionalCharges: 0
      };
      table.players.push(newPlayer);
      return newPlayer;
    }
    return null;
  },

  togglePlayerTimer: (tableId, playerId) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const player = table.players.find(p => p.id === playerId);
      if (player) {
        const now = new Date();
        
        if (player.isPaused) {
          // Resume: set new resume time
          player.isPaused = false;
          player.lastResumeTime = now;
        } else {
          // Pause: calculate and store elapsed time
          const currentElapsed = calculateElapsedTime(player);
          player.totalElapsedSeconds = currentElapsed;
          player.isPaused = true;
        }
        return player;
      }
    }
    return null;
  },

  updatePlayerTime: (tableId, playerId, additionalMinutes) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const player = table.players.find(p => p.id === playerId);
      if (player) {
        // Add time as additional seconds to total elapsed
        player.totalElapsedSeconds = (player.totalElapsedSeconds || 0) + (additionalMinutes * 60);
        return player;
      }
    }
    return null;
  },

  addPlayerCharge: (tableId, playerId, amount) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const player = table.players.find(p => p.id === playerId);
      if (player) {
        player.additionalCharges += amount;
        return player;
      }
    }
    return null;
  },

  checkoutPlayer: (tableId, playerId) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const playerIndex = table.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const player = table.players[playerIndex];
        const totalSeconds = calculateElapsedTime(player);
        const timeCharge = (totalSeconds / 3600) * player.rate;
        const totalCharge = timeCharge + player.additionalCharges;
        
        // Add to daily total only (not current revenue)
        mockState.revenue.daily += totalCharge;
        
        // Remove player (this will automatically reduce current revenue since it's calculated from active players only)
        table.players.splice(playerIndex, 1);
        
        return { player, totalCharge, totalSeconds };
      }
    }
    return null;
  },

  addTable: () => {
    const newTable = {
      id: mockState.nextTableId,
      name: `Table ${mockState.nextTableId}`,
      players: []
    };
    mockState.tables.push(newTable);
    mockState.nextTableId++;
    return newTable;
  },

  resetDailyTotal: () => {
    mockState.revenue.daily = 0;
    mockState.revenue.current = 0; // Reset this too for consistency
  },

  getStats: () => {
    const activeTables = mockState.tables.filter(t => t.players.length > 0).length;
    
    // Calculate current revenue from ONLY active players (not completed checkouts)
    let currentRevenue = 0;
    mockState.tables.forEach(table => {
      table.players.forEach(player => {
        const totalSeconds = calculateElapsedTime(player);
        const timeCharge = (totalSeconds / 3600) * player.rate;
        currentRevenue += timeCharge + player.additionalCharges;
      });
    });
    
    return {
      activeTables,
      totalTables: mockState.tables.length,
      currentRevenue: currentRevenue, // Only active players
      dailyTotal: mockState.revenue.daily // Completed checkouts
    };
  }
};