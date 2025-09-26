import React from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { UserPlus, Clock, Plus, DollarSign, LogOut, User } from 'lucide-react';

const PoolTable = ({ table, onAddPlayer, onAddTime, onAddCharge, onCheckout }) => {
  return (
    <Card className="bg-gradient-to-br from-emerald-800 to-emerald-900 border-emerald-700 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full"></div>
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
      
      <CardContent className="space-y-3">
        {table.players.length === 0 ? (
          <div className="text-emerald-200 text-center py-8 border-2 border-dashed border-emerald-600 rounded-lg">
            <User className="h-8 w-8 mx-auto mb-2 opacity-60" />
            <p className="text-sm">No players currently seated</p>
          </div>
        ) : (
          <div className="space-y-3">
            {table.players.map((player) => (
              <Card key={player.id} className="bg-white/95 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-600" />
                        {player.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {player.timeMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {player.rateType} (${player.rate}/hr)
                        </span>
                        {player.additionalCharges > 0 && (
                          <span className="text-orange-600 font-medium">
                            +${player.additionalCharges}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => onAddTime(table.id, player.id)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      +15 min
                    </Button>
                    
                    <Button
                      onClick={() => onAddCharge(table.id, player.id)}
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      +$1
                    </Button>
                    
                    <Button
                      onClick={() => onCheckout(table.id, player.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Checkout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PoolTable;