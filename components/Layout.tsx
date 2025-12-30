
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Target, LogOut, Camera, Loader2, Trash2, UserX, AlertTriangle } from 'lucide-react';
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
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  
  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    // Optimistic Load from LocalStorage first
    const storedList = localStorage.getItem('child_profiles');
    let list: ChildProfile[] = storedList ? JSON.parse(storedList) : [];
    
    // Background fetch from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        const { data } = await supabase.from('child_profiles').select('*');
        if (data && data.length > 0) {
            // Map DB snake_case to CamelCase
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
                photoUrl: p.photo_url // Load photo URL if exists
            }));
            
            list = mappedProfiles;
            // Update cache
            localStorage.setItem('child_profiles', JSON.stringify(mappedProfiles));
        }
    }
    
    setProfiles(list);

    // Get Active Profile
    const activeId = localStorage.getItem('active_profile_id');
    const active = list.find(p => p.id === activeId) || list[0];
    
    if (active) {
        setActiveProfile(active);
        // Sync legacy key
        localStorage.setItem('child_profile', JSON.stringify(active));
    }
  };

  const handleSwitchProfile = (profile: ChildProfile) => {
    setActiveProfile(profile);
    localStorage.setItem('active_profile_id', profile.id);
    localStorage.setItem('child_profile', JSON.stringify(profile));
    setShowProfileSwitcher(false);
    
    if (!isHome) {
        window.location.reload(); 
    } else {
        loadProfiles();
        window.location.reload(); 
    }
  };

  const handleDeleteProfile = async (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation(); 
    
    if (!window.confirm("Tem certeza que deseja apagar este perfil? Todo o progresso será perdido.")) {
        return;
    }

    try {
        // No need to manually delete daily_progress anymore due to CASCADE, 
        // but we keep the profile delete call.
        
        const { error } = await supabase.from('child_profiles').delete().eq('id', idToDelete);
        if (error) throw error;

        // Update local state
        const updatedList = profiles.filter(p => p.id !== idToDelete);
        setProfiles(updatedList);
        localStorage.setItem('child_profiles', JSON.stringify(updatedList));

        // Handle active profile deletion
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
        console.error("Error deleting profile:", err);
        alert("Erro ao apagar perfil. Verifique sua conexão.");
    }
  };

  // --- DELETE ACCOUNT FUNCTIONALITY ---
  const handleDeleteAccount = async () => {
    if (!window.confirm("ATENÇÃO: Isso excluirá sua conta de email e todos os perfis das crianças. Não há como desfazer.")) {
        return;
    }

    const confirmText = prompt("Para confirmar, digite: DELETAR");
    if (confirmText !== "DELETAR") return;

    setUploading(true);

    try {
        // Now calling the standard function, because DB handles cascades
        const { error } = await supabase.rpc('delete_user_account');
        
        if (error) {
            console.error("RPC Error:", error);
            if (error.message.includes('function not found')) {
                 throw new Error("Erro de configuração: Você rodou o novo SQL de Reset no Supabase?");
            }
            throw new Error(error.message);
        }

        // Success - Clear everything locally
        localStorage.clear();
        sessionStorage.clear();
        await supabase.auth.signOut();
        navigate(AppRoute.WELCOME);
        alert("Conta excluída com sucesso.");

    } catch (error: any) {
        console.error("Deletion failed:", error);
        alert("ERRO AO EXCLUIR: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handleAddProfile = () => {
    if (profiles.length >= 5) {
        alert("Máximo de 5 perfis atingido.");
        return;
    }
    navigate(AppRoute.PROFILE);
  };

  const handleLogout = async () => {
      if (window.confirm("Tem certeza que deseja sair da conta dos pais?")) {
          await supabase.auth.signOut();
          localStorage.clear();
          navigate(AppRoute.WELCOME);
      }
  };

  const handleAvatarClick = () => {
      if (isHome) {
          fileInputRef.current?.click();
      }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activeProfile) return;

      if (file.size > 2 * 1024 * 1024) {
          alert("A foto é muito grande! Tente uma menor.");
          return;
      }

      setUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          
          try {
              const { error } = await supabase
                  .from('child_profiles')
                  .update({ photo_url: base64 })
                  .eq('id', activeProfile.id);

              if (error) throw error;

              const updatedProfile = { ...activeProfile, photoUrl: base64 };
              const updatedList = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
              
              setActiveProfile(updatedProfile);
              setProfiles(updatedList);
              localStorage.setItem('child_profiles', JSON.stringify(updatedList));
              localStorage.setItem('child_profile', JSON.stringify(updatedProfile));

          } catch (err) {
              console.error("Failed to update avatar", err);
              alert("Erro ao atualizar foto. Tente novamente.");
          } finally {
              setUploading(false);
          }
      };
      reader.readAsDataURL(file);
  };

  const getProfileImage = (p: ChildProfile | null) => {
      if (!p) return DEFAULT_AVATAR;
      return p.photoUrl || p.avatarBase || DEFAULT_AVATAR;
  };

  return (
    <div 
      className="h-full flex flex-col font-sans relative bg-slate-50 text-slate-800 overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleAvatarUpload}
      />

      {/* --- HEADER --- */}
      <div className="px-4 pt-4 pb-2 z-20">
        <header className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm border-2 border-slate-100 p-2 flex items-center justify-between relative">
          
          <div className="flex items-center gap-3">
            {isHome ? (
              <button 
                onClick={handleAvatarClick}
                className="relative group active:scale-95 transition-transform"
                disabled={uploading}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                   {uploading ? (
                       <Loader2 className="animate-spin text-blue-500" />
                   ) : (
                       <img src={getProfileImage(activeProfile)} alt="Profile" className="w-full h-full object-cover" />
                   )}
                </div>
                {!uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={16} className="text-white"/>
                    </div>
                )}
              </button>
            ) : (
              <button 
                onClick={() => navigate('/')}
                className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors active:scale-95"
              >
                <ArrowLeft size={24} strokeWidth={3} />
              </button>
            )}

            <div className="flex flex-col">
               {isHome ? (
                 <>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Bem-vindo ao</span>
                   <button onClick={() => setShowProfileSwitcher(true)} className="text-left group">
                       <span className="text-lg font-black text-slate-800 leading-tight group-active:text-blue-500 transition-colors">
                           Mundo d{activeProfile?.gender === 'girl' ? 'a' : 'o'} {activeProfile?.name || 'Miguel'}
                       </span>
                   </button>
                 </>
               ) : (
                 <>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Voltar para Início</span>
                    <span className={`text-lg font-black leading-tight ${color}`}>{title}</span>
                 </>
               )}
            </div>
          </div>

          <div className="flex items-center gap-2">
             {isHome ? (
                <>
                    <button 
                        onClick={handleAddProfile} 
                        className="w-10 h-10 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-500 active:scale-95 transition-transform"
                        title="Adicionar Criança"
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="w-10 h-10 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center text-red-400 active:scale-95 transition-transform"
                        title="Sair"
                    >
                        <LogOut size={18} />
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

      {/* --- PROFILE SWITCHER MODAL --- */}
      {showProfileSwitcher && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowProfileSwitcher(false)}>
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-slate-800">Quem vai brincar?</h3>
                    <p className="text-sm text-slate-400">Alternar perfil</p>
                </div>

                <div className="space-y-3 mb-6">
                    {profiles.map(p => (
                        <div key={p.id} className="flex gap-2 w-full">
                            <button 
                                onClick={() => handleSwitchProfile(p)}
                                className={`flex-1 flex items-center gap-4 p-3 rounded-2xl border-2 transition-all
                                    ${activeProfile?.id === p.id 
                                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                                        : 'border-slate-100 hover:border-slate-200 bg-white'}
                                `}
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                    <img src={getProfileImage(p)} className="w-full h-full object-cover" alt={p.name} />
                                </div>
                                <div className="flex-1 text-left">
                                    <span className={`block font-bold text-lg ${activeProfile?.id === p.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                        {p.name}
                                    </span>
                                    <span className="text-xs text-slate-400 font-bold">{p.age} anos</span>
                                </div>
                                {activeProfile?.id === p.id && <div className="text-blue-500"><Check /></div>}
                            </button>
                            
                            <button 
                                onClick={(e) => handleDeleteProfile(e, p.id)}
                                className="w-14 bg-red-50 text-red-500 border-2 border-red-100 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
                                title="Apagar Perfil"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                {profiles.length < 5 && (
                    <button 
                        onClick={handleAddProfile}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-slate-600 transition-colors mb-6"
                    >
                        <Plus size={20} /> Adicionar Criança
                    </button>
                )}

                {/* DELETE ACCOUNT BUTTON - Re-added */}
                <div className="border-t border-slate-100 pt-6 mt-6">
                    <button 
                        onClick={handleDeleteAccount}
                        disabled={uploading}
                        className="w-full py-3 rounded-2xl bg-red-50 text-red-600 border border-red-100 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                    >
                        {uploading ? <Loader2 className="animate-spin" /> : <UserX size={18} />}
                        Excluir Minha Conta (Responsável)
                    </button>
                    <p className="text-[10px] text-red-300 text-center mt-2 px-4">
                        Isso apaga seu login e todos os perfis. Ação irreversível.
                    </p>
                </div>

            </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative flex flex-col z-10 scrollbar-hide">
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
};
