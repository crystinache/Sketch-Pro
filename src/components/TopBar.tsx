import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Undo2, Redo2, MoreHorizontal, ChevronLeft } from 'lucide-react';

interface TopBarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDone?: () => void;
}

export default function TopBar({ onUndo, onRedo, canUndo, canRedo, onDone }: TopBarProps) {
  const [lastDoneClick, setLastDoneClick] = useState(0);

  const handleDoneClick = () => {
    const now = Date.now();
    if (now - lastDoneClick < 400) {
      window.dispatchEvent(new CustomEvent('open-secret-menu'));
    } else {
      onDone?.();
    }
    setLastDoneClick(now);
  };

  return (
    <header className="h-14 px-4 flex items-center justify-between z-20">
      <div className="flex items-center gap-1 text-[#eebd3b] cursor-pointer" onClick={onDone}>
        <ChevronLeft size={24} />
        <span className="font-medium">Notes</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onUndo} 
          disabled={!canUndo}
          className={`p-1.5 rounded-full border border-gray-700 ${canUndo ? 'text-gray-300 active:bg-gray-800' : 'text-gray-600'}`}
        >
          <Undo2 size={20} />
        </button>
        <button 
          onClick={onRedo} 
          disabled={!canRedo}
          className={`p-1.5 rounded-full border border-gray-700 ${canRedo ? 'text-gray-300 active:bg-gray-800' : 'text-gray-600'}`}
        >
          <Redo2 size={20} />
        </button>
      </div>
      
      <div className="flex items-center gap-4 text-[#eebd3b]">
        <button className="p-1.5 rounded-full border border-gray-700 text-gray-300">
          <MoreHorizontal size={20} />
        </button>
        <span className="font-semibold text-lg cursor-pointer active:opacity-60 transition-opacity" onClick={handleDoneClick}>Done</span>
      </div>
    </header>
  );
}

