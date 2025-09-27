import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { LogOut, Clock, DollarSign, User, Users, Receipt } from 'lucide-react';
import { formatTime, calculateElapsedTime } from '../mock';

const CheckoutModal = ({ isOpen, onClose, onConfirm, checkoutData }) => {
  const [includeTax, setIncludeTax] = useState(false);
  
  if (!checkoutData) return null;

  const { players, subtotal, isTableCheckout, tableName } = checkoutData;
  const taxRate = 0.0575; // 5.75%
  const tax = includeTax ? subtotal * taxRate : 0;
  const total = subtotal + tax;

  const handleConfirm = () => {
    onConfirm(includeTax);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-green-600" />
            {isTableCheckout ? `Checkout ${tableName}` : 'Checkout Player'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            {isTableCheckout && (
              <div className="flex items-center gap-2 mb-3 text-lg font-semibold text-slate-800">
                <Users className="h-5 w-5 text-emerald-600" />
                {players.length} Player{players.length > 1 ? 's' : ''} - {tableName}
              </div>
            )}
            
            {players.map((player, index) => {
              const playerSeconds = calculateElapsedTime(player);
              const playerTimeCharge = (playerSeconds / 3600) * player.rate;
              const playerTotal = playerTimeCharge + player.additionalCharges;
              
              return (
                <div key={player.id} className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium text-slate-800">{player.name}</span>
                    <span className="text-sm text-slate-500">({player.rateType})</span>
                    {player.isPaused && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">PAUSED</span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-slate-600 ml-8">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Time: {formatTime(playerSeconds)}
                      </span>
                      <span>${playerTimeCharge.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Rate: ${player.rate}/hour</span>
                      <span></span>
                    </div>
                    
                    {player.additionalCharges > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Additional charges:</span>
                        <span>${player.additionalCharges.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between font-medium text-slate-800 border-t pt-1">
                      <span>Player Total:</span>
                      <span className="text-green-600">${playerTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="border-t-2 border-slate-300 pt-4 space-y-3">
              <div className="flex items-center justify-between text-lg font-medium">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {/* Sales Tax Option */}
              <div className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg">
                <Checkbox
                  id="includeTax"
                  checked={includeTax}
                  onCheckedChange={setIncludeTax}
                />
                <label htmlFor="includeTax" className="text-sm font-medium cursor-pointer flex-1">
                  Include Sales Tax (5.75%)
                </label>
                {includeTax && (
                  <span className="text-sm text-slate-600">+${tax.toFixed(2)}</span>
                )}
              </div>
              
              <div className="border-t pt-3 flex items-center justify-between text-xl font-bold">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Total:
                </span>
                <span className="text-green-600">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 text-center">
            {isTableCheckout 
              ? `Are you sure you want to checkout all players from ${tableName}?`
              : 'Are you sure you want to checkout this player?'
            }
          </p>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleConfirm}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Complete Checkout - ${total.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;