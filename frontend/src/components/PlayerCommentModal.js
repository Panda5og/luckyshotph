import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { MessageSquare, Save } from 'lucide-react';

const PlayerCommentModal = ({ isOpen, onClose, onSave, playerName, currentComment = '' }) => {
  const [comment, setComment] = useState(currentComment);

  const handleSave = () => {
    onSave(comment.trim());
    onClose();
  };

  const handleClose = () => {
    setComment(currentComment); // Reset to original comment
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            Comment for {playerName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment about this player..."
            className="min-h-[100px] bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
            maxLength={500}
          />
          <div className="text-xs text-slate-400 text-right">
            {comment.length}/500 characters
          </div>
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerCommentModal;