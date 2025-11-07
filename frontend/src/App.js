import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import Dashboard from "./components/Dashboard";
import PoolTable from "./components/PoolTable";
import AddPlayerModal from "./components/AddPlayerModal";
import CheckoutModal from "./components/CheckoutModal";
import PrepaidCheckoutModal from "./components/PrepaidCheckoutModal";
import ConfirmActionModal from "./components/ConfirmActionModal";
import PlayerCommentModal from "./components/PlayerCommentModal";
import DailyAnalyticsModal from "./components/DailyAnalyticsModal";
import MiscellaneousPurchaseModal from "./components/MiscellaneousPurchaseModal";
import CustomChargeModal from "./components/CustomChargeModal";
import SettingsModal from "./components/SettingsModal";
import MovePlayerModal from "./components/MovePlayerModal";
import AddTableButton from "./components/AddTableButton";
import LoginPage from "./components/LoginPage";
import { mockState, mockAPI, formatTime, calculateElapsedTime, calculatePrepaidTimeRemaining } from "./mock";

const Home = ({ onLogout }) => {
  const [tables, setTables] = useState(mockState.tables);
  const [stats, setStats] = useState({
    activeTables: 0,
    totalTables: 5,
    currentRevenue: 0,
    dailyTotal: 0
  });
  const [selectedTable, setSelectedTable] = useState(null);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false);
  const [isPlayerCommentModalOpen, setIsPlayerCommentModalOpen] = useState(false);
  const [isDailyAnalyticsModalOpen, setIsDailyAnalyticsModalOpen] = useState(false);
  const [isMiscPurchaseModalOpen, setIsMiscPurchaseModalOpen] = useState(false);
  const [isCustomChargeModalOpen, setIsCustomChargeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrepaidCheckoutModalOpen, setIsPrepaidCheckoutModalOpen] = useState(false);
  const [isMovePlayerModalOpen, setIsMovePlayerModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [prepaidCheckoutData, setPrepaidCheckoutData] = useState(null);
  const [movePlayerData, setMovePlayerData] = useState(null);
  const [confirmActionData, setConfirmActionData] = useState(null);
  const [commentData, setCommentData] = useState(null);
  const [customChargeData, setCustomChargeData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [settings, setSettings] = useState(mockState.settings);
  const { toast } = useToast();

  // Update stats every second to reflect timer changes
  const updateStats = useCallback(() => {
    const newStats = mockAPI.getStats();
    setStats(newStats);
  }, []);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 1000); // Update every second
    return () => clearInterval(interval);
  }, [tables, updateStats]);

  const handleAddPlayer = (tableId) => {
    const table = mockState.tables.find(t => t.id === tableId); // Use mockState directly
    setSelectedTable(table);
    setIsAddPlayerModalOpen(true);
  };

  const handlePlayerAdded = (playerData) => {
    const newPlayer = mockAPI.addPlayer(selectedTable.id, playerData);
    if (newPlayer) {
      // Force React to re-render by creating new table objects
      const updatedTables = mockState.tables.map(table => ({
        ...table,
        players: [...table.players]
      }));
      setTables(updatedTables);
      toast({
        title: "Player Added",
        description: `${playerData.name} (${playerData.rateType}) has been added to ${selectedTable.name}`,
      });
    }
  };

  const handleSetTableTimer = (tableId, hours) => {
    const updatedTable = mockAPI.setTableTimer(tableId, hours);
    if (updatedTable) {
      // Force React to re-render by creating new table objects
      const updatedTables = mockState.tables.map(table => ({
        ...table,
        players: [...table.players]
      }));
      setTables(updatedTables);
      toast({
        title: "Table Timer Set",
        description: `${updatedTable.name} timer set to ${hours} hours`,
      });
    }
  };

  const handleShowConfirmAction = (actionData) => {
    setConfirmActionData(actionData);
    setIsConfirmActionModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (confirmActionData) {
      const { type, amount, isSubtract, tableId, playerId, callback } = confirmActionData;
      const finalAmount = isSubtract ? -amount : amount;
      
      const updatedPlayer = callback(tableId, playerId, finalAmount);
      if (updatedPlayer) {
        setTables([...mockState.tables]);
        const actionText = isSubtract ? 'removed from' : 'added to';
        const itemText = type === 'time' ? `${Math.abs(finalAmount)} minutes` : `$${Math.abs(finalAmount)}`;
        
        toast({
          title: `${type === 'time' ? 'Time' : 'Charge'} ${isSubtract ? 'Removed' : 'Added'}`,
          description: `${itemText} ${actionText} ${updatedPlayer.name}`,
        });
      }
    }
    setIsConfirmActionModalOpen(false);
    setConfirmActionData(null);
  };

  const handleUpdateComment = (tableId, playerId, currentComment, playerName) => {
    setCommentData({ tableId, playerId, currentComment, playerName });
    setIsPlayerCommentModalOpen(true);
  };

  const handleSaveComment = (comment) => {
    if (commentData) {
      const updatedPlayer = mockAPI.updatePlayerComment(commentData.tableId, commentData.playerId, comment);
      if (updatedPlayer) {
        setTables([...mockState.tables]);
        toast({
          title: "Comment Updated",
          description: `Comment ${comment ? 'saved' : 'removed'} for ${commentData.playerName}`,
        });
      }
    }
    setCommentData(null);
  };

  const handleRemovePlayer = (tableId, playerId) => {
    const result = mockAPI.removePlayer(tableId, playerId);
    if (result.success) {
      // Force React to re-render by creating new table objects
      const updatedTables = mockState.tables.map(table => ({
        ...table,
        players: [...table.players]
      }));
      setTables(updatedTables);
      toast({
        title: "Player Removed",
        description: `${result.removedPlayer.name} has been removed from the table`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleToggleTimer = (tableId, playerId) => {
    const updatedPlayer = mockAPI.togglePlayerTimer(tableId, playerId);
    if (updatedPlayer) {
      setTables([...mockState.tables]);
      toast({
        title: updatedPlayer.isPaused ? "Timer Paused" : "Timer Resumed",
        description: `${updatedPlayer.name}'s timer ${updatedPlayer.isPaused ? 'paused' : 'resumed'}`,
      });
    }
  };

  const handleAddTime = (tableId, playerId, minutes = 15) => {
    return mockAPI.updatePlayerTime(tableId, playerId, minutes);
  };

  const handleAddCharge = (tableId, playerId, amount = 1) => {
    return mockAPI.addPlayerCharge(tableId, playerId, amount);
  };

  const handleCheckout = (tableId, playerId) => {
    const result = mockAPI.checkoutPlayer(tableId, playerId);
    if (result) {
      const player = result.players[0];
      
      // Check if player is prepaid - use simple confirmation modal
      if (player.isPrepaid) {
        const remainingTime = calculatePrepaidTimeRemaining(player);
        setPrepaidCheckoutData({
          player: player,
          remainingTime: remainingTime,
          tableId: tableId,
          playerId: playerId
        });
        setIsPrepaidCheckoutModalOpen(true);
      } else {
        // Regular checkout with payment calculation
        setCheckoutData(result);
        setIsCheckoutModalOpen(true);
      }
    }
  };

  const handleCheckoutTable = (tableId) => {
    const result = mockAPI.checkoutTable(tableId);
    if (result) {
      setCheckoutData(result);
      setIsCheckoutModalOpen(true);
    }
  };

  const handleCheckoutConfirmed = (checkoutOptions) => {
    if (checkoutData) {
      const finalResult = mockAPI.completeCheckout(checkoutData, checkoutOptions);
      setTables([...mockState.tables]);
      
      const { includeTax, discount, extraItems, total } = checkoutOptions;
      const taxText = includeTax ? ` (includes $${finalResult.tax.toFixed(2)} tax)` : '';
      const discountText = discount > 0 ? ` (discount: $${discount.toFixed(2)})` : '';
      const extraText = extraItems.length > 0 ? ` + ${extraItems.length} extra items` : '';
      const playersText = finalResult.isTableCheckout 
        ? `${finalResult.players.length} players from ${finalResult.tableName}`
        : finalResult.players[0].name;
      
      toast({
        title: "Checkout Complete",
        description: `${playersText} checked out${extraText}. Total: $${total.toFixed(2)}${taxText}${discountText}`,
      });
    }
    setIsCheckoutModalOpen(false);
    setCheckoutData(null);
  };

  const handleAddTable = () => {
    const newTable = mockAPI.addTable();
    if (newTable) {
      setTables([...mockState.tables]);
      toast({
        title: "Table Added",
        description: `${newTable.name} has been added to your pool hall`,
      });
    }
  };

  const handleDeleteTable = (tableId) => {
    const result = mockAPI.deleteTable(tableId);
    if (result.success) {
      setTables([...mockState.tables]);
      toast({
        title: "Table Deleted",
        description: `${result.deletedTable.name} has been removed from your pool hall`,
      });
    } else {
      toast({
        title: "Cannot Delete Table",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleResetDaily = () => {
    // Get current analytics WITHOUT resetting yet - use API method
    const currentAnalytics = mockAPI.getCurrentAnalytics();
    setAnalyticsData(currentAnalytics);
    setIsDailyAnalyticsModalOpen(true);
  };

  const handleOpenSettings = () => {
    setSettings(mockAPI.getSettings());
    setIsSettingsModalOpen(true);
  };

  const handleUpdateSettings = (newSettings) => {
    const updatedSettings = mockAPI.updateSettings(newSettings);
    setSettings(updatedSettings);
    toast({
      title: "Settings Updated",
      description: "Player rates and tax rate have been updated successfully",
    });
  };

  const handlePrepaidCheckoutConfirmed = () => {
    if (prepaidCheckoutData) {
      const { tableId, playerId, player } = prepaidCheckoutData;
      
      // Complete prepaid checkout - moves revenue to daily total
      const result = mockAPI.completePrepaidCheckout(tableId, playerId);
      if (result.success) {
        setTables([...mockState.tables]);
        updateStats(); // Update stats to reflect new daily total
        toast({
          title: "Session Closed",
          description: `${player.name} has been checked out (already paid: $${player.prepaidAmount.toFixed(2)})`,
        });
      }
      
      setIsPrepaidCheckoutModalOpen(false);
      setPrepaidCheckoutData(null);
    }
  };

  const handleConfirmReset = () => {
    // NOW actually reset the data
    mockAPI.resetDailyTotal();
    updateStats();
    setTables([...mockState.tables]);
    toast({
      title: "Daily Analytics Reset",
      description: "All daily totals and analytics have been reset to zero",
    });
    setIsDailyAnalyticsModalOpen(false);
    setAnalyticsData(null);
  };

  const handleMiscPurchase = () => {
    setIsMiscPurchaseModalOpen(true);
  };

  const handleMiscPurchaseConfirm = (purchaseData) => {
    mockAPI.addMiscellaneousPurchase(purchaseData);
    updateStats();
    setTables([...mockState.tables]);
    toast({
      title: "Purchase Added",
      description: `${purchaseData.description} - $${purchaseData.amount.toFixed(2)} added to daily total`,
    });
    setIsMiscPurchaseModalOpen(false);
  };

  const handleCustomCharge = (tableId, playerId, playerName) => {
    setCustomChargeData({ tableId, playerId, playerName });
    setIsCustomChargeModalOpen(true);
  };

  const handleCustomChargeConfirm = (chargeData) => {
    const { tableId, playerId, playerName } = customChargeData;
    
    // Add the charge as an extra item (not player charge)
    mockAPI.addPlayerExtraItem(tableId, playerId, {
      description: chargeData.description,
      amount: chargeData.amount
    });
    
    setTables([...mockState.tables]);
    toast({
      title: "Extra Item Added",
      description: `${chargeData.description} - $${chargeData.amount.toFixed(2)} added to ${playerName}`,
    });
    setIsCustomChargeModalOpen(false);
    setCustomChargeData(null);
  };

  return (
    <div className="min-h-screen bg-slate-800">{/* Dark background */}
      <Dashboard 
        stats={stats} 
        onReset={handleResetDaily}
        onMiscPurchase={handleMiscPurchase}
        onOpenSettings={handleOpenSettings}
      />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tables.map((table) => (
              <PoolTable
                key={table.id}
                table={table}
                onAddPlayer={handleAddPlayer}
                onAddTime={handleAddTime}
                onAddCharge={handleAddCharge}
                onCustomCharge={handleCustomCharge}
                onCheckout={handleCheckout}
                onCheckoutTable={handleCheckoutTable}
                onToggleTimer={handleToggleTimer}
                onDeleteTable={handleDeleteTable}
                onUpdateComment={handleUpdateComment}
                onShowConfirmAction={handleShowConfirmAction}
                onSetTableTimer={handleSetTableTimer}
                onRemovePlayer={handleRemovePlayer}
              />
            ))}
            <AddTableButton onAddTable={handleAddTable} />
          </div>
        </div>
      </div>

      <AddPlayerModal
        isOpen={isAddPlayerModalOpen}
        onClose={() => setIsAddPlayerModalOpen(false)}
        onAddPlayer={handlePlayerAdded}
        tableName={selectedTable?.name}
        settings={settings}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={handleCheckoutConfirmed}
        checkoutData={checkoutData}
        settings={settings}
      />

      <PrepaidCheckoutModal
        isOpen={isPrepaidCheckoutModalOpen}
        onClose={() => setIsPrepaidCheckoutModalOpen(false)}
        onConfirm={handlePrepaidCheckoutConfirmed}
        playerData={prepaidCheckoutData}
      />

      <ConfirmActionModal
        isOpen={isConfirmActionModalOpen}
        onClose={() => setIsConfirmActionModalOpen(false)}
        onConfirm={handleConfirmAction}
        actionData={confirmActionData}
      />

      <PlayerCommentModal
        isOpen={isPlayerCommentModalOpen}
        onClose={() => setIsPlayerCommentModalOpen(false)}
        onSave={handleSaveComment}
        playerName={commentData?.playerName}
        currentComment={commentData?.currentComment}
      />

      <DailyAnalyticsModal
        isOpen={isDailyAnalyticsModalOpen}
        onClose={() => setIsDailyAnalyticsModalOpen(false)}
        onConfirm={handleConfirmReset}
        analytics={analyticsData}
      />

      <MiscellaneousPurchaseModal
        isOpen={isMiscPurchaseModalOpen}
        onClose={() => setIsMiscPurchaseModalOpen(false)}
        onConfirm={handleMiscPurchaseConfirm}
      />

      <CustomChargeModal
        isOpen={isCustomChargeModalOpen}
        onClose={() => setIsCustomChargeModalOpen(false)}
        onConfirm={handleCustomChargeConfirm}
        playerName={customChargeData?.playerName}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        settings={settings}
      />

      <Toaster />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('poolhall_authenticated');
      setIsAuthenticated(authStatus === 'true');
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('poolhall_authenticated');
    localStorage.removeItem('poolhall_user');
    setIsAuthenticated(false);
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show main app if authenticated
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home onLogout={handleLogout} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
