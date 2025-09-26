import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Plus, Table } from 'lucide-react';

const AddTableButton = ({ onAddTable }) => {
  return (
    <div className="relative">
      {/* Wooden Frame Border - Dashed style to indicate it's for adding */}
      <div className="bg-gradient-to-br from-amber-700/60 via-amber-600/60 to-amber-800/60 p-4 rounded-xl shadow-2xl border-4 border-dashed border-amber-700">
        {/* Inner wooden frame detail */}
        <div className="bg-gradient-to-br from-amber-500/40 to-amber-700/40 p-2 rounded-lg shadow-inner">
          {/* Add Table Surface */}
          <Card className="bg-gradient-to-br from-slate-600/80 via-slate-700/80 to-slate-800/80 border-2 border-dashed border-slate-500 shadow-xl min-h-[400px] rounded-lg overflow-hidden backdrop-blur-sm">
            {/* Texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 to-slate-900/20 rounded-lg"></div>
            
            <CardContent className="flex flex-col items-center justify-center h-full p-8 relative z-10">
              <div className="text-slate-200 text-center">
                {/* Pool table icon with wooden border effect */}
                <div className="relative mb-6">
                  <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-4 rounded-xl shadow-lg">
                    <Table className="h-16 w-16 text-emerald-300 drop-shadow-lg" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 drop-shadow-lg">Add New Table</h3>
                <p className="text-sm text-slate-300 mb-6 drop-shadow">
                  Expand your pool hall capacity
                </p>
                <Button
                  onClick={onAddTable}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg border-2 border-emerald-500"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Table
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Wooden corner reinforcements - dashed for add button */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-amber-700/60 rounded-full shadow-inner"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-amber-700/60 rounded-full shadow-inner"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-amber-700/60 rounded-full shadow-inner"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-amber-700/60 rounded-full shadow-inner"></div>
      </div>
      
      {/* Table shadow/base */}
      <div className="absolute -bottom-2 left-2 right-2 h-4 bg-slate-900/30 rounded-xl blur-sm -z-10"></div>
    </div>
  );
};

export default AddTableButton;