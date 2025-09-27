import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DollarSign, Plus } from 'lucide-react';

const CustomChargeModal = ({ isOpen, onClose, onConfirm, playerName }) => {
  const [amount, setAmount] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (amount && parseFloat(amount) > 0) {
      onConfirm(parseFloat(amount));
      handleClose();
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const isValid = amount && parseFloat(amount) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-5 w-5 text-orange-400" />
            Add Custom Charge
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-slate-300">
              Adding charge for: <span className="text-white font-medium">{playerName}</span>
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="charge-amount" className="text-slate-200">
              Charge Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="charge-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500"
                autoFocus
              />
            </div>
          </div>
          
          <div className="bg-orange-900/20 border border-orange-600/50 p-3 rounded-lg">
            <p className="text-orange-300 text-sm text-center">
              This charge will be added to the player's additional charges.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleConfirm}
            disabled={!isValid}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Charge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomChargeModal;