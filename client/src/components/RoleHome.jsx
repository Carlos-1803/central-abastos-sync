import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import { getRoleHomePath, normalizeRole, ROLES } from '../utils/roles';

export default function RoleHome() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (role === ROLES.ADMIN) {
    return <Home />;
  }

  return <Navigate to={getRoleHomePath(role)} replace />;
}
