import React, { useCallback, useEffect, useMemo, useState } from 'react';
import RouteModal from '../components/RouteModal';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../services/axiosClient';
import {
  getOrderStatusClasses,
  getOrderStatusLabel,
  normalizeOrderStatus,
  ORDER_STATUS,
} from '../utils/orderStatus';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function DriverDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState({ truck: null, orders: [] });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [routeOrder, setRouteOrder] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosClient.get('/orders/driver-dashboard');
      setDashboard({
        truck: response.data?.truck || null,
        orders: response.data?.orders || [],
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setDashboard({ truck: null, orders: [] });
        setError(err.response.data?.message || err.response.data || 'No tienes un camión asignado.');
      } else {
        setError('No fue posible cargar tu ruta de entrega.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const activeOrders = useMemo(
    () => dashboard.orders.filter((order) => {
      const status = normalizeOrderStatus(order.status);
      return ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(status);
    }),
    [dashboard.orders]
  );

  const deliveredCount = useMemo(
    () => dashboard.orders.filter(
      (order) => normalizeOrderStatus(order.status) === ORDER_STATUS.DELIVERED
    ).length,
    [dashboard.orders]
  );

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      setError('');
      setMessage('');
      await axiosClient.patch(`/orders/${orderId}/status`, { status });
      setDashboard((current) => ({
        ...current,
        orders: current.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
      }));
      setMessage(`La orden #${orderId} cambió a ${getOrderStatusLabel(status)}.`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'No se pudo actualizar la entrega.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openRoute = (order) => {
    setRouteOrder(order);
  };

  const renderActions = (order) => {
    const status = normalizeOrderStatus(order.status);
    const disabled = updatingId === order.id;

    if ([ORDER_STATUS.READY, ORDER_STATUS.DELIVERY_FAILED].includes(status)) {
      return (
        <button
          onClick={() => updateStatus(order.id, ORDER_STATUS.OUT_FOR_DELIVERY)}
          disabled={disabled}
          className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-900 text-slate-950 text-[11px] font-black uppercase"
        >
          {disabled ? 'Actualizando...' : 'Iniciar entrega'}
        </button>
      );
    }

    if (status === ORDER_STATUS.OUT_FOR_DELIVERY) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateStatus(order.id, ORDER_STATUS.DELIVERED)}
            disabled={disabled}
            className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 text-slate-950 text-[11px] font-black uppercase"
          >
            Marcar entregado
          </button>
          <button
            onClick={() => updateStatus(order.id, ORDER_STATUS.DELIVERY_FAILED)}
            disabled={disabled}
            className="px-3 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-black uppercase"
          >
            No entregado
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-mono">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h1 className="text-2xl font-black tracking-wide text-white uppercase">
              Panel del chofer
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bienvenido, {user?.username}. Consulta tu unidad y registra cada entrega.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold"
        >
          🔄 Actualizar ruta
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-900/60 text-rose-300 p-4 rounded-xl text-xs">
          ⚠️ {error}
        </div>
      )}
      {message && (
        <div className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 p-4 rounded-xl text-xs">
          ✅ {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Unidad asignada</p>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Cargando unidad...</p>
          ) : dashboard.truck ? (
            <div className="mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-black text-white">{dashboard.truck.plateNumber}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {dashboard.truck.model} • {dashboard.truck.year}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] uppercase text-slate-500">Capacidad</p>
                <p className="text-lg font-black text-emerald-400">
                  {Number(dashboard.truck.capacityKg || 0).toLocaleString('es-MX')} kg
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Sin unidad asignada.</p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Entregas activas</p>
            <p className="text-3xl font-black text-amber-400 mt-2">{activeOrders.length}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Entregadas</p>
            <p className="text-3xl font-black text-emerald-400 mt-2">{deliveredCount}</p>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Mis entregas</h2>
          <span className="text-[10px] text-slate-500">{dashboard.orders.length} órdenes asignadas</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Cargando entregas...</div>
        ) : dashboard.orders.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 text-center text-xs text-slate-500">
            No tienes pedidos asignados en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {dashboard.orders.map((order) => (
              <article key={order.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-emerald-400">
                      ORDEN #{String(order.id).padStart(4, '0')}
                    </p>
                    <h3 className="text-lg font-black text-white mt-1">{order.clientName}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{formatDate(order.orderDate)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${getOrderStatusClasses(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Dirección de entrega</p>
                  <p className="text-sm text-slate-200 mt-1">{order.deliveryAddress || 'Dirección no registrada'}</p>
                </div>

                <div className="space-y-1">
                  {(order.items || []).map((item) => (
                    <div key={item.id || `${item.productId}-${item.productName}`} className="flex justify-between text-xs">
                      <span className="text-slate-400">{item.productName}</span>
                      <span className="font-bold text-white">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800 pt-4">
                  <button
                    onClick={() => openRoute(order)}
                    disabled={!order.deliveryLatitude || !order.deliveryLongitude}
                    className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-cyan-300 text-[11px] font-bold"
                  >
                    🗺️ Ver ubicación
                  </button>
                  {renderActions(order)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <RouteModal
        isOpen={Boolean(routeOrder)}
        onClose={() => setRouteOrder(null)}
        orderId={routeOrder?.id}
        destination={routeOrder ? [routeOrder.deliveryLatitude, routeOrder.deliveryLongitude] : null}
      />
    </div>
  );
}
