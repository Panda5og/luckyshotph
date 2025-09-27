// Mock data and state management for Lucky Shot Pool Hall with offline persistence
const STORAGE_KEYS = {
  TABLES: 'poolhall_tables',
  REVENUE: 'poolhall_revenue',
  NEXT_TABLE_ID: 'poolhall_next_table_id'
};

// Load data from localStorage or use defaults
const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error loading from storage:', error);
    return defaultValue;
  }
};

// Save data to localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

export const mockState = {
  tables: loadFromStorage(STORAGE_KEYS.TABLES, [
    { id: 1, name: 'Table 1', players: [] },
    { id: 2, name: 'Table 2', players: [] },
    { id: 3, name: 'Table 3', players: [] },
    { id: 4, name: 'Table 4', players: [] },
    { id: 5, name: 'Table 5', players: [] }
  ]),
  revenue: loadFromStorage(STORAGE_KEYS.REVENUE, {
    current: 0,
    daily: 0
  }),
  nextTableId: loadFromStorage(STORAGE_KEYS.NEXT_TABLE_ID, 6)
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
    const currentSessionStart = new Date(player.lastResumeTime || player.startTime);
    const currentSessionElapsed = Math.floor((now - currentSessionStart) / 1000);
    totalElapsed = previousElapsed + currentSessionElapsed;
  }
  
  return Math.max(0, totalElapsed);
};

// Helper function to save all data to localStorage
const persistData = () => {
  saveToStorage(STORAGE_KEYS.TABLES, mockState.tables);
  saveToStorage(STORAGE_KEYS.REVENUE, mockState.revenue);
  saveToStorage(STORAGE_KEYS.NEXT_TABLE_ID, mockState.nextTableId);
};

// Mock functions to simulate backend operations with offline persistence
export const mockAPI = {
  addPlayer: (tableId, playerData) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const newPlayer = {
        id: Date.now(),
        name: playerData.name,
        rate: playerData.rate,
        rateType: playerData.rateType, // 'Adult' or 'Child'
        startTime: new Date().toISOString(),
        lastResumeTime: new Date().toISOString(),
        totalElapsedSeconds: 0,
        isPaused: false,
        additionalCharges: 0,
        comment: ''
      };
      table.players.push(newPlayer);
      persistData();
      return newPlayer;
    }
    return null;
  },

  togglePlayerTimer: (tableId, playerId) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const player = table.players.find(p => p.id === playerId);
      if (player) {
        const now = new Date().toISOString();
        
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
        persistData();
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
        const newTime = Math.max(0, (player.totalElapsedSeconds || 0) + (additionalMinutes * 60));
        player.totalElapsedSeconds = newTime;
        persistData();
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
        persistData();
        return player;
      }
    }
    return null;
  },

  checkoutPlayer: (tableId, playerId) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const player = table.players.find(p => p.id === playerId);
      if (player) {
        const totalSeconds = calculateElapsedTime(player);
        const timeCharge = (totalSeconds / 3600) * player.rate;
        const subtotal = timeCharge + player.additionalCharges;
        
        // Don't remove player yet - only prepare checkout data
        return { 
          players: [player], 
          subtotal, 
          totalSeconds: [totalSeconds],
          isTableCheckout: false,
          tableId,
          playerIds: [playerId]
        };
      }
    }
    return null;
  },

  checkoutTable: (tableId) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table && table.players.length > 0) {
      const players = [...table.players];
      let subtotal = 0;
      const totalSeconds = [];
      const playerIds = [];
      
      // Calculate total for all players
      players.forEach(player => {
        const seconds = calculateElapsedTime(player);
        const timeCharge = (seconds / 3600) * player.rate;
        subtotal += timeCharge + player.additionalCharges;
        totalSeconds.push(seconds);
        playerIds.push(player.id);
      });
      
      // Don't remove players yet - only prepare checkout data
      return { 
        players, 
        subtotal, 
        totalSeconds,
        isTableCheckout: true,
        tableName: table.name,
        tableId,
        playerIds
      };
    }
    return null;
  },

  completeCheckout: (checkoutData, includeTax = false) => {
    const taxRate = 0.0575; // 5.75%
    const tax = includeTax ? checkoutData.subtotal * taxRate : 0;
    const total = checkoutData.subtotal + tax;
    
    // Now actually remove the players from the table
    const table = mockState.tables.find(t => t.id === checkoutData.tableId);
    if (table) {
      checkoutData.playerIds.forEach(playerId => {
        const playerIndex = table.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          table.players.splice(playerIndex, 1);
        }
      });
    }
    
    // Add to daily total
    mockState.revenue.daily += total;
    persistData();
    
    return { 
      ...checkoutData, 
      tax, 
      total, 
      taxRate: includeTax ? taxRate : 0 
    };
  },

  addTable: () => {
    const newTable = {
      id: mockState.nextTableId,
      name: `Table ${mockState.nextTableId}`,
      players: []
    };
    mockState.tables.push(newTable);
    mockState.nextTableId++;
    persistData();
    return newTable;
  },

  deleteTable: (tableId) => {
    // Only allow deletion of tables with id > 5 (added tables)
    if (tableId <= 5) {
      return { error: "Cannot delete original tables (1-5)" };
    }
    
    const tableIndex = mockState.tables.findIndex(t => t.id === tableId);
    if (tableIndex !== -1) {
      const table = mockState.tables[tableIndex];
      
      // Don't allow deletion if table has active players
      if (table.players.length > 0) {
        return { error: "Cannot delete table with active players" };
      }
      
      mockState.tables.splice(tableIndex, 1);
      persistData();
      return { success: true, deletedTable: table };
    }
    return { error: "Table not found" };
  },

  resetDailyTotal: () => {
    mockState.revenue.daily = 0;
    mockState.revenue.current = 0;
    persistData();
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