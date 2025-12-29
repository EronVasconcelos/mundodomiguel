import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Plus, Check } from 'lucide-react';
import { ChildProfile, AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  color?: string;
}

// Generic Gender-Neutral Avatar
const DEFAULT_AVATAR = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e2e8f0"/><circle cx="100" cy="85" r="45" fill="%2394a3b8"/><path d="M100 145 C60 145 30 180 30 200 L170 200 C170 180 140 145 100 145 Z" fill="%2394a3b8"/><circle cx="85" cy="80" r="5" fill="white"/><circle cx="115" cy="80" r="5" fill="white"/><path d="M90 100 Q100 110 110 100" stroke="white" stroke-width="3" fill="none"/></svg>`;

export const Layout: React.FC<LayoutProps> = ({ children, title, color = "text-slate-700" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    // 1. Get List
    const storedList = localStorage.getItem('child_profiles');
    let list: ChildProfile[] = storedList ? JSON.parse(storedList) : [];
    
    // 2. Fallback to legacy single profile if list is empty
    if (list.length === 0) {
        const legacy = localStorage.getItem('child_profile');
        if (legacy) {
            const parsed = JSON.parse(legacy);
            // Ensure ID exists
            if (!parsed.id) parsed.id = 'legacy_user';
            list = [parsed];
            localStorage.setItem('child_profiles', JSON.stringify(list));
        }
    }
    setProfiles(list);

    // 3. Get Active Profile
    const activeId = localStorage.getItem('active_profile_id');
    const active = list.find(p => p.id === activeId) || list[0];
    
    if (active) {
        setActiveProfile(active);
        // Sync legacy key for components that might strictly depend on it (backward compat)
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
        window.location.reload(); // Reload home to update progress tracking for new user
    }
  };

  const handleAddProfile = () => {
    if (profiles.length >= 5) {
        alert("Máximo de 5 perfis atingido.");
        return;
    }
    navigate(AppRoute.PROFILE);
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
      {/* --- HEADER --- */}
      <div className="px-4 pt-4 pb-2 z-20">
        <header className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm border-2 border-slate-100 p-2 flex items-center justify-between relative">
          
          {/* Left: Avatar (Switcher) or Back Button */}
          <div className="flex items-center gap-3">
            {isHome ? (
              <button 
                onClick={() => setShowProfileSwitcher(true)}
                className="relative group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden group-active:scale-95 transition-transform">
                   <img src={activeProfile?.avatarBase || DEFAULT_AVATAR} alt="Profile" className="w-full h-full object-cover" />
                </div>
                {/* Badge if multiple profiles */}
                {profiles.length > 1 && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-slate-200">
                        <Users size={10} className="text-slate-500"/>
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
                   <button onClick={() => setShowProfileSwitcher(true)} className="text-left">
                       <span className="text-lg font-black text-slate-800 leading-tight">Mundo d{activeProfile?.gender === 'girl' ? 'a' : 'o'} {activeProfile?.name || 'Miguel'}</span>
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

          {/* Right: Settings (Only on Home) */}
          <div className="flex items-center">
             {isHome && (
                <button onClick={() => setShowProfileSwitcher(true)} className="w-10 h-10 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-300">
                   <Settings size={18} />
                </button>
             )}
          </div>
        </header>
      </div>

      {/* --- PROFILE SWITCHER MODAL --- */}
      {showProfileSwitcher && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowProfileSwitcher(false)}>
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-slate-800">Quem vai brincar?</h3>
                    <p className="text-sm text-slate-400">Alternar perfil</p>
                </div>

                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                    {profiles.map(p => (
                        <button 
                            key={p.id}
                            onClick={() => handleSwitchProfile(p)}
                            className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all
                                ${activeProfile?.id === p.id 
                                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                                    : 'border-slate-100 hover:border-slate-200 bg-white'}
                            `}
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                <img src={p.avatarBase || DEFAULT_AVATAR} className="w-full h-full object-cover" alt={p.name} />
                            </div>
                            <div className="flex-1 text-left">
                                <span className={`block font-bold text-lg ${activeProfile?.id === p.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                    {p.name}
                                </span>
                                <span className="text-xs text-slate-400 font-bold">{p.age} anos</span>
                            </div>
                            {activeProfile?.id === p.id && <div className="text-blue-500"><Check /></div>}
                        </button>
                    ))}
                </div>

                {profiles.length < 5 && (
                    <button 
                        onClick={handleAddProfile}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                    >
                        <Plus size={20} /> Adicionar Criança
                    </button>
                )}
            </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative flex flex-col z-10 scrollbar-hide">
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
};