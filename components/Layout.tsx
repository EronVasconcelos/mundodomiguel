
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Check, Target, LogOut, Camera, Loader2, 
  Trash2, UserX, Menu, Download, X, RefreshCw, Settings, Key 
} from 'lucide-react';
import { ChildProfile, AppRoute } from '../types';
import { supabase } from '../services/supabase';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  color?: string;
  missionTarget?: { current: number; target: number | boolean; label?: string };
}

// Generic Gender-Neutral Avatar
const DEFAULT_AVATAR = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e2e8f0"/><circle cx="100" cy="85" r="45" fill="%2394a3b8"/><path d="M100 145 C60 145 30 180 30 200 L170 200 C170 180 140 145 100 145 Z" fill="%2394a3b8"/><circle cx="85" cy="80" r="5" fill="white"/><circle cx="115" cy="80" r="5" fill="white"/><path d="M90 100 Q100 110 110 100" stroke="white" stroke-width="3" fill="none"/></svg>`;

export const Layout: React.FC<LayoutProps> = ({ children, title, color = "text-slate-700", missionTarget }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  
  // Drawer & Installation State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Pull to Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const [pullDist, setPullDist] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const PULL_THRESHOLD = 80;

  useEffect(() => {
    loadProfiles();

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
    
    // Background fetch sync
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

            if (list.length === 0 && !location.pathname.includes(AppRoute.PROFILE)) {
                 setActiveProfile(null);
                 localStorage.removeItem('active_profile_id');
                 localStorage.removeItem('child_profile');
                 if (location.pathname !== AppRoute.WELCOME && location.pathname !== AppRoute.LOGIN) {
                    navigate(AppRoute.PROFILE);
                 }
                 return;
            }
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

  // --- ACTIONS ---

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };

  const handleSwitchProfile = (profile: ChildProfile) => {
    setActiveProfile(profile);
    localStorage.setItem('active_profile_id', profile.id);
    localStorage.setItem('child_profile', JSON.stringify(profile));
    setIsMenuOpen(false);
    window.location.reload(); 
  };

  const handleDeleteProfile = async (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation(); 
    if (!window.confirm("Apagar este perfil e todo o progresso?")) return;

    try {
        const { error } = await supabase.from('child_profiles').delete().eq('id', idToDelete);
        if (error) throw error;

        const updatedList = profiles.filter(p => p.id !== idToDelete);
        setProfiles(updatedList);
        localStorage.setItem('child_profiles', JSON.stringify(updatedList));

        if (activeProfile?.id === idToDelete) {
            if (updatedList.length > 0) {
                handleSwitchProfile(updatedList[0]);
            } else {
                localStorage.removeItem('active_profile_id');
                localStorage.removeItem('child_profile');
                setActiveProfile(null);
                navigate(AppRoute.PROFILE);
            }
        }
    } catch (err) {
        alert("Erro ao apagar. Verifique conexão.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("ATENÇÃO: Isso excluirá sua conta e todos os perfis. Não há volta.")) return;
    const confirmText = prompt("Digite DELETAR para confirmar:");
    if (confirmText !== "DELETAR") return;

    setUploading(true);
    try {
        await supabase.rpc('delete_user_account');
        localStorage.clear();
        await supabase.auth.signOut();
        navigate(AppRoute.WELCOME);
    } catch (error: any) {
        alert("Erro ao excluir: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handleConfigureAPI = () => {
      const currentKey = localStorage.getItem('gemini_api_key') || '';
      const newKey = prompt("Insira sua chave de API do Gemini para ativar a IA:", currentKey);
      if (newKey !== null) {
          localStorage.setItem('gemini_api_key', newKey.trim());
          if (newKey.trim()) {
              alert("Chave salva! O app será recarregado.");
              window.location.reload();
          }
      }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activeProfile) return;
      if (file.size > 2 * 1024 * 1024) {
          alert("Foto muito grande.");
          return;
      }

      setUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          try {
              await supabase.from('child_profiles').update({ photo_url: base64 }).eq('id', activeProfile.id);
              const updatedProfile = { ...activeProfile, photoUrl: base64 };
              const updatedList = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
              setActiveProfile(updatedProfile);
              setProfiles(updatedList);
              localStorage.setItem('child_profiles', JSON.stringify(updatedList));
          } catch (err) {
              alert("Erro ao salvar foto.");
          } finally {
              setUploading(false);
          }
      };
      reader.readAsDataURL(file);
  };

  const getProfileImage = (p: ChildProfile | null) => p?.photoUrl || p?.avatarBase || DEFAULT_AVATAR;

  // --- PULL TO REFRESH LOGIC ---
  const handleTouchStart = (e: React.TouchEvent) => {
      if (contentRef.current?.scrollTop === 0) {
          pullStartY.current = e.touches[0].clientY;
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!pullStartY.current) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStartY.current;
      
      if (diff > 0 && contentRef.current?.scrollTop === 0) {
          // Prevent default only if purely pulling down at top
          if (diff < 200) e.preventDefault(); 
          setPullDist(Math.pow(diff, 0.8)); // Resistive scrolling
      }
  };

  const handleTouchEnd = () => {
      if (pullDist > PULL_THRESHOLD) {
          setIsRefreshing(true);
          setPullDist(PULL_THRESHOLD); // Snap to threshold
          setTimeout(() => {
              window.location.reload();
          }, 800);
      } else {
          setPullDist(0);
          pullStartY.current = 0;
      }
  };

  return (
    <div 
      className="h-full w-full flex flex-col font-sans relative bg-slate-50 text-slate-800 overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      {/* --- HEADER --- */}
      <div className="px-4 pt-4 pb-2 z-20 flex-shrink-0">
        <header className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm border-2 border-slate-100 p-2 pl-3 flex items-center justify-between relative">
          
          <div className="flex items-center gap-3">
             {/* LEFT: Menu Hamburger or Back Button */}
             {isHome ? (
                 <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 active:bg-slate-100 rounded-full transition-colors"
                 >
                    <Menu size={28} strokeWidth={2.5} />
                 </button>
             ) : (
                <button 
                    onClick={() => navigate('/')}
                    className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full active:scale-95"
                >
                    <ArrowLeft size={24} strokeWidth={3} />
                </button>
             )}

             {/* CENTER: Title / Name */}
             <div className="flex flex-col">
                {isHome ? (
                    <span className="text-lg font-black text-slate-800 leading-tight">
                        {activeProfile?.name || 'Mundo Miguel'}
                    </span>
                ) : (
                    <span className={`text-lg font-black leading-tight ${color}`}>{title}</span>
                )}
             </div>
          </div>

          {/* RIGHT: Context Buttons */}
          <div className="flex items-center gap-2">
             {isHome ? (
                <>
                   {installPrompt && (
                       <button 
                         onClick={handleInstallClick}
                         className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center animate-pulse"
                         title="Instalar Aplicativo"
                       >
                          <Download size={20} />
                       </button>
                   )}
                   <button 
                        onClick={() => navigate(AppRoute.PROFILE)} 
                        className="w-10 h-10 rounded-full bg-blue-500 text-white shadow-md shadow-blue-200 flex items-center justify-center active:scale-95 transition-transform"
                   >
                        <Plus size={24} strokeWidth={3} />
                   </button>
                </>
             ) : missionTarget && (
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                    <Target size={16} className="text-slate-400" />
                    <span className="text-sm font-black text-slate-600">
                        {typeof missionTarget.target === 'boolean' 
                           ? (missionTarget.current ? '1/1' : '0/1') 
                           : `${missionTarget.current}/${missionTarget.target}`
                        }
                    </span>
                </div>
             )}
          </div>
        </header>
      </div>

      {/* --- SIDE MENU DRAWER (HAMBURGER) --- */}
      {isMenuOpen && (
         <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsMenuOpen(false)} />
            
            {/* Drawer */}
            <div className="relative w-4/5 max-w-xs h-full bg-white shadow-2xl flex flex-col p-6 animate-slide-up" style={{ animationDirection: 'normal', animationName: 'slideRight' }}>
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black text-slate-800">Menu</h2>
                   <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
                </div>

                {/* Current Profile Card */}
                {activeProfile && (
                   <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 mb-6 flex flex-col items-center relative overflow-hidden">
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden mb-3">
                         <img src={getProfileImage(activeProfile)} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-black text-xl text-slate-800">{activeProfile.name}</h3>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm text-slate-400"
                      >
                         {uploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                      </button>
                   </div>
                )}

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Trocar Perfil</h3>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
                    {profiles.map(p => (
                       <button 
                         key={p.id}
                         onClick={() => handleSwitchProfile(p)}
                         className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${activeProfile?.id === p.id ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-slate-50'}`}
                       >
                          <img src={getProfileImage(p)} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                          <span className={`font-bold flex-1 text-left ${activeProfile?.id === p.id ? 'text-blue-600' : 'text-slate-600'}`}>{p.name}</span>
                          {activeProfile?.id !== p.id && (
                             <div onClick={(e) => handleDeleteProfile(e, p.id)} className="p-2 text-slate-300 hover:text-red-400"><Trash2 size={16}/></div>
                          )}
                       </button>
                    ))}
                    {profiles.length < 5 && (
                       <button onClick={() => { setIsMenuOpen(false); navigate(AppRoute.PROFILE); }} className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 font-bold flex items-center justify-center gap-2">
                          <Plus size={18} /> Adicionar
                       </button>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                   {/* Configurar API */}
                   <button onClick={handleConfigureAPI} className="w-full py-3 text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 rounded-xl border border-slate-100">
                      <Key size={18} /> Configurar IA
                   </button>

                   {installPrompt && (
                      <button onClick={handleInstallClick} className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold flex items-center justify-center gap-2">
                         <Download size={18} /> Instalar App
                      </button>
                   )}
                   <button onClick={async () => { await supabase.auth.signOut(); localStorage.clear(); navigate(AppRoute.WELCOME); }} className="w-full py-3 text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 rounded-xl">
                      <LogOut size={18} /> Sair
                   </button>
                   <button onClick={handleDeleteAccount} className="w-full py-2 text-xs text-red-400 font-bold flex items-center justify-center gap-1 hover:text-red-600">
                      <UserX size={14} /> Excluir Conta
                   </button>
                </div>
            </div>
         </div>
      )}

      {/* --- PULL TO REFRESH SPINNER --- */}
      <div 
        className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-0 transition-transform duration-200"
        style={{ transform: `translateY(${Math.min(pullDist, 100) - 40}px)` }}
      >
         <div className={`w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDist * 2}deg)` }}>
            {isRefreshing ? <Loader2 /> : <RefreshCw />}
         </div>
      </div>

      {/* Main Content Area */}
      <main 
         ref={contentRef}
         className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative flex flex-col z-10 scrollbar-hide"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
         style={{ 
             transform: `translateY(${pullDist}px)`, 
             transition: isRefreshing ? 'transform 0.3s' : 'none' 
         }}
      >
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes slideRight {
           from { transform: translateX(-100%); }
           to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
