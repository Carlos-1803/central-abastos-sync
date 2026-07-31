import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  // Console.log útil para depurar si tu rol viene como 'role', 'rol', o 'Role'


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-emerald-400 font-mono text-xs">
        Cargando credenciales de usuario...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'DRIVER') return <Navigate to="/fleet/active" replace />;
    
    // CORRECCIÓN: Redirigimos a /profile en lugar de / para evitar el bucle infinito
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}