
import React, { useRef, useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Trash2, Eraser, PenTool, PaintBucket, X, Upload, Circle, ImagePlus, FolderOpen, Undo2 } from 'lucide-react';

const ColoringBook: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [color, setColor] = useState('#EF4444'); 
  const [tool, setTool] = useState<'pen' | 'eraser' | 'bucket'>('bucket');
  const [brushSize, setBrushSize] = useState(8);
  const [showGallery, setShowGallery] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  
  // Gallery State
  const [savedImages, setSavedImages] = useState<string[]>([]);
  // History for Undo
  const [history, setHistory] = useState<ImageData[]>([]);

  const palette = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6', '#A855F7', '#EC4899', '#78350F', '#000000', '#FFFFFF'];

  useEffect(() => {
    const stored = localStorage.getItem('miguel_coloring_gallery');
    if (stored) {
      try {
        setSavedImages(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load gallery", e);
      }
    }
  }, []);

  // Initialize Canvas Logic - Unifies the loading flow
  useEffect(() => {
    if (!showGallery) {
      setTimeout(() => {
        initCanvas();
        if (activeTemplate) {
           drawImageTemplate(activeTemplate);
        } else {
           saveState(); // Save blank state
        }
      }, 100);
    } else {
       setActiveTemplate(null);
       setHistory([]);
    }
  }, [showGallery, activeTemplate]); 

  const saveState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (canvas && ctx) {
       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
       setHistory(prev => [...prev.slice(-9), imageData]); // Keep last 10 states
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return; 
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

  const saveToGallery = (imageBase64: string) => {
    try {
      if (savedImages.includes(imageBase64)) return;
      
      const newGallery = [imageBase64, ...savedImages];
      setSavedImages(newGallery);
      localStorage.setItem('miguel_coloring_gallery', JSON.stringify(newGallery));
    } catch (e) {
      alert("A galeria está cheia! Apague alguns desenhos para adicionar mais.");
    }
  };

  const deleteFromGallery = (e: React.MouseEvent | React.TouchEvent, indexToDelete: number) => {
    e.stopPropagation();
    e.preventDefault();

    if (window.confirm("Quer mesmo apagar este desenho?")) {
      const newGallery = savedImages.filter((_, i) => i !== indexToDelete);
      setSavedImages(newGallery);
      localStorage.setItem('miguel_coloring_gallery', JSON.stringify(newGallery));
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
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
      }
    }
  };

  const drawImageTemplate = (src: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          const rect = canvas.getBoundingClientRect();
          const scale = Math.min(rect.width / img.width, rect.height / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (rect.width - w) / 2;
          const y = (rect.height - h) / 2;
          
          ctx.fillStyle = "white";
          ctx.fillRect(0,0, rect.width, rect.height);
          
          ctx.drawImage(img, x, y, w, h);
          saveState(); // Save initial loaded state
        }
    };
  };

  const loadTemplate = (src: string) => {
    setActiveTemplate(src);
    setShowGallery(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        saveToGallery(src);
      };
      reader.readAsDataURL(file);
    }
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const x = Math.round(startX * dpr);
    const y = Math.round(startY * dpr);
    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const r = parseInt(fillColor.slice(1, 3), 16);
    const g = parseInt(fillColor.slice(3, 5), 16);
    const b = parseInt(fillColor.slice(5, 7), 16);
    const a = 255;

    const targetPos = (y * width + x) * 4;
    const targetR = data[targetPos];
    const targetG = data[targetPos + 1];
    const targetB = data[targetPos + 2];

    if (targetR === r && targetG === g && targetB === b) return;

    const stack = [[x, y]];

    const matchColor = (pos: number) => {
      const dr = data[pos] - targetR;
      const dg = data[pos + 1] - targetG;
      const db = data[pos + 2] - targetB;
      return (dr*dr + dg*dg + db*db) < 3500; 
    };

    const colorPixel = (pos: number) => {
      data[pos] = r;
      data[pos + 1] = g;
      data[pos + 2] = b;
      data[pos + 3] = a;
    };

    while (stack.length) {
      const pop = stack.pop();
      if (!pop) break;
      let [cx, cy] = pop;
      let pixelPos = (cy * width + cx) * 4;

      while (cy >= 0 && matchColor(pixelPos)) {
        cy--;
        pixelPos -= width * 4;
      }
      cy++;
      pixelPos += width * 4;
      
      let reachLeft = false;
      let reachRight = false;
      
      while (cy < height - 1 && matchColor(pixelPos)) {
        colorPixel(pixelPos);
        if (cx > 0) {
          if (matchColor(pixelPos - 4)) {
            if (!reachLeft) {
              stack.push([cx - 1, cy]);
              reachLeft = true;
            }
          } else if (reachLeft) reachLeft = false;
        }
        if (cx < width - 1) {
          if (matchColor(pixelPos + 4)) {
            if (!reachRight) {
              stack.push([cx + 1, cy]);
              reachRight = true;
            }
          } else if (reachRight) reachRight = false;
        }
        cy++;
        pixelPos += width * 4;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    saveState(); // Save state after fill
  };

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    if (tool === 'bucket') {
       floodFill(x, y, color);
    } else {
       const ctx = canvas.getContext('2d');
       if (ctx) {
          ctx.lineWidth = brushSize;
          ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
          
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
       }
    }
  };
  
  const startDraw = (e: any) => {
    if (tool === 'bucket') {
       handleTouch(e);
       return;
    }
    const canvas = canvasRef.current;
    if(canvas) {
       const ctx = canvas.getContext('2d');
       ctx?.beginPath();
    }
    handleTouch(e);
  };

  const stopDraw = () => {
    if (tool !== 'bucket') {
        saveState();
    }
  };

  return (
    <Layout title="Colorir Desenhos" color="text-pink-500">
      <div className="flex flex-col h-full gap-4">
        
        {showGallery ? (
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-20">
             
             {/* Hidden Input for Upload */}
             <input 
               type="file" 
               accept="image/*" 
               ref={fileInputRef} 
               className="hidden" 
               onChange={handleFileUpload} 
             />

             {/* Upload Big Button */}
             <div className="px-2 pt-2">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 rounded-3xl border-2 border-dashed border-sky-700 bg-sky-900 text-sky-200 flex flex-col items-center justify-center gap-3 active:bg-sky-800 transition-colors"
                >
                  <div className="bg-sky-800 p-3 rounded-full shadow-sm text-sky-300">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                     <span className="font-black text-xl block text-white">ENVIAR FOTO</span>
                     <span className="text-sm font-bold text-sky-300">Do celular ou tablet</span>
                  </div>
                </button>
             </div>

             {/* SECTION: SAVED GALLERY */}
             <div className="px-2">
                <div className="flex items-center gap-2 mb-3 px-2">
                   <FolderOpen size={20} className="text-pink-500" />
                   <h2 className="font-black text-slate-300 text-lg uppercase tracking-wide">Seus Desenhos</h2>
                </div>
                
                {savedImages.length === 0 ? (
                    <div className="bg-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-slate-700 min-h-[200px]">
                       <ImagePlus size={48} />
                       <p className="font-bold text-sm">Nenhum desenho salvo</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 content-start">
                        {savedImages.map((src, i) => (
                        <div key={src.substring(0, 100) + i} className="relative group animate-pop">
                            <button 
                              onClick={() => loadTemplate(src)}
                              className="w-full aspect-square bg-slate-800 rounded-3xl border border-slate-700 p-2 flex items-center justify-center transition-all overflow-hidden active:scale-95 shadow-sm"
                            >
                               <img src={src} className="w-full h-full object-contain" alt="Gallery item" />
                            </button>
                            
                            <button 
                              type="button"
                              onClick={(e) => deleteFromGallery(e, i)}
                              onTouchStart={(e) => e.stopPropagation()}
                              className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full shadow-md active:scale-90 transition-all flex items-center justify-center z-50 border-4 border-white cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </button>
                        </div>
                        ))}
                    </div>
                )}
             </div>

          </div>
        ) : (
          <>
            <div className="flex-1 bg-slate-800 rounded-3xl border-4 border-slate-700 overflow-hidden relative shadow-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDraw}
                onMouseUp={stopDraw}
                onMouseMove={(e) => tool !== 'bucket' && e.buttons === 1 && handleTouch(e)}
                onTouchStart={startDraw}
                onTouchEnd={stopDraw}
                onTouchMove={(e) => tool !== 'bucket' && handleTouch(e)}
                className="w-full h-full touch-none cursor-crosshair"
              />
              <button onClick={() => setShowGallery(true)} className="absolute top-4 right-4 bg-slate-700 p-3 rounded-full border-b-4 border-slate-600 active:border-b-0 active:translate-y-1"><X className="text-slate-300" /></button>
            </div>

            <div className="bg-slate-900 p-4 rounded-3xl border-4 border-slate-800 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <button onClick={handleUndo} className="p-4 rounded-2xl border-b-4 bg-slate-800 border-slate-700 text-slate-300 active:border-b-0 active:translate-y-1 transition-all"><Undo2 /></button>
                    <button onClick={() => setTool('bucket')} className={`p-4 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all ${tool === 'bucket' ? 'bg-blue-800 border-blue-700 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}><PaintBucket /></button>
                    <button onClick={() => setTool('pen')} className={`p-4 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all ${tool === 'pen' ? 'bg-blue-800 border-blue-700 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}><PenTool /></button>
                    <button onClick={() => setTool('eraser')} className={`p-4 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all ${tool === 'eraser' ? 'bg-blue-800 border-blue-700 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}><Eraser /></button>
                </div>
                
                 {/* Brush Size Slider */}
                 {(tool === 'pen' || tool === 'eraser') && (
                  <div className="flex items-center gap-2 flex-1 mx-2 bg-slate-800 px-2 py-2 rounded-xl border border-slate-700">
                      <Circle size={6} className="text-slate-300 fill-slate-300" />
                      <input 
                        type="range" 
                        min="2" 
                        max="40" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <Circle size={16} className="text-slate-300 fill-slate-300" />
                  </div>
                 )}

                <button onClick={() => initCanvas()} className="p-4 bg-red-800 text-red-300 rounded-2xl border-b-4 border-red-700 active:border-b-0 active:translate-y-1"><Trash2 /></button>
              </div>
              
              <div className="flex justify-between gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {palette.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-12 h-12 rounded-full border-4 flex-shrink-0 transition-transform ${color === c ? 'scale-110 border-white' : 'border-slate-700'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ColoringBook;