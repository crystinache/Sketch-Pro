import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, Stroke, Point } from '../types';

interface DrawingCanvasProps {
  activeTool: ToolType;
  activeColor: string;
  history: Stroke[];
  onStrokeComplete: (stroke: Stroke) => void;
}

export default function DrawingCanvas({ activeTool, activeColor, history, onStrokeComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getToolSettings = (tool: ToolType) => {
    switch (tool) {
      case 'pen': return { width: 3, opacity: 1, globalCompositeOperation: 'source-over' };
      case 'felt': return { width: 6, opacity: 0.9, globalCompositeOperation: 'source-over' };
      case 'marker': return { width: 30, opacity: 0.3, globalCompositeOperation: 'source-over' };
      case 'pencil': return { width: 40, opacity: 1, globalCompositeOperation: 'destination-out' };
      case 'crayon': return { width: 12, opacity: 0.8, globalCompositeOperation: 'source-over' };
      case 'ruler': return { width: 2, opacity: 1, globalCompositeOperation: 'source-over' };
      default: return { width: 2, opacity: 1, globalCompositeOperation: 'source-over' };
    }
  };


  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;

    const settings = getToolSettings(stroke.tool);
    ctx.globalAlpha = stroke.opacity;
    ctx.globalCompositeOperation = settings.globalCompositeOperation as GlobalCompositeOperation;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      // Quadratic curve for smoothness
      const xc = (stroke.points[i].x + stroke.points[i - 1].x) / 2;
      const yc = (stroke.points[i].y + stroke.points[i - 1].y) / 2;
      ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, xc, yc);
    }

    ctx.stroke();
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Initial background (black) - though transparency is usually better for saving
    // but the app look is black background.
    
    history.forEach(stroke => {
      drawStroke(ctx, stroke);
    });

    if (isDrawing && currentStroke.length > 0) {
      const settings = getToolSettings(activeTool);
      drawStroke(ctx, {
        tool: activeTool,
        color: activeColor,
        width: settings.width,
        opacity: settings.opacity,
        points: currentStroke
      });
    }
  }, [history, isDrawing, currentStroke, activeTool, activeColor]);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      
      redraw();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redraw]);

  useEffect(() => {
    redraw();
  }, [history, redraw]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getPoint(e);
    if (point) setCurrentStroke([point]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const point = getPoint(e);
    if (point) {
      setCurrentStroke(prev => [...prev, point]);
    }
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentStroke.length > 1) {
      const settings = getToolSettings(activeTool);
      onStrokeComplete({
        tool: activeTool,
        color: activeColor,
        width: settings.width,
        opacity: settings.opacity,
        points: currentStroke
      });
    }
    setCurrentStroke([]);
  };

  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    
    let clientX, clientY, pressure = 1;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // In some browsers, pressure is supported
      if ((e.touches[0] as any).force) pressure = (e.touches[0] as any).force;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      pressure
    };
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black cursor-crosshair">
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="block"
      />
      
      {activeTool === 'ruler' && (
        <RulerOverlay />
      )}
    </div>
  );
}

function RulerOverlay() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 w-80 h-32 bg-gray-500/20 backdrop-blur-sm border border-white/10 rounded-lg pointer-events-auto cursor-move flex items-center justify-center">
      <div className="w-full flex justify-between px-4 opacity-50 font-mono text-xs">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-[1px] h-3 bg-white" />
            <span>{i * 10}</span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 w-full h-1 bg-white/20" />
      <div className="absolute bottom-0 w-full h-1 bg-white/20" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white font-bold">
        12°
      </div>
    </div>
  );
}
