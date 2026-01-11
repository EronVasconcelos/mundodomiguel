
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, GameState } from '../../types';
import { ArrowLeft, RefreshCw, Trophy, AlertCircle, GripHorizontal } from 'lucide-react';

const GRID_SIZE = 8;

interface Piece {
  shape: number[][];
  color: string;
  id: string;
}

const COLORS = {
  BLUE: 'bg-blue-500 from-blue-400 to-blue-600 shadow-blue-900/50',
  PINK: 'bg-pink-500 from-pink-400 to-pink-600 shadow-pink-900/50',
  ORANGE: 'bg-orange-500 from-orange-400 to-orange-600 shadow-orange-900/50',
  GREEN: 'bg-emerald-500 from-emerald-400 to-emerald-600 shadow-emerald-900/50',
  RED: 'bg-red-500 from-red-400 to-red-600 shadow-red-900/50',
  PURPLE: 'bg-purple-500 from-purple-400 to-purple-600 shadow-purple-900/50',
};

const SHAPES = [
  [[1, 1], [1, 1]], // O
  [[1, 1, 1, 1]], // I
  [[1], [1], [1], [1]], // I Vertical
  [[1, 1, 1], [0, 1, 0]], // T
  [[0, 1, 0], [1, 1, 1]], // T Reversed
  [[1, 1, 0], [0, 1, 1]], // Z
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 0], [1, 0], [1, 1]], // L
  [[0, 1], [0, 1], [1, 1]], // J
  [[1]], // Dot
  [[1, 1]], // 1x2
  [[1], [1]], // 2x1
];

const BlockPuzzle: React.FC = () => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  
  // Refs para Drag and Drop
  const [draggedPiece, setDraggedPiece] = useState<Piece | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoverCell, setHoverCell] = useState<{r: number, c: number} | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generatePiece = useCallback((): Piece => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const colorKeys = Object.keys(COLORS) as (keyof typeof COLORS)[];
    const color = COLORS[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
    return { shape, color, id: Math.random().toString(36).substr(2, 9) };
  }, []);

  const initGame = () => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    setPieces([generatePiece(), generatePiece(), generatePiece()]);
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  useEffect(() => {
    initGame();
  }, [generatePiece]);

  const canPlace = (shape: number[][], row: number, col: number, currentGrid: (string | null)[][]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          const targetRow = row + r;
          const targetCol = col + c;
          if (
            targetRow < 0 || targetRow >= GRID_SIZE ||
            targetCol < 0 || targetCol >= GRID_SIZE ||
            currentGrid[targetRow][targetCol] !== null
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const applyGravity = (currentGrid: (string | null)[][]) => {
    const newGrid = [...currentGrid.map(r => [...r])];
    for (let c = 0; c < GRID_SIZE; c++) {
      let writeIndex = GRID_SIZE - 1;
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (newGrid[r][c] !== null) {
          const val = newGrid[r][c];
          newGrid[r][c] = null;
          newGrid[writeIndex][c] = val;
          writeIndex--;
        }
      }
    }
    return newGrid;
  };

  const placePiece = (piece: Piece, row: number, col: number) => {
    const newGrid = [...grid.map(r => [...r])];
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] === 1) {
          newGrid[row + r][col + c] = piece.color;
        }
      }
    }

    let rowsToClear: number[] = [];
    let colsToClear: number[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r].every(cell => cell !== null)) rowsToClear.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid.every(row => row[c] !== null)) colsToClear.push(c);
    }

    rowsToClear.forEach(r => {
      for (let c = 0; c < GRID_SIZE; c++) newGrid[r][c] = null;
    });
    colsToClear.forEach(c => {
      for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = null;
    });

    let finalGrid = newGrid;
    if (rowsToClear.length > 0 || colsToClear.length > 0) {
      finalGrid = applyGravity(newGrid);
    }

    setGrid(finalGrid);
    setScore(prev => prev + ((rowsToClear.length + colsToClear.length) * 100) + 10);
    
    const remainingPieces = pieces.filter(p => p.id !== piece.id);
    const updatedPieces = remainingPieces.length === 0 ? [generatePiece(), generatePiece(), generatePiece()] : remainingPieces;
    setPieces(updatedPieces);
    
    checkGameOver(finalGrid, updatedPieces);
  };

  const checkGameOver = (currentGrid: (string | null)[][], currentPieces: Piece[]) => {
    let possibleMove = false;
    for (const piece of currentPieces) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlace(piece.shape, r, c, currentGrid)) {
            possibleMove = true;
            break;
          }
        }
        if (possibleMove) break;
      }
      if (possibleMove) break;
    }
    if (!possibleMove) setGameState(GameState.GAME_OVER);
  };

  // HANDLERS DE ARRASTAR (Melhorados)
  const handlePointerDown = (e: React.PointerEvent, piece: Piece) => {
    if (gameState !== GameState.PLAYING) return;
    setDraggedPiece(piece);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedPiece) return;
    setDragPos({ x: e.clientX, y: e.clientY });

    if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        // Tamanho aproximado de uma célula na tela para detecção
        const cellW = rect.width / GRID_SIZE;
        const cellH = rect.height / GRID_SIZE;

        // Calculamos a célula alvo baseada na posição do ponteiro
        const x = e.clientX - rect.left - (cellW / 2);
        const y = e.clientY - rect.top - (cellH / 2);
        
        const c = Math.round(x / cellW);
        const r = Math.round(y / cellH);

        if (r >= 0 && r <= GRID_SIZE - draggedPiece.shape.length && 
            c >= 0 && c <= GRID_SIZE - draggedPiece.shape[0].length) {
            setHoverCell({ r, c });
        } else {
            setHoverCell(null);
        }
    }
  };

  const handlePointerUp = () => {
    if (!draggedPiece) return;
    
    if (hoverCell && canPlace(draggedPiece.shape, hoverCell.r, hoverCell.c, grid)) {
        placePiece(draggedPiece, hoverCell.r, hoverCell.c);
    }

    setDraggedPiece(null);
    setHoverCell(null);
  };

  const Block = ({ color, isGhost = false }: { color: string, isGhost?: boolean }) => (
    <div className={`w-full h-full rounded-md border-b-4 border-r-2 border-black/20 relative overflow-hidden transition-all duration-300 shadow-inner ${color} ${isGhost ? 'opacity-30' : 'animate-pop'}`}>
      <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full" />
    </div>
  );

  return (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="h-full flex flex-col font-sans bg-[#0f172a] text-white overflow-hidden relative touch-none"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-slate-800 z-10 pointer-events-auto">
         <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center active:scale-95 transition-transform"><ArrowLeft size={24} strokeWidth={3} /></button>
         <div className="flex flex-col items-center">
            <h1 className="text-xl font-black uppercase text-blue-400 leading-none">Blocos</h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Arrastar e Soltar</span>
         </div>
         <div className="bg-blue-600 px-4 py-1 rounded-full text-lg font-black shadow-lg shadow-blue-900/50">{score}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6 z-10">
        
        {/* Main Grid */}
        <div 
            ref={gridRef}
            className="bg-slate-800/80 p-2 rounded-2xl shadow-2xl border-4 border-slate-700 relative backdrop-blur-sm pointer-events-none"
        >
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {grid.map((row, r) => 
              row.map((cell, c) => {
                const isHovered = draggedPiece && hoverCell && 
                                  r >= hoverCell.r && r < hoverCell.r + draggedPiece.shape.length &&
                                  c >= hoverCell.c && c < hoverCell.c + draggedPiece.shape[0].length &&
                                  draggedPiece.shape[r - hoverCell.r][c - hoverCell.c] === 1;

                const canPlaceGhost = isHovered && canPlace(draggedPiece!.shape, hoverCell!.r, hoverCell!.c, grid);

                return (
                    <div 
                      key={`${r}-${c}`} 
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-colors duration-200
                        ${cell === null ? 'bg-slate-900/50 border border-slate-800/50' : ''}`}
                    >
                      {cell && <Block color={cell} />}
                      {isHovered && !cell && (
                        <div className={`w-full h-full p-0.5 ${canPlaceGhost ? 'opacity-40' : 'opacity-20 bg-red-500'}`}>
                           <div className={`w-full h-full rounded-md ${draggedPiece!.color}`} />
                        </div>
                      )}
                    </div>
                );
              })
            )}
          </div>

          {gameState === GameState.GAME_OVER && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-xl animate-fade-in z-20 pointer-events-auto">
               <Trophy size={64} className="text-yellow-400 mb-4 animate-bounce" />
               <h2 className="text-3xl font-black mb-2">Fim de Jogo!</h2>
               <p className="text-blue-200 mb-6 text-xl">Pontos: {score}</p>
               <button onClick={initGame} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-2 active:scale-95 shadow-lg">
                 <RefreshCw /> Reiniciar
               </button>
            </div>
          )}
        </div>

        {/* Peça Arrastada Visual (Overlay) */}
        {draggedPiece && (
            <div 
                className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 scale-110 opacity-90"
                style={{ left: dragPos.x, top: dragPos.y }}
            >
                <div className="flex flex-col gap-1 items-center justify-center">
                    {draggedPiece.shape.map((row, r) => (
                        <div key={r} className="flex gap-1">
                            {row.map((cell, c) => (
                                <div key={c} className={`w-9 h-9 sm:w-11 sm:h-11 ${cell === 1 ? '' : 'opacity-0'}`}>
                                    {cell === 1 && <Block color={draggedPiece.color} />}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Tray de Peças */}
        <div className="flex gap-3 items-center justify-center w-full min-h-[140px] pointer-events-auto">
           {pieces.map((piece) => (
             <div
               key={piece.id}
               onPointerDown={(e) => handlePointerDown(e, piece)}
               className={`p-3 rounded-2xl transition-all duration-300 border-4 border-dashed border-slate-700/50 hover:border-blue-500/50 touch-none
                 ${draggedPiece?.id === piece.id ? 'opacity-20 grayscale' : 'bg-slate-800/50 cursor-grab active:scale-90 shadow-lg'}`}
             >
                <div className="flex flex-col gap-0.5 items-center justify-center">
                  {piece.shape.map((row, r) => (
                    <div key={r} className="flex gap-0.5">
                      {row.map((cell, c) => (
                        <div key={c} className={`w-5 h-5 sm:w-6 sm:h-6 ${cell === 1 ? '' : 'opacity-0'}`}>
                           {cell === 1 && <Block color={piece.color} />}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
             </div>
           ))}
        </div>

        {/* Rodapé de Instrução */}
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 text-slate-400">
           <GripHorizontal size={16} />
           <span className="text-[10px] font-bold uppercase tracking-widest">Segure e arraste a peça para o quadro</span>
        </div>
      </div>
    </div>
  );
};

export default BlockPuzzle;
