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
        
        // Update revenue (this goes to completed checkouts, not current active revenue)
        mockState.revenue.current += totalCharge;
        mockState.revenue.daily += totalCharge;
        
        // Remove player (this will reduce the active player revenue automatically)
        table.players.splice(playerIndex, 1);
        
        return { player, totalCharge };
      }
    }
    return null;
  },

  resetDailyTotal: () => {
    mockState.revenue.daily = 0;
  },

  getStats: () => {
    const activeTables = mockState.tables.filter(t => t.players.length > 0).length;
    
    // Calculate current revenue from all active players
    let activePlayerRevenue = 0;
    mockState.tables.forEach(table => {
      table.players.forEach(player => {
        const timeCharge = (player.timeMinutes / 60) * player.rate;
        activePlayerRevenue += timeCharge + player.additionalCharges;
      });
    });
    
    // Current revenue = completed checkouts + what active players currently owe
    const currentRevenue = mockState.revenue.current + activePlayerRevenue;
    
    return {
      activeTables,
      totalTables: mockState.tables.length,
      currentRevenue: currentRevenue,
      dailyTotal: mockState.revenue.daily
    };
  }
};