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
  }
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
        timeMinutes: 0,
        additionalCharges: 0,
        startTime: new Date()
      };
      table.players.push(newPlayer);
      return newPlayer;
    }
    return null;
  },

  updatePlayerTime: (tableId, playerId, additionalMinutes) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const player = table.players.find(p => p.id === playerId);
      if (player) {
        player.timeMinutes += additionalMinutes;
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
        const timeCharge = (player.timeMinutes / 60) * player.rate;
        const totalCharge = timeCharge + player.additionalCharges;
        
        // Add to daily total only (not current revenue)
        mockState.revenue.daily += totalCharge;
        
        // Remove player (this will automatically reduce current revenue since it's calculated from active players only)
        table.players.splice(playerIndex, 1);
        
        return { player, totalCharge };
      }
    }
    return null;
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
        const timeCharge = (player.timeMinutes / 60) * player.rate;
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