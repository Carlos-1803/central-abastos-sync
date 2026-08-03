import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function OrderTakerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosClient.get('/orders/mine');
      setOrders(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar tus pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const cancelOrder = async (order) => {
    if (!window.confirm(`¿Cancelar el pedido #${String(order.id).padStart(4, '0')}?`)) return;

    try {
      setUpdatingId(order.id);
      setError('');
      setMessage('');
      await axiosClient.patch(`/orders/${order.id}/status`, { status: ORDER_STATUS.CANCELLED });
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, status: ORDER_STATUS.CANCELLED } : item
        )
      );
      setMessage(`El pedido #${order.id} fue cancelado.`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'No se pudo cancelar el pedido.');
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    const pending = orders.filter(
      (order) => normalizeOrderStatus(order.status) === ORDER_STATUS.PENDING
    ).length;
    const inProcess = orders.filter((order) =>
      [
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.PREPARING,
        ORDER_STATUS.READY,
        ORDER_STATUS.OUT_FOR_DELIVERY,
      ].includes(normalizeOrderStatus(order.status))
    ).length;
    const delivered = orders.filter(
      (order) => normalizeOrderStatus(order.status) === ORDER_STATUS.DELIVERED
    ).length;

    return { total: orders.length, pending, inProcess, delivered };
  }, [orders]);

  const visibleOrders = useMemo(() => {
    if (filter === 'ALL') return orders;
    if (filter === 'IN_PROCESS') {
      return orders.filter((order) =>
        [
          ORDER_STATUS.CONFIRMED,
          ORDER_STATUS.PREPARING,
          ORDER_STATUS.READY,
          ORDER_STATUS.OUT_FOR_DELIVERY,
        ].includes(normalizeOrderStatus(order.status))
      );
    }
    return orders.filter((order) => normalizeOrderStatus(order.status) === filter);
  }, [filter, orders]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-mono">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-2xl font-black tracking-wide text-white uppercase">
              Levanta pedidos
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Usuario: {user?.username} • Captura pedidos y revisa su avance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold"
          >
            🔄 Actualizar
          </button>
          <button
            onClick={() => navigate('/orders/new')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase"
          >
            ➕ Nuevo pedido
          </button>
        </div>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total capturados', value: stats.total, color: 'text-white' },
          { label: 'Pendientes', value: stats.pending, color: 'text-amber-400' },
          { label: 'En proceso', value: stats.inProcess, color: 'text-cyan-400' },
          { label: 'Entregados', value: stats.delivered, color: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <p className="text-[10px] uppercase font-bold text-slate-500">{stat.label}</p>
            <p className={`text-3xl font-black mt-2 ${stat.color}`}>{loading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: 'Todos' },
          { id: ORDER_STATUS.PENDING, label: 'Pendientes' },
          { id: 'IN_PROCESS', label: 'En proceso' },
          { id: ORDER_STATUS.DELIVERED, label: 'Entregados' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase ${
              filter === item.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Mis pedidos</h2>
          <span className="text-[10px] text-slate-500">{visibleOrders.length} registros</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Cargando pedidos...</div>
        ) : visibleOrders.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 text-center space-y-3">
            <p className="text-xs text-slate-500">No hay pedidos para este filtro.</p>
            <button
              onClick={() => navigate('/orders/new')}
              className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black uppercase"
            >
              Capturar el primero
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-900/60 border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Pedido</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Productos</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Estatus</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {visibleOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30">
                    <td className="px-5 py-4">
                      <p className="font-black text-emerald-400">#{String(order.id).padStart(4, '0')}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{formatDate(order.orderDate)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{order.clientName}</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs truncate">
                        {order.deliveryAddress || 'Sin dirección'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} unidades
                    </td>
                    <td className="px-5 py-4 font-black text-white">
                      ${Number(order.totalAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${getOrderStatusClasses(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {normalizeOrderStatus(order.status) === ORDER_STATUS.PENDING ? (
                        <button
                          type="button"
                          onClick={() => cancelOrder(order)}
                          disabled={updatingId === order.id}
                          className="rounded-lg border border-rose-800/70 bg-rose-950/60 px-3 py-1.5 text-[10px] font-black uppercase text-rose-300 hover:bg-rose-900 disabled:opacity-50"
                        >
                          {updatingId === order.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600">Sin acciones</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
