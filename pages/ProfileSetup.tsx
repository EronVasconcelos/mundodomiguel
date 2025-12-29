import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, ChildProfile } from '../types';
import { ArrowRight, Check, User, Users } from 'lucide-react';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [existingCount, setExistingCount] = useState(0);
  
  const [profile, setProfile] = useState<ChildProfile>({
    id: crypto.randomUUID(),
    name: '',
    age: 5,
    gender: 'boy',
    hairColor: 'dark',
    hairStyle: 'short',
    eyeColor: 'brown',
    skinTone: 'light',
  });

  useEffect(() => {
    // Check existing profiles
    const stored = localStorage.getItem('child_profiles');
    if (stored) {
        const profiles = JSON.parse(stored);
        setExistingCount(profiles.length);
        if (profiles.length >= 5) {
            alert("Você já atingiu o limite de 5 perfis.");
            navigate(AppRoute.HOME);
        }
    }
  }, [navigate]);

  const handleSave = () => {
    // Get existing profiles
    const stored = localStorage.getItem('child_profiles');
    let profiles: ChildProfile[] = stored ? JSON.parse(stored) : [];
    
    // Add new profile
    profiles.push(profile);
    
    // Save updated list
    localStorage.setItem('child_profiles', JSON.stringify(profiles));
    
    // Set as active profile
    localStorage.setItem('active_profile_id', profile.id);
    
    // Legacy support (optional, keeps other components working until fully migrated)
    localStorage.setItem('child_profile', JSON.stringify(profile));

    navigate(AppRoute.HOME);
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-slide-up">
       <div className="text-center">
          <h2 className="text-3xl font-black text-slate-800">Novo Aventureiro</h2>
          <p className="text-slate-400">Perfil {existingCount + 1} de 5</p>
       </div>

       <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Nome da Criança</label>
          <input 
            type="text" 
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            className="w-full text-3xl font-black text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 outline-none py-2 placeholder-slate-200"
            placeholder="Ex: Miguel"
            autoFocus
          />
       </div>

       <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Quantos anos?</label>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[3,4,5,6,7,8,9,10].map(age => (
               <button 
                 key={age}
                 onClick={() => setProfile({...profile, age})}
                 className={`w-14 h-14 rounded-2xl font-black text-xl flex-shrink-0 border-2 transition-all
                   ${profile.age === age ? 'bg-blue-500 text-white border-blue-600 scale-110' : 'bg-slate-50 text-slate-400 border-slate-200'}
                 `}
               >
                 {age}
               </button>
            ))}
          </div>
       </div>
       
       <div className="flex gap-4">
          <button 
             onClick={() => setProfile({...profile, gender: 'boy'})}
             className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all ${profile.gender === 'boy' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-slate-100 text-slate-400'}`}
          >
             Menino 👦
          </button>
          <button 
             onClick={() => setProfile({...profile, gender: 'girl'})}
             className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all ${profile.gender === 'girl' ? 'bg-pink-100 border-pink-400 text-pink-700' : 'bg-white border-slate-100 text-slate-400'}`}
          >
             Menina 👧
          </button>
       </div>

       <button 
         disabled={!profile.name}
         onClick={() => setStep(2)}
         className="w-full py-4 bg-blue-500 disabled:bg-slate-300 text-white rounded-2xl font-black text-xl shadow-lg shadow-blue-200 mt-8 flex items-center justify-center gap-2"
       >
         PRÓXIMO <ArrowRight />
       </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-slide-up">
       <div className="text-center">
          <h2 className="text-3xl font-black text-slate-800">Como você é?</h2>
          <p className="text-slate-400">Para criarmos desenhos parecidos com você!</p>
       </div>

       {/* Hair Color */}
       <div className="bg-white p-5 rounded-3xl border border-slate-100">
          <label className="text-xs font-bold text-slate-400 uppercase block mb-3">Cor do Cabelo</label>
          <div className="flex gap-3">
             {['blonde', 'brown', 'black', 'red'].map(c => (
                <button 
                  key={c} 
                  onClick={() => setProfile({...profile, hairColor: c})}
                  className={`w-12 h-12 rounded-full border-4 ${profile.hairColor === c ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c === 'blonde' ? '#fcd34d' : c === 'brown' ? '#78350f' : c === 'black' ? '#171717' : '#ef4444' }}
                />
             ))}
          </div>
       </div>

       {/* Hair Style */}
       <div className="bg-white p-5 rounded-3xl border border-slate-100">
          <label className="text-xs font-bold text-slate-400 uppercase block mb-3">Estilo do Cabelo</label>
          <div className="grid grid-cols-2 gap-2">
             {['short', 'long', 'curly', 'straight'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setProfile({...profile, hairStyle: s})}
                  className={`py-2 px-4 rounded-xl text-sm font-bold border-2 ${profile.hairStyle === s ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                  {s === 'short' ? 'Curto' : s === 'long' ? 'Longo' : s === 'curly' ? 'Cacheado' : 'Liso'}
                </button>
             ))}
          </div>
       </div>

       {/* Skin Tone */}
       <div className="bg-white p-5 rounded-3xl border border-slate-100">
          <label className="text-xs font-bold text-slate-400 uppercase block mb-3">Tom de Pele</label>
          <div className="flex gap-3">
             {['light', 'medium', 'dark'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setProfile({...profile, skinTone: s})}
                  className={`w-12 h-12 rounded-full border-4 ${profile.skinTone === s ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: s === 'light' ? '#fde68a' : s === 'medium' ? '#d4a373' : '#5c3a21' }}
                />
             ))}
          </div>
       </div>

       <button 
         onClick={handleSave}
         className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-xl shadow-lg shadow-green-200 mt-8 flex items-center justify-center gap-2"
       >
         <Check /> SALVAR PERFIL
       </button>
    </div>
  );

  return (
    <div className="h-full bg-slate-50 p-6 flex flex-col pt-12">
       {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
};

export default ProfileSetup;