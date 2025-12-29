import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Plus, Check } from 'lucide-react';
import { ChildProfile, AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  color?: string;
}

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2JhZTZmZCIvPjxwYXRoIGQ9Ik01MCAxNDAgUTEwMCAyMDAgMTUwIDE0MCBWMTAwIEg1MCBaIiBmaWxsPSIjZmZlZGQ1Ii8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iOTAiIHI9IjUwIiBmaWxsPSIjZmZlZGQ1Ii8+PHBhdGggZD0iTTQ1IDgwIFExMDAgMjAgMTU1IDgwIEwxNjAgNzAgUTEwMCAwIDQwIDcwIFoiIGZpbGw9IiMwMzY5YTEiLz48Y2lyY2xlIGN4PSI4NSIgY3k9IjkwIiByPSI2IiBmaWxsPSIjMWUyOTNiIiLz48Y2lyY2xlIGN4PSI4NSIgY3k9IjkwIiByPSI2IiBmaWxsPSIjMWUyOTNiIiLz48cGF0aCBkPSJNODUgMTEwIFExMDAgMTIwIDExNSAxMTAiIHN0cm9rZT0iIzFlMjkzYiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=";

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
    
    // Force reload of current view data if needed, or just let React state handle it
    // For specific pages like Story/Faith, they use useEffect on mount.
    // Ideally we'd use a context, but a simple reload works for this scope.
    if (!isHome) {
        window.location.reload(); 
    } else {
        // Just reload profiles to be safe
        loadProfiles();
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
                <div className="w-12 h-12 rounded-full bg-sky-100 border-2 border-white shadow-sm overflow-hidden group-active:scale-95 transition-transform">
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