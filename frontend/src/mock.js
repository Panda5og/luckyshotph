// Mock data and state management for Lucky Shot Pool Hall with offline persistence
const STORAGE_KEYS = {
  TABLES: 'poolhall_tables',
  REVENUE: 'poolhall_revenue',
  NEXT_TABLE_ID: 'poolhall_next_table_id',
  DAILY_ANALYTICS: 'poolhall_daily_analytics',
  SETTINGS: 'poolhall_settings'
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
    { id: 1, name: 'Table 1', players: [], tableTimerHours: 0 },
    { id: 2, name: 'Table 2', players: [], tableTimerHours: 0 },
    { id: 3, name: 'Table 3', players: [], tableTimerHours: 0 },
    { id: 4, name: 'Table 4', players: [], tableTimerHours: 0 },
    { id: 5, name: 'Table 5', players: [], tableTimerHours: 0 }
  ]),
  revenue: loadFromStorage(STORAGE_KEYS.REVENUE, {
    current: 0,
    daily: 0
  }),
  nextTableId: loadFromStorage(STORAGE_KEYS.NEXT_TABLE_ID, 6),
  dailyAnalytics: loadFromStorage(STORAGE_KEYS.DAILY_ANALYTICS, {
    totalPlayers: 0,
    adults: 0,
    children: 0,
    members: 0,
    totalTax: 0,
    totalRevenue: 0,
    totalDiscount: 0,
    timeValue: 0,
    extraValue: 0,
    extraItems: [] // Detailed list of extra items
  }),
  settings: loadFromStorage(STORAGE_KEYS.SETTINGS, {
    rates: {
      adult: 5.00,
      child: 2.00,
      member: 0.00
    },
    taxRate: 0.0575 // 5.75%
  })
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
  saveToStorage(STORAGE_KEYS.DAILY_ANALYTICS, mockState.dailyAnalytics);
  saveToStorage(STORAGE_KEYS.SETTINGS, mockState.settings);
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
        rateType: playerData.rateType, // 'Adult', 'Child', or 'Member'
        startTime: new Date().toISOString(),
        lastResumeTime: new Date().toISOString(),
        totalElapsedSeconds: 0,
        isPaused: false,
        additionalCharges: 0,
        comment: ''
      };
      table.players.push(newPlayer);
      
      // Update analytics
      mockState.dailyAnalytics.totalPlayers++;
      if (playerData.rateType === 'Adult') mockState.dailyAnalytics.adults++;
      else if (playerData.rateType === 'Child') mockState.dailyAnalytics.children++;
      else if (playerData.rateType === 'Member') mockState.dailyAnalytics.members++;
      
      persistData();
      return newPlayer; // Return the new player
    }
    return null;
  },

  setTableTimer: (tableId, hours) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      table.tableTimerHours = Math.max(0, hours);
      persistData();
      return table;
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
        // Ensure charges don't go below 0
        player.additionalCharges = Math.max(0, player.additionalCharges + amount);
        persistData();
        return player;
      }
    }
    return null;
  },

  updatePlayerComment: (tableId, playerId, comment) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const player = table.players.find(p => p.id === playerId);
      if (player) {
        player.comment = comment;
        persistData();
        return player;
      }
    }
    return null;
  },

  addPlayerExtraItem: (tableId, playerId, itemData) => {
    const table = mockState.tables.find(t => t.id === tableId);
    if (table) {
      const player = table.players.find(p => p.id === playerId);
      if (player) {
        // Initialize extraItems array if it doesn't exist
        if (!player.extraItems) {
          player.extraItems = [];
        }
        
        // Add the extra item to the player
        player.extraItems.push({
          id: Date.now(),
          description: itemData.description,
          amount: itemData.amount,
          timestamp: new Date().toISOString()
        });
        
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
        const extraItemsTotal = player.extraItems ? 
          player.extraItems.reduce((sum, item) => sum + item.amount, 0) : 0;
        const subtotal = timeCharge + player.additionalCharges + extraItemsTotal;
        
        // Don't remove player yet - only prepare checkout data
        return { 
          players: [player], 
          subtotal, 
          totalSeconds: [totalSeconds],
          timeChargeOnly: timeCharge + player.additionalCharges, // Time-based charges only
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
      let timeChargeOnly = 0;
      const totalSeconds = [];
      const playerIds = [];
      
      // Calculate total for all players
      players.forEach(player => {
        const seconds = calculateElapsedTime(player);
        const timeCharge = (seconds / 3600) * player.rate;
        const extraItemsTotal = player.extraItems ? 
          player.extraItems.reduce((sum, item) => sum + item.amount, 0) : 0;
        subtotal += timeCharge + player.additionalCharges + extraItemsTotal;
        timeChargeOnly += timeCharge + player.additionalCharges; // Time-based charges only
        totalSeconds.push(seconds);
        playerIds.push(player.id);
      });
      
      // Don't remove players yet - only prepare checkout data
      return { 
        players, 
        subtotal, 
        totalSeconds,
        timeChargeOnly, // Time-based charges only
        isTableCheckout: true,
        tableName: table.name,
        tableId,
        playerIds
      };
    }
    return null;
  },

  completeCheckout: (checkoutData, checkoutOptions) => {
    const { 
      includeTax = false, 
      discount = 0, 
      extraItems = [], 
      subtotal, 
      extraItemsTotal = 0 
    } = checkoutOptions;
    
    // Get time-based charges only (excluding extra items)
    const timeChargeOnly = checkoutData.timeChargeOnly || subtotal;
    
    const taxRate = mockState.settings?.taxRate || 0.0575; // Use dynamic tax rate
    const subtotalWithExtras = subtotal + extraItemsTotal;
    const discountAmount = Math.min(discount, subtotalWithExtras);
    
    // Calculate tax only on items (extraItems), not on player time charges
    const timeCharges = Math.max(0, subtotal - Math.min(discount, subtotal)); // Time charges after discount
    const itemCharges = Math.max(0, extraItemsTotal - Math.max(0, discount - subtotal)); // Items after remaining discount
    const tax = includeTax ? itemCharges * taxRate : 0; // Tax only applies to items
    const total = timeCharges + itemCharges + tax;
    
    // Now actually remove the players from the table and collect their extra items
    const table = mockState.tables.find(t => t.id === checkoutData.tableId);
    const allPlayerExtraItems = [];
    
    if (table) {
      checkoutData.playerIds.forEach(playerId => {
        const playerIndex = table.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          const player = table.players[playerIndex];
          
          // Collect player extra items before removing the player
          if (player.extraItems && player.extraItems.length > 0) {
            player.extraItems.forEach(item => {
              allPlayerExtraItems.push({
                description: `${item.description} (${player.name})`,
                amount: item.amount,
                type: 'player_item',
                timestamp: item.timestamp
              });
            });
          }
          
          table.players.splice(playerIndex, 1);
        }
      });
    }
    
    // Update analytics
    mockState.dailyAnalytics.totalRevenue += total;
    mockState.dailyAnalytics.totalTax += tax;
    mockState.dailyAnalytics.totalDiscount += discountAmount;
    mockState.dailyAnalytics.timeValue += timeChargeOnly; // Only actual time-based charges
    mockState.dailyAnalytics.extraValue += extraItemsTotal;
    
    // Initialize extraItems array if it doesn't exist (for backward compatibility)
    if (!mockState.dailyAnalytics.extraItems) {
      mockState.dailyAnalytics.extraItems = [];
    }
    
    // Add checkout extra items to detailed tracking
    if (extraItems && extraItems.length > 0) {
      extraItems.forEach(item => {
        mockState.dailyAnalytics.extraItems.push({
          description: item.description,
          amount: item.amount,
          type: 'checkout',
          timestamp: new Date().toISOString()
        });
      });
    }
    
    // Add player extra items to detailed tracking
    allPlayerExtraItems.forEach(item => {
      mockState.dailyAnalytics.extraItems.push(item);
      // Also add to extraValue since these are extra charges
      mockState.dailyAnalytics.extraValue += item.amount;
      mockState.dailyAnalytics.totalRevenue += item.amount;
    });
    
    // Add to daily total
    mockState.revenue.daily += total;
    persistData();
    
    return { 
      ...checkoutData,
      ...checkoutOptions,
      tax, 
      total, 
      taxRate: includeTax ? taxRate : 0,
      discountAmount,
      afterDiscount
    };
  },

  addTable: () => {
    const newTable = {
      id: mockState.nextTableId,
      name: `Table ${mockState.nextTableId}`,
      players: [],
      tableTimerHours: 0
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

  getCurrentAnalytics: () => {
    // Ensure extraItems exists for backward compatibility
    if (!mockState.dailyAnalytics.extraItems) {
      mockState.dailyAnalytics.extraItems = [];
    }
    
    // Return a copy of current analytics without resetting anything
    return {
      totalPlayers: mockState.dailyAnalytics.totalPlayers,
      adults: mockState.dailyAnalytics.adults,
      children: mockState.dailyAnalytics.children,
      members: mockState.dailyAnalytics.members,
      totalTax: mockState.dailyAnalytics.totalTax,
      totalRevenue: mockState.dailyAnalytics.totalRevenue,
      totalDiscount: mockState.dailyAnalytics.totalDiscount,
      timeValue: mockState.dailyAnalytics.timeValue,
      extraValue: mockState.dailyAnalytics.extraValue,
      extraItems: [...mockState.dailyAnalytics.extraItems]
    };
  },

  resetDailyTotal: () => {
    // Ensure extraItems exists before creating analytics
    if (!mockState.dailyAnalytics.extraItems) {
      mockState.dailyAnalytics.extraItems = [];
    }
    
    const analytics = { ...mockState.dailyAnalytics };
    
    // Reset everything
    mockState.revenue.daily = 0;
    mockState.revenue.current = 0;
    mockState.dailyAnalytics = {
      totalPlayers: 0,
      adults: 0,
      children: 0,
      members: 0,
      totalTax: 0,
      totalRevenue: 0,
      totalDiscount: 0,
      timeValue: 0,
      extraValue: 0,
      extraItems: []
    };
    
    persistData();
    return analytics;
  },

  addMiscellaneousPurchase: (purchaseData) => {
    // Add miscellaneous purchase directly to daily total
    mockState.revenue.daily += purchaseData.amount;
    
    // Add to analytics for tracking
    mockState.dailyAnalytics.totalRevenue += purchaseData.amount;
    mockState.dailyAnalytics.extraValue += purchaseData.amount;
    
    // Initialize extraItems array if it doesn't exist (for backward compatibility)
    if (!mockState.dailyAnalytics.extraItems) {
      mockState.dailyAnalytics.extraItems = [];
    }
    
    // Add to detailed extra items tracking
    mockState.dailyAnalytics.extraItems.push({
      description: purchaseData.description,
      amount: purchaseData.amount,
      type: 'miscellaneous',
      timestamp: new Date().toISOString()
    });
    
    persistData();
    return purchaseData;
  },

  getStats: () => {
    const activeTables = mockState.tables.filter(t => t.players.length > 0).length;
    
    // Calculate current revenue from ONLY active players (not completed checkouts)
    let currentRevenue = 0;
    mockState.tables.forEach(table => {
      table.players.forEach(player => {
        const totalSeconds = calculateElapsedTime(player);
        const timeCharge = (totalSeconds / 3600) * player.rate;
        
        // Calculate total from extra items
        const extraItemsTotal = player.extraItems ? 
          player.extraItems.reduce((sum, item) => sum + item.amount, 0) : 0;
        
        currentRevenue += timeCharge + player.additionalCharges + extraItemsTotal;
      });
    });
    
    return {
      activeTables,
      totalTables: mockState.tables.length,
      currentRevenue: currentRevenue, // Only active players
      dailyTotal: mockState.revenue.daily // Completed checkouts
    };
  },

  getSettings: () => {
    return { ...mockState.settings };
  },

  updateSettings: (newSettings) => {
    mockState.settings = { ...mockState.settings, ...newSettings };
    persistData();
    return mockState.settings;
  },

  getRateForType: (rateType) => {
    switch(rateType) {
      case 'Adult':
        return mockState.settings.rates.adult;
      case 'Child':
        return mockState.settings.rates.child;
      case 'Member':
        return mockState.settings.rates.member;
      default:
        return mockState.settings.rates.adult;
    }
  },

  getTaxRate: () => {
    return mockState.settings.taxRate;
  }
};