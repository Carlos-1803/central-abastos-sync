import { useState } from 'react';
import { AiOutlineHome, AiOutlineUser, AiOutlineShop, AiOutlineTruck, AiOutlineShopify, AiOutlineBarChart, AiOutlineSetting } from 'react-icons/ai';
import FiLogOut from 'react-icons/fi';
import CustomerIcon from './icons/CustomerIcon';
import TruckIcon from './icons/TruckIcon';
import CentralAbastosLogo from './CentralAbastosLogo';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const toggleSubmenu = () => {
    setSubmenuOpen(!submenuOpen);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <CentralAbastosLogo className="h-8 w-8" />
          <span className="hidden md:inline font-semibold text-lg">Central Abastos</span>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded hover:bg-gray-200">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav mt-6 space-y-1">
        {/* Dashboard */}
        <a
          href="#"
          className={`flex items-center px-4 py-2 text-sm font-medium ${!isCollapsed && 'whitespace-nowrap'} rounded-md hover:bg-gray-100 hover:text-primary`}
        >
          <AiOutlineHome className={`mr-3 h-5 w-5 ${!isCollapsed && 'flex-shrink-0'}`} />
          <span className={!isCollapsed && 'flex-1 min-w-0'}>Dashboard</span>
        </a>

        {/* Orders */}
        <div className="mt-1">
          <button
            onClick={toggleSubmenu}
            className={`flex w-full items-center px-4 py-2 text-left text-sm font-medium ${!isCollapsed && 'whitespace-nowrap'} rounded-md hover:bg-gray-100 hover:text-primary`}
          >
            <AiOutlineShop className={`mr-3 h-5 w-5 ${!isCollapsed && 'flex-shrink-0'}`} />
            <span className={!isCollapsed && 'flex-1 min-w-0'}>Orders</span>
            <ChevronIcon className={`ml-2 h-4 w-4 opacity-50 transition-transform duration-200 ${submenuOpen ? '-rotate-180' : ''}`} />
          </button>
          {submenuOpen && (
            <div className="ml-4 space-y-1">
              <a
                href="#"
                className="flex items-center px-3 py-1 text-sm rounded hover:bg-gray-100"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 min-w-0">Daily Orders</span>
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-1 text-sm rounded hover:bg-gray-100"
              >
                <TruckIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 min-w-0">Dispatch</span>
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-1 text-sm rounded hover:bg-gray-100"
              >
                <FileTextIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 min-w-0">Order History</span>
              </a>
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="mt-1">
          <button
            onClick={toggleSubmenu}
            className={`flex w-full items-center px-4 py-2 text-left text-sm font-medium ${!isCollapsed && 'whitespace-nowrap'} rounded-md hover:bg-gray-100 hover:text-primary`}
          >
            <AiOutlineShopify className={`mr-3 h-5 w-5 ${!isCollapsed && 'flex-shrink-0'}`} />
            <span className={!isCollapsed && 'flex-1 min-w-0'}>Inventory</span>
            <ChevronIcon className={`ml-2 h-4 w-4 opacity-50 transform duration-200 ${submenuOpen ? '-rotate-180' : ''}`} />
          </button>
          {submenuOpen && (
            <div className="ml-4 space-y-1">
              <a
                href="#"
                className="flex items-center px-3 py-1 text-sm rounded hover:bg-gray-100"
              >
                <BoxMultipleIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 min-w-0">Products</span>
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-1 text-sm rounded hover:bg-gray-100"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 min-w-0">Suppliers</span>
              </a>
            </div>
          )}
        </div>

        {/* Fleet Management */}
        <div className="mt-1">
          <button
            onClick={toggleSubmenu}
            className={`flex w-full items-center px-4 py-2 text-left text-sm font-medium ${!isCollapsed && 'whitespace-nowrap'} rounded-md hover:bg-gray-100 hover:text-primary`}
          >
            <TruckIcon className={`mr-3 h-5 w-5 ${!isCollapsed && 'flex-shrink-0'}`} />
            <span className={!isCollapsed && 'flex-1 min-w-0'}>Fleet</span>
            <ChevronIcon className={`ml-2 h-4 w-4 opacity-50 transition-transform duration-200 ${submenuOpen ? '-rotate-180' : ''}`} />
          </button>
          {submenuOpen && (
            <div className="ml-4 space-y-1">
              <a
                href="#"
                className="flex items-center px-3 py-1 text-sm rounded hover:bg-gray-100"
              >
                <MapPinIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 min-w-0">Vehicles</span>
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-1 text-sm rounded hover:bg-gray-100"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 min-w-0">Drivers</span>
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-1 text-sm rounded hover:bg-gray-100"
              >
                <ClipboardListIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 min-w-0">Maintenance</span>
              </a>
            </div>
          )}
        </div>

        {/* Users & Roles */}
        <a
          href="#"
          className="flex items-center px-4 py-2 text-sm font-medium ${!isCollapsed && 'whitespace-nowrap'} rounded-md hover:bg-gray-100 hover:text-primary"
        >
          <AiOutlineUser className={`mr-3 h-5 w-5 ${!isCollapsed && 'flex-shrink-0'}`} />
          <span className={!isCollapsed && 'flex-1 min-w-0'}>Users</span>
        </a>

        {/* Analytics */}
        <a
          href="#"
          className="flex items-center px-4 py-2 text-sm font-medium ${!isCollapsed && 'whitespace-nowrap'} rounded-md hover:bg-gray-100 hover:text-primary"
        >
          <AiOutlineBarChart className={`mr-3 h-5 w-5 ${!isCollapsed && 'flex-shrink-0'}`} />
          <span className={!isCollapsed && 'flex-1 min-w-0'}>Analytics</span>
        </a>

        {/* Settings */}
        <a
          href="#"
          className="mt-6 flex items-center px-4 py-2 text-sm font-medium ${!isCollapsed && 'whitespace-nowrap'} rounded-md hover:bg-gray-100 hover:text-primary"
        >
          <AiOutlineSetting className={`mr-3 h-5 w-5 ${!isCollapsed && 'flex-shrink-0'}`} />
          <span className={!isCollapsed && 'flex-1 min-w-0'}>Settings</span>
        </a>

        {/* Logout */}
        <a
          href="#"
          className="mt-auto flex items-center px-4 py-2 text-sm font-medium ${!isCollapsed && 'whitespace-nowrap'} rounded-md hover:bg-gray-100 hover:text-red-600"
        >
          <FiLogOut className={`mr-3 h-5 w-5 ${!isCollapsed && 'flex-shrink-0'}`} />
          <span className={!isCollapsed && 'flex-1 min-w-0'}>Logout</span>
        </a>
      </nav>
    </aside>
  );
};

// Icon components (simple SVG)
const ChevronIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 01-2 2v6a2 2 0 01-2-2h-3.071a2 2 0 00-1.414.586l-.879.879a2 2 0 01-2.821 0l-.879-.879a2 2 0 00-1.415-.586H3a2 2 0 01-2-2V8a2 2 0 012-2h6z" />
  </svg>
);

const BoxMultipleIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 01-2 2v6a2 2 0 01-2-2h-3.071a2 2 0 00-1.414.586l-.879.879a2 2 0 01-2.821 0l-.879-.879a2 2 0 00-1.415-.586H3a2 2 0 01-2-2V8a2 2 0 012-2h6zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3 3m0 0l3-3m-3 3V8m0 11a8 8 0 108-8 8 8 0 00-8 8z" />
  </svg>
);

const ClipboardListIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h2a2 2 0 000-4H9zM9 13a2 2 0 010 4H7a2 2 0 010-4h2z" />
  </svg>
);

export default Sidebar;