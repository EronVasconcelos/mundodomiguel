import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  color?: string; // Optional now, we use a cleaner UI style
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div 
      className="h-full flex flex-col font-sans relative bg-sky-50 text-slate-800"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Modern Minimal Header */}
      <div className="px-4 pt-2 pb-2 z-20">
        <header className="flex items-center justify-between py-2">
          {!isHome ? (
            <button 
              onClick={() => navigate('/')}
              className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-sky-600 active:scale-95 transition-transform border border-sky-100"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={3} />
            </button>
          ) : (
            <div className="w-12" />
          )}
          
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide text-center flex-1 mx-2 text-slate-700 truncate">
            {title}
          </h1>

          <button 
            onClick={() => navigate('/')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${isHome ? 'opacity-0 pointer-events-none' : 'bg-white shadow-sm text-sky-600 border border-sky-100'}`}
          >
            <Home className="w-6 h-6" strokeWidth={3} />
          </button>
        </header>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative flex flex-col z-10">
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Footer Observation */}
      <footer className="p-4 text-center z-10">
        <p className="text-xs text-slate-400 font-bold opacity-80">
          Desenvolvido pelo pai Eron Vasconcelos de coração ❤️
        </p>
      </footer>
    </div>
  );
};