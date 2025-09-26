import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Plus, Table } from 'lucide-react';

const AddTableButton = ({ onAddTable }) => {
  return (
    <Card className="bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500 shadow-xl min-h-[400px] border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-slate-300 text-center">
          <Table className="h-16 w-16 mx-auto mb-4 opacity-60" />
          <h3 className="text-xl font-semibold mb-2">Add New Table</h3>
          <p className="text-sm text-slate-400 mb-6">
            Expand your pool hall capacity
          </p>
          <Button
            onClick={onAddTable}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Table
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddTableButton;