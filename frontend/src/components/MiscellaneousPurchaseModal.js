import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ShoppingCart, DollarSign, Plus } from 'lucide-react';

const MiscellaneousPurchaseModal = ({ isOpen, onClose, onConfirm }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('add'); // 'add' or 'deduct'

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setAmount('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (description.trim() && amount && parseFloat(amount) > 0) {
      onConfirm({
        description: description.trim(),
        amount: parseFloat(amount)
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setDescription('');
    setAmount('');
    onClose();
  };

  const isValid = description.trim() && amount && parseFloat(amount) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShoppingCart className="h-5 w-5 text-purple-400" />
            Add Miscellaneous Purchase
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-200">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Equipment rental, Merchandise, etc."
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-slate-200">
              Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div className="bg-purple-900/20 border border-purple-600/50 p-3 rounded-lg">
            <p className="text-purple-300 text-sm text-center">
              This amount will be added directly to today's daily total revenue.
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
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleConfirm}
            disabled={!isValid}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MiscellaneousPurchaseModal;