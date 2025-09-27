import React from 'react';
import { Button } from './ui/button';
import { RotateCcw, DollarSign, Users, Clock, ShoppingCart } from 'lucide-react';

const Dashboard = ({ stats, onReset, onMiscPurchase }) => {
  return (
    <div className="bg-slate-900 text-white p-6 shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-full">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Lucky Shot</h1>
        </div>

        {/* Center Tournament Button */}
        <div className="flex-1 flex justify-center">
          <Button
            onClick={() => window.open('/tournament', '_blank')}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <img src="/bracket.png" alt="Tournament" className="h-5 w-5 mr-3" />
            Tournament
          </Button>
        </div>
        
        <div className="flex items-center gap-6">
          <Button
            onClick={onMiscPurchase}
            className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 hover:border-purple-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add Purchase
          </Button>
          
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
            <Clock className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium">Active Tables:</span>
            <span className="text-emerald-400 font-bold">
              {stats.activeTables} / {stats.totalTables}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium">Current Revenue:</span>
            <span className="text-green-400 font-bold">
              ${stats.currentRevenue.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
            <DollarSign className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium">Daily Total:</span>
            <span className="text-blue-400 font-bold">
              ${stats.dailyTotal.toFixed(2)}
            </span>
          </div>
          
          <Button 
            onClick={onReset}
            variant="outline" 
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Daily
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;