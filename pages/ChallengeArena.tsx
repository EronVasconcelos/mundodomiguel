import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Trophy, RefreshCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { incrementMaze } from '../services/progressService';

const SIZE = 8; // 8x8 Grid

type Cell = {
  x: number;
  y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
};

// Themes configuration
const THEMES = [
  { id: 'fire', name: 'Bombeiro', player: '🚒', goal: '🔥', wallColor: 'bg-red-800', floorColor: 'bg-slate-200' },
  { id: 'police', name: 'Polícia', player: '🚓', goal: '💰', wallColor: 'bg-blue-900', floorColor: 'bg-slate-200' },
  { id: 'jungle', name: 'Selva', player: '🤠', goal: '💎', wallColor: 'bg-green-800', floorColor: 'bg-green-100' },
  { id: 'space', name: 'Espaço', player: '🚀', goal: '🪐', wallColor: 'bg-indigo-900', floorColor: 'bg-slate-900' },
];

const ChallengeArena: React.FC = () => {
  const [maze, setMaze] = useState<Cell[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [won, setWon] = useState(false);
  const [theme, setTheme] = useState(THEMES[0]);

  // DFS Maze Generation
  const generateMaze = () => {
    setTheme(THEMES[Math.floor(Math.random() * THEMES.length)]);

    const grid: Cell[] = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        grid.push({ x, y, walls: { top: true, right: true, bottom: true, left: true }, visited: false });
      }
    }

    const stack: Cell[] = [];
    let current = grid[0];
    current.visited = true;

    const getIndex = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return -1;
      return x + y * SIZE;
    };

    const getUnvisitedNeighbors = (cell: Cell) => {
      const neighbors = [];
      const top = grid[getIndex(cell.x, cell.y - 1)];
      const right = grid[getIndex(cell.x + 1, cell.y)];
      const bottom = grid[getIndex(cell.x, cell.y + 1)];
      const left = grid[getIndex(cell.x - 1, cell.y)];

      if (top && !top.visited) neighbors.push(top);
      if (right && !right.visited) neighbors.push(right);
      if (bottom && !bottom.visited) neighbors.push(bottom);
      if (left && !left.visited) neighbors.push(left);
      return neighbors;
    };

    do {
      const neighbors = getUnvisitedNeighbors(current);
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        stack.push(current);

        const xDiff = current.x - next.x;
        const yDiff = current.y - next.y;

        if (xDiff === 1) { current.walls.left = false; next.walls.right = false; }
        else if (xDiff === -1) { current.walls.right = false; next.walls.left = false; }
        if (yDiff === 1) { current.walls.top = false; next.walls.bottom = false; }
        else if (yDiff === -1) { current.walls.bottom = false; next.walls.top = false; }

        next.visited = true;
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      }
    } while (stack.length > 0);

    setMaze(grid);
    setPlayerPos({ x: 0, y: 0 });
    setWon(false);
  };

  useEffect(() => {
    generateMaze();
  }, []);

  const move = (dx: number, dy: number) => {
    if (won) return;
    const currentCell = maze[playerPos.x + playerPos.y * SIZE];
    
    // Check walls
    if (dx === 1 && currentCell.walls.right) return;
    if (dx === -1 && currentCell.walls.left) return;
    if (dy === 1 && currentCell.walls.bottom) return;
    if (dy === -1 && currentCell.walls.top) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX >= 0 && newX < SIZE && newY >= 0 && newY < SIZE) {
      setPlayerPos({ x: newX, y: newY });
      if (newX === SIZE - 1 && newY === SIZE - 1) {
        setWon(true);
        incrementMaze(); // Track progress
      }
    }
  };

  return (
    <Layout title={theme.name}>
      <div className={`flex flex-col items-center justify-center h-full`}>
        
        {won ? (
          <div className="text-center animate-pop bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mx-4 w-full">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto drop-shadow-sm" fill="#FACC15" />
            <h2 className="text-3xl font-black text-slate-800 mt-4">CHEGOU!</h2>
            <div className="flex gap-4 justify-center mt-6 text-5xl bg-slate-50 p-4 rounded-3xl border border-slate-100">
               <span className="animate-bounce">{theme.player}</span>
               <span>➡️</span>
               <span className="animate-bounce-slow">{theme.goal}</span>
            </div>
            <button 
              onClick={generateMaze}
              className={`mt-8 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold active:scale-95 transition-transform text-xl w-full flex items-center justify-center gap-2 shadow-lg shadow-emerald-200`}
            >
              <RefreshCcw /> Outra Missão
            </button>
          </div>
        ) : (
          <div className={`relative p-2 bg-white rounded-2xl shadow-sm border border-slate-200`} style={{ width: '340px', height: '340px' }}>
            <div className={`relative w-full h-full grid ${theme.floorColor} rounded-xl overflow-hidden`} style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
              {maze.map((cell, i) => {
                const wallClass = `border-slate-800`;
                return (
                  <div 
                    key={i} 
                    className={`relative box-border
                      ${cell.walls.top ? `border-t-2 ${wallClass}` : ''}
                      ${cell.walls.right ? `border-r-2 ${wallClass}` : ''}
                      ${cell.walls.bottom ? `border-b-2 ${wallClass}` : ''}
                      ${cell.walls.left ? `border-l-2 ${wallClass}` : ''}
                    `}
                  >
                     {cell.x === SIZE - 1 && cell.y === SIZE - 1 && (
                        <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">{theme.goal}</div>
                     )}
                  </div>
                );
              })}
              
              <div 
                className="absolute transition-all duration-200 flex items-center justify-center text-3xl z-10"
                style={{
                  width: `${100/SIZE}%`,
                  height: `${100/SIZE}%`,
                  left: `${(playerPos.x / SIZE) * 100}%`,
                  top: `${(playerPos.y / SIZE) * 100}%`,
                  transform: 'scale(0.8)'
                }}
              >
                {theme.player}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-8 grid grid-cols-3 gap-3 w-56">
          <div />
          <button onClick={() => move(0, -1)} className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 active:bg-slate-50 transition-all text-slate-500 flex items-center justify-center"><ArrowUp size={32} strokeWidth={2.5} /></button>
          <div />
          <button onClick={() => move(-1, 0)} className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 active:bg-slate-50 transition-all text-slate-500 flex items-center justify-center"><ArrowLeft size={32} strokeWidth={2.5} /></button>
          <button onClick={() => move(0, 1)} className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 active:bg-slate-50 transition-all text-slate-500 flex items-center justify-center"><ArrowDown size={32} strokeWidth={2.5} /></button>
          <button onClick={() => move(1, 0)} className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 active:bg-slate-50 transition-all text-slate-500 flex items-center justify-center"><ArrowRight size={32} strokeWidth={2.5} /></button>
        </div>
        
        {!won && (
          <button onClick={generateMaze} className="mt-8 flex items-center gap-2 text-slate-400 font-bold px-6 py-2 rounded-full hover:bg-white transition-colors">
            <RefreshCcw className="w-4 h-4"/> Mudar Missão
          </button>
        )}
      </div>
    </Layout>
  );
};

export default ChallengeArena;