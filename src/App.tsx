/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Undo2, Redo2, MoreHorizontal, ChevronLeft } from 'lucide-react';
import { ToolType, Stroke, Point, PresetDrawing } from './types';
import confetti from 'canvas-confetti';
import { generateHandDrawnShape } from './utils';

// Components
import Toolbar from './components/Toolbar';
import TopBar from './components/TopBar';
import DrawingCanvas from './components/DrawingCanvas';
import SecretMenu from './components/SecretMenu';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [history, setHistory] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [showSecretMenu, setShowSecretMenu] = useState(false);
  const [presets, setPresets] = useState<PresetDrawing[]>(() => {
    const saved = localStorage.getItem('sketchpro-presets');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Cerchio', triggerWord: 'OTTIMO', strokes: generateHandDrawnShape('circle') },
      { id: '2', name: 'Quadrato', triggerWord: 'PERFETTO', strokes: generateHandDrawnShape('square') },
      { id: '3', name: 'Triangolo', triggerWord: 'FANTASTICO', strokes: generateHandDrawnShape('triangle') },
    ];
  });
  
  const [isListening, setIsListening] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('sketchpro-presets', JSON.stringify(presets));
  }, [presets]);

  const handleVoiceInput = (text: string) => {
    const upperText = text.toUpperCase();
    presets.forEach(preset => {
      if (upperText.includes(preset.triggerWord)) {
        setHistory(prev => [...prev, ...preset.strokes]);
        stopListening();
      }
    });
  };

  const startListening = () => {
    setIsListening(true);
    setTimeout(() => {
      hiddenInputRef.current?.focus();
      hiddenInputRef.current?.click();
    }, 100);
  };

  const stopListening = () => {
    setIsListening(false);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
      hiddenInputRef.current.blur();
    }
  };

  useEffect(() => {
    const openSecretMenu = () => setShowSecretMenu(true);
    const startVoice = () => startListening();

    window.addEventListener('open-secret-menu', openSecretMenu);
    window.addEventListener('start-voice-listening', startVoice);
    return () => {
      window.removeEventListener('open-secret-menu', openSecretMenu);
      window.removeEventListener('start-voice-listening', startVoice);
    };
  }, []);

  const pushToCanvas = useCallback((strokes: Stroke[]) => {
    setHistory(prev => [...prev, ...strokes]);
    setRedoStack([]);
  }, []);
  
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastStroke = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastStroke]);
  }, [history]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextStroke = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setHistory(prev => [...prev, nextStroke]);
  }, [redoStack]);

  const addStroke = useCallback((stroke: Stroke) => {
    setHistory(prev => [...prev, stroke]);
    setRedoStack([]);
  }, []);

  const handleDone = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#eebd3b', '#ffffff', '#ff3b30']
    });
    // Here we could save to local storage or external service
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-sans select-none overflow-hidden touch-none">
      <TopBar 
        onUndo={handleUndo} 
        onRedo={handleRedo} 
        canUndo={history.length > 0} 
        canRedo={redoStack.length > 0} 
        onDone={handleDone}
      />
      
      <main className="flex-1 relative overflow-hidden">
        <DrawingCanvas 
          activeTool={activeTool} 
          activeColor={activeColor} 
          history={history}
          onStrokeComplete={addStroke}
        />
      </main>

      <Toolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        activeColor={activeColor}
        onColorChange={setActiveColor}
      />

      <AnimatePresence>
        {showSecretMenu && (
          <SecretMenu 
            presets={presets}
            onClose={() => setShowSecretMenu(false)}
            onSavePresets={setPresets}
            currentStrokes={history}
            onPushToCanvas={pushToCanvas}
          />
        )}
      </AnimatePresence>

      {/* Hidden input to trigger native keyboard/voice */}
      <input 
        ref={hiddenInputRef}
        type="text"
        className="fixed opacity-0 pointer-events-none top-[-100px]"
        onChange={(e) => handleVoiceInput(e.target.value)}
        onBlur={() => setIsListening(false)}
      />

      {/* Voice feedback overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] py-2 px-6 bg-[#eebd3b] text-black rounded-full font-bold flex items-center gap-2 shadow-2xl"
          >
            <div className="w-2 h-2 bg-black rounded-full animate-ping" />
            <span>Ascoltando...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile specific optimization: hide browser UI as much as possible */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          overscroll-behavior: none;
        }
        body {
          position: fixed;
          width: 100%;
          height: 100%;
          overflow: hidden;
          margin: 0;
          padding: 0;
          background-color: black;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }
        #root {
          height: 100%;
        }
      `}} />
    </div>
  );
}

