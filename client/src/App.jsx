import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleHome from './components/RoleHome';

import Login from './pages/Login';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import Trucks from './pages/Trucks';
import ActiveTrucks from './pages/ActiveTrucks';
import Clients from './pages/Clients';
import Profile from './pages/Profile';
import ProductsCatalog from './pages/ProductsCatalog';
import Users from './pages/Users';
import DriverDashboard from './pages/DriverDashboard';
import OrderTakerDashboard from './pages/OrderTakerDashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import { ALL_ROLES, ROLES } from './utils/roles';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
          <Route path="/" element={<RoleHome />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/orders" element={<Orders />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/products" element={<ProductsCatalog />} />
          <Route path="/fleet" element={<Trucks />} />
          <Route path="/trucks" element={<Trucks />} />
          <Route path="/fleet/active" element={<ActiveTrucks />} />
          <Route path="/fleet/units" element={<ActiveTrucks />} />
          <Route path="/users" element={<Users />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.DRIVER]} />}>
          <Route path="/chofer" element={<DriverDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ORDER_TAKER]} />}>
          <Route path="/levanta-pedidos" element={<OrderTakerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ORDER_TAKER]} />}>
          <Route path="/orders/new" element={<CreateOrder />} />
          <Route path="/orders/create" element={<CreateOrder />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.WAREHOUSE]} />}>
          <Route path="/bodega" element={<WarehouseDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.WAREHOUSE]} />}>
          <Route path="/inventory" element={<ProductsCatalog />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
