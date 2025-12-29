import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { ArrowLeft, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
        setLoading(false);
        // Save fake auth token
        localStorage.setItem('auth_token', 'valid_token');
        // Navigate to Profile Setup
        navigate(AppRoute.PROFILE);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800 p-6">
      <div className="mb-8">
        <button onClick={() => navigate(AppRoute.WELCOME)} className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-500 mb-6">
            <ArrowLeft />
        </button>
        <h1 className="text-3xl font-black text-slate-800">Criar Conta</h1>
        <p className="text-slate-400">Primeiro, os dados do responsável.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6 flex-1">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
            <User className="text-slate-300" />
            <input 
                type="text" 
                required
                placeholder="Seu Nome" 
                className="flex-1 outline-none text-slate-700 font-bold placeholder-slate-300 bg-transparent"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
            />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
            <Mail className="text-slate-300" />
            <input 
                type="email" 
                required
                placeholder="Seu Email" 
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
            className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-xl shadow-lg shadow-yellow-100 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
        >
            {loading ? <Loader2 className="animate-spin"/> : <>CONTINUAR <ArrowRight /></>}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;