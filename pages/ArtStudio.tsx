
import React, { useRef, useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Trash2, Eraser, PenTool, Circle, Undo2 } from 'lucide-react';

const ArtStudio: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#EF4444'); // Started with Red
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(8);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  
  // History for Undo
  const [history, setHistory] = useState<ImageData[]>([]);

  // Palette with bright simple colors
  const palette = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#A855F7', // Purple
    '#EC4899', // Pink
    '#000000', // Black
    '#FFFFFF'  // White
  ];

  useEffect(() => {
    initCanvas();
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // High DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0,0, rect.width, rect.height);
        saveState(); // Initial white state
      }
    }
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
       setHistory(prev => [...prev.slice(-9), imageData]); // Keep last 10 states
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return; // Always keep 1 state (blank/initial)
    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const previousState = newHistory[newHistory.length - 1];
    setHistory(newHistory);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && previousState) {
        ctx.putImageData(previousState, 0, 0);
    }
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.beginPath();
        saveState(); // Save after stroke finishes
    }
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    
    // Smooth drawing
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, rect.width, rect.height);
      saveState();
    }
  };

  return (
    <Layout title="Lousa Mágica" color="text-amber-600">
      <div className="flex flex-col h-full gap-4">
        
        {/* Canvas Container */}
        <div className="flex-1 bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden relative shadow-sm">
           <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="w-full h-full touch-none cursor-crosshair"
          />
        </div>

        {/* Tools Panel */}
        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex flex-col gap-4 shadow-none">
          
          {/* Top Row: Tools & Clear */}
          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                <button 
                  onClick={handleUndo}
                  className="p-3 rounded-2xl border bg-slate-800 border-slate-700 text-slate-300 active:scale-95 transition-transform"
                >
                  <Undo2 />
                </button>
                <button 
                  onClick={() => setTool('pen')} 
                  className={`p-3 rounded-2xl border transition-all active:scale-95 ${tool === 'pen' ? 'bg-amber-800 border-amber-700 text-amber-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                >
                  <PenTool />
                </button>
                <button 
                  onClick={() => setTool('eraser')} 
                  className={`p-3 rounded-2xl border transition-all active:scale-95 ${tool === 'eraser' ? 'bg-amber-800 border-amber-700 text-amber-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                >
                  <Eraser />
                </button>
             </div>

             {/* Brush Size Slider */}
             <div className="flex items-center gap-2 flex-1 mx-4 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                <Circle size={8} className="text-slate-300 fill-slate-300" />
                <input 
                  type="range" 
                  min="2" 
                  max="40" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <Circle size={20} className="text-slate-300 fill-slate-300" />
             </div>
             
             <button onClick={clearCanvas} className="p-3 bg-red-800 text-red-300 rounded-2xl border border-red-700 active:scale-95 transition-transform">
               <Trash2 />
             </button>
          </div>

          {/* Color Palette */}
          <div className="flex justify-between gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {palette.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('pen'); }}
                className={`w-12 h-12 rounded-full border-4 flex-shrink-0 transition-transform ${color === c && tool === 'pen' ? 'scale-110 border-white' : 'border-slate-700'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArtStudio;