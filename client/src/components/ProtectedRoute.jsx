import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath, normalizeRole } from '../utils/roles';

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

  const userRole = normalizeRole(user.role);
  const normalizedAllowedRoles = allowedRoles?.map(normalizeRole);

  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to={getRoleHomePath(userRole)} replace />;
  }

  return <Outlet />;
}
