
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStoryText, generateStoryImage, STATIC_STORIES, isAIAvailable } from '../services/geminiService';
import { Sparkles, Loader2, BookOpen, Moon, WifiOff, Download, Gift, Pencil, Wand2, Book, ArrowLeft, RefreshCcw } from 'lucide-react';
import { StoryData, ChildProfile } from '../types';

const StoryTime: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'kids' | 'ai'>('kids');
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false); 
  const [imageLoading, setImageLoading] = useState(false);
  const [story, setStory] = useState<StoryData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showImageReveal, setShowImageReveal] = useState(false); 
  
  const IMAGINATION_TOPICS = [
    "Patrulha Canina", "Mickey e Minnie", "Princesas", "Homem Aranha",
    "Frozen", "Dinossauros", "Unicórnios", "Espaço"
  ];

  useEffect(() => {
    const stored = localStorage.getItem('child_profile');
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  const resetStoryState = () => {
    setStory(null);
    setImageUrl(null);
    setShowImageReveal(false);
    setImageLoading(false);
    setLoading(false);
  };

  const handleCreateAIStory = async (topic: string) => {
    if (!profile || !topic.trim()) return;

    setLoading(true);
    setStory(null);
    setImageUrl(null);
    
    try {
      console.log("Iniciando geração mágica para o tema:", topic);
      const storyData = await generateStoryText(topic, profile);
      setStory(storyData);
      setLoading(false);

      // Gera imagem em background
      setImageLoading(true);
      const img = await generateStoryImage(storyData.content, profile);
      setImageUrl(img);
      setImageLoading(false);
    } catch (e) {
      console.error("Erro na criação da história:", e);
      alert("Ops! A mágica falhou um pouquinho. Tente de novo!");
      setLoading(false);
      setImageLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans relative bg-[#0f172a] text-white">
       <div className="px-4 pt-6 pb-2">
         <header className="bg-slate-800/50 backdrop-blur-md rounded-3xl px-4 py-3 flex items-center justify-between border border-slate-700">
            <button onClick={() => story ? resetStoryState() : navigate(-1)} className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 active:scale-95 transition-transform">
               <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <h1 className="text-xl font-black uppercase text-yellow-400">Hora da História</h1>
            <div className="w-10 flex items-center justify-center">
              <Moon className="text-yellow-200 fill-yellow-200" />
            </div>
         </header>
       </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {!story && !loading && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
                <button onClick={() => setActiveTab('kids')} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'kids' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>
                    <Book size={18} /> Livros
                </button>
                <button onClick={() => setActiveTab('ai')} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-400'}`}>
                    <Wand2 size={18} /> IA Mágica
                </button>
            </div>

            {activeTab === 'kids' ? (
               <div className="grid gap-3">
                 {STATIC_STORIES.map((s, i) => (
                    <button key={i} onClick={() => setStory(s)} className="w-full bg-slate-800 p-5 rounded-2xl text-left border-l-4 border-indigo-500">
                       <span className="block font-black text-lg text-slate-200">{s.title}</span>
                       <span className="text-xs text-slate-500 font-bold uppercase">Ler clássico</span>
                    </button>
                 ))}
               </div>
            ) : (
               <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700">
                  <h2 className="text-xl font-black text-center mb-4 text-fuchsia-300">O que vamos criar?</h2>
                  <div className="flex gap-2 mb-6">
                     <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="Ex: Um robô no espaço" className="flex-1 bg-slate-900 border border-slate-600 rounded-2xl px-4 py-3 text-white outline-none focus:border-fuchsia-500" />
                     <button onClick={() => handleCreateAIStory(customTopic)} disabled={!customTopic.trim()} className="bg-fuchsia-600 p-3 rounded-2xl"><Pencil /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     {IMAGINATION_TOPICS.map(t => (
                        <button key={t} onClick={() => handleCreateAIStory(t)} className="p-3 rounded-xl bg-slate-700 text-slate-200 font-bold text-sm text-left">{t}</button>
                     ))}
                  </div>
               </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 animate-spin text-fuchsia-400 mb-4" />
            <p className="text-xl font-black text-center text-yellow-200 animate-pulse">A mágica está<br/>acontecendo...</p>
          </div>
        )}

        {story && (
          <div className="animate-slide-up space-y-6">
            <h2 className="text-3xl font-black text-yellow-400 text-center leading-tight">{story.title}</h2>
            <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 text-slate-200 text-lg leading-relaxed shadow-xl">
              {story.content}
            </div>
            <div className="p-4 bg-indigo-900/30 rounded-2xl text-yellow-100 font-bold italic text-center">
                ✨ Moral: {story.moral}
            </div>
            
            {!showImageReveal ? (
                <button onClick={() => setShowImageReveal(true)} className="w-full py-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2rem] shadow-xl animate-pulse flex flex-col items-center justify-center gap-3 border-4 border-white/20">
                    <Gift size={48} className="text-white" />
                    <span className="text-xl font-black text-white uppercase">Ver Ilustração Mágica</span>
                </button>
            ) : (
                <div className="aspect-square w-full bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-indigo-500 shadow-2xl flex items-center justify-center">
                    {imageLoading ? (
                        <div className="flex flex-col items-center gap-2">
                           <Loader2 className="animate-spin text-fuchsia-400" />
                           <span className="text-xs font-bold text-slate-500">Pintando desenho...</span>
                        </div>
                    ) : imageUrl ? (
                        <img src={imageUrl} alt="Ilustração" className="w-full h-full object-cover animate-pop" />
                    ) : (
                        <span className="text-slate-500 text-sm">Não consegui pintar a imagem :(</span>
                    )}
                </div>
            )}
            <button onClick={resetStoryState} className="w-full py-4 bg-slate-700 text-slate-300 rounded-2xl font-bold">Voltar para a Biblioteca</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryTime;
