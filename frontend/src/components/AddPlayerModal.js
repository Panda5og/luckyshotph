import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { User, UserPlus, Star } from 'lucide-react';

const AddPlayerModal = ({ isOpen, onClose, onAddPlayer, tableName, settings }) => {
  const [playerName, setPlayerName] = useState('');
  const [rateType, setRateType] = useState('Adult');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      let rate;
      switch(rateType) {
        case 'Adult':
          rate = settings?.rates?.adult || 5;
          break;
        case 'Child':
          rate = settings?.rates?.child || 2;
          break;
        case 'Member':
          rate = settings?.rates?.member || 0;
          break;
        default:
          rate = settings?.rates?.adult || 5;
      }
      
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
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <UserPlus className="h-5 w-5 text-emerald-400" />
            Add Player to {tableName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="flex items-center gap-2 text-slate-200">
              <User className="h-4 w-4" />
              Player Name
            </Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="w-full bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
              autoFocus
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-200">Rate Type</Label>
            <RadioGroup 
              value={rateType} 
              onValueChange={setRateType}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors bg-slate-700/50">
                <RadioGroupItem 
                  value="Adult" 
                  id="adult" 
                  className="border-slate-400 text-emerald-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <Label htmlFor="adult" className="flex-1 cursor-pointer text-slate-200">
                  <span className="font-medium">Adult</span>
                  <span className="ml-2 text-emerald-400 font-bold">${(settings?.rates?.adult || 5).toFixed(2)}/hour</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors bg-slate-700/50">
                <RadioGroupItem 
                  value="Child" 
                  id="child" 
                  className="border-slate-400 text-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="child" className="flex-1 cursor-pointer text-slate-200">
                  <span className="font-medium">Child</span>
                  <span className="ml-2 text-blue-400 font-bold">${(settings?.rates?.child || 2).toFixed(2)}/hour</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors bg-slate-700/50">
                <RadioGroupItem 
                  value="Member" 
                  id="member" 
                  className="border-slate-400 text-yellow-400 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                />
                <Label htmlFor="member" className="flex-1 cursor-pointer text-slate-200">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Member</span>
                    <Star className="h-3 w-3 text-yellow-400" />
                  </div>
                  <span className="ml-2 text-yellow-400 font-bold">
                    {(settings?.rates?.member || 0) === 0 ? 'FREE' : `$${(settings?.rates?.member || 0).toFixed(2)}/hour`}
                  </span>
                </Label>
              </div>
            </RadioGroup>
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
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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