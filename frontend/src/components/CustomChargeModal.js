import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DollarSign, Plus, Coffee, AlertTriangle } from 'lucide-react';

const CustomChargeModal = ({ isOpen, onClose, onConfirm, playerName }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

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

  const handlePresetClick = (presetDescription, presetAmount) => {
    setDescription(presetDescription);
    setAmount(presetAmount.toString());
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

          {/* Preset Buttons */}
          <div className="space-y-2">
            <Label className="text-slate-200">Quick Add:</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick('Drink', 1)}
                className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-900/20 hover:text-blue-300"
              >
                <Coffee className="h-3 w-3 mr-1" />
                Drink - $1
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick('Scratch', 1)}
                className="flex-1 border-red-600 text-red-400 hover:bg-red-900/20 hover:text-red-300"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Scratch - $1
              </Button>
            </div>
          </div>
          
          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="charge-description" className="text-slate-200">
              Item Description
            </Label>
            <Input
              id="charge-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Drink, Scratch, Food, etc."
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500"
            />
          </div>
          
          {/* Amount Field */}
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
              />
            </div>
          </div>
          
          <div className="bg-orange-900/20 border border-orange-600/50 p-3 rounded-lg">
            <p className="text-orange-300 text-sm text-center">
              This charge will be tracked as an extra item for analytics.
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