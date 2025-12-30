
import React, { useState, useEffect } from 'react';
import { generateStoryText, generateStoryImage } from '../services/geminiService';
import { Sparkles, Loader2, BookOpen, Moon, WifiOff, Download, Gift } from 'lucide-react';
import { StoryData, ChildProfile } from '../types';

const StoryTime: React.FC = () => {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  
  const [useAI, setUseAI] = useState(true); 

  const [loading, setLoading] = useState(false); // Carregamento do Texto
  const [imageLoading, setImageLoading] = useState(false); // Carregamento da Imagem (Background)
  
  const [story, setStory] = useState<StoryData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showImageReveal, setShowImageReveal] = useState(false); // Controle da revelação
  
  const IMAGINATION_TOPICS = [
    "Numberblocks na Praia",
    "Patrulha Canina no Espaço",
    "Dinossauros na Escola",
    "Piquenique da Peppa",
    "Heróis de Pijama Salvam o Dia",
    "Construindo um Foguete Lego",
    "O Aniversário do Mickey",
    "Uma Aventura no Minecraft"
  ];

  useEffect(() => {
    const stored = localStorage.getItem('child_profile');
    if (stored) setProfile(JSON.parse(stored));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleModeSwitch = (wantAI: boolean) => {
    setUseAI(wantAI);
    resetStoryState();
  };

  const resetStoryState = () => {
    setStory(null);
    setImageUrl(null);
    setShowImageReveal(false);
    setImageLoading(false);
  };
  
  const handleCreateStory = async (selectedTopic: string) => {
    if (!profile) return;
    setLoading(true);
    resetStoryState();
    
    try {
      // 1. Gera e mostra o TEXTO primeiro (bloqueia a UI apenas para o texto)
      const storyData = await generateStoryText(selectedTopic, profile);
      setStory(storyData);
      setLoading(false); // Libera a UI para leitura

      // 2. Gera a IMAGEM em Background (enquanto a criança lê)
      setImageLoading(true);
      let img = "";
      
      if (useAI && isOnline) {
          // Usa o conteúdo da história para gerar uma imagem coerente
          img = await generateStoryImage(storyData.content, profile);
      } else {
          // Fallback offline instantâneo
          img = await generateStoryImage(selectedTopic, profile);
      }
      
      setImageUrl(img);
      setImageLoading(false);

    } catch (e) {
      console.error(e);
      alert("Ops! Não consegui ler a história agora.");
      setLoading(false);
      setImageLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `historia-magica-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col font-sans relative bg-[#0f172a] text-white">
       <div className="px-4 pt-6 pb-2">
         <header className="bg-slate-800/50 backdrop-blur-md rounded-3xl px-4 py-3 flex items-center justify-between border border-slate-700">
            <button onClick={() => window.history.back()} className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
               <BookOpen />
            </button>
            <h1 className="text-xl font-black uppercase text-yellow-400">Histórias</h1>
            <div className="w-10 flex items-center justify-center">
              {isOnline ? <Moon className="text-yellow-200 fill-yellow-200" /> : <WifiOff className="text-slate-500" size={20} />}
            </div>
         </header>
       </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 scroll-smooth">
        {!story && !loading && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 space-y-6">
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-700">
               <button onClick={() => handleModeSwitch(false)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${!useAI ? 'bg-slate-700' : 'text-slate-400'}`}>Livro Comum</button>
               <button onClick={() => handleModeSwitch(true)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${useAI ? 'bg-indigo-600' : 'text-slate-400'}`}>IA Mágica ✨</button>
            </div>
            <h2 className="text-2xl font-black text-center">O que vamos imaginar?</h2>
            <div className="grid grid-cols-2 gap-3 justify-center">
              {IMAGINATION_TOPICS.map(t => (
                <button key={t} onClick={() => handleCreateStory(t)} className="px-4 py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-slate-200 font-bold text-sm text-left leading-tight border-b-4 border-slate-800 active:border-b-0 active:translate-y-1">
                    {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-400 mb-4" />
            <p className="text-2xl font-bold animate-pulse text-yellow-200">Escrevendo sua história...</p>
          </div>
        )}

        {story && (
          <div className="space-y-6 animate-slide-up pb-8">
            <h2 className="text-3xl font-black text-yellow-400 text-center leading-tight">{story.title}</h2>
            
            <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 text-slate-300 leading-relaxed text-lg shadow-lg">
              {story.content.split('\n').map((p, i) => <p key={i} className="mb-4 last:mb-0">{p}</p>)}
            </div>

            <div className="p-4 bg-indigo-900/30 rounded-2xl text-yellow-100 font-bold italic text-center border border-indigo-500/30">
                ✨ Moral: {story.moral}
            </div>
            
            {/* AREA DA SURPRESA (IMAGEM) */}
            <div className="mt-8">
                {!showImageReveal ? (
                    <button 
                        onClick={() => setShowImageReveal(true)}
                        className="w-full py-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2rem] shadow-[0_0_30px_rgba(219,39,119,0.3)] animate-pulse flex flex-col items-center justify-center gap-3 border-4 border-white/20 active:scale-95 transition-transform"
                    >
                        <Gift size={48} className="text-white mb-1" />
                        <span className="text-2xl font-black text-white uppercase tracking-widest">Abrir Presente Mágico</span>
                        <span className="text-sm font-bold text-pink-200">Toque para ver o desenho da história!</span>
                    </button>
                ) : (
                    <div className="animate-pop space-y-4">
                        <div className="aspect-square w-full bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-indigo-500 shadow-2xl relative group">
                            {imageUrl ? (
                                <>
                                    <img src={imageUrl} alt="Story Illustration" className="w-full h-full object-cover" />
                                    {/* Botão de Download */}
                                    <button 
                                        onClick={handleDownloadImage}
                                        className="absolute top-4 right-4 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 active:scale-95 hover:bg-black/70 transition-all shadow-lg"
                                        title="Baixar Imagem"
                                    >
                                        <Download size={24} />
                                    </button>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 gap-4 text-slate-400">
                                    <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
                                    <p className="font-bold text-center px-6">A IA mágica está pintando o desenho...<br/>Quase pronto!</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Botão para ler outra só aparece depois de revelar a imagem para manter o fluxo */}
                        <button onClick={resetStoryState} className="w-full bg-slate-700 text-slate-300 py-4 rounded-2xl font-bold hover:bg-slate-600 transition-colors">
                            Ler Outra História
                        </button>
                    </div>
                )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default StoryTime;
