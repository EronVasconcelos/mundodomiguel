import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, GameState } from '../../types';
import { ArrowLeft, Play, RefreshCw, Target } from 'lucide-react';

const SpaceShooter: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);

  // Game Refs to avoid re-renders during loop
  const playerRef = useRef({ x: 150, y: 500, width: 40, height: 40 });
  const bulletsRef = useRef<{ x: number, y: number }[]>([]);
  const enemiesRef = useRef<{ x: number, y: number, speed: number }[]>([]);
  const frameIdRef = useRef<number>(0);
  const lastShotRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);

  const initGame = () => {
    setScore(0);
    playerRef.current = { x: window.innerWidth / 2 - 20, y: window.innerHeight * 0.75, width: 40, height: 40 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    setGameState(GameState.PLAYING);
  };

  const loop = (time: number) => {
    if (gameState !== GameState.PLAYING) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- LOGIC ---
    
    // Auto Shoot every 300ms
    if (time - lastShotRef.current > 300) {
      bulletsRef.current.push({ 
         x: playerRef.current.x + playerRef.current.width / 2 - 2, 
         y: playerRef.current.y 
      });
      lastShotRef.current = time;
    }

    // Spawn Enemies
    if (time - spawnTimerRef.current > 1000) {
       enemiesRef.current.push({
          x: Math.random() * (canvas.width - 30),
          y: -30,
          speed: 2 + Math.random() * 2
       });
       spawnTimerRef.current = time;
    }

    // Move Bullets
    bulletsRef.current = bulletsRef.current.filter(b => b.y > -10);
    bulletsRef.current.forEach(b => b.y -= 7);

    // Move Enemies
    let gameOver = false;
    enemiesRef.current.forEach(e => {
       e.y += e.speed;
       if (e.y > canvas.height) gameOver = true;
       // Player Collision
       if (
          e.x < playerRef.current.x + playerRef.current.width &&
          e.x + 30 > playerRef.current.x &&
          e.y < playerRef.current.y + playerRef.current.height &&
          e.y + 30 > playerRef.current.y
       ) {
         gameOver = true;
       }
    });

    if (gameOver) {
       setGameState(GameState.GAME_OVER);
       cancelAnimationFrame(frameIdRef.current);
       return;
    }

    // Collision Bullets vs Enemies
    for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
       let b = bulletsRef.current[i];
       for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
          let e = enemiesRef.current[j];
          if (b.x > e.x && b.x < e.x + 30 && b.y > e.y && b.y < e.y + 30) {
             // Hit
             bulletsRef.current.splice(i, 1);
             enemiesRef.current.splice(j, 1);
             setScore(s => s + 10);
             break;
          }
       }
    }

    // --- DRAW ---

    // Draw Player (Triangle Ship)
    ctx.fillStyle = "#6366f1"; // Indigo
    ctx.beginPath();
    ctx.moveTo(playerRef.current.x + 20, playerRef.current.y);
    ctx.lineTo(playerRef.current.x + 40, playerRef.current.y + 40);
    ctx.lineTo(playerRef.current.x, playerRef.current.y + 40);
    ctx.fill();
    // Engine flame
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(playerRef.current.x + 15, playerRef.current.y + 40);
    ctx.lineTo(playerRef.current.x + 25, playerRef.current.y + 40);
    ctx.lineTo(playerRef.current.x + 20, playerRef.current.y + 50 + Math.random() * 10);
    ctx.fill();


    // Draw Bullets
    ctx.fillStyle = "#f472b6"; // Pink
    bulletsRef.current.forEach(b => {
       ctx.fillRect(b.x, b.y, 4, 10);
    });

    // Draw Enemies
    ctx.fillStyle = "#ef4444"; // Red
    enemiesRef.current.forEach(e => {
       // Simple alien shape
       ctx.fillRect(e.x, e.y, 30, 30);
       ctx.fillStyle = "#000";
       ctx.fillRect(e.x + 5, e.y + 5, 8, 8);
       ctx.fillRect(e.x + 17, e.y + 5, 8, 8);
       ctx.fillStyle = "#ef4444";
    });

    frameIdRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
     if (gameState === GameState.PLAYING) {
        frameIdRef.current = requestAnimationFrame(loop);
     }
     return () => cancelAnimationFrame(frameIdRef.current);
  }, [gameState]);

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let clientX;
    if ('touches' in e) {
       clientX = e.touches[0].clientX;
    } else {
       clientX = (e as React.MouseEvent).clientX;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    
    // Clamp
    playerRef.current.x = Math.max(0, Math.min(canvas.width - 40, x - 20));
  };

  // Setup Canvas Size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
       canvas.width = canvas.parentElement?.clientWidth || 300;
       canvas.height = canvas.parentElement?.clientHeight || 500;
    }
  }, []);

  return (
    <div className="h-full flex flex-col font-sans bg-[#0f0e17] text-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-indigo-900/20 backdrop-blur-md border-b border-indigo-900/50 absolute top-0 w-full z-20">
         <button onClick={() => navigate(AppRoute.ARCADE)} className="w-10 h-10 bg-indigo-800/80 rounded-full flex items-center justify-center active:scale-95"><ArrowLeft /></button>
         <div className="bg-indigo-600/50 px-4 py-1 rounded-full text-lg font-black tracking-widest flex items-center gap-2">
            <Target size={16} /> {score}
         </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col">
         {/* Starfield Background */}
         <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }}></div>

         {gameState === GameState.IDLE && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
               <button onClick={initGame} className="flex flex-col items-center animate-pulse">
                  <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                    <Play size={48} fill="white" className="ml-2"/>
                  </div>
                  <span className="mt-4 font-black text-2xl tracking-widest">INICIAR</span>
                  <span className="text-sm text-indigo-300">Arraste para mover</span>
               </button>
            </div>
         )}

        {gameState === GameState.GAME_OVER && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
               <h2 className="text-4xl font-black text-red-500 mb-2">GAME OVER</h2>
               <p className="text-2xl text-white mb-8">Score: {score}</p>
               <button onClick={initGame} className="bg-white text-indigo-900 px-8 py-4 rounded-full font-black text-xl flex items-center gap-2 hover:bg-indigo-50 transition-colors">
                  <RefreshCw /> TENTAR DE NOVO
               </button>
            </div>
         )}

         <canvas 
            ref={canvasRef}
            className="w-full h-full touch-none"
            onTouchMove={handleTouchMove}
            onMouseMove={(e) => e.buttons === 1 && handleTouchMove(e)}
            onMouseDown={(e) => handleTouchMove(e)}
         />
      </div>
    </div>
  );
};

export default SpaceShooter;