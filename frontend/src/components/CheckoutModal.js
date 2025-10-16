import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { LogOut, Clock, DollarSign, User, Users, Receipt, Plus, Minus, ShoppingCart, Percent } from 'lucide-react';
import { formatTime, calculateElapsedTime } from '../mock';

const CheckoutModal = ({ isOpen, onClose, onConfirm, checkoutData, settings }) => {
  const [includeTax, setIncludeTax] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [extraItems, setExtraItems] = useState([]);
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  
  // Reset form state whenever modal opens or checkoutData changes
  useEffect(() => {
    if (isOpen) {
      setIncludeTax(false);
      setDiscount(0);
      setExtraItems([]);
      setNewItemDescription('');
      setNewItemAmount('');
    }
  }, [isOpen, checkoutData]);
  
  if (!checkoutData) return null;

  const { players, subtotal, isTableCheckout, tableName } = checkoutData;
  
  const extraItemsTotal = extraItems.reduce((sum, item) => sum + item.amount, 0);
  const subtotalWithExtras = subtotal + extraItemsTotal;
  const discountAmount = Math.min(discount, subtotalWithExtras);
  const afterDiscount = subtotalWithExtras - discountAmount;
  const taxRate = settings?.taxRate || 0.0575; // Use dynamic tax rate
  const tax = includeTax ? afterDiscount * taxRate : 0;
  const total = afterDiscount + tax;

  const handleAddExtraItem = () => {
    if (newItemDescription.trim() && newItemAmount && parseFloat(newItemAmount) > 0) {
      setExtraItems([...extraItems, {
        id: Date.now(),
        description: newItemDescription.trim(),
        amount: parseFloat(newItemAmount)
      }]);
      setNewItemDescription('');
      setNewItemAmount('');
    }
  };

  const handleRemoveExtraItem = (itemId) => {
    setExtraItems(extraItems.filter(item => item.id !== itemId));
  };

  const handleConfirm = () => {
    onConfirm({
      includeTax,
      discount: discountAmount,
      extraItems: [...extraItems],
      subtotal,
      extraItemsTotal,
      afterDiscount,
      tax,
      total
    });
  };

  const handleClose = () => {
    setIncludeTax(false);
    setDiscount(0);
    setExtraItems([]);
    setNewItemDescription('');
    setNewItemAmount('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Receipt className="h-5 w-5 text-green-400" />
            {isTableCheckout ? `Checkout ${tableName}` : 'Checkout Player'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Players Section */}
          <div className="bg-slate-700 p-4 rounded-lg space-y-4 border border-slate-600">
            {isTableCheckout && (
              <div className="flex items-center gap-2 mb-3 text-lg font-semibold text-white">
                <Users className="h-5 w-5 text-emerald-400" />
                {players.length} Player{players.length > 1 ? 's' : ''} - {tableName}
              </div>
            )}
            
            {players.map((player, index) => {
              const playerSeconds = calculateElapsedTime(player);
              const playerTimeCharge = (playerSeconds / 3600) * player.rate;
              const playerTotal = playerTimeCharge + player.additionalCharges;
              
              return (
                <div key={player.id} className="border-b border-slate-600 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium text-white">{player.name}</span>
                    <span className="text-sm text-slate-300">({player.rateType})</span>
                    {player.isPaused && (
                      <span className="text-xs bg-orange-600 text-orange-100 px-2 py-1 rounded border border-orange-500">
                        PAUSED
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-slate-300 ml-8">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Time: {formatTime(playerSeconds)}
                      </span>
                      <span className="text-white">${playerTimeCharge.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Rate: ${player.rate}/hour</span>
                      <span></span>
                    </div>
                    
                    {player.additionalCharges > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Additional charges:</span>
                        <span className="text-white">${player.additionalCharges.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between font-medium text-white border-t border-slate-600 pt-1">
                      <span>Player Total:</span>
                      <span className="text-green-400">${playerTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Extra Items Section */}
          <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
            <h4 className="flex items-center gap-2 font-medium text-white mb-3">
              <ShoppingCart className="h-4 w-4 text-blue-400" />
              Additional Items
            </h4>
            
            {/* Extra Items List */}
            {extraItems.length > 0 && (
              <div className="space-y-2 mb-3">
                {extraItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-600/50 p-2 rounded border border-slate-500">
                    <span className="text-slate-200">{item.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">${item.amount.toFixed(2)}</span>
                      <Button
                        onClick={() => handleRemoveExtraItem(item.id)}
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 border-red-500 text-red-400 hover:bg-red-600/20"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Item */}
            <div className="flex gap-2">
              <Input
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Item description (e.g., Drinks, Snacks)"
                className="flex-1 bg-slate-600 border-slate-500 text-white placeholder-slate-400"
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                placeholder="$0.00"
                className="w-20 bg-slate-600 border-slate-500 text-white placeholder-slate-400"
              />
              <Button
                onClick={handleAddExtraItem}
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-400 hover:bg-blue-600/20"
                disabled={!newItemDescription.trim() || !newItemAmount || parseFloat(newItemAmount) <= 0}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Totals Section */}
          <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 space-y-3">
            <div className="flex items-center justify-between text-lg font-medium text-white">
              <span>Subtotal (Time + Charges):</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {extraItemsTotal > 0 && (
              <div className="flex items-center justify-between font-medium text-blue-400">
                <span>Additional Items:</span>
                <span>${extraItemsTotal.toFixed(2)}</span>
              </div>
            )}
            
            {/* Discount Section */}
            <div className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg bg-slate-600/50">
              <Percent className="h-4 w-4 text-yellow-400" />
              <Label className="text-slate-200 flex-1">Discount Amount:</Label>
              <Input
                type="number"
                min="0"
                max={subtotalWithExtras}
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(parseFloat(e.target.value) || 0, subtotalWithExtras)))}
                placeholder="$0.00"
                className="w-24 bg-slate-700 border-slate-500 text-white"
              />
            </div>
            
            {discount > 0 && (
              <div className="flex items-center justify-between font-medium text-yellow-400">
                <span>Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            {/* Sales Tax Option */}
            <div className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg bg-slate-600/50">
              <Checkbox
                id="includeTax"
                checked={includeTax}
                onCheckedChange={setIncludeTax}
                className="border-slate-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <label htmlFor="includeTax" className="text-sm font-medium cursor-pointer flex-1 text-slate-200">
                Include Sales Tax ({((settings?.taxRate || 0.0575) * 100).toFixed(2)}%)
              </label>
              {includeTax && (
                <span className="text-sm text-slate-300">+${tax.toFixed(2)}</span>
              )}
            </div>
            
            <div className="border-t border-slate-500 pt-3 flex items-center justify-between text-xl font-bold">
              <span className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-green-400" />
                Total:
              </span>
              <span className="text-green-400">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-slate-300 text-center">
            {isTableCheckout 
              ? `Are you sure you want to checkout all players from ${tableName}?`
              : 'Are you sure you want to checkout this player?'
            }
          </p>
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
            className="bg-green-600 hover:bg-green-700 text-white"
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