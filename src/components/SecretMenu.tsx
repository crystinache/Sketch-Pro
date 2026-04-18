import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Trash2, Edit2, Check, ZoomIn } from 'lucide-react';
import { PresetDrawing, Stroke } from '../types';

interface SecretMenuProps {
  onClose: () => void;
  presets: PresetDrawing[];
  onSavePresets: (presets: PresetDrawing[]) => void;
  currentStrokes: Stroke[]; // Used to "capture" a new drawing if needed
  onPushToCanvas: (strokes: Stroke[]) => void; // Added to allow editing on main canvas
}

export default function SecretMenu({ onClose, presets, onSavePresets, currentStrokes, onPushToCanvas }: SecretMenuProps) {
  const [localPresets, setLocalPresets] = useState<PresetDrawing[]>(presets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTrigger, setEditTrigger] = useState("");
  const [editName, setEditName] = useState("");
  const [previewPreset, setPreviewPreset] = useState<PresetDrawing | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo disegno preinfostato?")) {
      setLocalPresets(prev => prev.filter(p => p.id !== id));
    }
  };

  const startEdit = (preset: PresetDrawing) => {
    setEditingId(preset.id);
    setEditTrigger(preset.triggerWord);
    setEditName(preset.name);
  };

  const saveEdit = (id: string) => {
    setLocalPresets(prev => prev.map(p => 
      p.id === id ? { ...p, triggerWord: editTrigger.toUpperCase(), name: editName } : p
    ));
    setEditingId(null);
  };

  const handleAddNew = () => {
    const newId = Date.now().toString();
    const newPreset: PresetDrawing = {
      id: newId,
      name: `Nuovo Disegno ${localPresets.length + 1}`,
      triggerWord: "NUOVO",
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

  const handleEditOnCanvas = (preset: PresetDrawing) => {
    if (window.confirm(`Vuoi caricare questo disegno sul foglio principale per modificarlo?\nNota: Questo aggiungerà il disegno a quello che hai già sul foglio.`)) {
      onPushToCanvas(preset.strokes);
      onClose();
    }
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
                <div 
                  onClick={() => setPreviewPreset(preset)}
                  className="w-16 h-16 bg-black rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform"
                >
                  <svg viewBox="0 0 400 600" className="w-full h-full p-2">
                    {preset.strokes.map((s, si) => (
                      <path 
                        key={si}
                        d={`M ${s.points[0].x} ${s.points[0].y} ${s.points.map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                        stroke="white"
                        strokeWidth="20"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  {editingId === preset.id ? (
                    <>
                      <input 
                        className="bg-gray-800 border-none rounded px-2 py-1 text-white w-32 outline-none font-bold text-sm"
                        value={editTrigger}
                        placeholder="Parola..."
                        onChange={(e) => setEditTrigger(e.target.value)}
                      />
                      <input 
                        className="bg-gray-800/50 border-none rounded px-2 py-1 text-gray-300 w-32 outline-none text-xs"
                        value={editName}
                        placeholder="Nome..."
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-bold text-[#eebd3b] uppercase tracking-widest">{preset.triggerWord}</span>
                      <p className="text-xs text-gray-500">{preset.name}</p>
                    </>
                  )}
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
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleCaptureActual(preset.id)}
                className="flex-1 py-2 bg-gray-800 rounded-xl text-[10px] font-medium text-gray-300 active:bg-gray-700"
              >
                CATTURA CORRENTE
              </button>
              <button 
                onClick={() => handleEditOnCanvas(preset)}
                className="flex-1 py-2 bg-[#eebd3b]/10 border border-[#eebd3b]/20 rounded-xl text-[10px] font-medium text-[#eebd3b] active:bg-[#eebd3b]/20"
              >
                MODIFICA SU FOGLIO
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={handleAddNew}
          className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 hover:border-gray-700 transition-all font-medium"
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
          className="w-full py-4 bg-[#eebd3b] text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#eebd3b]/20 active:scale-95 transition-transform"
        >
          <Save size={20} />
          SALVA TUTTO
        </button>
      </div>

      {/* Full Screen Preview */}
      <AnimatePresence>
        {previewPreset && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black z-[60] flex flex-col"
          >
            <div className="p-6 flex items-center justify-between">
               <h3 className="text-[#eebd3b] font-bold text-xl">{previewPreset.name}</h3>
               <button onClick={() => setPreviewPreset(null)} className="p-2 bg-gray-800 rounded-full text-white">
                 <X size={24} />
               </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
               <div className="w-full aspect-[2/3] max-h-[70vh] bg-[#0a0a0a] rounded-3xl border border-gray-800 overflow-hidden relative shadow-2xl">
                  <svg viewBox="0 0 400 600" className="w-full h-full">
                    {previewPreset.strokes.map((s, si) => (
                      <path 
                        key={si}
                        d={`M ${s.points[0].x} ${s.points[0].y} ${s.points.map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </svg>
               </div>
            </div>
            <div className="p-8">
               <button 
                onClick={() => {
                  handleEditOnCanvas(previewPreset);
                  setPreviewPreset(null);
                }}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2"
               >
                 <Edit2 size={20} />
                 MODIFICA SUL FOGLIO PRINCIPALE
               </button>
               <p className="text-center text-gray-500 text-xs mt-4">
                 Modifica il disegno sul foglio principale e usa "CATTURA CORRENTE" per salvare le modifiche.
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
