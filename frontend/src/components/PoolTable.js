import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { UserPlus, Clock, Plus, DollarSign, LogOut, User, ChevronDown, ChevronUp } from 'lucide-react';

const PlayerCard = ({ player, tableId, onAddTime, onAddCharge, onCheckout }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
              </h4>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">
                {player.timeMinutes} minutes
              </span>
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

const PoolTable = ({ table, onAddPlayer, onAddTime, onAddCharge, onCheckout }) => {
  return (
    <Card className="bg-gradient-to-br from-emerald-800 to-emerald-900 border-emerald-700 shadow-xl min-h-[400px]">
      <CardHeader className="pb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-4 h-4 bg-white rounded-full"></div>
            {table.name}
          </h3>
          <Button
            onClick={() => onAddPlayer(table.id)}
            className="bg-white hover:bg-slate-100 text-emerald-800 font-medium"
            size="sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {table.players.length === 0 ? (
          <div className="text-emerald-200 text-center py-16 border-2 border-dashed border-emerald-600 rounded-lg">
            <User className="h-12 w-12 mx-auto mb-3 opacity-60" />
            <p className="text-base">No players currently seated</p>
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
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PoolTable;