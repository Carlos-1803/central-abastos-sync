import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AiOutlineHome, 
  AiOutlineUser, 
  AiOutlineShop, 
  AiOutlineShopping, 
  AiOutlineBarChart, 
  AiOutlineSetting 
} from 'react-icons/ai';
import { FiLogOut, FiUser } from 'react-icons/fi';
import TruckIcon from './icons/TruckIcon';
import CentralAbastosLogo from './CentralAbastosLogo';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  // Manejamos los submenús abiertos de manera independiente por nombre
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();

  const toggleSubmenu = (menuName) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar bg-slate-900 text-slate-300 min-h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className="sidebar-header flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <CentralAbastosLogo className="h-8 w-8 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-semibold text-lg text-white whitespace-nowrap">
              Central Abastos
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav mt-6 space-y-1 px-3">
        {/* Dashboard */}
        <Link
          to="/"
          className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <AiOutlineHome className="h-5 w-5 flex-shrink-0 mr-3" />
          {!isCollapsed && <span className="truncate">Dashboard</span>}
        </Link>

        {/* Orders */}
        <div className="mt-1">
          <button
            onClick={() => toggleSubmenu('orders')}
            className={`flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.startsWith('/orders')
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <AiOutlineShop className="h-5 w-5 flex-shrink-0 mr-3" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left truncate">Orders</span>
                <ChevronIcon className={`h-4 w-4 transition-transform duration-200 ${openSubmenu === 'orders' ? '-rotate-180' : ''}`} />
              </>
            )}
          </button>
          {openSubmenu === 'orders' && !isCollapsed && (
            <div className="ml-6 mt-1 space-y-1 border-l border-slate-800 pl-3">
              <Link
                to="/orders"
                className="flex items-center px-3 py-1.5 text-xs rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span className="truncate">Daily Orders</span>
              </Link>
              <Link
                to="/orders/dispatch"
                className="flex items-center px-3 py-1.5 text-xs rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <TruckIcon className="mr-2 h-4 w-4" />
                <span className="truncate">Dispatch</span>
              </Link>
              <Link
                to="/orders/history"
                className="flex items-center px-3 py-1.5 text-xs rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <FileTextIcon className="mr-2 h-4 w-4" />
                <span className="truncate">Order History</span>
              </Link>
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="mt-1">
          <button
            onClick={() => toggleSubmenu('inventory')}
            className={`flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.startsWith('/inventory')
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <AiOutlineShopping className="h-5 w-5 flex-shrink-0 mr-3" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left truncate">Inventory</span>
                <ChevronIcon className={`h-4 w-4 transition-transform duration-200 ${openSubmenu === 'inventory' ? '-rotate-180' : ''}`} />
              </>
            )}
          </button>
          {openSubmenu === 'inventory' && !isCollapsed && (
            <div className="ml-6 mt-1 space-y-1 border-l border-slate-800 pl-3">
              <Link
                to="/inventory/products"
                className="flex items-center px-3 py-1.5 text-xs rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <BoxMultipleIcon className="mr-2 h-4 w-4" />
                <span className="truncate">Products</span>
              </Link>
              <Link
                to="/inventory/suppliers"
                className="flex items-center px-3 py-1.5 text-xs rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <FiUser className="mr-2 h-4 w-4" />
                <span className="truncate">Suppliers</span>
              </Link>
            </div>
          )}
        </div>

        {/* Fleet Management */}
        <div className="mt-1">
          <button
            onClick={() => toggleSubmenu('fleet')}
            className={`flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.startsWith('/fleet')
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TruckIcon className="h-5 w-5 flex-shrink-0 mr-3" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left truncate">Fleet</span>
                <ChevronIcon className={`h-4 w-4 transition-transform duration-200 ${openSubmenu === 'fleet' ? '-rotate-180' : ''}`} />
              </>
            )}
          </button>
          {openSubmenu === 'fleet' && !isCollapsed && (
            <div className="ml-6 mt-1 space-y-1 border-l border-slate-800 pl-3">
              <Link
                to="/fleet/vehicles"
                className="flex items-center px-3 py-1.5 text-xs rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <MapPinIcon className="mr-2 h-4 w-4" />
                <span className="truncate">Vehicles</span>
              </Link>
              <Link
                to="/fleet/drivers"
                className="flex items-center px-3 py-1.5 text-xs rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <AiOutlineUser className="mr-2 h-4 w-4" />
                <span className="truncate">Drivers</span>
              </Link>
              <Link
                to="/fleet/maintenance"
                className="flex items-center px-3 py-1.5 text-xs rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ClipboardListIcon className="mr-2 h-4 w-4" />
                <span className="truncate">Maintenance</span>
              </Link>
            </div>
          )}
        </div>

        {/* Users */}
        <Link
          to="/users"
          className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/users') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <AiOutlineUser className="h-5 w-5 flex-shrink-0 mr-3" />
          {!isCollapsed && <span className="truncate">Users</span>}
        </Link>

        {/* Analytics */}
        <Link
          to="/analytics"
          className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/analytics') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <AiOutlineBarChart className="h-5 w-5 flex-shrink-0 mr-3" />
          {!isCollapsed && <span className="truncate">Analytics</span>}
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/settings') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <AiOutlineSetting className="h-5 w-5 flex-shrink-0 mr-3" />
          {!isCollapsed && <span className="truncate">Settings</span>}
        </Link>

        {/* Logout */}
        <button
          onClick={() => alert('Cerrando sesión...')}
          className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <FiLogOut className="h-5 w-5 flex-shrink-0 mr-3" />
          {!isCollapsed && <span className="truncate">Logout</span>}
        </button>
      </nav>
    </aside>
  );
};

// Componentes de iconos locales
const ChevronIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const FileTextIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 01-2 2v6a2 2 0 01-2-2h-3.071a2 2 0 00-1.414.586l-.879.879a2 2 0 01-2.821 0l-.879-.879a2 2 0 00-1.415-.586H3a2 2 0 01-2-2V8a2 2 0 012-2h6z" />
  </svg>
);

const BoxMultipleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const MapPinIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
  </svg>
);

const ClipboardListIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h2a2 2 0 000-4H9z" />
  </svg>
);

export default Sidebar;