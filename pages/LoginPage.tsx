import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { supabase } from '../services/supabase';
import { ArrowLeft, Lock, Mail, LogIn, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Check if user has profiles
      const { data: profiles } = await supabase.from('child_profiles').select('id');
      
      if (profiles && profiles.length > 0) {
        navigate(AppRoute.HOME);
      } else {
        navigate(AppRoute.PROFILE);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message === "Invalid login credentials" ? "Email ou senha incorretos." : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800 p-6">
      <div className="mb-8">
        <button onClick={() => navigate(AppRoute.WELCOME)} className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-500 mb-6">
            <ArrowLeft />
        </button>
        <h1 className="text-3xl font-black text-slate-800">Bem-vindo de volta!</h1>
        <p className="text-slate-400">Entre para continuar a aventura.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6 flex-1">
        {errorMsg && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold">
            {errorMsg}
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
            <Mail className="text-slate-300" />
            <input 
                type="email" 
                required
                placeholder="Email do responsável" 
                className="flex-1 outline-none text-slate-700 font-bold placeholder-slate-300 bg-transparent"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
            />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
            <Lock className="text-slate-300" />
            <input 
                type="password" 
                required
                placeholder="Senha" 
                className="flex-1 outline-none text-slate-700 font-bold placeholder-slate-300 bg-transparent"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
            />
        </div>

        <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black text-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
        >
            {loading ? <Loader2 className="animate-spin"/> : <><LogIn /> ENTRAR</>}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;