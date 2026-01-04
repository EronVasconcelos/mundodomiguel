
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
  const [previewPos, setPreviewPos] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
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
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canFit(piece.shape, r, c, currentGrid)) return true;
        }
      }
      return false;
    });

    if (!canPlaceAny) {
      setGameState(GameState.GAME_OVER);
    }
  };

  const canFit = (shape: number[][], row: number, col: number, currentGrid: (string | null)[]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const targetR = row + r;
          const targetC = col + c;
          if (targetR >= GRID_SIZE || targetC >= GRID_SIZE || currentGrid[targetR * GRID_SIZE + targetC]) {
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

    // Check for completed rows and columns
    const rowsToClear = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      let full = true;
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!newGrid[r * GRID_SIZE + c]) { full = false; break; }
      }
      if (full) rowsToClear.push(r);
    }

    const colsToClear = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let full = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (!newGrid[r * GRID_SIZE + c]) { full = false; break; }
      }
      if (full) colsToClear.push(c);
    }

    // Points
    let points = cellsPlaced * 10;
    if (rowsToClear.length > 0 || colsToClear.length > 0) {
      const clearedCount = rowsToClear.length + colsToClear.length;
      points += clearedCount * 100 * clearedCount; // Bonus for multi-line
      
      // Clear cells
      rowsToClear.forEach(r => {
        for (let c = 0; c < GRID_SIZE; c++) newGrid[r * GRID_SIZE + c] = null;
      });
      colsToClear.forEach(c => {
        for (let r = 0; r < GRID_SIZE; r++) newGrid[r * GRID_SIZE + c] = null;
      });
    }

    setScore(s => s + points);
    setGrid(newGrid);
    
    const remainingPieces = pieces.filter(p => p.id !== piece.id);
    if (remainingPieces.length === 0) {
      spawnPieces();
    } else {
      setPieces(remainingPieces);
      checkGameOver(newGrid, remainingPieces);
    }
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

    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const cellSize = rect.width / GRID_SIZE;
      
      // Offset piece position slightly so it's above finger
      const pieceYOffset = 80; 
      
      const localX = clientX - rect.left;
      const localY = clientY - rect.top - pieceYOffset;
      
      const col = Math.round(localX / cellSize);
      const row = Math.round(localY / cellSize);

      if (draggingPiece && col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        if (canFit(draggingPiece.shape, row, col, grid)) {
          setPreviewPos(row * GRID_SIZE + col);
        } else {
          setPreviewPos(null);
        }
      } else {
        setPreviewPos(null);
      }
    }
  };

  const handleDragEnd = () => {
    if (draggingPiece && previewPos !== null) {
      const row = Math.floor(previewPos / GRID_SIZE);
      const col = previewPos % GRID_SIZE;
      placePiece(draggingPiece, row, col);
    }
    setDraggingPiece(null);
    setPreviewPos(null);
  };

  const renderPiece = (piece: ActivePiece, isGhost: boolean = false) => {
    return (
      <div 
        className={`grid gap-1 transition-transform ${isGhost ? 'opacity-30 scale-90' : 'active:scale-110'}`}
        style={{ 
          gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
          width: piece.shape[0].length * 25,
          height: piece.shape.length * 25
        }}
      >
        {piece.shape.flat().map((cell, i) => (
          <div 
            key={i} 
            className="w-6 h-6 rounded-md shadow-sm border-b-4 border-black/20"
            style={{ 
              backgroundColor: cell ? piece.color : 'transparent',
              opacity: cell ? 1 : 0
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className="h-full flex flex-col font-sans bg-slate-900 text-white relative touch-none select-none"
      ref={containerRef}
      onMouseMove={draggingPiece ? updateDragPos : undefined}
      onTouchMove={draggingPiece ? updateDragPos : undefined}
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-slate-800/80 backdrop-blur-md border-b border-slate-700 z-20">
         <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center active:scale-95 transition-transform"><ArrowLeft size={24} strokeWidth={3} /></button>
         <h1 className="text-xl font-black uppercase text-sky-400">Blocos Mágicos</h1>
         <div className="bg-slate-700 px-4 py-1 rounded-full text-lg font-black tracking-widest flex items-center gap-2 border border-slate-600">
            <Star size={16} className="text-yellow-400 fill-yellow-400" /> {score}
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        
        {/* Game Grid */}
        <div 
          ref={gridRef}
          className="bg-slate-800 p-2 rounded-2xl grid gap-1 shadow-2xl relative border-4 border-slate-700"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: 'min(90vw, 360px)', 
            height: 'min(90vw, 360px)' 
          }}
        >
          {grid.map((cell, i) => (
            <div 
              key={i} 
              className={`w-full h-full rounded-md border-b-4 ${cell ? 'border-black/20' : 'bg-slate-900/50 border-transparent'}`}
              style={{ backgroundColor: cell || undefined }}
            />
          ))}

          {/* Placement Preview */}
          {draggingPiece && previewPos !== null && (
             <div 
                className="absolute inset-0 pointer-events-none p-2 grid gap-1"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
             >
                {Array(GRID_SIZE * GRID_SIZE).fill(null).map((_, i) => {
                  const r = Math.floor(i / GRID_SIZE);
                  const c = i % GRID_SIZE;
                  const pr = Math.floor(previewPos / GRID_SIZE);
                  const pc = previewPos % GRID_SIZE;
                  
                  const isPart = r >= pr && r < pr + draggingPiece.shape.length && 
                                 c >= pc && c < pc + draggingPiece.shape[0].length &&
                                 draggingPiece.shape[r - pr][c - pc];
                  
                  return (
                    <div 
                      key={i} 
                      className={`w-full h-full rounded-md ${isPart ? 'opacity-40' : ''}`}
                      style={{ backgroundColor: isPart ? draggingPiece.color : 'transparent' }}
                    />
                  );
                })}
             </div>
          )}
        </div>

        {/* Available Pieces */}
        <div className="flex gap-4 justify-around w-full max-w-sm h-32 items-center bg-slate-800/30 rounded-[2rem] p-4">
          {pieces.map((p) => (
            <div 
              key={p.id}
              className={`cursor-grab active:cursor-grabbing p-2 transition-opacity ${draggingPiece?.id === p.id ? 'opacity-0' : 'opacity-100'}`}
              onMouseDown={(e) => handleDragStart(e, p)}
              onTouchStart={(e) => handleDragStart(e, p)}
            >
              {renderPiece(p)}
            </div>
          ))}
        </div>

        {/* Dragging Piece Visual Overlay */}
        {draggingPiece && (
          <div 
            className="fixed pointer-events-none z-50 transform -translate-x-1/2"
            style={{ 
              left: dragPosition.x, 
              top: dragPosition.y - 100, // Show above touch point
              transform: 'scale(1.5) translateX(-33%)' 
            }}
          >
             {renderPiece(draggingPiece)}
          </div>
        )}

      </div>

      {/* Game Over Screen */}
      {gameState === GameState.GAME_OVER && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md animate-fade-in p-8 text-center">
            <Trophy size={80} className="text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
            <h2 className="text-5xl font-black text-white mb-2">FIM DE JOGO!</h2>
            <p className="text-2xl text-sky-400 mb-8 font-bold">Incríveis {score} pontos!</p>
            <button 
              onClick={initGame} 
              className="bg-sky-500 hover:bg-sky-400 text-white px-12 py-5 rounded-3xl font-black text-2xl flex items-center gap-3 active:scale-95 transition-transform shadow-xl border-b-8 border-sky-700"
            >
                <RefreshCw /> JOGAR DE NOVO
            </button>
            <button 
              onClick={() => navigate(AppRoute.ARCADE)} 
              className="mt-6 text-slate-400 font-bold hover:text-white"
            >
                Voltar para o Arcade
            </button>
        </div>
      )}
    </div>
  );
};

export default BlockPuzzle;
