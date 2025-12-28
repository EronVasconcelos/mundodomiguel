import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Blocks, PenTool, BrainCircuit, BookOpen, Camera, User, Type, Palette } from 'lucide-react';
import { AppRoute } from '../types';

// Generic Boy Avatar (Blue cap, smiling) - Default placeholder
const DEFAULT_PROFILE_PIC = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2JhZTZmZCIvPjxwYXRoIGQ9Ik01MCAxNDAgUTEwMCAyMDAgMTUwIDE0MCBWMTAwIEg1MCBaIiBmaWxsPSIjZmZlZGQ1Ii8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iOTAiIHI9IjUwIiBmaWxsPSIjZmZlZGQ1Ii8+PHBhdGggZD0iTTQ1IDgwIFExMDAgMjAgMTU1IDgwIEwxNjAgNzAgUTEwMCAwIDQwIDcwIFoiIGZpbGw9IiMwMzY5YTEiLz48Y2lyY2xlIGN4PSI4NSIgY3k9IjkwIiByPSI2IiBmaWxsPSIjMWUyOTNiIi8+PGNpcmNsZSBjeD0iMTE1IiBjeT0iOTAiIHI9IjYiIGZpbGw9IiMxZTI5M2IiLz48cGF0aCBkPSJNODUgMTEwIFExMDAgMTIwIDExNSAxMTAiIHN0cm9rZT0iIzFlMjkzYiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with saved pic or default
  const [profilePic, setProfilePic] = useState<string>(() => {
    return localStorage.getItem('miguel_profile_pic') || DEFAULT_PROFILE_PIC;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePic(result);
        localStorage.setItem('miguel_profile_pic', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // UI Design: Light Backgrounds + Dark Text of same color family
  const modules = [
    {
      title: "CONTAR",
      icon: <Blocks className="w-8 h-8" strokeWidth={2.5} />,
      route: AppRoute.MATH,
      style: "bg-blue-100 text-blue-900 border-blue-200", // Light Blue bg, Dark Blue text
      iconColor: "text-blue-600"
    },
    {
      title: "COLORIR",
      icon: <Palette className="w-8 h-8" strokeWidth={2.5} />,
      route: AppRoute.COLORING,
      style: "bg-rose-100 text-rose-900 border-rose-200", // Light Red/Pink bg, Dark Red text
      iconColor: "text-rose-500"
    },
    {
      title: "LABIRINTO",
      icon: <BrainCircuit className="w-8 h-8" strokeWidth={2.5} />,
      route: AppRoute.CHALLENGE,
      style: "bg-emerald-100 text-emerald-900 border-emerald-200", // Light Green bg, Dark Green text
      iconColor: "text-emerald-600"
    },
    {
      title: "PALAVRAS",
      icon: <Type className="w-8 h-8" strokeWidth={2.5} />,
      route: AppRoute.WORDS,
      style: "bg-orange-100 text-orange-900 border-orange-200", // Light Orange bg, Dark Orange text
      iconColor: "text-orange-500"
    },
    {
      title: "LOUSA",
      icon: <PenTool className="w-8 h-8" strokeWidth={2.5} />,
      route: AppRoute.ART,
      style: "bg-amber-100 text-amber-900 border-amber-200", // Light Yellow bg, Dark Yellow text
      iconColor: "text-amber-600"
    },
    {
      title: "DORMIR",
      icon: <BookOpen className="w-8 h-8" strokeWidth={2.5} />,
      route: AppRoute.STORY,
      style: "bg-indigo-100 text-indigo-900 border-indigo-200", // Light Indigo bg, Dark Indigo text
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-sky-50">
      
      <div className="flex-1 flex flex-col p-6 z-10 pt-10 max-w-lg mx-auto w-full">
        
        {/* Header Area */}
        <div className="w-full flex items-center justify-between mb-10">
          <div className="flex flex-col">
             <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Olá, campeão!</span>
             <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
              Mundo do <br />
              <span className="text-sky-600">Miguel</span>
            </h1>
          </div>

          {/* Profile Picture */}
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden relative transition-all shadow-sm border-2 border-white ring-2 ring-sky-100"
            >
              <img src={profilePic} alt="Miguel" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Camera size={16} className="text-white" />
              </div>
            </button>
          </div>
        </div>

        {/* UI Grid System */}
        <div className="grid grid-cols-2 gap-5 flex-1 content-start pb-8">
          {modules.map((mod, index) => (
            <button
              key={mod.title}
              onClick={() => navigate(mod.route)}
              className={`
                relative overflow-hidden group
                ${mod.style} border
                rounded-3xl flex flex-col items-start justify-between p-5 h-36
                transition-transform active:scale-95 duration-200
                shadow-sm hover:shadow-md
              `}
              style={{ animationDelay: `${index * 50}ms` }} // Staggered animation
            >
              {/* Icon Container */}
              <div className={`p-3 bg-white/60 rounded-2xl backdrop-blur-sm ${mod.iconColor} mb-2`}>
                {mod.icon}
              </div>
              
              {/* Text */}
              <div className="w-full text-left">
                <span className="text-lg font-black tracking-wide block">{mod.title}</span>
              </div>

              {/* Decorative background element */}
              <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/20 pointer-events-none group-hover:scale-110 transition-transform`} />
            </button>
          ))}
        </div>
      </div>

      {/* Footer Observation */}
      <footer className="p-4 text-center z-10">
        <p className="text-xs text-slate-400 font-bold opacity-80">
          Desenvolvido pelo pai Eron Vasconcelos de coração ❤️
        </p>
      </footer>
    </div>
  );
};

export default Home;