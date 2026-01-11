import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, GameState } from '../../types';
import { ArrowLeft, RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play } from 'lucide-react';

const GRID_SIZE = 15;
const INITIAL_SPEED = 200;

type Point = { x: number, y: number };

const SnakeGame: React.FC = () => {
  const navigate = useNavigate();
  const [snake, setSnake] = useState<Point[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: 0 }); 
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(INITIAL_SPEED);
  const gameLoopRef = useRef<any>(null);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      gameLoopRef.current = setInterval(moveSnake, currentSpeed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameState, snake, direction, currentSpeed]);

  const startGame = () => {
    setSnake([{ x: 7, y: 7 }, { x: 7, y: 8 }]);
    setDirection({ x: 0, y: -1 });
    setScore(0);
    setCurrentSpeed(INITIAL_SPEED);
    spawnFood();
    setGameState(GameState.PLAYING);
  };

  const spawnFood = () => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    setFood({ x, y });
  };

  const moveSnake = () => {
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      setGameState(GameState.GAME_OVER);
      return;
    }

    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setGameState(GameState.GAME_OVER);
      return;
    }

    const newSnake = [newHead, ...snake];

    if (newHead.x === food.x && newHead.y === food.y) {
      const newScore = score + 1;
      setScore(newScore);
      spawnFood();
      // Increase speed every 2 points, capping at 80ms
      if (newScore % 2 === 0) {
        setCurrentSpeed(prev => Math.max(80, prev - 10));
      }
    } else {
      newSnake.pop(); 
    }

    setSnake(newSnake);
  };

  const changeDirection = (x: number, y: number) => {
    if (gameState !== GameState.PLAYING) return;
    if (direction.x + x === 0 && direction.y + y === 0) return;
    setDirection({ x, y });
  };

  return (
    <div className="h-full flex flex-col font-sans bg-emerald-950 text-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-emerald-900/50 backdrop-blur-md border-b border-emerald-800">
         <button onClick={() => navigate(AppRoute.ARCADE)} className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center active:scale-95"><ArrowLeft /></button>
         <h1 className="text-xl font-black uppercase">Cobrinha</h1>
         <div className="bg-emerald-800 px-3 py-1 rounded-full text-sm font-bold">🍎 {score}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* Game Board */}
        <div className="relative bg-emerald-900/30 border-4 border-emerald-700 rounded-xl overflow-hidden shadow-2xl" 
             style={{ width: 'min(90vw, 350px)', height: 'min(90vw, 350px)' }}>
          
          {gameState === GameState.IDLE && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 backdrop-blur-sm">
               <button onClick={startGame} className="bg-emerald-500 p-6 rounded-full text-white shadow-lg animate-pulse">
                 <Play size={40} fill="white" />
               </button>
            </div>
          )}

          {gameState === GameState.GAME_OVER && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 backdrop-blur-sm animate-fade-in">
               <h2 className="text-3xl font-black text-white mb-2">BATEU!</h2>
               <p className="mb-4 text-emerald-200">Pontos: {score}</p>
               <button onClick={startGame} className="bg-emerald-500 px-6 py-3 rounded-2xl text-white font-bold flex gap-2">
                 <RefreshCw /> Tentar de novo
               </button>
            </div>
          )}

          {/* Grid Render */}
          <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnake = snake.some(s => s.x === x && s.y === y);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isFood = food.x === x && food.y === y;

              let cellClass = "";
              if (isHead) cellClass = "bg-white rounded-sm z-10 scale-110";
              else if (isSnake) cellClass = "bg-emerald-400 rounded-sm opacity-80";
              else if (isFood) cellClass = "bg-red-500 rounded-full animate-bounce";

              return <div key={i} className={`w-full h-full border-[0.5px] border-emerald-900/10 ${cellClass}`} />;
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 grid grid-cols-3 gap-2 w-48">
           <div />
           <button onClick={() => changeDirection(0, -1)} className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center active:bg-emerald-700 active:scale-95 shadow-lg border-b-4 border-emerald-950 active:border-b-0 active:translate-y-1"><ChevronUp size={32}/></button>
           <div />
           <button onClick={() => changeDirection(-1, 0)} className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center active:bg-emerald-700 active:scale-95 shadow-lg border-b-4 border-emerald-950 active:border-b-0 active:translate-y-1"><ChevronLeft size={32}/></button>
           <button onClick={() => changeDirection(0, 1)} className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center active:bg-emerald-700 active:scale-95 shadow-lg border-b-4 border-emerald-950 active:border-b-0 active:translate-y-1"><ChevronDown size={32}/></button>
           <button onClick={() => changeDirection(1, 0)} className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center active:bg-emerald-700 active:scale-95 shadow-lg border-b-4 border-emerald-950 active:border-b-0 active:translate-y-1"><ChevronRight size={32}/></button>
        </div>

      </div>
    </div>
  );
};

export default SnakeGame;