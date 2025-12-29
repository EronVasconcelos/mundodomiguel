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
  const playerXRef = useRef(0); // 0 = Center, -1 = Left, 1 = Right (Logic) -> Converted to pixels in draw
  const enemiesRef = useRef<{ x: number, y: number, color: string }[]>([]);
  const coinsRef = useRef<{ x: number, y: number }[]>([]);
  const speedRef = useRef(5);
  const frameIdRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const playerSmoothXRef = useRef(0.5); // 0 to 1 (position in road width)

  const CAR_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b']; // Blue, Green, Purple, Yellow

  const initGame = () => {
    setScore(0);
    speedRef.current = 6;
    enemiesRef.current = [];
    coinsRef.current = [];
    roadOffsetRef.current = 0;
    playerSmoothXRef.current = 0.5; // Center
    setGameState(GameState.PLAYING);
  };

  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, isPlayer: boolean) => {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 5, y + 5, width, height);

    // Tires
    ctx.fillStyle = '#1e293b';
    const tireW = width * 0.2;
    const tireH = height * 0.25;
    ctx.fillRect(x - 2, y + 5, tireW, tireH); // FL
    ctx.fillRect(x + width - tireW + 2, y + 5, tireW, tireH); // FR
    ctx.fillRect(x - 2, y + height - tireH - 5, tireW, tireH); // RL
    ctx.fillRect(x + width - tireW + 2, y + height - tireH - 5, tireW, tireH); // RR

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();

    // Stripes / Decor
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x + width * 0.4, y, width * 0.2, height);

    // Windshield
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 4, y + height * 0.2, width - 8, height * 0.25);
    
    // Roof
    ctx.fillStyle = color; // Darker version of color usually, but keeping simple
    ctx.fillRect(x + 2, y + height * 0.45, width - 4, height * 0.3);

    // Lights
    if (isPlayer) {
      ctx.fillStyle = '#ef4444'; // Rear lights red
      ctx.fillRect(x + 4, y + height - 4, 8, 4);
      ctx.fillRect(x + width - 12, y + height - 4, 8, 4);
    } else {
      ctx.fillStyle = '#fef08a'; // Headlights yellow
      ctx.fillRect(x + 4, y + height - 4, 8, 4);
      ctx.fillRect(x + width - 12, y + height - 4, 8, 4);
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

    // Increase difficulty slowly
    speedRef.current += 0.002;

    // Move Player (Smooth Steering)
    // We update playerSmoothXRef based on input state if we had continuous input,
    // but for simple touch buttons, we will just interpolate towards target if we implemented lanes.
    // Here we assume playerSmoothXRef is updated by buttons directly.

    // Spawn Enemies & Coins
    if (time - lastSpawnRef.current > (20000 / speedRef.current)) {
       const lane = Math.floor(Math.random() * 3); // 0, 1, 2
       const spawnX = lane; // Store logical lane
       
       if (Math.random() > 0.3) {
           // Spawn Enemy
           enemiesRef.current.push({
               x: spawnX, // Logical lane
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
    enemiesRef.current.forEach(e => e.y += (speedRef.current * 0.8)); // Enemies move slightly slower than road (player is faster)
    coinsRef.current.forEach(c => c.y += speedRef.current);

    // Cleanup
    enemiesRef.current = enemiesRef.current.filter(e => e.y < H + 100);
    coinsRef.current = coinsRef.current.filter(c => c.y < H + 100);

    // Collision Detection
    const playerCarW = laneW * 0.6;
    const playerCarH = playerCarW * 1.6;
    const playerPixelX = roadX + (playerSmoothXRef.current * roadW) - (playerCarW / 2); // Center of car at position
    const playerPixelY = H - 150;

    // Check Enemy Collision
    let crash = false;
    enemiesRef.current.forEach(e => {
        // Enemy Pixel Position
        // Map logical lane 0,1,2 to 0.16, 0.5, 0.83 road percentage
        const enemyPct = (e.x * 0.333) + 0.166;
        const enemyPixelX = roadX + (enemyPct * roadW) - (playerCarW / 2);
        const enemyPixelY = e.y;

        // Simple Rect Collision
        if (
            playerPixelX < enemyPixelX + playerCarW &&
            playerPixelX + playerCarW > enemyPixelX &&
            playerPixelY < enemyPixelY + playerCarH &&
            playerPixelY + playerCarH > enemyPixelY
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
        const coinPixelY = c.y + 20; // Center offset

        // Distance check
        const dx = (playerPixelX + playerCarW/2) - coinPixelX;
        const dy = (playerPixelY + playerCarH/2) - coinPixelY;
        if (Math.sqrt(dx*dx + dy*dy) < 40) {
            coinsRef.current.splice(i, 1);
            setScore(s => s + 10);
        }
    }


    // --- DRAWING ---

    // 1. Grass
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, 0, W, H);

    // 2. Road
    ctx.fillStyle = '#475569'; // Slate 600
    ctx.fillRect(roadX, 0, roadW, H);
    
    // Road Borders
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(roadX - 5, 0, 5, H);
    ctx.fillRect(roadX + roadW, 0, 5, H);

    // Lane Markers (Moving)
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -roadOffsetRef.current;
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
        
        ctx.fillStyle = '#fbbf24'; // Amber
        ctx.beginPath();
        ctx.arc(cx, c.y + 20, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#d97706';
        ctx.stroke();
        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', cx, c.y + 20);
    });

    // 4. Enemies
    enemiesRef.current.forEach(e => {
        const enemyPct = (e.x * 0.333) + 0.166;
        const ex = roadX + (enemyPct * roadW) - (playerCarW / 2);
        // Note: Enemies face DOWN (lights logic inverted in helper)
        drawCar(ctx, ex, e.y, playerCarW, playerCarH, e.color, false);
    });

    // 5. Player
    drawCar(ctx, playerPixelX, playerPixelY, playerCarW, playerCarH, '#ef4444', true);


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
         <button onClick={() => navigate(AppRoute.ARCADE)} className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center active:scale-95"><ArrowLeft /></button>
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

         {/* Touch Controls Layer */}
         {gameState === GameState.PLAYING && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8 pb-safe">
               <button 
                 onPointerDown={moveLeft}
                 className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/50 flex items-center justify-center active:bg-white/40 active:scale-95 transition-all"
               >
                 <ChevronLeft size={48} />
               </button>
               
               <button 
                 onPointerDown={moveRight}
                 className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/50 flex items-center justify-center active:bg-white/40 active:scale-95 transition-all"
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