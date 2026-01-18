import { useRef, useState, useEffect } from 'react';
// Fixing the "Cannot find namespace 'React'" error by ensuring React is imported
import React from 'react';
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
  const speedRef = useRef(3.5); 
  const frameIdRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const playerSmoothXRef = useRef(0.5); 

  const CAR_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4']; 

  const initGame = () => {
    setScore(0);
    speedRef.current = 3.5; 
    enemiesRef.current = [];
    coinsRef.current = [];
    roadOffsetRef.current = 0;
    playerSmoothXRef.current = 0.5; 
    setGameState(GameState.PLAYING);
  };

  const drawSportCar = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, isPlayer: boolean) => {
    // Sombra do carro
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2 + 5, width/1.6, height/1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rodas (Mais largas para o jogador)
    ctx.fillStyle = '#0f172a';
    const tireW = isPlayer ? width * 0.28 : width * 0.25;
    const tireH = height * 0.18;
    
    // FL, FR, RL, RR
    ctx.fillRect(x - 4, y + height * 0.1, tireW, tireH);
    ctx.fillRect(x + width - tireW + 4, y + height * 0.1, tireW, tireH);
    ctx.fillRect(x - 4, y + height * 0.7, tireW, tireH);
    ctx.fillRect(x + width - tireW + 4, y + height * 0.7, tireW, tireH);

    if (isPlayer) {
      // Corpo do Carro de Corrida (Player)
      ctx.fillStyle = color;
      ctx.beginPath();
      // Nariz pontiagudo
      ctx.moveTo(x + width * 0.5, y - 5);
      ctx.lineTo(x + width, y + height * 0.3);
      ctx.lineTo(x + width * 0.9, y + height * 0.95);
      ctx.lineTo(x + width * 0.1, y + height * 0.95);
      ctx.lineTo(x, y + height * 0.3);
      ctx.closePath();
      ctx.fill();

      // Faixas de Corrida
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(x + width * 0.35, y + height * 0.3, width * 0.1, height * 0.6);
      ctx.fillRect(x + width * 0.55, y + height * 0.3, width * 0.1, height * 0.6);

      // Cabine / Cockpit (Cúpula)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(x + width * 0.5, y + height * 0.55, width * 0.25, height * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Reflexo na Cúpula
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(x + width * 0.58, y + height * 0.48, 5, 0, Math.PI * 2);
      ctx.fill();

      // Grande Aerofólio Traseiro
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 8, y + height - 12, width + 16, 12);
      ctx.fillStyle = color;
      ctx.fillRect(x - 8, y + height - 12, 4, 15);
      ctx.fillRect(x + width + 4, y + height - 12, 4, 15);

      // Número da Corrida "01"
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('01', x + width * 0.5, y + height * 0.25);

      // Faróis Traseiros com Brilho
      ctx.fillStyle = '#ff0000';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 15;
      ctx.fillRect(x + 2, y + height - 4, 12, 6);
      ctx.fillRect(x + width - 14, y + height - 4, 12, 6);
      ctx.shadowBlur = 0;

    } else {
      // Carro Esportivo Padrão (Inimigo)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 12);
      ctx.fill();

      // Vidro
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 5, y + height * 0.3, width - 10, height * 0.25);

      // Spoiler Simples
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x, y + height - 8, width, 5);
      
      // Faróis
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + 4, y + 2, 8, 4);
      ctx.fillRect(x + width - 12, y + 2, 8, 4);
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
    roadOffsetRef.current += speedRef.current;
    if (roadOffsetRef.current > 40) roadOffsetRef.current = 0;
    speedRef.current = 3.5 + (score / 80);

    if (time - lastSpawnRef.current > (18000 / speedRef.current)) {
       const lane = Math.floor(Math.random() * 3); 
       const spawnX = lane; 
       
       if (Math.random() > 0.3) {
           enemiesRef.current.push({
               x: spawnX, 
               y: -100,
               color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]
           });
       } else {
           coinsRef.current.push({
               x: spawnX,
               y: -100
           });
       }
       lastSpawnRef.current = time;
    }

    enemiesRef.current.forEach(e => e.y += (speedRef.current * 0.7)); 
    coinsRef.current.forEach(c => c.y += speedRef.current);

    enemiesRef.current = enemiesRef.current.filter(e => e.y < H + 100);
    coinsRef.current = coinsRef.current.filter(c => c.y < H + 100);

    // Collision Detection
    const playerCarW = laneW * 0.65;
    const playerCarH = playerCarW * 1.6;
    const playerPixelX = roadX + (playerSmoothXRef.current * roadW) - (playerCarW / 2); 
    const playerPixelY = H - 180; 

    let crash = false;
    enemiesRef.current.forEach(e => {
        const enemyPct = (e.x * 0.333) + 0.166;
        const enemyPixelX = roadX + (enemyPct * roadW) - (playerCarW / 2);
        const enemyPixelY = e.y;

        if (
            playerPixelX + 10 < enemyPixelX + playerCarW - 10 &&
            playerPixelX + playerCarW - 10 > enemyPixelX + 10 &&
            playerPixelY + 15 < enemyPixelY + playerCarH - 15 &&
            playerPixelY + playerCarH - 15 > enemyPixelY + 15
        ) {
            crash = true;
        }
    });

    if (crash) {
        setGameState(GameState.GAME_OVER);
        return;
    }

    for (let i = coinsRef.current.length - 1; i >= 0; i--) {
        const c = coinsRef.current[i];
        const coinPct = (c.x * 0.333) + 0.166;
        const coinPixelX = roadX + (coinPct * roadW);
        const coinPixelY = c.y + 20; 

        const dx = (playerPixelX + playerCarW/2) - coinPixelX;
        const dy = (playerPixelY + playerCarH/2) - coinPixelY;
        if (Math.sqrt(dx*dx + dy*dy) < 60) {
            coinsRef.current.splice(i, 1);
            setScore(s => s + 10);
        }
    }

    // --- DRAWING ---
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#334155'; 
    ctx.fillRect(roadX, 0, roadW, H);
    
    const stripeH = 40;
    const totalStripes = Math.ceil(H / stripeH) + 1;
    const offset = roadOffsetRef.current % stripeH;
    
    for (let i = -1; i < totalStripes; i++) {
        const y = (i * stripeH) + offset;
        ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#ffffff';
        ctx.fillRect(roadX - 10, y, 10, stripeH);
        ctx.fillRect(roadX + roadW, y, 10, stripeH);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.setLineDash([30, 30]);
    ctx.lineDashOffset = -roadOffsetRef.current * 1.5;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(roadX + laneW, -50);
    ctx.lineTo(roadX + laneW, H + 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(roadX + (laneW * 2), -50);
    ctx.lineTo(roadX + (laneW * 2), H + 50);
    ctx.stroke();
    ctx.setLineDash([]); 

    coinsRef.current.forEach(c => {
        const coinPct = (c.x * 0.333) + 0.166;
        const cx = roadX + (coinPct * roadW);
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#fbbf24'; 
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

    enemiesRef.current.forEach(e => {
        const enemyPct = (e.x * 0.333) + 0.166;
        const ex = roadX + (enemyPct * roadW) - (playerCarW / 2);
        drawSportCar(ctx, ex, e.y, playerCarW, playerCarH, e.color, false);
    });

    drawSportCar(ctx, playerPixelX, playerPixelY, playerCarW, playerCarH, '#dc2626', true);
    frameIdRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
     if (gameState === GameState.PLAYING) {
        frameIdRef.current = requestAnimationFrame(loop);
     }
     return () => cancelAnimationFrame(frameIdRef.current);
  }, [gameState]);

  const moveLeft = () => {
    playerSmoothXRef.current = Math.max(0.166, playerSmoothXRef.current - 0.333);
  };

  const moveRight = () => {
    playerSmoothXRef.current = Math.min(0.833, playerSmoothXRef.current + 0.333);
  };

  useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
          canvas.width = canvas.parentElement?.clientWidth || 300;
          canvas.height = canvas.parentElement?.clientHeight || 500;
      }
  }, []);

  return (
    <div className="h-full flex flex-col font-sans bg-slate-900 text-white overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-slate-800/80 backdrop-blur-md border-b border-slate-700 z-20">
         <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center active:scale-95 transition-transform"><ArrowLeft size={24} strokeWidth={3} /></button>
         <h1 className="text-xl font-black uppercase text-yellow-400">Super Corrida</h1>
         <div className="bg-slate-700 px-3 py-1 rounded-full text-sm font-bold border border-slate-600">🏆 {score}</div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center bg-green-800">
         <canvas ref={canvasRef} className="w-full h-full block" />

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