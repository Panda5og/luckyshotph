import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { UserPlus, Clock, Plus, Minus, DollarSign, LogOut, User, ChevronDown, ChevronUp, Play, Pause, Trash2, MessageSquare, X } from 'lucide-react';
import { formatTime, calculateElapsedTime, calculatePrepaidTimeRemaining, formatCountdownTime } from '../mock';

// Utility function to consolidate extra items
const consolidateExtraItems = (extraItems) => {
  if (!extraItems || extraItems.length === 0) return [];
  
  const consolidated = {};
  
  extraItems.forEach(item => {
    const key = item.description;
    if (consolidated[key]) {
      consolidated[key].count += 1;
      consolidated[key].totalAmount += item.amount;
    } else {
      consolidated[key] = {
        description: item.description,
        count: 1,
        totalAmount: item.amount,
        unitAmount: item.amount
      };
    }
  });
  
  return Object.values(consolidated);
};

const PlayerCard = ({ player, tableId, onAddTime, onAddCharge, onCustomCharge, onCheckout, onToggleTimer, onUpdateComment, onShowConfirmAction, onRemovePlayer }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [prepaidTimeRemaining, setPrepaidTimeRemaining] = useState(0);
  const [hasPlayedChime, setHasPlayedChime] = useState(false);

  // Chime function
  const playChime = () => {
    try {
      // Create audio context for chime sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a simple chime sound using oscillators
      const createTone = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Create chime sequence (Westminster chime pattern)
      const now = audioContext.currentTime;
      createTone(523.25, now, 0.5); // C5
      createTone(659.25, now + 0.2, 0.5); // E5
      createTone(783.99, now + 0.4, 0.8); // G5
      createTone(523.25, now + 0.8, 1.0); // C5
      
    } catch (error) {
      // Fallback: use system beep if Web Audio API fails
      console.log('🔔 PREPAID TIME EXPIRED for', player.name);
    }
  };

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = calculateElapsedTime(player);
      setCurrentTime(elapsed);
      
      if (player.isPrepaid) {
        const remaining = calculatePrepaidTimeRemaining(player);
        const prevRemaining = prepaidTimeRemaining;
        setPrepaidTimeRemaining(remaining);
        
        // Play chime when timer expires (transitions from >0 to 0)
        if (prevRemaining > 0 && remaining <= 0 && !hasPlayedChime && !player.isPaused) {
          playChime();
          setHasPlayedChime(true);
        }
        
        // Reset chime flag if time is added back
        if (remaining > 0 && hasPlayedChime) {
          setHasPlayedChime(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, prepaidTimeRemaining, hasPlayedChime]);

  const timeDisplay = player.isPrepaid 
    ? formatCountdownTime(prepaidTimeRemaining)
    : formatTime(currentTime);

  const handleTimeAction = (isAdd) => {
    onShowConfirmAction({
      type: 'time',
      amount: 15,
      playerName: player.name,
      isSubtract: !isAdd,
      tableId,
      playerId: player.id,
      callback: onAddTime
    });
  };

  const handleChargeAction = (isAdd) => {
    if (isAdd) {
      // For adding charges, open the custom charge modal
      onCustomCharge(tableId, player.id, player.name);
    } else {
      // For subtracting charges, use the existing confirmation modal with $1
      onShowConfirmAction({
        type: 'charge',
        amount: 1,
        playerName: player.name,
        isSubtract: true,
        tableId,
        playerId: player.id,
        callback: onAddCharge
      });
    }
  };

  const handleCommentClick = () => {
    onUpdateComment(tableId, player.id, player.comment || '', player.name);
  };

  const handleRemovePlayer = () => {
    onRemovePlayer(tableId, player.id);
  };

  return (
    <Card 
      className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 backdrop-blur-sm shadow-xl cursor-pointer transition-all duration-200 hover:shadow-2xl border-2 border-slate-600 hover:border-slate-500"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                {player.name}
                {player.isPaused && (
                  <span className="text-xs bg-orange-600 text-orange-100 px-2 py-1 rounded-full border border-orange-500 font-medium">
                    PAUSED
                  </span>
                )}
                {player.comment && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCommentClick();
                    }}
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 border-blue-400 text-blue-400 hover:bg-blue-600/20 bg-slate-600/50"
                    title="View/Edit Comment"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                )}
              </h4>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-300" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-300" />
              )}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                player.isPrepaid 
                  ? 'bg-green-600/20 border-green-500' 
                  : 'bg-slate-600 border-slate-500'
              }`}>
                <Clock className={`h-4 w-4 ${
                  player.isPrepaid ? 'text-green-300' : 'text-slate-300'
                }`} />
                <span className={`text-lg font-mono font-bold ${
                  player.isPrepaid 
                    ? (prepaidTimeRemaining <= 0 ? 'text-red-400 animate-pulse' : 'text-green-400')
                    : (player.isPaused ? 'text-orange-400' : 'text-blue-400')
                }`}>
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
                    ? 'text-green-400 border-green-500 hover:bg-green-600/20 bg-green-600/10' 
                    : 'text-orange-400 border-orange-500 hover:bg-orange-600/20 bg-orange-600/10'
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
          <div className="mt-4 pt-3 border-t border-slate-600" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-3 text-sm text-slate-200 bg-slate-600/50 p-2 rounded-lg border border-slate-500">
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <strong className="text-white">{player.rateType}</strong> (${player.rate}/hr)
              </span>
              {player.isPrepaid && (
                <span className="text-green-300 font-bold bg-green-600/20 px-2 py-1 rounded border border-green-500/50">
                  PREPAID {player.prepaidHours}h (${player.prepaidAmount})
                </span>
              )}
              {player.additionalCharges > 0 && (
                <span className="text-orange-300 font-bold bg-orange-600/20 px-2 py-1 rounded border border-orange-500/50">
                  +${player.additionalCharges} extra
                </span>
              )}
              {player.extraItems && player.extraItems.length > 0 && (
                <span className="text-purple-300 font-bold bg-purple-600/20 px-2 py-1 rounded border border-purple-500/50">
                  {player.extraItems.length} item{player.extraItems.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Extra Items List */}
            {player.extraItems && player.extraItems.length > 0 && (
              <div className="mt-3 space-y-1">
                <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wide">Extra Items:</h4>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {consolidateExtraItems(player.extraItems).map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs bg-slate-700/50 p-1.5 rounded border border-slate-600">
                      <span className="text-slate-300">
                        {item.description}
                        {item.count > 1 && <span className="text-purple-400"> ({item.count}x)</span>}
                      </span>
                      <span className="text-purple-300 font-medium">${item.totalAmount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {/* Time Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleTimeAction(false)}
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-500 hover:bg-red-600/20 bg-red-600/10 shadow-md font-medium"
                  disabled={currentTime < 15 * 60} // Disable if less than 15 minutes
                >
                  <Minus className="h-3 w-3 mr-1" />
                  -15 min
                </Button>
                <Button
                  onClick={() => handleTimeAction(true)}
                  variant="outline"
                  size="sm"
                  className="text-blue-400 border-blue-500 hover:bg-blue-600/20 bg-blue-600/10 shadow-md font-medium"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  +15 min
                </Button>
              </div>
              
              {/* Charge Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleChargeAction(false)}
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-500 hover:bg-red-600/20 bg-red-600/10 shadow-md font-medium"
                  disabled={player.additionalCharges < 1} // Disable if no charges to remove
                >
                  <Minus className="h-3 w-3 mr-1" />
                  -$1
                </Button>
                <Button
                  onClick={() => handleChargeAction(true)}
                  variant="outline"
                  size="sm"
                  className="text-orange-400 border-orange-500 hover:bg-orange-600/20 bg-orange-600/10 shadow-md font-medium"
                >
                  <DollarSign className="h-3 w-3 mr-1" />
                  $
                </Button>
              </div>
              
              {/* Other Actions */}
              <div className="flex gap-1.5 pt-2 border-t border-slate-600">
                <Button
                  onClick={handleCommentClick}
                  variant="outline"
                  size="sm"
                  className="text-blue-400 border-blue-500 hover:bg-blue-600/20 bg-blue-600/10 shadow-md font-medium flex-1 px-2"
                  title={player.comment ? 'Edit player comment' : 'Add player comment'}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  <span className="text-xs">{player.comment ? 'Edit' : 'Comment'}</span>
                </Button>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePlayer();
                  }}
                  variant="outline"
                  size="sm"
                  className="text-slate-400 border-slate-500 hover:bg-slate-600/20 bg-slate-600/10 shadow-md font-medium px-3"
                  title="Remove player from table (no charges)"
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCheckout(tableId, player.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-green-400 border-green-500 hover:bg-green-600/20 bg-green-600/10 shadow-md font-medium flex-1 px-2"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  <span className="text-xs">Checkout</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PoolTable = ({ table, onAddPlayer, onAddTime, onAddCharge, onCustomCharge, onCheckout, onCheckoutTable, onToggleTimer, onDeleteTable, onUpdateComment, onShowConfirmAction, onSetTableTimer, onRemovePlayer }) => {
  const canDelete = table.id > 5; // Only allow deletion of added tables
  const hasPlayers = table.players.length > 0;
  const hasMultiplePlayers = table.players.length > 1;

  const handleTableTimerChange = (e) => {
    const hours = Math.max(0, parseInt(e.target.value) || 0);
    onSetTableTimer(table.id, hours);
  };

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
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg mb-2">
                    {/* Pool ball decoration */}
                    <div className="relative">
                      <div className="w-6 h-6 bg-white rounded-full shadow-lg border-2 border-slate-300"></div>
                      <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full"></div>
                    </div>
                    {table.name}
                  </h3>
                  
                  {/* Table Timer */}
                  <div className="flex items-center gap-2 text-emerald-100">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Table Timer:</span>
                    <input
                      type="number"
                      min="0"
                      value={table.tableTimerHours || 0}
                      onChange={handleTableTimerChange}
                      className="w-16 px-2 py-1 text-xs bg-emerald-800 border border-emerald-600 rounded text-white"
                    />
                    <span className="text-xs">hours</span>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => onAddPlayer(table.id)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium shadow-lg border-2 border-amber-300"
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
            
            <CardContent className="space-y-4 relative z-10 pb-20">
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
                      onCustomCharge={onCustomCharge}
                      onCheckout={onCheckout}
                      onToggleTimer={onToggleTimer}
                      onUpdateComment={onUpdateComment}
                      onShowConfirmAction={onShowConfirmAction}
                      onRemovePlayer={onRemovePlayer}
                    />
                  ))}
                </div>
              )}
              
              {/* Checkout Table Button at Bottom */}
              {hasPlayers && (
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <Button
                    onClick={() => onCheckoutTable(table.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 shadow-xl border-2 border-green-500"
                    size="lg"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Checkout {hasMultiplePlayers ? 'All Players' : 'Table'}
                  </Button>
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