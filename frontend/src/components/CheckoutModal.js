import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { LogOut, Clock, DollarSign, User } from 'lucide-react';
import { formatTime, calculateElapsedTime } from '../mock';

const CheckoutModal = ({ isOpen, onClose, onConfirm, player }) => {
  if (!player) return null;

  const totalSeconds = calculateElapsedTime(player);
  const timeCharge = (totalSeconds / 3600) * player.rate;
  const totalCharge = timeCharge + player.additionalCharges;
  const timeDisplay = formatTime(totalSeconds);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-red-600" />
            Checkout Player
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-600" />
              <span className="font-medium">{player.name}</span>
              <span className="text-sm text-slate-500">({player.rateType})</span>
              {player.isPaused && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">PAUSED</span>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Time played:
                </span>
                <span className="font-mono font-bold text-blue-600">{timeDisplay}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Rate:</span>
                <span>${player.rate}/hour</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Time charge:</span>
                <span>${timeCharge.toFixed(2)}</span>
              </div>
              
              {player.additionalCharges > 0 && (
                <div className="flex items-center justify-between">
                  <span>Additional charges:</span>
                  <span>${player.additionalCharges.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-2 flex items-center justify-between font-medium">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Total:
                </span>
                <span className="text-green-600 font-bold">
                  ${totalCharge.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 text-center">
            Are you sure you want to checkout this player?
          </p>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;