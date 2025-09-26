import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { UserPlus, Clock, Plus, DollarSign, LogOut, User, ChevronDown, ChevronUp, Play, Pause } from 'lucide-react';
import { formatTime, calculateElapsedTime } from '../mock';

const PlayerCard = ({ player, tableId, onAddTime, onAddCharge, onCheckout, onToggleTimer }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(calculateElapsedTime(player));
    }, 1000);

    return () => clearInterval(interval);
  }, [player]);

  const timeDisplay = formatTime(currentTime);

  return (
    <Card 
      className="bg-white/95 backdrop-blur-sm shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-600" />
                {player.name}
                {player.isPaused && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">PAUSED</span>
                )}
              </h4>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className={`text-base font-mono font-bold ${player.isPaused ? 'text-orange-600' : 'text-blue-600'}`}>
                  {timeDisplay}
                </span>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTimer(tableId, player.id);
                }}
                variant="outline"
                size="sm"
                className={`${
                  player.isPaused 
                    ? 'text-green-600 border-green-200 hover:bg-green-50' 
                    : 'text-orange-600 border-orange-200 hover:bg-orange-50'
                }`}
              >
                {player.isPaused ? (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-3 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {player.rateType} (${player.rate}/hr)
              </span>
              {player.additionalCharges > 0 && (
                <span className="text-orange-600 font-medium">
                  +${player.additionalCharges} extra
                </span>
              )}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTime(tableId, player.id);
                }}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                +15 min
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddCharge(tableId, player.id);
                }}
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                +$1
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckout(tableId, player.id);
                }}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Checkout
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PoolTable = ({ table, onAddPlayer, onAddTime, onAddCharge, onCheckout, onToggleTimer, onDeleteTable }) => {
  const canDelete = table.id > 5; // Only allow deletion of added tables
  const hasPlayers = table.players.length > 0;

  return (
    <Card className="bg-gradient-to-br from-emerald-800 to-emerald-900 border-emerald-700 shadow-xl min-h-[400px]">
      <CardHeader className="pb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-4 h-4 bg-white rounded-full"></div>
            {table.name}
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() => onAddPlayer(table.id)}
              className="bg-white hover:bg-slate-100 text-emerald-800 font-medium"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
            
            {canDelete && (
              <Button
                onClick={() => onDeleteTable(table.id)}
                variant="outline"
                size="sm"
                className={`text-red-600 border-red-300 hover:bg-red-50 ${
                  hasPlayers ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={hasPlayers}
                title={hasPlayers ? 'Cannot delete table with active players' : 'Delete this table'}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {table.players.length === 0 ? (
          <div className="text-emerald-200 text-center py-16 border-2 border-dashed border-emerald-600 rounded-lg">
            <User className="h-12 w-12 mx-auto mb-3 opacity-60" />
            <p className="text-base">No players currently seated</p>
            {canDelete && (
              <p className="text-sm text-emerald-300 mt-2">
                This table can be deleted
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {table.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                tableId={table.id}
                onAddTime={onAddTime}
                onAddCharge={onAddCharge}
                onCheckout={onCheckout}
                onToggleTimer={onToggleTimer}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PoolTable;