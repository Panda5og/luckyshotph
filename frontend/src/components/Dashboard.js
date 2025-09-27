import React from 'react';
import { Button } from './ui/button';
import { RotateCcw, DollarSign, Users, Clock, ShoppingCart } from 'lucide-react';

const Dashboard = ({ stats, onReset }) => {
  return (
    <div className="bg-slate-900 text-white p-6 shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-full">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Lucky Shot</h1>
        </div>
        
        <div className="flex items-center gap-8">
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