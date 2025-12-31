
import React, { useState, useEffect, useRef } from 'react';
import { generateDevotionalContent, generateStoryImage, generateDevotionalAudio, isAIAvailable, getFallbackDevotionalImage } from '../services/geminiService';
import { DevotionalData, ChildProfile } from '../types';
import { Layout } from '../components/Layout';
import { Cloud, Sun, Volume2, BookOpen, Loader2, Sparkles, StopCircle, Trophy } from 'lucide-react';
import { completeFaith, getDailyProgress } from '../services/progressService';

const FaithCorner: React.FC = () => {
  const [data, setData] = useState<DevotionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  
  const [missionStats, setMissionStats] = useState({ current: 0, target: true });
  const [aiEnabled, setAiEnabled] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const endOfContentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('child_profile');
    if (storedProfile) setProfile(JSON.parse(storedProfile));

    const p = getDailyProgress();
    setMissionStats({ current: p.faithDone ? 1 : 0, target: true });
    
    // Check if AI is available at mount
    setAiEnabled(isAIAvailable());

    return () => {
        if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!data || missionStats.current === 1) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
            triggerCompletion();
            observerRef.current?.disconnect();
        }
    }, { threshold: 0.5 });

    if (endOfContentRef.current) {
        observerRef.current.observe(endOfContentRef.current);
    }
  }, [data, missionStats.current]);

  const triggerCompletion = () => {
      const p = getDailyProgress();
      if (!p.faithDone) {
          const reached = completeFaith();
          setMissionStats({ current: 1, target: true });
          if (reached) {
             setShowMissionComplete(true);
          }
      }
  };

  useEffect(() => {
    if (profile) {
        loadContent(profile);
    }
  }, [profile]);

  const loadContent = async (currentProfile: ChildProfile) => {
    setLoading(true);
    try {
        const content = await generateDevotionalContent(currentProfile);
        setData(content);
        setLoading(false);

        // Imagem Lógica:
        // Se AI está OFF ou não tem prompt -> Usa Estática Imediatamente
        if (!isAIAvailable() || !content.imagePrompt) {
            setImageUrl(getFallbackDevotionalImage());
            setImageLoading(false);
            return;
        }

        // Se AI está ON e tem prompt -> Tenta Cache ou Gera
        const savedImgKey = `faith_img_${content.date}_${currentProfile.name}`;
        const savedImg = localStorage.getItem(savedImgKey);
        
        if (savedImg) {
            setImageUrl(savedImg);
        } else {
            setImageLoading(true);
            const img = await generateStoryImage(content.imagePrompt, currentProfile);
            if (img) {
                setImageUrl(img);
                try { localStorage.setItem(savedImgKey, img); } catch(e) {}
            } else {
                // Se falhar a geração, usa fallback estático
                setImageUrl(getFallbackDevotionalImage());
            }
            setImageLoading(false);
        }
    } catch (e) {
        console.error("Erro ao carregar conteúdo", e);
        setLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch(e) {}
        audioSourceRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setIsSpeaking(false);
  };

  const speakDevotional = async () => {
    if (!data || !aiEnabled) return; // Segurança extra
    
    triggerCompletion();

    if (isSpeaking) {
        stopAudio();
        return;
    }

    const textToRead = `Devocional de hoje. Versículo: ${data.verse}. ${data.devotional}. Agora, uma história: ${data.storyTitle}. ${data.storyContent}. Vamos orar? ${data.prayer}`;

    setIsGeneratingAudio(true);
    try {
        const base64Audio = await generateDevotionalAudio(textToRead, profile?.gender || 'boy');
        if (base64Audio) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            audioContextRef.current = ctx;
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
            
            const dataInt16 = new Int16Array(bytes.buffer);
            const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.onended = () => { setIsSpeaking(false); setIsGeneratingAudio(false); };
            audioSourceRef.current = source;
            source.start();
            setIsSpeaking(true);
            setIsGeneratingAudio(false);
        } else {
            // Se AI retornar null (erro), não fazemos nada (sem voz robótica)
            setIsGeneratingAudio(false);
            alert("Áudio indisponível no momento.");
        }
    } catch (e) { 
        setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans bg-sky-50 text-slate-800 relative">
        <Layout title="Cantinho da Fé" color="text-sky-600" missionTarget={missionStats}>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="animate-spin text-sky-400 w-12 h-12" />
                    <p className="text-sky-400 font-bold animate-pulse">Buscando a palavra de hoje...</p>
                </div>
            ) : data ? (
                <div className="space-y-6 pb-12">
                    <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-[2.5rem] p-6 text-white shadow-lg relative overflow-hidden">
                        <Cloud className="absolute -top-4 -right-4 w-32 h-32 text-white/20" />
                        <Sun className="absolute top-4 left-4 w-12 h-12 text-yellow-300 animate-spin-slow" />
                        <div className="relative z-10 text-center mt-6">
                            <h2 className="text-sm font-bold opacity-90 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                Palavra do Dia
                            </h2>
                            <p className="text-2xl font-black italic mb-2">"{data.verse}"</p>
                            <p className="font-bold opacity-80">{data.reference}</p>
                        </div>
                    </div>

                    {/* SÓ MOSTRA O BOTÃO SE A IA ESTIVER HABILITADA */}
                    {aiEnabled && (
                        <button 
                            onClick={speakDevotional}
                            disabled={isGeneratingAudio}
                            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md ${isSpeaking ? 'bg-amber-400 text-amber-900 border-b-4 border-amber-600' : 'bg-white text-slate-600 border-b-4 border-slate-200'}`}
                        >
                            {isGeneratingAudio ? <Loader2 className="animate-spin" /> : isSpeaking ? <StopCircle className="animate-pulse" /> : <Volume2 />}
                            {isGeneratingAudio ? "Criando Áudio..." : isSpeaking ? "Parar Áudio" : "Ouvir Devocional"}
                        </button>
                    )}

                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative">
                        <div className="absolute -top-3 left-6 bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Para {profile?.name}</div>
                        <p className="text-lg leading-relaxed text-slate-600 font-medium">{data.devotional}</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 border-l-8 border-sky-300 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="text-sky-500" size={24} />
                            <h3 className="font-black text-xl text-slate-700">{data.storyTitle}</h3>
                        </div>
                        <div className="prose prose-slate text-slate-600 leading-relaxed">
                            {data.storyContent.split('\n').map((p, i) => <p key={i} className="mb-2">{p}</p>)}
                        </div>
                    </div>

                    <div className="relative aspect-square w-full bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-inner border-4 border-white">
                        {imageLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Sparkles className="animate-spin text-yellow-400 w-8 h-8" />
                                <span className="text-xs font-bold">Pintando...</span>
                            </div>
                        ) : imageUrl ? (
                            <img src={imageUrl} alt="História" className="w-full h-full object-cover animate-fade-in" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                <Cloud size={48} />
                            </div>
                        )}
                    </div>
                    
                    <div ref={endOfContentRef} className="h-10 w-full" />
                </div>
            ) : null}
        </Layout>

        {showMissionComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
               <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center animate-pop relative overflow-hidden shadow-2xl border-4 border-yellow-300">
                  <Trophy className="w-12 h-12 text-yellow-500 animate-bounce mb-4" />
                  <h2 className="text-2xl font-black text-slate-800 text-center mb-2">DEVOCIONAL LIDO!</h2>
                  <button onClick={() => setShowMissionComplete(false)} className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-xl">AMÉM!</button>
               </div>
            </div>
        )}
    </div>
  );
};

export default FaithCorner;
