import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';

const PrepaidCheckoutModal = ({ isOpen, onClose, onConfirm, playerData }) => {
  if (!playerData) return null;

  const { player, remainingTime } = playerData;
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Close Prepaid Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Player Info */}
          <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
            <h3 className="text-lg font-medium text-white mb-2">{player.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Player Type:</span>
                <span className="text-emerald-400 font-medium">{player.rateType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Prepaid Amount:</span>
                <span className="text-green-400 font-medium">${player.prepaidAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Prepaid Hours:</span>
                <span className="text-green-400 font-medium">{player.prepaidHours}h</span>
              </div>
              {remainingTime > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Time Remaining:</span>
                  <span className="text-yellow-400 font-medium">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {Math.floor(remainingTime / 3600)}h {Math.floor((remainingTime % 3600) / 60)}m
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          <div className="bg-green-600/20 border border-green-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-green-300 font-medium">Already Paid</span>
            </div>
            <p className="text-sm text-slate-300">
              This player has already paid for their session. No additional charges apply.
              {remainingTime > 0 && ' They still have time remaining on their prepaid session.'}
            </p>
          </div>

          {remainingTime <= 0 && (
            <div className="bg-red-600/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-300 text-sm">
                ⏰ Prepaid time has expired
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Close Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrepaidCheckoutModal;