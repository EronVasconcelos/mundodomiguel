
import React, { useState, useEffect } from 'react';
import { generateStoryText, generateStoryImage } from '../services/geminiService';
import { Sparkles, Loader2, BookOpen, Moon, WifiOff, Key } from 'lucide-react';
import { StoryData, ChildProfile } from '../types';

const StoryTime: React.FC = () => {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  
  const [useAI, setUseAI] = useState(false);
  const [aiActiveGlobal, setAiActiveGlobal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [story, setStory] = useState<StoryData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  
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

    const checkInitialAuth = async () => {
        const globalStatus = localStorage.getItem('ai_active_global') === 'true';
        setAiActiveGlobal(globalStatus);
        
        if (globalStatus) {
            setUseAI(true);
        }
    };

    checkInitialAuth();

    const handleAuthReset = () => {
        setAiActiveGlobal(false);
        setUseAI(false);
    };
    window.addEventListener('ai_auth_reset', handleAuthReset);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('ai_auth_reset', handleAuthReset);
    };
  }, []);

  const handleModeSwitch = (wantAI: boolean) => {
    if (wantAI && !aiActiveGlobal) {
        setShowPremiumGate(true);
        return;
    }
    setUseAI(wantAI);
    resetStoryState();
  };

  const resetStoryState = () => {
    setStory(null);
    setImageUrl(null);
  };
  
  const activateAI = () => {
      setIsConnecting(true);
      
      const aiStudio = (window as any).aistudio;
      if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
          aiStudio.openSelectKey();
      }

      localStorage.setItem('ai_active_global', 'true');
      setAiActiveGlobal(true);
      setUseAI(true);
      
      setTimeout(() => {
         setShowPremiumGate(false);
         setIsConnecting(false);
      }, 1000);
  };

  const handleCreateStory = async (selectedTopic: string) => {
    if (!profile) return;
    setLoading(true);
    resetStoryState();
    
    try {
      setLoadingPhase(useAI ? "A IA está escrevendo..." : "Buscando o livro...");
      
      const storyData = await generateStoryText(selectedTopic, profile);
      setStory(storyData);
      
      if (useAI && aiActiveGlobal && isOnline) {
          setLoadingPhase("Pintando o desenho...");
          // Em modo online com IA, gera imagem
          const img = await generateStoryImage(storyData.content, profile);
          setImageUrl(img);
      } else {
          // Em modo Offline ou sem IA, pega a imagem de fallback diretamente
          // O service retorna URL da imagem de fallback se não tiver chave
          const img = await generateStoryImage(selectedTopic, profile);
          setImageUrl(img);
      }
    } catch (e) {
      console.error(e);
      alert("Ops! Não consegui ler a história agora.");
    } finally {
      setLoading(false);
    }
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

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {!story && !loading && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 space-y-6">
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-700">
               <button onClick={() => handleModeSwitch(false)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${!useAI ? 'bg-slate-700' : 'text-slate-400'}`}>Livro Nativo</button>
               <button onClick={() => handleModeSwitch(true)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${useAI ? 'bg-indigo-600' : 'text-slate-400'}`}>IA Mágica {aiActiveGlobal && '✓'}</button>
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
            <p className="text-2xl font-bold animate-pulse text-yellow-200">{loadingPhase}</p>
          </div>
        )}

        {story && (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-3xl font-black text-yellow-400 text-center">{story.title}</h2>
            
            <div className="aspect-square w-full bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-700 shadow-2xl">
               {imageUrl ? <img src={imageUrl} alt="Story" className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <Sparkles className="text-slate-600" size={48} />
                  </div>
               )}
            </div>

            <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 text-slate-300 leading-relaxed text-lg">
              {story.content.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              <div className="mt-6 p-4 bg-slate-900 rounded-2xl text-yellow-100 font-bold italic text-center border border-slate-700">
                  ✨ Moral: {story.moral}
              </div>
            </div>
            
            <button onClick={resetStoryState} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all">
                Ler Outra História
            </button>
          </div>
        )}
      </div>

      {showPremiumGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-slate-900 border border-indigo-500/50 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl">
              <Sparkles size={48} className="text-yellow-400 mx-auto mb-6 animate-pulse" />
              <h2 className="text-2xl font-black text-white mb-2">Ativar IA Mágica?</h2>
              
              <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                 Conecte sua conta para criar histórias infinitas e desenhos mágicos para <strong>{profile?.name}</strong>.
              </p>

              <div className="space-y-3">
                  <button 
                    onClick={activateAI} 
                    disabled={isConnecting} 
                    className="w-full py-4 bg-white text-indigo-900 font-black text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
                  >
                     {isConnecting ? <Loader2 className="animate-spin text-indigo-900" /> : <Key size={20} />}
                     CONECTAR
                  </button>
                  <button onClick={() => setShowPremiumGate(false)} disabled={isConnecting} className="w-full py-3 text-slate-500 font-bold text-sm">
                      Agora não
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StoryTime;
