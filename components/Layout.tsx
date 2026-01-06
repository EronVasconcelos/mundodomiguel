
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, LogOut, Camera, Loader2, Menu, X, Rocket, 
  Pencil, Trash2, UserX, Plus
} from 'lucide-react';
import { ChildProfile, AppRoute } from '../types';
import { supabase } from '../services/supabase';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  color?: string;
}

const DEFAULT_AVATAR = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f1f5f9"/><circle cx="100" cy="100" r="60" fill="%23cbd5e1"/><rect x="70" y="80" width="20" height="20" rx="5" fill="%23334155"/><rect x="110" y="80" width="20" height="20" rx="5" fill="%23334155"/><path d="M70 130 Q100 150 130 130" stroke="%23334155" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="100" cy="100" r="55" stroke="%2394a3b8" stroke-width="4" fill="none"/></svg>`;

export const Layout: React.FC<LayoutProps> = ({ children, title, color = "text-slate-700" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === AppRoute.HOME;
  
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfiles();
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
              setActiveProfile({ ...activeProfile, photoUrl: base64 });
              loadProfiles();
          } catch (err) {
              alert("Erro ao salvar foto.");
          } finally {
              setUploading(false);
          }
      };
      reader.readAsDataURL(file);
  };

  const handleDeleteProfile = async () => {
      if (!activeProfile) return;
      const confirm = window.confirm(`Tem certeza que deseja excluir o perfil de ${activeProfile.name}? Isso apagará todo o progresso dele.`);
      if (!confirm) return;

      try {
          await supabase.from('child_profiles').delete().eq('id', activeProfile.id);
          const remaining = profiles.filter(p => p.id !== activeProfile.id);
          if (remaining.length > 0) {
              handleSwitchProfile(remaining[0]);
          } else {
              localStorage.clear();
              navigate(AppRoute.PROFILE);
          }
      } catch (err) {
          alert("Erro ao excluir perfil.");
      }
  };

  const handleDeleteAccount = async () => {
      const confirm = window.confirm("ATENÇÃO: Deseja realmente excluir sua conta e TODOS os perfis? Esta ação é permanente.");
      if (!confirm) return;

      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              await supabase.from('child_profiles').delete().eq('user_id', user.id);
              await supabase.auth.signOut();
              localStorage.clear();
              navigate(AppRoute.WELCOME);
          }
      } catch (err) {
          alert("Erro ao excluir conta.");
      }
  };

  const getProfileImage = (p: ChildProfile | null) => p?.photoUrl || p?.avatarBase || DEFAULT_AVATAR;

  return (
    <div className="h-full w-full flex flex-col font-sans relative bg-[#f8fafc] text-slate-800 overflow-hidden">
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
                 <img src={getProfileImage(activeProfile)} className="w-full h-full object-cover" alt="Profile" />
             </div>
          </div>
        </header>
      </div>

      {isMenuOpen && (
         <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <div className="relative w-[320px] h-full bg-[#f8fafc] shadow-2xl flex flex-col p-6 animate-slide-right overflow-y-auto scrollbar-hide">
                
                {/* Header do Menu */}
                <div className="flex justify-between items-center mb-8 px-2">
                   <h2 className="text-[28px] font-black text-[#1e293b]">Menu</h2>
                   <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-blue-50 text-blue-600 rounded-full active:scale-95 transition-transform">
                      <X size={24} strokeWidth={3} />
                   </button>
                </div>

                {/* Card do Perfil Ativo (Exatamente como na imagem) */}
                {activeProfile && (
                   <div className="bg-white rounded-[2.5rem] p-8 mb-8 flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100/50">
                      <div className="w-28 h-28 rounded-full border-4 border-slate-50 shadow-sm overflow-hidden mb-4 p-1 bg-white">
                         <div className="w-full h-full rounded-full overflow-hidden">
                            <img src={getProfileImage(activeProfile)} className="w-full h-full object-cover" alt="Active" />
                         </div>
                      </div>
                      <h3 className="font-black text-2xl text-[#1e293b] mb-6">{activeProfile.name}</h3>
                      
                      <div className="flex items-center gap-2 w-full">
                          <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                          >
                             {uploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />} Foto
                          </button>
                          <button 
                            onClick={() => navigate(AppRoute.PROFILE, { state: { profile: activeProfile } })} 
                            className="flex-1 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                          >
                             <Pencil size={16} /> Editar
                          </button>
                          <button 
                            onClick={handleDeleteProfile} 
                            className="flex-1 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                          >
                             <Trash2 size={16} /> Excluir
                          </button>
                      </div>
                   </div>
                )}

                {/* Seção Trocar Perfil */}
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-4 px-2">Trocar Perfil</h3>
                <div className="space-y-3 mb-8">
                    {profiles.map(p => (
                       <button 
                         key={p.id} 
                         onClick={() => handleSwitchProfile(p)} 
                         className={`w-full flex items-center gap-4 p-3 rounded-[1.5rem] border-2 transition-all ${activeProfile?.id === p.id ? 'bg-blue-50 border-blue-400' : 'bg-white border-transparent'}`}
                       >
                          <div className="w-12 h-12 rounded-full border-2 border-slate-100 overflow-hidden shadow-sm flex-shrink-0">
                            <img src={getProfileImage(p)} className="w-full h-full object-cover" alt="Thumb" />
                          </div>
                          <span className={`font-black text-lg ${activeProfile?.id === p.id ? 'text-blue-600' : 'text-slate-600'}`}>{p.name}</span>
                       </button>
                    ))}
                    
                    {/* Adicionar Novo (Tracejado como na imagem) */}
                    <button 
                      onClick={() => navigate(AppRoute.PROFILE)} 
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-[1.5rem] border-2 border-dashed border-slate-300 text-slate-400 font-bold text-lg active:scale-95 transition-all bg-transparent"
                    >
                        <Plus size={20} strokeWidth={3} /> Adicionar Novo
                    </button>
                </div>

                <div className="mt-auto pt-8 flex flex-col items-center gap-6">
                    <button 
                      onClick={async () => { await supabase.auth.signOut(); localStorage.clear(); navigate(AppRoute.WELCOME); }} 
                      className="flex items-center gap-3 text-slate-500 font-black text-xl active:scale-95 transition-transform"
                    >
                       <LogOut size={24} strokeWidth={3} /> Sair
                    </button>

                    <button 
                      onClick={handleDeleteAccount} 
                      className="flex items-center gap-2 text-red-500/70 font-bold text-xs uppercase tracking-widest hover:text-red-600 transition-colors"
                    >
                       <UserX size={14} /> Excluir Conta
                    </button>
                </div>
            </div>
         </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 relative scrollbar-hide">
        <div className="max-w-lg mx-auto w-full">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-right { animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};
