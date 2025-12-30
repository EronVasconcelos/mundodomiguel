
import React, { useState, useEffect, useRef } from 'react';
import { generateDevotionalContent, generateStoryImage, generateDevotionalAudio } from '../services/geminiService';
import { DevotionalData, ChildProfile } from '../types';
import { Layout } from '../components/Layout';
import { Cloud, Sun, Volume2, BookOpen, Loader2, Sparkles, Heart, StopCircle, Key, Check, Zap, Trophy, ExternalLink } from 'lucide-react';
import { completeFaith, getDailyProgress } from '../services/progressService';

const FaithCorner: React.FC = () => {
  const [data, setData] = useState<DevotionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [aiActiveGlobal, setAiActiveGlobal] = useState(false);
  const [missionStats, setMissionStats] = useState({ current: 0, target: true });
  const [isConnecting, setIsConnecting] = useState(false);

  const hasAIStudio = typeof window !== 'undefined' && (window as any).aistudio;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('child_profile');
    if (storedProfile) setProfile(JSON.parse(storedProfile));

    const globalStatus = localStorage.getItem('ai_active_global') === 'true';
    setAiActiveGlobal(globalStatus);

    if (!globalStatus) {
        const decision = localStorage.getItem('ai_enabled_decision');
        if (decision === null) {
            setShowPremiumGate(true);
            setLoading(false);
        }
    }
    
    const reached = completeFaith();
    const p = getDailyProgress();
    setMissionStats({ current: p.faithDone ? 1 : 0, target: true });

    if (reached) {
      setTimeout(() => setShowMissionComplete(true), 2000);
    }
  }, []);

  useEffect(() => {
    if (profile) {
        if (!showPremiumGate) {
            loadContent(profile);
        }
    }
    return () => stopAudio();
  }, [profile, showPremiumGate]);

  const loadContent = async (currentProfile: ChildProfile) => {
    setLoading(true);
    const content = await generateDevotionalContent(currentProfile);
    setData(content);
    setLoading(false);

    const savedImgKey = `faith_img_${content.date}_${currentProfile.name}`;
    const savedImg = localStorage.getItem(savedImgKey);
    
    if (savedImg) {
        setImageUrl(savedImg);
    } else if (content.imagePrompt) {
        if (aiActiveGlobal || localStorage.getItem('ai_enabled_decision') === 'true') {
            setImageLoading(true);
            const img = await generateStoryImage(content.imagePrompt, currentProfile);
            setImageUrl(img);
            localStorage.setItem(savedImgKey, img);
            setImageLoading(false);
        }
    }
  };

  const activateAI = async () => {
      setIsConnecting(true);
      try {
          // MANDATORY: Open Key Selection Dialog
          if (hasAIStudio) {
              await (window as any).aistudio.openSelectKey();
          }
          
          // CRITICAL: Assume success immediately to mitigate race condition
          localStorage.setItem('ai_active_global', 'true');
          localStorage.setItem('ai_enabled_decision', 'true');
          setAiActiveGlobal(true);
          
          setTimeout(() => {
             setShowPremiumGate(false); 
             setIsConnecting(false);
             if (profile) loadContent(profile); 
          }, 800);

      } catch (e) {
          console.error("Auth failed", e);
          setIsConnecting(false);
      }
  };

  const declineAI = () => {
      localStorage.setItem('ai_enabled_decision', 'false');
      setShowPremiumGate(false);
      if (profile) loadContent(profile);
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
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakDevotional = async () => {
    if (!data) return;
    if (isSpeaking) {
        stopAudio();
        return;
    }
    const textToRead = `Devocional de hoje. Versículo: ${data.verse}. ${data.devotional}. Agora, uma história: ${data.storyTitle}. ${data.storyContent}. Vamos orar? ${data.prayer}`;

    if (aiActiveGlobal) {
        setIsGeneratingAudio(true);
        try {
            const base64Audio = await generateDevotionalAudio(textToRead);
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
                return;
            }
        } catch (e) { console.warn(e); }
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-BR';
    utterance.onend = () => { setIsSpeaking(false); setIsGeneratingAudio(false); };
    setIsSpeaking(true);
    setIsGeneratingAudio(false);
    window.speechSynthesis.speak(utterance);
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
                                {aiActiveGlobal && <Check size={14} className="text-green-300 bg-white/20 rounded-full p-0.5"/>}
                            </h2>
                            <p className="text-2xl font-black italic mb-2">"{data.verse}"</p>
                            <p className="font-bold opacity-80">{data.reference}</p>
                        </div>
                    </div>

                    <button 
                        onClick={speakDevotional}
                        disabled={isGeneratingAudio}
                        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md ${isSpeaking ? 'bg-amber-400 text-amber-900 border-b-4 border-amber-600' : 'bg-white text-slate-600 border-b-4 border-slate-200'}`}
                    >
                        {isGeneratingAudio ? <Loader2 className="animate-spin" /> : isSpeaking ? <StopCircle className="animate-pulse" /> : <Volume2 />}
                        {isGeneratingAudio ? "Preparando Voz..." : isSpeaking ? "Parar Áudio" : "Ouvir Devocional"}
                    </button>

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
                                <span className="text-xs font-bold">Pintando a história...</span>
                            </div>
                        ) : imageUrl ? (
                            <img src={imageUrl} alt="História" className="w-full h-full object-cover animate-fade-in" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                <Cloud size={48} />
                            </div>
                        )}
                    </div>
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

      {showPremiumGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white p-6 rounded-[2.5rem] max-w-md w-full relative shadow-2xl text-center">
              <Sparkles size={40} className="text-sky-500 mx-auto mb-6 animate-spin-slow" />
              <h2 className="text-2xl font-black text-slate-800 mb-2">Ativar IA Mágica?</h2>
              <div className="space-y-4 text-slate-500 text-sm leading-relaxed mb-6">
                 <p>Conecte sua conta Google para gerar conteúdo único para <strong>{profile?.name}</strong>.</p>
                 <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-blue-500 font-bold hover:underline"
                 >
                    Ver documentação de faturamento <ExternalLink size={14} />
                 </a>
                 <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-xs border border-yellow-100">
                    <strong>Nota:</strong> É necessário selecionar um projeto do Google Cloud com faturamento ativado.
                 </div>
              </div>
              <div className="space-y-3">
                  <button onClick={activateAI} disabled={isConnecting} className="w-full py-4 bg-sky-500 text-white font-black text-lg rounded-xl flex items-center justify-center gap-2">
                     {isConnecting ? <Loader2 className="animate-spin" /> : <Key size={20} />}
                     CONECTAR GOOGLE
                  </button>
                  <button onClick={declineAI} disabled={isConnecting} className="w-full py-3 text-slate-400 font-bold text-sm">Usar modo simples</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FaithCorner;
