import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

const MovePlayerModal = ({ isOpen, onClose, onConfirm, playerData, tables, currentTableId }) => {
  const [selectedTableId, setSelectedTableId] = useState(null);

  if (!playerData) return null;

  const { player } = playerData;
  
  // Filter out the current table from available destinations
  const availableTables = tables.filter(t => t.id !== currentTableId);

  const handleConfirm = () => {
    if (selectedTableId) {
      onConfirm(selectedTableId);
      setSelectedTableId(null);
    }
  };

  const handleClose = () => {
    setSelectedTableId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <ArrowRight className="h-5 w-5 text-blue-400" />
            Move Player
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Player Info */}
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-300 mb-1">Moving Player:</div>
            <div className="text-lg font-semibold text-white">{player.name}</div>
            <div className="text-sm text-slate-400 mt-1">
              {player.isPrepaid ? (
                <span className="text-green-400">Prepaid Player</span>
              ) : (
                <span>Rate: ${player.rate.toFixed(2)}/hour</span>
              )}
            </div>
          </div>

          {/* Table Selection */}
          <div>
            <div className="text-sm font-medium text-slate-300 mb-2">
              Select Destination Table:
            </div>
            <div className="space-y-2">
              {availableTables.length === 0 ? (
                <div className="text-center py-4 text-slate-400">
                  No other tables available
                </div>
              ) : (
                availableTables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`w-full p-3 rounded-lg border transition-all ${
                      selectedTableId === table.id
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{table.name}</div>
                      </div>
                      <div className="text-sm text-slate-400">
                        {table.players.length} player{table.players.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTableId}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            Move Player
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovePlayerModal;
