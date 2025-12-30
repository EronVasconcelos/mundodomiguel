
import React, { useState, useEffect } from 'react';
import { generateStoryText, generateStoryImage } from '../services/geminiService';
import { Sparkles, Loader2, BookOpen, Moon, WifiOff, Key, ExternalLink, AlertCircle } from 'lucide-react';
import { StoryData, ChildProfile } from '../types';

const StoryTime: React.FC = () => {
  const [topic, setTopic] = useState("Aventura Espacial");
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
  
  const hasAIStudio = typeof window !== 'undefined' && (window as any).aistudio;

  useEffect(() => {
    const stored = localStorage.getItem('child_profile');
    if (stored) setProfile(JSON.parse(stored));

    const checkInitialAuth = async () => {
        const globalStatus = localStorage.getItem('ai_active_global') === 'true';
        setAiActiveGlobal(globalStatus);
        
        if (globalStatus) {
            setUseAI(true);
        } else {
            const decision = localStorage.getItem('ai_enabled_decision');
            if (decision === null) {
                setShowPremiumGate(true);
            }
        }
    };

    checkInitialAuth();

    const handleAuthReset = () => {
        setAiActiveGlobal(false);
        setUseAI(false);
        setShowPremiumGate(true);
        setIsConnecting(false);
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
      localStorage.setItem('ai_enabled_decision', 'true');
      setAiActiveGlobal(true);
      setUseAI(true);
      
      setTimeout(() => {
         setShowPremiumGate(false);
         setIsConnecting(false);
      }, 1500);
  };

  const declineAI = () => {
      localStorage.setItem('ai_enabled_decision', 'false');
      localStorage.setItem('ai_active_global', 'false');
      setUseAI(false);
      setShowPremiumGate(false);
  };

  const handleCreateStory = async (selectedTopic: string) => {
    if (!profile) return;
    setLoading(true);
    resetStoryState();
    
    try {
      if (!isOnline && useAI) {
        alert("A mágica precisa de internet!");
        setUseAI(false);
        setLoading(false);
        return;
      }
      
      setLoadingPhase("A IA está escrevendo...");
      const storyData = await generateStoryText(selectedTopic, profile);
      setStory(storyData);
      
      setLoadingPhase("Pintando o desenho...");
      const img = await generateStoryImage(storyData.content, profile);
      setImageUrl(img);
    } catch (e) {
      alert("Ops! Verifique sua conexão ou conta Google.");
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
               <button onClick={() => handleModeSwitch(false)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${!useAI ? 'bg-slate-700' : 'text-slate-400'}`}>Livro</button>
               <button onClick={() => handleModeSwitch(true)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${useAI ? 'bg-indigo-600' : 'text-slate-400'}`}>IA Mágica</button>
            </div>
            <h2 className="text-2xl font-black text-center">O que vamos imaginar?</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {["Espaço", "Dragões", "Dinos", "Robôs", "LEGO", "Castelo"].map(t => (
                <button key={t} onClick={() => handleCreateStory(t)} className="px-4 py-3 rounded-2xl bg-slate-700 text-slate-200 font-bold text-sm">{t}</button>
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
            <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 text-slate-300 leading-relaxed">
              {story.content.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              <div className="mt-6 p-4 bg-slate-900 rounded-2xl text-yellow-100 font-bold italic">Moral: {story.moral}</div>
            </div>
            <div className="aspect-square w-full bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-700">
               {imageUrl && <img src={imageUrl} alt="Story" className="w-full h-full object-cover" />}
            </div>
            <button onClick={resetStoryState} className="w-full bg-slate-800 py-4 rounded-2xl font-bold text-slate-400">Outra história</button>
          </div>
        )}
      </div>

      {showPremiumGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-slate-900 border border-indigo-500/50 p-6 rounded-[2.5rem] max-w-md w-full text-center">
              <Sparkles size={40} className="text-indigo-400 mx-auto mb-6 animate-spin-slow" />
              <h2 className="text-2xl font-black text-white mb-2">Modo IA Mágica</h2>
              
              <div className="bg-indigo-950 border border-indigo-800 p-3 rounded-xl flex gap-2 text-left mb-6">
                 <AlertCircle className="text-indigo-400 flex-shrink-0" size={18} />
                 <p className="text-xs text-indigo-200 font-medium">
                    A janela de seleção do Google aparecerá em seguida. Certifique-se de escolher um projeto com faturamento ativo.
                 </p>
              </div>

              <div className="space-y-4 text-slate-300 text-sm mb-8">
                 <p>Crie histórias únicas e personalizadas conectando sua conta Google.</p>
                 <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-indigo-400 font-bold hover:underline"
                 >
                    Ver documentação de faturamento <ExternalLink size={14} />
                 </a>
              </div>
              <div className="space-y-3">
                  <button 
                    onClick={activateAI} 
                    disabled={isConnecting} 
                    className="w-full py-4 bg-white text-indigo-900 font-black text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
                  >
                     {isConnecting ? <Loader2 className="animate-spin text-indigo-900" /> : <Key size={20} />}
                     CONECTAR AGORA
                  </button>
                  <button onClick={declineAI} disabled={isConnecting} className="w-full py-3 text-slate-500 font-bold text-sm">Usar modo limitado</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StoryTime;
