import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { PresetDrawing, Stroke } from '../types';

interface SecretMenuProps {
  onClose: () => void;
  presets: PresetDrawing[];
  onSavePresets: (presets: PresetDrawing[]) => void;
  currentStrokes: Stroke[]; // Used to "capture" a new drawing if needed
}

export default function SecretMenu({ onClose, presets, onSavePresets, currentStrokes }: SecretMenuProps) {
  const [localPresets, setLocalPresets] = useState<PresetDrawing[]>(presets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTrigger, setEditTrigger] = useState("");

  const handleDelete = (id: string) => {
    setLocalPresets(prev => prev.filter(p => p.id !== id));
  };

  const startEdit = (preset: PresetDrawing) => {
    setEditingId(preset.id);
    setEditTrigger(preset.triggerWord);
  };

  const saveEdit = (id: string) => {
    setLocalPresets(prev => prev.map(p => 
      p.id === id ? { ...p, triggerWord: editTrigger.toUpperCase() } : p
    ));
    setEditingId(null);
  };

  const handleAddNew = () => {
    const newId = Date.now().toString();
    const newPreset: PresetDrawing = {
      id: newId,
      name: `New Drawing ${localPresets.length + 1}`,
      triggerWord: "NEW",
      strokes: currentStrokes.length > 0 ? [...currentStrokes] : []
    };
    setLocalPresets(prev => [...prev, newPreset]);
    startEdit(newPreset);
  };

  const handleCaptureActual = (id: string) => {
    if (currentStrokes.length === 0) {
      alert("Disegna qualcosa sul foglio prima di catturare!");
      return;
    }
    setLocalPresets(prev => prev.map(p => 
      p.id === id ? { ...p, strokes: [...currentStrokes] } : p
    ));
    alert("Disegno catturato con successo!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 bg-[#0c0c0c] z-50 flex flex-col p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#eebd3b]">Menu Segreto</h2>
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {localPresets.map((preset) => (
          <div key={preset.id} className="bg-[#1a1a1a] p-4 rounded-2xl border border-gray-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 400 600" className="w-full h-full">
                    {preset.strokes.map((s, si) => (
                      <path 
                        key={si}
                        d={`M ${s.points[0].x} ${s.points[0].y} ${s.points.map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                        stroke="white"
                        strokeWidth="10"
                        fill="none"
                      />
                    ))}
                  </svg>
                </div>
                <div>
                  {editingId === preset.id ? (
                    <input 
                      autoFocus
                      className="bg-gray-800 border-none rounded px-2 py-1 text-white w-32 outline-none font-bold"
                      value={editTrigger}
                      onChange={(e) => setEditTrigger(e.target.value)}
                    />
                  ) : (
                    <span className="text-lg font-bold text-[#eebd3b] uppercase tracking-widest">{preset.triggerWord}</span>
                  )}
                  <p className="text-xs text-gray-500">{preset.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingId === preset.id ? (
                  <button onClick={() => saveEdit(preset.id)} className="p-2 bg-green-900 rounded-full text-green-300">
                    <Check size={20} />
                  </button>
                ) : (
                  <button onClick={() => startEdit(preset)} className="p-2 bg-gray-800 rounded-full text-gray-400">
                    <Edit2 size={20} />
                  </button>
                )}
                <button onClick={() => handleDelete(preset.id)} className="p-2 bg-red-900/30 rounded-full text-red-500">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => handleCaptureActual(preset.id)}
              className="w-full py-2 bg-gray-800 rounded-xl text-xs font-medium text-gray-300 active:bg-gray-700"
            >
              CATTURA DISEGNO CORRENTE
            </button>
          </div>
        ))}

        <button 
          onClick={handleAddNew}
          className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 hover:border-gray-700 transition-all"
        >
          <Plus size={20} />
          <span>Aggiungi Nuovo Disegno</span>
        </button>
      </div>

      <div className="mt-8 pb-4">
        <button 
          onClick={() => {
            onSavePresets(localPresets);
            onClose();
          }}
          className="w-full py-4 bg-[#eebd3b] text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#eebd3b]/20"
        >
          <Save size={20} />
          SALVA MODIFICHE
        </button>
      </div>
    </motion.div>
  );
}
