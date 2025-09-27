import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import Dashboard from "./components/Dashboard";
import PoolTable from "./components/PoolTable";
import AddPlayerModal from "./components/AddPlayerModal";
import CheckoutModal from "./components/CheckoutModal";
import AddTableButton from "./components/AddTableButton";
import { mockState, mockAPI, formatTime, calculateElapsedTime } from "./mock";

const Home = () => {
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
  const [checkoutData, setCheckoutData] = useState(null);
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
    const table = tables.find(t => t.id === tableId);
    setSelectedTable(table);
    setIsAddPlayerModalOpen(true);
  };

  const handlePlayerAdded = (playerData) => {
    const newPlayer = mockAPI.addPlayer(selectedTable.id, playerData);
    if (newPlayer) {
      setTables([...mockState.tables]);
      toast({
        title: "Player Added",
        description: `${playerData.name} has been added to ${selectedTable.name}`,
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

  const handleAddTime = (tableId, playerId) => {
    const updatedPlayer = mockAPI.updatePlayerTime(tableId, playerId, 15);
    if (updatedPlayer) {
      setTables([...mockState.tables]);
      toast({
        title: "Time Added",
        description: `Added 15 minutes to ${updatedPlayer.name}`,
      });
    }
  };

  const handleAddCharge = (tableId, playerId) => {
    const updatedPlayer = mockAPI.addPlayerCharge(tableId, playerId, 1);
    if (updatedPlayer) {
      setTables([...mockState.tables]);
      toast({
        title: "Charge Added",
        description: `Added $1 to ${updatedPlayer.name}'s tab`,
      });
    }
  };

  const handleCheckout = (tableId, playerId) => {
    const result = mockAPI.checkoutPlayer(tableId, playerId);
    if (result) {
      setCheckoutData(result);
      setIsCheckoutModalOpen(true);
    }
  };

  const handleCheckoutTable = (tableId) => {
    const result = mockAPI.checkoutTable(tableId);
    if (result) {
      setCheckoutData(result);
      setIsCheckoutModalOpen(true);
    }
  };

  const handleCheckoutConfirmed = (includeTax = false) => {
    if (checkoutData) {
      const finalResult = mockAPI.completeCheckout(checkoutData, includeTax);
      setTables([...mockState.tables]);
      
      const taxText = includeTax ? ` (includes $${finalResult.tax.toFixed(2)} tax)` : '';
      const playersText = finalResult.isTableCheckout 
        ? `${finalResult.players.length} players from ${finalResult.tableName}`
        : finalResult.players[0].name;
      
      toast({
        title: "Checkout Complete",
        description: `${playersText} checked out. Total: $${finalResult.total.toFixed(2)}${taxText}`,
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
    mockAPI.resetDailyTotal();
    updateStats();
    toast({
      title: "Daily Total Reset",
      description: "Daily totals have been reset to $0.00",
    });
  };

  return (
    <div className="min-h-screen bg-slate-800">{/* Dark background */}
      <Dashboard 
        stats={stats} 
        onReset={handleResetDaily}
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
                onCheckout={handleCheckout}
                onCheckoutTable={handleCheckoutTable}
                onToggleTimer={handleToggleTimer}
                onDeleteTable={handleDeleteTable}
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
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={handleCheckoutConfirmed}
        checkoutData={checkoutData}
      />

      <Toaster />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
