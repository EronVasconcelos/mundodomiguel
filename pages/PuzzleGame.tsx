
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Trophy, RefreshCw, Star, Shuffle } from 'lucide-react';
import { incrementPuzzle, getDailyProgress, getGoals } from '../services/progressService';

const GRID_SIZE = 3; // 3x3 Grid
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

// Lista Curada: Personagens Famosos & Estilo 3D Realista (Toy Photography)
const PUZZLE_IMAGES = [
  // Super Mario
  'https://images.unsplash.com/photo-1612404730960-5c7157472611?q=80&w=800&auto=format&fit=crop', 
  // Homem Aranha (Spider-Man)
  'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=800&auto=format&fit=crop',
  // Star Wars (Stormtrooper)
  'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?q=80&w=800&auto=format&fit=crop',
  // Batman (Lego)
  'https://images.unsplash.com/photo-1509347528160-9a9e33742cd4?q=80&w=800&auto=format&fit=crop',
  // Toy Story Vibe (Woody/Buzz)
  'https://images.unsplash.com/photo-1596727147705-0608c687e2e9?q=80&w=800&auto=format&fit=crop',
  // Pokémon (Pikachu)
  'https://images.unsplash.com/photo-1613776317850-394db30d1de9?q=80&w=800&auto=format&fit=crop',
  // Dinossauro Rex (3D)
  'https://images.unsplash.com/photo-1560159752-d6d7c8052739?q=80&w=800&auto=format&fit=crop',
  // Astronauta (Among Us / Space vibe)
  'https://images.unsplash.com/photo-1614726365723-49cfae968603?q=80&w=800&auto=format&fit=crop',
  // Robô Wall-E Style
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop',
  // Carros (Relâmpago McQueen vibe)
  'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=800&auto=format&fit=crop',
  // Minion / Personagem Amarelo
  'https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=800&auto=format&fit=crop',
  // Hello Kitty / Cute Doll
  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop',
];

const PuzzleGame: React.FC = () => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState(TILE_COUNT - 1);
  const [won, setWon] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [missionStats, setMissionStats] = useState({ current: 0, target: 3 });

  useEffect(() => {
    // Pick random image on start
    setCurrentImageIndex(Math.floor(Math.random() * PUZZLE_IMAGES.length));
    startNewGame();
    
    const p = getDailyProgress();
    const g = getGoals();
    setMissionStats({ current: p.puzzlesSolved || 0, target: g.PUZZLES });
  }, []);

  const startNewGame = () => {
    setWon(false);
    setShowMissionComplete(false);
    
    // Create solved state
    let newTiles = Array.from({ length: TILE_COUNT }, (_, i) => i);
    
    // Shuffle by making random valid moves (ensures solvability)
    let currentEmpty = TILE_COUNT - 1;
    const moves = 60; 
    
    for (let i = 0; i < moves; i++) {
        const neighbors = getNeighbors(currentEmpty);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        newTiles[currentEmpty] = newTiles[randomNeighbor];
        newTiles[randomNeighbor] = TILE_COUNT - 1; 
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

    const neighbors = getNeighbors(emptyIndex);
    if (neighbors.includes(index)) {
        const newTiles = [...tiles];
        newTiles[emptyIndex] = newTiles[index];
        newTiles[index] = TILE_COUNT - 1; 
        
        setTiles(newTiles);
        setEmptyIndex(index);
        checkWin(newTiles);
    }
  };

  const checkWin = (currentTiles: number[]) => {
      const isWin = currentTiles.every((val, index) => val === index);
      if (isWin) {
          setWon(true);
          const reached = incrementPuzzle();
          const p = getDailyProgress();
          setMissionStats({ ...missionStats, current: p.puzzlesSolved || 0 });
          if (reached) setTimeout(() => setShowMissionComplete(true), 800);
      }
  };

  const shuffleImage = () => {
      let next = Math.floor(Math.random() * PUZZLE_IMAGES.length);
      while(next === currentImageIndex && PUZZLE_IMAGES.length > 1) {
          next = Math.floor(Math.random() * PUZZLE_IMAGES.length);
      }
      setCurrentImageIndex(next);
      startNewGame();
  };

  const currentImageUrl = PUZZLE_IMAGES[currentImageIndex];

  return (
    <Layout title="Quebra-Cabeça" color="text-indigo-600" missionTarget={missionStats}>
      <div className="flex flex-col h-full gap-6 items-center pt-4">
        
        {/* Shuffle Button */}
        <button 
            onClick={shuffleImage} 
            className="bg-white text-indigo-600 px-6 py-3 rounded-2xl border border-slate-200 shadow-sm active:scale-95 transition-transform font-bold text-sm flex items-center gap-2"
        >
            <Shuffle size={20} /> TROCAR IMAGEM
        </button>

        {/* Puzzle Board */}
        <div className="relative p-2 bg-indigo-500 rounded-[2.5rem] shadow-[0_15px_40px_rgba(79,70,229,0.3)]">
            <div 
                className="grid gap-1 bg-indigo-600 p-1 rounded-[2rem] relative overflow-hidden"
                style={{ 
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    width: '320px',
                    height: '320px'
                }}
            >
                {tiles.map((tileValue, index) => {
                    const isEmpty = tileValue === TILE_COUNT - 1; // 8
                    
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
                                backgroundImage: `url(${currentImageUrl})`,
                                backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                                backgroundPosition: `${xPos}% ${yPos}%`,
                                transform: isEmpty && !won ? 'scale(0)' : 'scale(1)'
                            }}
                        >
                           {/* Hint number (optional, minimal visibility) */}
                           {!won && !isEmpty && (
                                <div className="absolute top-1 left-1 w-5 h-5 bg-black/30 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                    {tileValue + 1}
                                </div>
                           )}
                        </div>
                    );
                })}
            </div>

            {/* Win Overlay */}
            {won && !showMissionComplete && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-[2.5rem] animate-fade-in">
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

        {/* Mini Preview & Instruction */}
        {!won && (
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm max-w-xs">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                    <img src={currentImageUrl} className="w-full h-full object-cover" />
                </div>
                <p className="text-slate-400 text-xs font-bold leading-tight">Monte a imagem movendo as peças para o espaço vazio.</p>
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
                    <p className="text-slate-500 font-bold text-center mb-6">Você completou o desafio de hoje.</p>
                    
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
