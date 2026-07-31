import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

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
    // Si no tiene el rol permitido, redirigir a una vista por defecto según su rol
    if (user.role === 'DRIVER') return <Navigate to="/fleet/active" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}