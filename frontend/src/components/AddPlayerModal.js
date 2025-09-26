import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { User, UserPlus } from 'lucide-react';

const AddPlayerModal = ({ isOpen, onClose, onAddPlayer, tableName }) => {
  const [playerName, setPlayerName] = useState('');
  const [rateType, setRateType] = useState('Adult');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      const rate = rateType === 'Adult' ? 5 : 2;
      onAddPlayer({
        name: playerName.trim(),
        rate,
        rateType
      });
      setPlayerName('');
      setRateType('Adult');
      onClose();
    }
  };

  const handleClose = () => {
    setPlayerName('');
    setRateType('Adult');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Add Player to {tableName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Player Name
            </Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="w-full"
              autoFocus
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rate Type</Label>
            <RadioGroup 
              value={rateType} 
              onValueChange={setRateType}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="Adult" id="adult" />
                <Label htmlFor="adult" className="flex-1 cursor-pointer">
                  <span className="font-medium">Adult</span>
                  <span className="ml-2 text-emerald-600 font-bold">$5/hour</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="Child" id="child" />
                <Label htmlFor="child" className="flex-1 cursor-pointer">
                  <span className="font-medium">Child</span>
                  <span className="ml-2 text-blue-600 font-bold">$2/hour</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!playerName.trim()}
            >
              Add Player
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlayerModal;