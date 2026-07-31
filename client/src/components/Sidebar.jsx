import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Definición centralizada de ítems del menú con sus roles autorizados
  const menuItems = [
    {
      label: 'Dashboard',
    path: '/',
    icon: '📊',
    roles: ['ADMIN', 'LOGISTICS'],
    },
    {
      label: 'Mis Pedidos / Entregas', // Titulo adaptado
    path: '/orders',
    icon: '📦',
    roles: ['ADMIN', 'LOGISTICS', 'DRIVER'],
    },
    {
      label: 'Nuevo Pedido',
      path: '/orders/new',
      icon: '➕',
      roles: ['ADMIN', 'LOGISTICS'],
    },
    {
      label: 'Catálogo Productos',
      path: '/products',
      icon: '🍎',
      roles: ['ADMIN', 'LOGISTICS'],
    },
    {
      label: 'Clientes',
      path: '/clients',
      icon: '👥',
      roles: ['ADMIN', 'LOGISTICS'],
    },
    {
      label: 'Gestión Flotilla',
      path: '/fleet',
      icon: '🚛',
      roles: ['ADMIN', 'LOGISTICS'],
    },
    {
      label: 'Unidades Activas',
      path: '/fleet/active',
      icon: '📍',
      roles: ['ADMIN', 'LOGISTICS', 'DRIVER'], // Accesible para Choferes
    },
    {
      label: 'Usuarios',
      path: '/users',
      icon: '👤',
      roles: ['ADMIN'], // Exclusivo de Administrador
    },
  ];

  // Filtrar los elementos según el rol del usuario logueado
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-200 h-screen flex flex-col justify-between font-mono p-4 select-none">
      <div className="space-y-6">
        {/* Header / Logo */}
        <div className="flex items-center gap-3 px-2 py-2 border-b border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg">
            ⚡
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              Central Sync
            </h2>
            <span className="text-[10px] text-emerald-400 font-bold block">
              v1.0 • Live
            </span>
          </div>
        </div>

        {/* Tarjeta del Usuario Activo */}
        {user && (
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                user.role === 'ADMIN'
                  ? 'bg-purple-950 text-purple-400 border border-purple-800/80'
                  : user.role === 'DRIVER'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800/80'
                  : 'bg-blue-950 text-blue-400 border border-blue-800/80'
              }`}
            >
              {user.role}
            </span>
          </div>
        )}

        {/* Navegación Filtrada */}
        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-2">
            Navegación
          </p>

          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Perfil y Cerrar Sesión */}
      <div className="border-t border-slate-800 pt-3 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`
          }
        >
          <span>⚙️</span>
          <span>Mi Perfil</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition-all text-left"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}