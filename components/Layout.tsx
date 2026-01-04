
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Target, LogIn, LogOut, Camera, Loader2, 
  Trash2, UserX, Menu, Download, X, RefreshCw, Pencil, Rocket
} from 'lucide-react';
import { ChildProfile, AppRoute } from '../types';
import { supabase } from '../services/supabase';
import { isAIAvailable } from '../services/geminiService';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  color?: string;
  missionTarget?: { current: number; target: number | boolean; label?: string };
}

const DEFAULT_AVATAR = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f1f5f9"/><circle cx="100" cy="100" r="60" fill="%23cbd5e1"/><rect x="70" y="80" width="20" height="20" rx="5" fill="%23334155"/><rect x="110" y="80" width="20" height="20" rx="5" fill="%23334155"/><path d="M70 130 Q100 150 130 130" stroke="%23334155" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="100" cy="100" r="55" stroke="%2394a3b8" stroke-width="4" fill="none"/></svg>`;

export const Layout: React.FC<LayoutProps> = ({ children, title, color = "text-slate-700", missionTarget }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === AppRoute.HOME;
  
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [aiAvailable, setAiAvailable] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const [pullDist, setPullDist] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const PULL_THRESHOLD = 80;

  useEffect(() => {
    loadProfiles();
    setAiAvailable(isAIAvailable());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const loadProfiles = async () => {
    const storedList = localStorage.getItem('child_profiles');
    let list: ChildProfile[] = storedList ? JSON.parse(storedList) : [];
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        const { data } = await supabase.from('child_profiles').select('*');
        if (data) {
            const mappedProfiles: ChildProfile[] = data.map((p: any) => ({
                id: p.id,
                name: p.name,
                age: p.age,
                gender: p.gender,
                hairColor: p.hair_color,
                hairStyle: p.hair_style,
                eyeColor: p.eye_color,
                skinTone: p.skin_tone,
                avatarBase: p.avatar_base,
                photoUrl: p.photo_url
            }));
            list = mappedProfiles;
            setProfiles(list);
            localStorage.setItem('child_profiles', JSON.stringify(mappedProfiles));
        }
    }
    
    setProfiles(list);
    const activeId = localStorage.getItem('active_profile_id');
    const active = list.find(p => p.id === activeId) || list[0];
    if (active) {
        setActiveProfile(active);
        localStorage.setItem('child_profile', JSON.stringify(active));
    }
  };

  const handleSwitchProfile = (profile: ChildProfile) => {
    setActiveProfile(profile);
    localStorage.setItem('active_profile_id', profile.id);
    localStorage.setItem('child_profile', JSON.stringify(profile));
    setIsMenuOpen(false);
    window.location.reload(); 
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activeProfile) return;
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          try {
              await supabase.from('child_profiles').update({ photo_url: base64 }).eq('id', activeProfile.id);
              const updatedProfile = { ...activeProfile, photoUrl: base64 };
              setActiveProfile(updatedProfile);
              loadProfiles();
          } catch (err) {
              alert("Erro ao salvar foto.");
          } finally {
              setUploading(false);
          }
      };
      reader.readAsDataURL(file);
  };

  const getProfileImage = (p: ChildProfile | null) => p?.photoUrl || p?.avatarBase || DEFAULT_AVATAR;

  return (
    <div 
      className="h-full w-full flex flex-col font-sans relative bg-[#f8fafc] text-slate-800 overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      <div className="px-4 pt-4 pb-2 z-20 flex-shrink-0">
        <header className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-sm border border-slate-100 p-2 relative h-16 flex items-center justify-between">
          <div className="flex-shrink-0 z-10 w-12 pl-1">
             {isHome ? (
                 <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full active:scale-95">
                    <Menu size={24} strokeWidth={2.5} />
                 </button>
             ) : (
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full active:scale-95">
                    <ArrowLeft size={24} strokeWidth={3} />
                </button>
             )}
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 max-w-[60%] overflow-hidden">
                {isHome ? (
                    <>
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <Rocket size={16} className="text-white ml-0.5 mb-0.5" />
                        </div>
                        <span className="text-xl font-black text-slate-800 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            Mundo {activeProfile?.gender === 'girl' ? 'da' : 'do'} <span className={activeProfile?.gender === 'girl' ? 'text-pink-500' : 'text-blue-500'}>{activeProfile?.name}</span>
                        </span>
                    </>
                ) : (
                    <span className={`text-lg font-black leading-tight ${color}`}>{title}</span>
                )}
              </div>
          </div>

          <div className="flex-shrink-0 z-10 w-12 flex justify-end pr-1">
             <div className="w-10 h-10 rounded-full border-2 border-slate-100 overflow-hidden shadow-sm">
                 <img src={getProfileImage(activeProfile)} className="w-full h-full object-cover" />
             </div>
          </div>
        </header>
      </div>

      {isMenuOpen && (
         <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsMenuOpen(false)} />
            <div className="relative w-4/5 max-w-xs h-full bg-white shadow-2xl flex flex-col p-6 animate-slide-up" style={{ animationName: 'slideRight' }}>
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black text-slate-800">Menu</h2>
                   <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
                </div>

                {activeProfile && (
                   <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 mb-6 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden mb-3">
                         <img src={getProfileImage(activeProfile)} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-black text-xl text-slate-800 mb-3">{activeProfile.name}</h3>
                      <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-white border border-slate-200 rounded-xl text-slate-500 font-bold text-xs flex items-center justify-center gap-1 active:scale-95">
                         {uploading ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />} Trocar Foto
                      </button>
                   </div>
                )}

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Trocar Perfil</h3>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
                    {profiles.map(p => (
                       <button key={p.id} onClick={() => handleSwitchProfile(p)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${activeProfile?.id === p.id ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-slate-50'}`}>
                          <img src={getProfileImage(p)} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                          <span className={`font-bold flex-1 text-left ${activeProfile?.id === p.id ? 'text-blue-600' : 'text-slate-600'}`}>{p.name}</span>
                       </button>
                    ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                   <button onClick={async () => { await supabase.auth.signOut(); localStorage.clear(); navigate(AppRoute.WELCOME); }} className="w-full py-3 text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 rounded-xl">
                      <LogOut size={18} /> Sair
                   </button>
                </div>
            </div>
         </div>
      )}

      <main ref={contentRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative flex flex-col z-10 scrollbar-hide">
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
};
