import React from 'react';
import { Button } from './ui/button';
import { RotateCcw, DollarSign, Clock, ShoppingCart, Settings } from 'lucide-react';

const Dashboard = ({ stats, onReset, onMiscPurchase, onOpenSettings }) => {
  return (
    <div className="bg-slate-900 text-white p-6 shadow-lg">
      <div className="flex items-center justify-evenly max-w-7xl mx-auto gap-6">
        {/* Logo */}
        <img
          src={`${process.env.PUBLIC_URL}/ls_logo.png`}
          alt="Lucky Shot"
          className="h-20 w-auto"
        />
        
        {/* Tournament Button */}
        <Button
          onClick={() => window.open('https://brackethq.com/', '_blank')}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <img
            src={`${process.env.PUBLIC_URL}/bracket.png`}
            alt="Tournament"
            className="h-5 w-5 mr-3"
          />
          Tournament
        </Button>

        {/* Add Purchase Button */}
        <Button
          onClick={onMiscPurchase}
          className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 hover:border-purple-700"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add Purchase
        </Button>
          
        {/* Active Tables Card */}
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
          <Clock className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">Active Tables:</span>
          <span className="text-emerald-400 font-bold">
            {stats.activeTables} / {stats.totalTables}
          </span>
        </div>

        {/* Current Revenue Card */}
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
          <DollarSign className="h-5 w-5 text-green-400" />
          <span className="text-sm font-medium">Current Revenue:</span>
          <span className="text-green-400 font-bold">
            ${stats.currentRevenue.toFixed(2)}
          </span>
        </div>

        {/* Daily Total Card */}
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
          <DollarSign className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-medium">Daily Total:</span>
          <span className="text-blue-400 font-bold">
            ${stats.dailyTotal.toFixed(2)}
          </span>
        </div>

        {/* Reset Daily Button */}
        <Button 
          onClick={onReset}
          variant="outline" 
          className="border-red-600 text-red-400 hover:bg-red-900/20 hover:text-red-300"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Daily
        </Button>

        {/* Settings Button - Icon Only */}
        <Button 
          onClick={onOpenSettings}
          variant="outline" 
          className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white p-2"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
