import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { UserPlus, Clock, Plus, DollarSign, LogOut, User, ChevronDown, ChevronUp, Play, Pause, Trash2 } from 'lucide-react';
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
      className="bg-gradient-to-br from-amber-50 via-white to-amber-50 backdrop-blur-sm shadow-xl cursor-pointer transition-all duration-200 hover:shadow-2xl border-2 border-amber-200 hover:border-amber-300"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                {player.name}
                {player.isPaused && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full border border-orange-200 font-medium">
                    PAUSED
                  </span>
                )}
              </h4>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                <Clock className="h-4 w-4 text-slate-600" />
                <span className={`text-lg font-mono font-bold ${player.isPaused ? 'text-orange-600' : 'text-blue-600'}`}>
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
                className={`font-medium shadow-md border-2 ${
                  player.isPaused 
                    ? 'text-green-700 border-green-300 hover:bg-green-50 bg-green-50/50' 
                    : 'text-orange-700 border-orange-300 hover:bg-orange-50 bg-orange-50/50'
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
          <div className="mt-4 pt-3 border-t border-amber-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-3 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <strong>{player.rateType}</strong> (${player.rate}/hr)
              </span>
              {player.additionalCharges > 0 && (
                <span className="text-orange-700 font-bold bg-orange-100 px-2 py-1 rounded border border-orange-200">
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
                className="text-blue-700 border-blue-300 hover:bg-blue-50 bg-blue-50/50 shadow-md font-medium"
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
                className="text-orange-700 border-orange-300 hover:bg-orange-50 bg-orange-50/50 shadow-md font-medium"
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
                className="text-red-700 border-red-300 hover:bg-red-50 bg-red-50/50 shadow-md font-medium"
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

const PoolTable = ({ table, onAddPlayer, onAddTime, onAddCharge, onCheckout, onCheckoutTable, onToggleTimer, onDeleteTable }) => {
  const canDelete = table.id > 5; // Only allow deletion of added tables
  const hasPlayers = table.players.length > 0;
  const hasMultiplePlayers = table.players.length > 1;

  return (
    <div className="relative">
      {/* Wooden Frame Border */}
      <div className="bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 p-4 rounded-xl shadow-2xl border-4 border-amber-900">
        {/* Inner wooden frame detail */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-2 rounded-lg shadow-inner">
          {/* Pool Table Felt Surface */}
          <Card className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 border-2 border-emerald-900 shadow-xl min-h-[400px] rounded-lg overflow-hidden">
            {/* Felt texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 rounded-lg"></div>
            
            <CardHeader className="pb-6 relative z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
                  {/* Pool ball decoration */}
                  <div className="relative">
                    <div className="w-6 h-6 bg-white rounded-full shadow-lg border-2 border-slate-300"></div>
                    <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full"></div>
                  </div>
                  {table.name}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => onAddPlayer(table.id)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium shadow-lg border-2 border-amber-300"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Player
                  </Button>
                  
                  {hasPlayers && (
                    <Button
                      onClick={() => onCheckoutTable(table.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-800 font-medium shadow-lg border-2 border-green-300"
                      size="sm"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Checkout {hasMultiplePlayers ? 'All' : 'Table'}
                    </Button>
                  )}
                  
                  {canDelete && (
                    <Button
                      onClick={() => onDeleteTable(table.id)}
                      variant="outline"
                      size="sm"
                      className={`text-red-600 border-red-300 hover:bg-red-50 bg-white/90 shadow-lg ${
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
            
            <CardContent className="space-y-4 relative z-10">
              {table.players.length === 0 ? (
                <div className="text-emerald-100 text-center py-16 border-2 border-dashed border-emerald-400 rounded-lg bg-emerald-800/30 backdrop-blur-sm">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-70 drop-shadow-lg" />
                  <p className="text-base font-medium drop-shadow">No players currently seated</p>
                  {canDelete && (
                    <p className="text-sm text-emerald-200 mt-2 drop-shadow">
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
        </div>
        
        {/* Wooden corner reinforcements */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-amber-900 rounded-full shadow-inner"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-amber-900 rounded-full shadow-inner"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-amber-900 rounded-full shadow-inner"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-amber-900 rounded-full shadow-inner"></div>
      </div>
      
      {/* Table shadow/base */}
      <div className="absolute -bottom-2 left-2 right-2 h-4 bg-slate-900/40 rounded-xl blur-sm -z-10"></div>
    </div>
  );
};

export default PoolTable;