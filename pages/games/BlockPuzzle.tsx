
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, GameState } from '../../types';
import { ArrowLeft, RefreshCw, Trophy, Star } from 'lucide-react';

const GRID_SIZE = 8;
const COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#22c55e', // Green
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#f97316', // Orange
  '#06b6d4'  // Cyan
];

const SHAPES = [
  { shape: [[1]], colorIdx: 0 },
  { shape: [[1, 1]], colorIdx: 1 },
  { shape: [[1], [1]], colorIdx: 2 },
  { shape: [[1, 1], [1, 1]], colorIdx: 3 },
  { shape: [[1, 1, 1]], colorIdx: 4 },
  { shape: [[1], [1], [1]], colorIdx: 5 },
  { shape: [[1, 1, 1], [0, 1, 0]], colorIdx: 6 },
  { shape: [[1, 0], [1, 1]], colorIdx: 0 },
  { shape: [[1, 1], [0, 1]], colorIdx: 1 },
  { shape: [[1, 1, 1], [1, 0, 0]], colorIdx: 2 },
  { shape: [[1, 1, 1, 1]], colorIdx: 3 },
];

interface ActivePiece {
  id: number;
  shape: number[][];
  color: string;
  originalIndex: number;
}

const BlockPuzzle: React.FC = () => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState<(string | null)[]>(Array(GRID_SIZE * GRID_SIZE).fill(null));
  const [pieces, setPieces] = useState<ActivePiece[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [draggingPiece, setDraggingPiece] = useState<ActivePiece | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [previewPos, setPreviewPos] = useState<{ r: number, c: number } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const spawnPieces = useCallback(() => {
    const newPieces = Array.from({ length: 3 }, (_, i) => {
      const rand = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      return {
        id: Date.now() + i,
        shape: rand.shape,
        color: COLORS[rand.colorIdx],
        originalIndex: i
      };
    });
    setPieces(newPieces);
    checkGameOver(grid, newPieces);
  }, [grid]);

  const initGame = () => {
    setGrid(Array(GRID_SIZE * GRID_SIZE).fill(null));
    setScore(0);
    setGameState(GameState.PLAYING);
    spawnPieces();
  };

  useEffect(() => {
    initGame();
  }, []);

  const checkGameOver = (currentGrid: (string | null)[], currentPieces: ActivePiece[]) => {
    if (currentPieces.length === 0) return;
    const canPlaceAny = currentPieces.some(piece => {
      for (let r = 0; r <= GRID_SIZE - piece.shape.length; r++) {
        for (let c = 0; c <= GRID_SIZE - piece.shape[0].length; c++) {
          if (canFit(piece.shape, r, c, currentGrid)) return true;
        }
      }
      return false;
    });
    if (!canPlaceAny) setGameState(GameState.GAME_OVER);
  };

  const canFit = (shape: number[][], row: number, col: number, currentGrid: (string | null)[]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const targetR = row + r;
          const targetC = col + c;
          if (targetR < 0 || targetR >= GRID_SIZE || targetC < 0 || targetC >= GRID_SIZE || currentGrid[targetR * GRID_SIZE + targetC]) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = (piece: ActivePiece, row: number, col: number) => {
    const newGrid = [...grid];
    let cellsPlaced = 0;
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          newGrid[(row + r) * GRID_SIZE + (col + c)] = piece.color;
          cellsPlaced++;
        }
      }
    }

    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      if (Array.from({ length: GRID_SIZE }, (_, i) => newGrid[r * GRID_SIZE + i]).every(cell => cell !== null)) rowsToClear.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      if (Array.from({ length: GRID_SIZE }, (_, i) => newGrid[i * GRID_SIZE + c]).every(cell => cell !== null)) colsToClear.push(c);
    }

    let points = cellsPlaced * 10;
    if (rowsToClear.length > 0 || colsToClear.length > 0) {
      const totalLines = rowsToClear.length + colsToClear.length;
      points += totalLines * 100 * totalLines;
      rowsToClear.forEach(r => { for (let c = 0; c < GRID_SIZE; c++) newGrid[r * GRID_SIZE + c] = null; });
      colsToClear.forEach(c => { for (let r = 0; r < GRID_SIZE; r++) newGrid[r * GRID_SIZE + c] = null; });
    }

    setScore(s => s + points);
    setGrid(newGrid);
    const remaining = pieces.filter(p => p.id !== piece.id);
    if (remaining.length === 0) spawnPieces();
    else { setPieces(remaining); checkGameOver(newGrid, remaining); }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, piece: ActivePiece) => {
    if (gameState !== GameState.PLAYING) return;
    setDraggingPiece(piece);
    updateDragPos(e);
  };

  const updateDragPos = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragPosition({ x: clientX, y: clientY });

    if (gridRef.current && draggingPiece) {
      const rect = gridRef.current.getBoundingClientRect();
      const cellSize = rect.width / GRID_SIZE;
      const pieceYOffset = 100; 
      
      // Calculate top-left based on touch point
      const localX = clientX - rect.left - (draggingPiece.shape[0].length * cellSize) / 2;
      const localY = clientY - rect.top - pieceYOffset;
      
      const col = Math.round(localX / cellSize);
      const row = Math.round(localY / cellSize);

      if (row >= 0 && row <= GRID_SIZE - draggingPiece.shape.length && 
          col >= 0 && col <= GRID_SIZE - draggingPiece.shape[0].length) {
        if (canFit(draggingPiece.shape, row, col, grid)) {
          setPreviewPos({ r: row, c: col });
        } else {
          setPreviewPos(null);
        }
      } else {
        setPreviewPos(null);
      }
    }
  };

  const handleDragEnd = () => {
    if (draggingPiece && previewPos) {
      placePiece(draggingPiece, previewPos.r, previewPos.c);
    }
    setDraggingPiece(null);
    setPreviewPos(null);
  };

  const renderPiece = (piece: ActivePiece, sizeMultiplier: number = 1) => (
    <div className="grid gap-1" style={{ 
      gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
      width: piece.shape[0].length * 30 * sizeMultiplier,
      height: piece.shape.length * 30 * sizeMultiplier
    }}>
      {piece.shape.flat().map((cell, i) => (
        <div key={i} className="rounded-md border-b-4 border-black/20" style={{ 
          backgroundColor: cell ? piece.color : 'transparent',
          opacity: cell ? 1 : 0,
          width: 30 * sizeMultiplier,
          height: 30 * sizeMultiplier
        }} />
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col font-sans bg-[#0f172a] text-white relative touch-none select-none" 
         onMouseMove={draggingPiece ? updateDragPos : undefined}
         onTouchMove={draggingPiece ? updateDragPos : undefined}
         onMouseUp={handleDragEnd} onTouchEnd={handleDragEnd}>
      
      <div className="p-4 flex items-center justify-between bg-slate-800/80 backdrop-blur-md border-b border-slate-700 z-20">
         <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center active:scale-95 transition-transform"><ArrowLeft size={24} strokeWidth={3} /></button>
         <h1 className="text-xl font-black uppercase text-sky-400">Puzzle Blocos</h1>
         <div className="bg-slate-700 px-4 py-1 rounded-full text-lg font-black tracking-widest flex items-center gap-2 border border-slate-600">
            <Star size={16} className="text-yellow-400 fill-yellow-400" /> {score}
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <div ref={gridRef} className="bg-slate-800 p-2 rounded-2xl grid gap-1 shadow-2xl relative border-4 border-slate-700"
             style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, width: 'min(90vw, 360px)', height: 'min(90vw, 360px)' }}>
          {grid.map((cell, i) => (
            <div key={i} className={`w-full h-full rounded-md border-b-4 ${cell ? 'border-black/20' : 'bg-slate-900/50 border-transparent'}`}
                 style={{ backgroundColor: cell || undefined }} />
          ))}

          {draggingPiece && previewPos && (
             <div className="absolute inset-0 pointer-events-none p-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {Array(GRID_SIZE * GRID_SIZE).fill(null).map((_, i) => {
                  const r = Math.floor(i / GRID_SIZE);
                  const c = i % GRID_SIZE;
                  const isPart = r >= previewPos.r && r < previewPos.r + draggingPiece.shape.length && 
                                 c >= previewPos.c && c < previewPos.c + draggingPiece.shape[0].length &&
                                 draggingPiece.shape[r - previewPos.r][c - previewPos.c];
                  return <div key={i} className={`w-full h-full rounded-md ${isPart ? 'opacity-40 ring-4 ring-white/30' : ''}`}
                             style={{ backgroundColor: isPart ? draggingPiece.color : 'transparent' }} />;
                })}
             </div>
          )}
        </div>

        <div className="flex gap-4 justify-around w-full max-w-sm h-32 items-center bg-slate-800/30 rounded-[2rem] p-4">
          {pieces.map((p) => (
            <div key={p.id} className={`p-2 transition-opacity ${draggingPiece?.id === p.id ? 'opacity-0' : 'opacity-100'}`}
                 onMouseDown={(e) => handleDragStart(e, p)} onTouchStart={(e) => handleDragStart(e, p)}>
              {renderPiece(p, 0.8)}
            </div>
          ))}
        </div>

        {draggingPiece && (
          <div className="fixed pointer-events-none z-50 transform -translate-x-1/2"
               style={{ left: dragPosition.x, top: dragPosition.y - 120 }}>
             {renderPiece(draggingPiece, 1.2)}
          </div>
        )}
      </div>

      {gameState === GameState.GAME_OVER && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md animate-fade-in p-8 text-center">
            <Trophy size={80} className="text-yellow-400 mb-4 animate-bounce" />
            <h2 className="text-5xl font-black text-white mb-2">FIM DE JOGO!</h2>
            <p className="text-2xl text-sky-400 mb-8 font-bold">{score} pontos!</p>
            <button onClick={initGame} className="bg-sky-500 text-white px-12 py-5 rounded-3xl font-black text-2xl shadow-xl border-b-8 border-sky-700 active:border-b-0 active:translate-y-2">
                JOGAR DE NOVO
            </button>
        </div>
      )}
    </div>
  );
};

export default BlockPuzzle;
