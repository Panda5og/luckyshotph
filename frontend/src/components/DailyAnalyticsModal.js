import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { BarChart3, Users, DollarSign, Percent, Clock, ShoppingBag, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Utility function to consolidate extra items
const consolidateExtraItems = (extraItems) => {
  if (!extraItems || extraItems.length === 0) return [];
  
  const consolidated = {};
  
  extraItems.forEach(item => {
    const key = `${item.description}_${item.type}`;
    if (consolidated[key]) {
      consolidated[key].count += 1;
      consolidated[key].totalAmount += item.amount;
    } else {
      consolidated[key] = {
        description: item.description,
        type: item.type,
        count: 1,
        totalAmount: item.amount,
        unitAmount: item.amount
      };
    }
  });
  
  return Object.values(consolidated);
};

const DailyAnalyticsModal = ({ isOpen, onClose, onConfirm, analytics }) => {
  if (!analytics) return null;

  const {
    totalPlayers,
    adults,
    children,
    members,
    totalTax,
    totalRevenue,
    totalDiscount,
    timeValue,
    extraValue,
    extraItems = []
  } = analytics;

  const downloadPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString();
    const timeStr = currentDate.toLocaleTimeString();
    
    // Set font styles
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    
    // Title
    doc.text('Lucky Shot Pool Hall', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Daily Analytics Report', 105, 30, { align: 'center' });
          <DialogDescription className="text-slate-400">View and download daily revenue analytics</DialogDescription>
    
    // Date and time
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${dateStr} at ${timeStr}`, 105, 40, { align: 'center' });
    
    // Draw a line separator
    doc.line(20, 45, 190, 45);
    
    let yPosition = 55;
    
    // Player Statistics Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Player Statistics', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Players: ${totalPlayers}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Adults ($5/hr): ${adults}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Children ($2/hr): ${children}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Members (FREE): ${members}`, 25, yPosition);
    yPosition += 15;
    
    // Revenue Breakdown Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Revenue Breakdown', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Time Value: $${timeValue.toFixed(2)}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Extra Items: $${extraValue.toFixed(2)}`, 25, yPosition);
    yPosition += 8;
    
    // Add detailed extra items if any
    if (extraItems && extraItems.length > 0) {
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Extra Items Detail:', 30, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      consolidateExtraItems(extraItems).forEach((item, index) => {
        const countText = item.count > 1 ? ` (${item.count}x)` : '';
        const itemText = `• ${item.description}${countText} - $${item.totalAmount.toFixed(2)} (${
          item.type === 'miscellaneous' ? 'Direct' : 
          item.type === 'player_item' ? 'Player' : 'Checkout'
        })`;
        doc.text(itemText, 35, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
      
      doc.setFontSize(11);
    }
    
    doc.text(`Subtotal: $${(timeValue + extraValue).toFixed(2)}`, 25, yPosition);
    yPosition += 8;
    
    if (totalDiscount > 0) {
      doc.text(`Total Discounts: -$${totalDiscount.toFixed(2)}`, 25, yPosition);
      yPosition += 8;
    }
    
    doc.text(`Sales Tax (5.75%): $${totalTax.toFixed(2)}`, 25, yPosition);
    yPosition += 8;
    
    // Draw line before total
    doc.line(25, yPosition, 100, yPosition);
    yPosition += 8;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 25, yPosition);
    yPosition += 15;
    
    // Payment Methods Breakdown
    if (analytics.paymentMethods) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Methods Breakdown', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Cash: $${analytics.paymentMethods.cash.toFixed(2)}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Credit Card: $${analytics.paymentMethods.creditCard.toFixed(2)}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Venmo: $${analytics.paymentMethods.venmo.toFixed(2)}`, 25, yPosition);
      yPosition += 8;
      
      // Draw line before total
      doc.line(25, yPosition, 100, yPosition);
      yPosition += 8;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      const totalCollected = analytics.paymentMethods.cash + analytics.paymentMethods.creditCard + analytics.paymentMethods.venmo;
      doc.text(`Total Collected: $${totalCollected.toFixed(2)}`, 25, yPosition);
    }
    
    // Generate filename with current date
    const filename = `daily-analytics-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}.pdf`;
    
    // Save the PDF
    doc.save(filename);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Daily Analytics Summary
          </DialogTitle>
          <DialogDescription className="text-slate-400">View and download daily revenue analytics</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Player Statistics */}
          <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
            <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
              <Users className="h-4 w-4 text-emerald-400" />
              Player Statistics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Total Players:</span>
                <span className="text-white font-medium">{totalPlayers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Adults ($5/hr):</span>
                <span className="text-emerald-400 font-medium">{adults}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Children ($2/hr):</span>
                <span className="text-blue-400 font-medium">{children}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Members (FREE):</span>
                <span className="text-yellow-400 font-medium">{members}</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
            <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
              <DollarSign className="h-4 w-4 text-green-400" />
              Revenue Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="h-3 w-3" />
                  Time Value:
                </span>
                <span className="text-blue-400 font-medium">${timeValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-slate-300">
                  <ShoppingBag className="h-3 w-3" />
                  Extra Items:
                </span>
                <span className="text-orange-400 font-medium">${extraValue.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Subtotal:</span>
                  <span className="text-white font-medium">${(timeValue + extraValue).toFixed(2)}</span>
                </div>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Percent className="h-3 w-3" />
                    Total Discounts:
                  </span>
                  <span className="text-yellow-400 font-medium">-${totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Sales Tax (5.75%):</span>
                <span className="text-purple-400 font-medium">${totalTax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total Revenue:</span>
                  <span className="text-green-400">${totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Extra Items */}
          <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
            <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
              <ShoppingBag className="h-4 w-4 text-purple-400" />
              Extra Items Details ({extraItems.length} items)
            </h3>
            {extraItems.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {consolidateExtraItems(extraItems).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm bg-slate-600/50 p-2 rounded border border-slate-500">
                    <div className="flex-1">
                      <span className="text-slate-200">
                        {item.description}
                        {item.count > 1 && <span className="text-purple-400"> ({item.count}x)</span>}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        ({item.type === 'miscellaneous' ? 'Direct Purchase' : 
                          item.type === 'player_item' ? 'Player Charge' : 'Checkout Item'})
                      </span>
                    </div>
                    <span className="text-white font-medium">${item.totalAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-2">No extra items recorded for today.</p>
            )}
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
            <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
              <DollarSign className="h-4 w-4 text-green-400" />
              Payment Methods Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Cash:
                </span>
                <span className="text-green-400 font-medium">${(analytics.paymentMethods?.cash || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Credit Card:
                </span>
                <span className="text-blue-400 font-medium">${(analytics.paymentMethods?.creditCard || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  Venmo:
                </span>
                <span className="text-purple-400 font-medium">${(analytics.paymentMethods?.venmo || 0).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-600 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total Collected:</span>
                  <span className="text-green-400">
                    ${((analytics.paymentMethods?.cash || 0) + (analytics.paymentMethods?.creditCard || 0) + (analytics.paymentMethods?.venmo || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-900/20 border border-red-600/50 p-4 rounded-lg">
            <p className="text-red-300 text-sm text-center">
              <strong>Warning:</strong> This will reset all daily totals and analytics to zero. 
              This action cannot be undone.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={downloadPDF}
            className="border-blue-600 text-blue-400 hover:bg-blue-900/20 hover:text-blue-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
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
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Reset Daily Analytics
          <DialogDescription className="text-slate-400">View and download daily revenue analytics</DialogDescription>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DailyAnalyticsModal;