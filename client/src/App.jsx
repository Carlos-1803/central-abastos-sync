import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Home from './pages/Home';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import Trucks from './pages/Trucks';
import ActiveTrucks from './pages/ActiveTrucks';
import Clients from './pages/Clients';
import Profile from './pages/Profile';
import ProductsCatalog from './pages/ProductsCatalog';
import Users from './pages/Users';

export default function App() {
  return (
    <Routes>
      {/* Ruta Pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas Protegidas enmarcadas con Layout */}
      <Route element={<Layout />}>
        {/* Accesibles para ADMIN, LOGISTICS y DRIVER */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'LOGISTICS', 'DRIVER']} />}>
          <Route path="/orders" element={<Orders />} />
          <Route path="/fleet/active" element={<ActiveTrucks />} />
          <Route path="/fleet/units" element={<ActiveTrucks />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Accesibles solo para ADMIN y LOGISTICS */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'LOGISTICS']} />}>
          <Route path="/" element={<Home />} />
          <Route path="/orders/new" element={<CreateOrder />} />
          <Route path="/orders/create" element={<CreateOrder />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/products" element={<ProductsCatalog />} />
          <Route path="/inventory" element={<ProductsCatalog />} />
          <Route path="/fleet" element={<Trucks />} />
          <Route path="/trucks" element={<Trucks />} />
        </Route>

        {/* Exclusivo para ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/users" element={<Users />} />
        </Route>
      </Route>
    </Routes>
  );
}