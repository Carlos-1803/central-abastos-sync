import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalRevenue: 0,
    activeTrucks: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    db: true,
    api: true,
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch de órdenes de la API
      const ordersResponse = await api.get('/orders');
      const orders = ordersResponse.data || [];

      // 1. Obtener órdenes del día de hoy
      const today = new Date().toDateString();
      const todayOrdersList = orders.filter((o) => {
        if (!o.orderDate) return false;
        return new Date(o.orderDate).toDateString() === today;
      });

      // 2. Calcular ingresos totales procesados
      const revenue = orders.reduce((acc, order) => {
        if (!order.items || order.items.length === 0) return acc;
        const orderTotal = order.items.reduce(
          (sum, item) => sum + (item.unitPrice || item.price || 0) * (item.quantity || 1),
          0
        );
        return acc + orderTotal;
      }, 0);

      // 3. Conteo de órdenes pendientes
      const pendingCount = orders.filter(
        (o) => o.status === 'Pending' || o.status === 'Pendiente'
      ).length;

      // 4. Intentar obtener camiones/flota activa (si existe el endpoint /trucks o /fleet)
      let activeTrucksCount = 0;
      try {
        const trucksResponse = await api.get('/trucks').catch(() => api.get('/fleet'));
        if (trucksResponse?.data) {
          activeTrucksCount = trucksResponse.data.filter(
            (t) => t.status === 'In Transit' || t.status === 'Active' || t.status === 'En Ruta'
          ).length;
        }
      } catch {
        // Fallback: contar órdenes en ruta como camiones activos si no hay endpoint de flota
        activeTrucksCount = orders.filter(
          (o) => o.status === 'Out for Delivery' || o.status === 'En Ruta'
        ).length;
      }

      // Actualizar estado de las tarjetas
      setStats({
        todayOrders: todayOrdersList.length,
        totalRevenue: revenue,
        activeTrucks: activeTrucksCount,
        pendingOrders: pendingCount,
      });

      // 5. Últimas 5 órdenes para la tabla
      const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0)
      );
      setRecentOrders(sortedOrders.slice(0, 5));
      setSystemStatus({ db: true, api: true });
    } catch (err) {
      console.error('Error al cargar datos del Dashboard:', err);
      setError('No se pudo conectar con el servidor para obtener las métricas en tiempo real.');
      setSystemStatus({ db: false, api: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Out for Delivery':
      case 'En Ruta':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
            EN RUTA
          </span>
        );
      case 'Delivered':
      case 'Entregado':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            ENTREGADO
          </span>
        );
      case 'Pending':
      case 'Pendiente':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
            PENDIENTE
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-mono">
      {/* Header General */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-2xl font-black tracking-wide text-white uppercase">
              Panel de Control
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Métricas reales de operación • Central de Abastos Sync
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 transition-colors self-start sm:self-auto"
        >
          🔄 Actualizar Datos
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/30 text-rose-400 border border-rose-900/50 p-4 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Métricas Principales Reales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tarjeta 1 */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Órdenes Hoy</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
              HOY
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">
              {loading ? '...' : stats.todayOrders}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Registradas durante el día</p>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Acumulados</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
              TOTAL
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {loading ? '...' : `$${stats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Suma acumulada de pedidos</p>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flota en Ruta</span>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-full">
              ACTIVOS
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">
              {loading ? '...' : stats.activeTrucks}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Unidades/Órdenes en tránsito</p>
          </div>
        </div>

        {/* Tarjeta 4 */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Por Procesar</span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-full">
              PENDIENTES
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-amber-400">
              {loading ? '...' : stats.pendingOrders}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Requieren atención rápida</p>
          </div>
        </div>
      </div>

      {/* Bloque Inferior: Órdenes Recientes y Estado del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Órdenes Recientes Reales */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Órdenes Recientes</h2>
            <span className="text-xs text-slate-500">Últimos 5 registros</span>
          </div>

          <div className="space-y-2">
            {loading ? (
              <p className="text-center py-6 text-slate-500 text-xs">Cargando despachos...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-xs">No hay órdenes registradas.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-emerald-400">
                      #{order.id.toString().padStart(4, '0')}
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {order.customerName || order.client?.name || 'Cliente General'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                          })
                        : 'N/A'}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Estatus del Backend y DB */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Estatus del Sistema</h2>
            <p className="text-[11px] text-slate-500">Infraestructura Central Abastos</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/50">
              <span className="text-slate-300">Base de Datos (MySQL)</span>
              <span
                className={`flex items-center gap-1.5 font-bold ${
                  systemStatus.db ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    systemStatus.db ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                ></span>
                {systemStatus.db ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/50">
              <span className="text-slate-300">Servidor API (.NET)</span>
              <span
                className={`flex items-center gap-1.5 font-bold ${
                  systemStatus.api ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    systemStatus.api ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                ></span>
                {systemStatus.api ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/50">
              <span className="text-slate-300">Sincronización Bodega</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                SYNC OK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}