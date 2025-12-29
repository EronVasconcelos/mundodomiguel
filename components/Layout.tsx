import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  color?: string;
}

// Default Avatar
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2JhZTZmZCIvPjxwYXRoIGQ9Ik01MCAxNDAgUTEwMCAyMDAgMTUwIDE0MCBWMTAwIEg1MCBaIiBmaWxsPSIjZmZlZGQ1Ii8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iOTAiIHI9IjUwIiBmaWxsPSIjZmZlZGQ1Ii8+PHBhdGggZD0iTTQ1IDgwIFExMDAgMjAgMTU1IDgwIEwxNjAgNzAgUTEwMCAwIDQwIDcwIFoiIGZpbGw9IiMwMzY5YTEiLz48Y2lyY2xlIGN4PSI4NSIgY3k9IjkwIiByPSI2IiBmaWxsPSIjMWUyOTNiIi8+PGNpcmNsZSBjeD0iMTE1IiBjeT0iOTAiIHI9IjYiIGZpbGw9IiMxZTI5M2IiLz48cGF0aCBkPSJNODUgMTEwIFExMDAgMTIwIDExNSAxMTAiIHN0cm9rZT0iIzFlMjkzYiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=";

export const Layout: React.FC<LayoutProps> = ({ children, title, color = "text-slate-700" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [avatar, setAvatar] = useState(() => localStorage.getItem('miguel_profile_pic') || DEFAULT_AVATAR);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        setAvatar(result);
        localStorage.setItem('miguel_profile_pic', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="h-full flex flex-col font-sans relative bg-slate-50 text-slate-800 overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        // Dot pattern background
        backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* --- HEADER --- */}
      <div className="px-4 pt-4 pb-2 z-20">
        <header className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm border-2 border-slate-100 p-2 flex items-center justify-between">
          
          {/* Left: Avatar or Back Button */}
          <div className="flex items-center gap-3">
            {isHome ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="relative group"
              >
                <div className="w-12 h-12 rounded-full bg-sky-100 border-2 border-white shadow-sm overflow-hidden group-active:scale-95 transition-transform">
                   <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                />
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
                   <span className="text-lg font-black text-slate-800 leading-tight">Mundo do Miguel</span>
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
                <button className="w-10 h-10 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-300">
                   <Settings size={18} />
                </button>
             )}
          </div>

        </header>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative flex flex-col z-10 scrollbar-hide">
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
};