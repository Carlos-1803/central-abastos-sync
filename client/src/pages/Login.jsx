import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomLogin = (e) => {
    e.preventDefault();
    // Simulación de login con la API
    login({
      id: Date.now(),
      name: email.split('@')[0] || 'Usuario',
      email,
      role: 'LOGISTICS', // Rol por defecto si entra manual
    });
    navigate('/');
  };

  // Botones de acceso rápido para probar roles
  const handleQuickLogin = (role, name) => {
    login({
      id: Date.now(),
      name,
      email: `${role.toLowerCase()}@central.com`,
      role,
    });

    if (role === 'DRIVER') {
      navigate('/fleet/active');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-mono text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-2xl">
            🚚
          </div>
          <h1 className="text-xl font-black uppercase text-white tracking-wider">
            Central Abastos Sync
          </h1>
          <p className="text-xs text-slate-400">Inicia sesión según tu rol</p>
        </div>

        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@central.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            Ingresar al Sistema
          </button>
        </form>

        <div className="border-t border-slate-800 pt-5 space-y-3">
          <p className="text-[10px] font-bold uppercase text-slate-500 text-center">
            Acceso Rápido de Prueba (Roles)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('ADMIN', 'Admin General')}
              className="px-2 py-2 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/80 rounded-xl text-[10px] font-bold uppercase"
            >
              ⚡ Admin
            </button>
            <button
              onClick={() => handleQuickLogin('LOGISTICS', 'Operador Logística')}
              className="px-2 py-2 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/80 rounded-xl text-[10px] font-bold uppercase"
            >
              📦 Logística
            </button>
            <button
              onClick={() => handleQuickLogin('DRIVER', 'Chofer Repartidor')}
              className="px-2 py-2 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 rounded-xl text-[10px] font-bold uppercase"
            >
              🚛 Chofer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}