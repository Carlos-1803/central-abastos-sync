import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel, normalizeRole, ROLES } from '../utils/roles';

const roleBadgeClasses = {
  [ROLES.ADMIN]: 'bg-purple-950 text-purple-400 border-purple-800/80',
  [ROLES.DRIVER]: 'bg-amber-950 text-amber-400 border-amber-800/80',
  [ROLES.ORDER_TAKER]: 'bg-cyan-950 text-cyan-400 border-cyan-800/80',
  [ROLES.WAREHOUSE]: 'bg-blue-950 text-blue-400 border-blue-800/80',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = normalizeRole(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: '📊',
      roles: [ROLES.ADMIN],
    },
    {
      label: 'Pedidos',
      path: '/orders',
      icon: '📦',
      roles: [ROLES.ADMIN],
    },
    {
      label: 'Levantar pedido',
      path: '/levanta-pedidos',
      icon: '📝',
      roles: [ROLES.ORDER_TAKER],
    },
    {
      label: 'Nuevo pedido',
      path: '/orders/new',
      icon: '➕',
      roles: [ROLES.ADMIN, ROLES.ORDER_TAKER],
    },
    {
      label: 'Operación de bodega',
      path: '/bodega',
      icon: '🏬',
      roles: [ROLES.WAREHOUSE],
    },
    {
      label: 'Inventario',
      path: '/inventory',
      icon: '🍎',
      roles: [ROLES.WAREHOUSE],
    },
    {
      label: 'Clientes',
      path: '/clients',
      icon: '👥',
      roles: [ROLES.ADMIN],
    },
    {
      label: 'Gestión flotilla',
      path: '/fleet',
      icon: '🚛',
      roles: [ROLES.ADMIN],
    },
    {
      label: 'Unidades activas',
      path: '/fleet/active',
      icon: '📍',
      roles: [ROLES.ADMIN],
    },
    {
      label: 'Mi ruta',
      path: '/chofer',
      icon: '🛣️',
      roles: [ROLES.DRIVER],
    },
    {
      label: 'Usuarios',
      path: '/users',
      icon: '👤',
      roles: [ROLES.ADMIN],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 text-slate-200 min-h-screen flex flex-col justify-between font-mono p-4 select-none sticky top-0">
      <div className="space-y-6">
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

        {user && (
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-2">
            <p className="text-xs font-bold text-white truncate">
              {user.username || user.name || 'Usuario'}
            </p>
            <span
              className={`inline-flex text-[9px] font-black px-2 py-0.5 rounded-md uppercase border ${
                roleBadgeClasses[userRole] || 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {getRoleLabel(userRole)}
            </span>
          </div>
        )}

        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-2">
            Navegación
          </p>

          {visibleMenuItems.map((item) => (
            <NavLink
              key={`${item.path}-${item.label}`}
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
          <span>Mi perfil</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition-all text-left"
        >
          <span>🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
