import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
}

const tools = [
  { id: 'pen' as ToolType, label: 'Pen' },
  { id: 'felt' as ToolType, label: 'Felt Tip' },
  { id: 'marker' as ToolType, label: 'Marker' },
  { id: 'pencil' as ToolType, label: 'Pencil' },
  { id: 'crayon' as ToolType, label: 'Crayon' },
  { id: 'ruler' as ToolType, label: 'Ruler' },
];

const colors = [
  '#ffffff', // White
  '#ff3b30', // Red
  '#ff9500', // Orange
  '#ffcc00', // Yellow
  '#4cd964', // Green
  '#5ac8fa', // Teal
  '#007aff', // Blue
  '#5856d6', // Indigo
  '#af52de', // Purple
  '#ff2d55', // Pink
  '#a2845e', // Brown
  '#8e8e93', // Gray
];

export default function Toolbar({ activeTool, setActiveTool, activeColor, onColorChange }: ToolbarProps) {
  const [showColors, setShowColors] = useState(false);
  const [lastPlusClick, setLastPlusClick] = useState(0);

  const handlePlusClick = () => {
    const now = Date.now();
    if (now - lastPlusClick < 500) {
      // Secret voice trigger (Double tap)
      window.dispatchEvent(new CustomEvent('start-voice-listening'));
    }
    setLastPlusClick(now);
  };

  return (
    <div className="h-28 bg-[#1a1a1a] pb-4 pt-4 px-4 flex items-end justify-center z-20 relative overflow-visible rounded-t-3xl border-t border-gray-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-end justify-center gap-3">
        {tools.map((tool) => (
          <ToolItem 
            // @ts-expect-error key is a special prop
            key={tool.id} 
            tool={tool.id} 
            isActive={activeTool === tool.id} 
            onClick={() => setActiveTool(tool.id)}
            color={activeColor}
          />
        ))}

        {/* Color Picker Circle */}
        <div className="flex flex-col items-center relative h-10 w-10 flex-shrink-0 self-end mb-1">
          <AnimatePresence>
            {showColors && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-16 -left-16 grid grid-cols-4 gap-2 bg-[#2a2a2a] p-3 rounded-2xl border border-gray-700 shadow-2xl z-50"
              >
                {colors.map(c => (
                  <button 
                    key={c}
                    className={`w-6 h-6 rounded-full border-2 ${activeColor === c ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      onColorChange(c);
                      setShowColors(false);
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            className="w-10 h-10 flex-shrink-0 aspect-square rounded-full p-0.5 border-2 border-white/20 bg-gradient-to-tr from-[#666] to-[#eee] overflow-hidden shadow-lg active:scale-95 transition-transform"
            onClick={() => setShowColors(!showColors)}
          >
            <div 
              className="w-full h-full rounded-full shadow-inner" 
              style={{ backgroundColor: activeColor }}
            />
          </button>
        </div>

        {/* Plus Button */}
        <button 
          onClick={handlePlusClick}
          className="w-10 h-10 flex-shrink-0 aspect-square flex items-center justify-center rounded-full bg-gray-800 text-gray-400 active:bg-gray-700 transition-colors self-end mb-1"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* iPhone Home Indicator Guard */}
      <div className="absolute bottom-1 w-32 h-1 bg-white/20 rounded-full left-1/2 -translate-x-1/2" />
    </div>
  );
}

function ToolItem({ tool, isActive, onClick, color }: { tool: ToolType; isActive: boolean; onClick: () => void; color: string }) {
  const getToolVisual = () => {
    switch (tool) {
      case 'pen':
        return (
          <div className="relative w-6 h-16 flex flex-col items-center">
            <div className="w-0.5 h-2 bg-white rounded-t-sm" />
            <div className="w-4 h-12 bg-[#222] rounded-sm relative overflow-hidden">
               <div className="absolute top-0 w-full h-2 bg-gray-700" />
               <div className="absolute bottom-1 w-full h-0.5 bg-gray-800" />
            </div>
            <div className="w-6 h-2 bg-gray-900 rounded-b-md" />
          </div>
        );
      case 'felt':
        return (
          <div className="relative w-6 h-16 flex flex-col items-center">
            <div className="w-1.5 h-3 bg-gray-400 rounded-t-md" />
            <div className="w-5 h-12 bg-[#111] rounded-sm" />
            <div className="w-6 h-2 bg-gray-900 rounded-b-md" />
          </div>
        );
      case 'marker':
        return (
          <div className="relative w-6 h-16 flex flex-col items-center">
            <div className="w-5 h-4 bg-[#ffcc00] rounded-t-sm skew-x-12" />
            <div className="w-5 h-10 bg-[#111] rounded-sm relative">
              <div className="absolute top-1 left-0.5 right-0.5 h-1.5 bg-gray-800 opacity-50" />
            </div>
            <div className="w-6 h-2 bg-gray-900 rounded-b-md" />
          </div>
        );
      case 'pencil':
        return (
            <div className="relative w-6 h-16 flex flex-col items-center">
              <div className="w-3 h-4 bg-[#ffb3ba] rounded-t-sm" />
              <div className="w-4 h-10 bg-[#222] rounded-sm flex flex-col items-center justify-between py-1">
                <div className="w-full h-0.5 bg-gray-700" />
              </div>
              <div className="w-5 h-2 bg-gray-900 rounded-b-md" />
            </div>
        );
      case 'crayon':
        return (
          <div className="relative w-6 h-16 flex flex-col items-center">
            <div className="w-3 h-3 bg-gray-800 rotate-45 mb-[-6px] rounded-sm" />
            <div className="w-5 h-12 bg-[#222] rounded-sm overflow-hidden flex flex-col gap-0.5 py-2">
               {[...Array(3)].map((_,i) => <div key={i} className="w-full h-[1px] bg-white opacity-5" />)}
            </div>
            <div className="w-6 h-2 bg-gray-900 rounded-b-md" />
          </div>
        );
      case 'ruler':
        return (
          <div className="relative w-8 h-16 flex flex-col items-center">
             <div className="w-6 h-16 bg-[#333] border border-white/5 rounded-sm relative overflow-hidden flex flex-col items-end px-1 py-1 gap-1">
                {[...Array(5)].map((_,i) => (
                  <div key={i} className={`h-[1px] bg-white/20 ${i % 2 === 0 ? 'w-full' : 'w-1/2'}`} />
                ))}
             </div>
          </div>
        );
      default:
        return <div className="w-6 h-16 bg-gray-700" />;
    }
  };



  return (
    <motion.div
      className="cursor-pointer flex flex-col items-center group"
      animate={{ y: isActive ? -25 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {/* Dynamic tip color for active tools */}
      <div 
        className="transition-colors duration-200" 
        style={{ color: isActive ? color : 'inherit' }}
      >
        {getToolVisual()}
      </div>
      
      {/* Shadow under the tool */}
      <div className={`w-6 h-1 bg-black/40 blur-[2px] rounded-full mt-[-2px] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
    </motion.div>
  );
}
