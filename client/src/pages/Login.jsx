import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../services/axiosClient';
import { getRoleHomePath, normalizeRole } from '../utils/roles';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCustomLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', {
        username,
        password,
      });

      const {
        id,
        userId,
        username: dbUsername,
        roleName,
        token,
      } = response.data;

      const normalizedRole = normalizeRole(roleName);
      const session = {
        id: id ?? userId,
        username: dbUsername,
        role: normalizedRole,
        token,
      };

      login(session);
      navigate(getRoleHomePath(normalizedRole), { replace: true });
    } catch (err) {
      if (err.response?.data) {
        const apiMessage = err.response.data;
        setError(
          typeof apiMessage === 'string'
            ? apiMessage
            : apiMessage.message || 'Credenciales inválidas.'
        );
      } else {
        setError('Error de conexión con el servidor backend.');
      }
    } finally {
      setLoading(false);
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
          <p className="text-xs text-slate-400">
            Inicia sesión con tus credenciales de empleado
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Nombre de Usuario
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ej. admin, chofer1"
              autoComplete="username"
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
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            {loading ? 'Autenticando...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
