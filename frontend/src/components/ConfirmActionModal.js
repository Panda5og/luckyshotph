import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Clock, DollarSign, AlertCircle } from 'lucide-react';

const ConfirmActionModal = ({ isOpen, onClose, onConfirm, actionData }) => {
  if (!actionData) return null;

  const { type, amount, playerName, isSubtract } = actionData;
  
  const getIcon = () => {
    if (type === 'time') return <Clock className="h-5 w-5 text-blue-400" />;
    if (type === 'charge') return <DollarSign className="h-5 w-5 text-orange-400" />;
    return <AlertCircle className="h-5 w-5 text-yellow-400" />;
  };

  const getTitle = () => {
    if (type === 'time') {
      return isSubtract ? `Remove ${amount} Minutes` : `Add ${amount} Minutes`;
    }
    if (type === 'charge') {
      return isSubtract ? `Remove $${amount}` : `Add $${amount}`;
    }
    return 'Confirm Action';
  };

  const getDescription = () => {
    const action = isSubtract ? 'subtract' : 'add';
    if (type === 'time') {
      return `Are you sure you want to ${action} ${amount} minutes ${isSubtract ? 'from' : 'to'} ${playerName}?`;
    }
    if (type === 'charge') {
      return `Are you sure you want to ${action} $${amount} ${isSubtract ? 'from' : 'to'} ${playerName}'s charges?`;
    }
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-slate-400 sr-only">
            Confirm the selected action for {playerName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-slate-300 text-center">
            {getDescription()}
          </p>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            className={`text-white ${
              isSubtract 
                ? 'bg-red-600 hover:bg-red-700' 
                : type === 'time' 
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-orange-600 hover:bg-orange-700'
            }`}
            onClick={onConfirm}
          >
            {isSubtract ? 'Remove' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmActionModal;