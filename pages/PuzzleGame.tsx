
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Trophy, RefreshCw, Star, Grid } from 'lucide-react';
import { incrementPuzzle, getDailyProgress, getGoals } from '../services/progressService';

const GRID_SIZE = 3; // 3x3 Grid
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

// Themes with nice Unsplash images
const THEMES = [
  { id: 'animals', name: 'Animais', url: 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=800&auto=format&fit=crop' }, // Parrot
  { id: 'space', name: 'Espaço', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop' }, // Space
  { id: 'dino', name: 'Dino', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop' }, // Mountain/Nature vibe
  { id: 'lego', name: 'Lego', url: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=800&auto=format&fit=crop' }, // Lego
];

const PuzzleGame: React.FC = () => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState(TILE_COUNT - 1);
  const [won, setWon] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [missionStats, setMissionStats] = useState({ current: 0, target: 3 });

  useEffect(() => {
    startNewGame();
    const p = getDailyProgress();
    const g = getGoals();
    setMissionStats({ current: p.puzzlesSolved || 0, target: g.PUZZLES });
  }, []);

  const startNewGame = () => {
    setWon(false);
    setShowMissionComplete(false);
    // Shuffle logic:
    // Create solved array [0, 1, 2, ..., 8] where 8 is empty
    let newTiles = Array.from({ length: TILE_COUNT }, (_, i) => i);
    
    // Random valid moves to shuffle (to ensure solvability)
    let currentEmpty = TILE_COUNT - 1;
    const moves = 50; // number of random moves to shuffle
    
    for (let i = 0; i < moves; i++) {
        const neighbors = getNeighbors(currentEmpty);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        // Swap
        newTiles[currentEmpty] = newTiles[randomNeighbor];
        newTiles[randomNeighbor] = TILE_COUNT - 1; // 8 is placeholder for empty in values? No, values match index.
        // Actually, let's track VALUES. 
        // Value 8 represents the empty tile visually.
        currentEmpty = randomNeighbor;
    }

    setTiles(newTiles);
    setEmptyIndex(currentEmpty);
  };

  const getNeighbors = (index: number) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const neighbors = [];
    
    if (row > 0) neighbors.push(index - GRID_SIZE); // Top
    if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE); // Bottom
    if (col > 0) neighbors.push(index - 1); // Left
    if (col < GRID_SIZE - 1) neighbors.push(index + 1); // Right
    
    return neighbors;
  };

  const handleTileClick = (index: number) => {
    if (won) return;

    // Check if adjacent to empty
    const neighbors = getNeighbors(emptyIndex);
    if (neighbors.includes(index)) {
        // Swap
        const newTiles = [...tiles];
        newTiles[emptyIndex] = newTiles[index];
        newTiles[index] = TILE_COUNT - 1; // TILE_COUNT-1 (8) is our "empty" value identifier
        
        setTiles(newTiles);
        setEmptyIndex(index);
        checkWin(newTiles);
    }
  };

  const checkWin = (currentTiles: number[]) => {
      // Check if tiles are in order: 0, 1, 2, 3...
      const isWin = currentTiles.every((val, index) => val === index);
      if (isWin) {
          setWon(true);
          const reached = incrementPuzzle();
          const p = getDailyProgress();
          setMissionStats({ ...missionStats, current: p.puzzlesSolved || 0 });
          if (reached) setTimeout(() => setShowMissionComplete(true), 800);
      }
  };

  const nextTheme = () => {
      setThemeIndex((prev) => (prev + 1) % THEMES.length);
      startNewGame();
  };

  return (
    <Layout title="Quebra-Cabeça" color="text-indigo-600" missionTarget={missionStats}>
      <div className="flex flex-col h-full gap-6 items-center">
        
        {/* Theme Selector */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <button onClick={nextTheme} className="bg-indigo-100 text-indigo-600 p-2 rounded-xl active:scale-95 transition-transform font-bold text-sm flex items-center gap-2">
                <Grid size={16} /> Mudar Tema: {THEMES[themeIndex].name}
            </button>
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                <img src={THEMES[themeIndex].url} className="w-full h-full object-cover" />
            </div>
        </div>

        {/* Puzzle Board */}
        <div className="relative p-2 bg-indigo-500 rounded-3xl shadow-[0_10px_30px_rgba(79,70,229,0.3)]">
            <div 
                className="grid gap-1 bg-indigo-600 p-1 rounded-2xl relative overflow-hidden"
                style={{ 
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    width: '320px',
                    height: '320px'
                }}
            >
                {tiles.map((tileValue, index) => {
                    const isEmpty = tileValue === TILE_COUNT - 1; // 8
                    
                    // Logic to calculate background position based on the VALUE of the tile (original position)
                    const row = Math.floor(tileValue / GRID_SIZE);
                    const col = tileValue % GRID_SIZE;
                    const xPos = (col * 100) / (GRID_SIZE - 1);
                    const yPos = (row * 100) / (GRID_SIZE - 1);

                    return (
                        <div
                            key={index}
                            onClick={() => handleTileClick(index)}
                            className={`w-full h-full rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden
                                ${isEmpty && !won ? 'opacity-0 pointer-events-none' : 'shadow-sm border border-white/20'}
                                ${won ? 'scale-100 border-none' : ''}
                            `}
                            style={{
                                backgroundImage: `url(${THEMES[themeIndex].url})`,
                                backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                                backgroundPosition: `${xPos}% ${yPos}%`,
                                transform: isEmpty && !won ? 'scale(0)' : 'scale(1)'
                            }}
                        >
                            {/* Number hint for easier solving (optional) */}
                            {!won && !isEmpty && (
                                <div className="absolute top-1 left-1 bg-black/40 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold backdrop-blur-sm">
                                    {tileValue + 1}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Win Overlay */}
            {won && !showMissionComplete && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl animate-fade-in">
                    <Star size={64} className="text-yellow-400 animate-spin-slow mb-4 fill-yellow-400" />
                    <h2 className="text-3xl font-black text-white mb-2">LINDO!</h2>
                    <button 
                        onClick={startNewGame} 
                        className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black text-lg flex items-center gap-2 active:scale-95 transition-transform shadow-lg mt-4"
                    >
                        <RefreshCw /> NOVO JOGO
                    </button>
                </div>
            )}
        </div>

        {/* Instructions */}
        {!won && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 max-w-xs text-center">
                <p className="text-slate-400 text-sm font-bold">Toque nas peças ao lado do espaço vazio para montar a foto!</p>
            </div>
        )}

        {/* Mission Complete Popup */}
        {showMissionComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center animate-pop relative overflow-hidden shadow-2xl border-4 border-yellow-300">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 text-center mb-2">QUEBRA-CABEÇA!</h2>
                    <p className="text-slate-500 font-bold text-center mb-6">Você montou 3 desenhos hoje.</p>
                    
                    <button 
                    onClick={() => setShowMissionComplete(false)}
                    className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-xl active:scale-95 transition-transform"
                    >
                    CONTINUAR
                    </button>
                </div>
            </div>
        )}

      </div>
    </Layout>
  );
};

export default PuzzleGame;
