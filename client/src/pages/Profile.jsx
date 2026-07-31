import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // <-- Asegúrate de tener esta línea

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-500 font-mono text-xs">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-100 font-mono">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">
          Mi Perfil
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Información de la sesión actual • Central de Abastos Sync
        </p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/50 border border-slate-800/60 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Usuario</span>
            <p className="text-lg font-black text-emerald-400 mt-1">
              {profileData?.username || profileData?.name || 'Administrador'}
            </p>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/60 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rol en el Sistema</span>
            <p className="text-lg font-black text-white mt-1">
              {profileData?.role || 'ADMIN'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}