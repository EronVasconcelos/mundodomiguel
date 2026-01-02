
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, GameState } from '../../types';
import { ArrowLeft, Play, RefreshCw, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

const RacingGame: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);

  // Game Logic Refs
  const roadOffsetRef = useRef(0);
  const playerXRef = useRef(0); 
  const enemiesRef = useRef<{ x: number, y: number, color: string }[]>([]);
  const coinsRef = useRef<{ x: number, y: number }[]>([]);
  const speedRef = useRef(3.5); // Slower initial speed (was 6)
  const frameIdRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const playerSmoothXRef = useRef(0.5); // 0 to 1 (position in road width)

  const CAR_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4']; 

  const initGame = () => {
    setScore(0);
    speedRef.current = 3.5; // Resets to slow
    enemiesRef.current = [];
    coinsRef.current = [];
    roadOffsetRef.current = 0;
    playerSmoothXRef.current = 0.5; // Center
    setGameState(GameState.PLAYING);
  };

  const drawSportCar = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, isPlayer: boolean) => {
    // Shadows
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2 + 5, width/1.8, height/2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tires (Wider and sticking out slightly)
    ctx.fillStyle = '#1e293b'; // Dark tire color
    const tireW = width * 0.25;
    const tireH = height * 0.2;
    // FL
    ctx.beginPath(); ctx.roundRect(x - 2, y + height * 0.15, tireW, tireH, 4); ctx.fill();
    // FR
    ctx.beginPath(); ctx.roundRect(x + width - tireW + 2, y + height * 0.15, tireW, tireH, 4); ctx.fill();
    // RL
    ctx.beginPath(); ctx.roundRect(x - 2, y + height * 0.7, tireW, tireH, 4); ctx.fill();
    // RR
    ctx.beginPath(); ctx.roundRect(x + width - tireW + 2, y + height * 0.7, tireW, tireH, 4); ctx.fill();

    // Main Body Chassis (Curvier)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y); // Front nose start
    ctx.lineTo(x + width * 0.8, y); // Front nose end
    ctx.quadraticCurveTo(x + width, y + height * 0.2, x + width, y + height * 0.8); // Right side curve
    ctx.lineTo(x + width, y + height); // Rear right
    ctx.lineTo(x, y + height); // Rear left
    ctx.quadraticCurveTo(x, y + height * 0.2, x + width * 0.2, y); // Left side curve
    ctx.fill();

    // Center Stripe (Racing look)
    ctx.fillStyle = isPlayer ? '#ffffff' : 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + width * 0.4, y, width * 0.2, height);

    // Cabin / Windshield
    ctx.fillStyle = '#1e293b'; // Dark glass
    ctx.beginPath();
    const cabinY = y + height * 0.35;
    const cabinH = height * 0.3;
    ctx.roundRect(x + 6, cabinY, width - 12, cabinH, 5);
    ctx.fill();
    
    // Windshield Reflection
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(x + width - 10, cabinY + 2);
    ctx.lineTo(x + width - 10, cabinY + cabinH - 2);
    ctx.lineTo(x + width - 14, cabinY + cabinH - 2);
    ctx.closePath();
    ctx.fill();

    // Spoiler (Rear Wing)
    ctx.fillStyle = isPlayer ? '#b91c1c' : '#334155'; // Darker shade of car or black
    ctx.fillRect(x - 2, y + height - 10, width + 4, 8);

    // Lights
    if (isPlayer) {
      // Rear Lights (Red)
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillRect(x + 4, y + height - 2, 10, 4);
      ctx.fillRect(x + width - 14, y + height - 2, 10, 4);
      ctx.shadowBlur = 0;
    } else {
      // Headlights (Yellow/White facing down)
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 5;
      ctx.fillRect(x + 4, y + height - 4, 8, 4);
      ctx.fillRect(x + width - 12, y + height - 4, 8, 4);
      ctx.shadowBlur = 0;
    }
  };

  const loop = (time: number) => {
    if (gameState !== GameState.PLAYING) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    const W = canvas.width;
    const H = canvas.height;
    const roadW = W * 0.8;
    const roadX = (W - roadW) / 2;
    const laneW = roadW / 3;

    // --- LOGIC ---
    
    // Move Road
    roadOffsetRef.current += speedRef.current;
    if (roadOffsetRef.current > 40) roadOffsetRef.current = 0;

    // Increase difficulty slowly based on SCORE (slower increment: /80 vs /50)
    speedRef.current = 3.5 + (score / 80);

    // Spawn Entities & Coins - Adjusted frequency based on lower speed
    if (time - lastSpawnRef.current > (18000 / speedRef.current)) {
       const lane = Math.floor(Math.random() * 3); // 0, 1, 2
       const spawnX = lane; // Store logical lane
       
       if (Math.random() > 0.3) {
           // Spawn Enemy
           enemiesRef.current.push({
               x: spawnX, 
               y: -100,
               color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]
           });
       } else {
           // Spawn Coin
           coinsRef.current.push({
               x: spawnX,
               y: -100
           });
       }
       lastSpawnRef.current = time;
    }

    // Move Entities
    enemiesRef.current.forEach(e => e.y += (speedRef.current * 0.7)); // Even slower enemies (0.7 vs 0.8)
    coinsRef.current.forEach(c => c.y += speedRef.current);

    // Cleanup
    enemiesRef.current = enemiesRef.current.filter(e => e.y < H + 100);
    coinsRef.current = coinsRef.current.filter(c => c.y < H + 100);

    // Collision Detection
    const playerCarW = laneW * 0.6;
    const playerCarH = playerCarW * 1.6;
    const playerPixelX = roadX + (playerSmoothXRef.current * roadW) - (playerCarW / 2); 
    const playerPixelY = H - 180; 

    // Check Enemy Collision
    let crash = false;
    enemiesRef.current.forEach(e => {
        // Enemy Pixel Position
        const enemyPct = (e.x * 0.333) + 0.166;
        const enemyPixelX = roadX + (enemyPct * roadW) - (playerCarW / 2);
        const enemyPixelY = e.y;

        // Simple Rect Collision (more forgiving bounding box for child)
        if (
            playerPixelX + 8 < enemyPixelX + playerCarW - 8 &&
            playerPixelX + playerCarW - 8 > enemyPixelX + 8 &&
            playerPixelY + 10 < enemyPixelY + playerCarH - 10 &&
            playerPixelY + playerCarH - 10 > enemyPixelY + 10
        ) {
            crash = true;
        }
    });

    if (crash) {
        setGameState(GameState.GAME_OVER);
        return;
    }

    // Check Coin Collection
    for (let i = coinsRef.current.length - 1; i >= 0; i--) {
        const c = coinsRef.current[i];
        const coinPct = (c.x * 0.333) + 0.166;
        const coinPixelX = roadX + (coinPct * roadW);
        const coinPixelY = c.y + 20; 

        // Distance check (increased range for easier collection)
        const dx = (playerPixelX + playerCarW/2) - coinPixelX;
        const dy = (playerPixelY + playerCarH/2) - coinPixelY;
        if (Math.sqrt(dx*dx + dy*dy) < 60) {
            coinsRef.current.splice(i, 1);
            setScore(s => s + 10);
        }
    }


    // --- DRAWING ---

    // 1. Grass
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 0, W, H);

    // 2. Road
    ctx.fillStyle = '#334155'; // Darker Slate
    ctx.fillRect(roadX, 0, roadW, H);
    
    // Road Borders (Red/White Strip)
    const stripeH = 40;
    const totalStripes = Math.ceil(H / stripeH) + 1;
    const offset = roadOffsetRef.current % stripeH;
    
    for (let i = -1; i < totalStripes; i++) {
        const y = (i * stripeH) + offset;
        ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#ffffff';
        ctx.fillRect(roadX - 10, y, 10, stripeH);
        ctx.fillRect(roadX + roadW, y, 10, stripeH);
    }

    // Lane Markers (Moving)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.setLineDash([30, 30]);
    ctx.lineDashOffset = -roadOffsetRef.current * 1.5;
    ctx.lineWidth = 4;
    
    // Left Line
    ctx.beginPath();
    ctx.moveTo(roadX + laneW, -50);
    ctx.lineTo(roadX + laneW, H + 50);
    ctx.stroke();

    // Right Line
    ctx.beginPath();
    ctx.moveTo(roadX + (laneW * 2), -50);
    ctx.lineTo(roadX + (laneW * 2), H + 50);
    ctx.stroke();
    
    ctx.setLineDash([]); // Reset

    // 3. Coins
    coinsRef.current.forEach(c => {
        const coinPct = (c.x * 0.333) + 0.166;
        const cx = roadX + (coinPct * roadW);
        
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#fbbf24'; // Amber
        ctx.beginPath();
        ctx.arc(cx, c.y + 20, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#d97706';
        ctx.stroke();
        
        ctx.fillStyle = '#d97706';
        ctx.font = '900 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', cx, c.y + 20);
    });

    // 4. Enemies
    enemiesRef.current.forEach(e => {
        const enemyPct = (e.x * 0.333) + 0.166;
        const ex = roadX + (enemyPct * roadW) - (playerCarW / 2);
        drawSportCar(ctx, ex, e.y, playerCarW, playerCarH, e.color, false);
    });

    // 5. Player
    drawSportCar(ctx, playerPixelX, playerPixelY, playerCarW, playerCarH, '#dc2626', true);


    frameIdRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
     if (gameState === GameState.PLAYING) {
        frameIdRef.current = requestAnimationFrame(loop);
     }
     return () => cancelAnimationFrame(frameIdRef.current);
  }, [gameState]);

  // Controls
  const moveLeft = () => {
    playerSmoothXRef.current = Math.max(0.166, playerSmoothXRef.current - 0.333);
  };

  const moveRight = () => {
    playerSmoothXRef.current = Math.min(0.833, playerSmoothXRef.current + 0.333);
  };

  // Canvas Sizing
  useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
          canvas.width = canvas.parentElement?.clientWidth || 300;
          canvas.height = canvas.parentElement?.clientHeight || 500;
      }
  }, []);

  return (
    <div className="h-full flex flex-col font-sans bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-slate-800/80 backdrop-blur-md border-b border-slate-700 z-20">
         <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center active:scale-95 transition-transform"><ArrowLeft size={24} strokeWidth={3} /></button>
         <h1 className="text-xl font-black uppercase text-yellow-400">Super Corrida</h1>
         <div className="bg-slate-700 px-3 py-1 rounded-full text-sm font-bold border border-slate-600">🏆 {score}</div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center bg-green-800">
         
         <canvas ref={canvasRef} className="w-full h-full block" />

         {/* Overlay UI */}
         {gameState === GameState.IDLE && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
               <button onClick={initGame} className="flex flex-col items-center animate-pulse">
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)] border-4 border-white">
                    <Play size={48} fill="white" className="ml-2"/>
                  </div>
                  <span className="mt-4 font-black text-3xl tracking-widest text-white drop-shadow-md">ACELERAR!</span>
               </button>
            </div>
         )}

         {gameState === GameState.GAME_OVER && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-6 text-center">
               <Trophy size={64} className="text-yellow-400 mb-4 animate-bounce" />
               <h2 className="text-4xl font-black text-white mb-2">FIM DA PISTA!</h2>
               <p className="text-xl text-slate-300 mb-8">Você fez <strong className="text-yellow-400 text-2xl">{score}</strong> pontos.</p>
               <button onClick={initGame} className="bg-red-500 text-white px-8 py-4 rounded-full font-black text-xl flex items-center gap-2 hover:bg-red-400 transition-colors shadow-lg active:scale-95">
                  <RefreshCw /> CORRER DE NOVO
               </button>
            </div>
         )}

         {/* Touch Controls Layer - MOVED UP (bottom-24) */}
         {gameState === GameState.PLAYING && (
            <div className="absolute bottom-24 left-0 right-0 flex justify-between px-8 pb-safe pointer-events-auto">
               <button 
                 onPointerDown={moveLeft}
                 className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/50 flex items-center justify-center active:bg-white/40 active:scale-95 transition-all shadow-xl"
               >
                 <ChevronLeft size={48} />
               </button>
               
               <button 
                 onPointerDown={moveRight}
                 className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/50 flex items-center justify-center active:bg-white/40 active:scale-95 transition-all shadow-xl"
               >
                 <ChevronRight size={48} />
               </button>
            </div>
         )}
      </div>
    </div>
  );
};

export default RacingGame;
