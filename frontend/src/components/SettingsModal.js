import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Settings, Save, RotateCcw, Users, Percent } from 'lucide-react';
          <DialogDescription className="text-slate-400">Configure player rates and sales tax</DialogDescription>

const SettingsModal = ({ isOpen, onClose, onUpdateSettings, settings }) => {
          <DialogDescription className="text-slate-400">Configure player rates and sales tax</DialogDescription>
  const [rates, setRates] = useState({
    adult: 5.00,
    child: 2.00,
    member: 0.00
  });
  const [taxRate, setTaxRate] = useState(5.75);

  // Initialize form with current settings
  useEffect(() => {
    if (settings) {
      setRates({
        adult: settings.rates?.adult || 5.00,
        child: settings.rates?.child || 2.00,
        member: settings.rates?.member || 0.00
      });
      setTaxRate((settings.taxRate || 0.0575) * 100); // Convert to percentage for display
    }
  }, [settings]);

  const handleSave = () => {
    const newSettings = {
      rates: {
        adult: parseFloat(rates.adult),
        child: parseFloat(rates.child),
        member: parseFloat(rates.member)
      },
      taxRate: parseFloat(taxRate) / 100 // Convert percentage back to decimal
    };
    
    onUpdateSettings(newSettings);
    onClose();
  };

  const handleReset = () => {
    setRates({
      adult: 5.00,
      child: 2.00,
      member: 0.00
    });
    setTaxRate(5.75);
  };

  const handleRateChange = (type, value) => {
    const numValue = Math.max(0, parseFloat(value) || 0);
    setRates(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  const handleTaxRateChange = (value) => {
    const numValue = Math.max(0, Math.min(100, parseFloat(value) || 0));
    setTaxRate(numValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Settings className="h-5 w-5 text-blue-400" />
            Pool Hall Settings
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure player rates and sales tax percentage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Player Rates Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-200">Player Rates (per hour)</h3>
            </div>

            {/* Adult Rate */}
            <div className="space-y-2">
              <Label htmlFor="adult-rate" className="text-sm font-medium text-slate-200">
                Adult Rate
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">$</span>
                <Input
                  id="adult-rate"
                  type="number"
                  min="0"
                  step="0.25"
                  value={rates.adult}
                  onChange={(e) => handleRateChange('adult', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white focus:border-emerald-500"
                  placeholder="5.00"
                />
                <span className="text-slate-400">/hour</span>
              </div>
            </div>

            {/* Child Rate */}
            <div className="space-y-2">
              <Label htmlFor="child-rate" className="text-sm font-medium text-slate-200">
                Child Rate
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold">$</span>
                <Input
                  id="child-rate"
                  type="number"
                  min="0"
                  step="0.25"
                  value={rates.child}
                  onChange={(e) => handleRateChange('child', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white focus:border-blue-500"
                  placeholder="2.00"
                />
                <span className="text-slate-400">/hour</span>
              </div>
            </div>

            {/* Member Rate */}
            <div className="space-y-2">
              <Label htmlFor="member-rate" className="text-sm font-medium text-slate-200">
                Member Rate
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">$</span>
                <Input
                  id="member-rate"
                  type="number"
                  min="0"
                  step="0.25"
                  value={rates.member}
                  onChange={(e) => handleRateChange('member', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white focus:border-yellow-500"
                  placeholder="0.00"
                />
                <span className="text-slate-400">/hour</span>
              </div>
            </div>
          </div>

          {/* Tax Rate Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Percent className="h-4 w-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-200">Sales Tax Rate</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-rate" className="text-sm font-medium text-slate-200">
                Tax Percentage
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.25"
                  value={taxRate}
                  onChange={(e) => handleTaxRateChange(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white focus:border-green-500"
                  placeholder="5.75"
                />
                <span className="text-slate-400">%</span>
              </div>
              <p className="text-xs text-slate-500">
                Current rate: {taxRate}% (Applied when "Include Sales Tax" is checked during checkout)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
          <DialogDescription className="text-slate-400">Configure player rates and sales tax</DialogDescription>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
          <DialogDescription className="text-slate-400">Configure player rates and sales tax</DialogDescription>
