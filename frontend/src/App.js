import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import Dashboard from "./components/Dashboard";
import PoolTable from "./components/PoolTable";
import AddPlayerModal from "./components/AddPlayerModal";
import CheckoutModal from "./components/CheckoutModal";
import { mockState, mockAPI } from "./mock";

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
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { toast } = useToast();

  // Update stats whenever tables change
  const updateStats = useCallback(() => {
    const newStats = mockAPI.getStats();
    setStats(newStats);
  }, []);

  useEffect(() => {
    updateStats();
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
    const table = tables.find(t => t.id === tableId);
    const player = table.players.find(p => p.id === playerId);
    setSelectedPlayer(player);
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutConfirmed = () => {
    const result = mockAPI.checkoutPlayer(
      selectedPlayer.tableId || tables.find(t => t.players.some(p => p.id === selectedPlayer.id)).id,
      selectedPlayer.id
    );
    
    if (result) {
      setTables([...mockState.tables]);
      toast({
        title: "Player Checked Out",
        description: `${result.player.name} has been checked out. Total: $${result.totalCharge.toFixed(2)}`,
      });
    }
    setIsCheckoutModalOpen(false);
    setSelectedPlayer(null);
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
              />
            ))}
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
        player={selectedPlayer}
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
