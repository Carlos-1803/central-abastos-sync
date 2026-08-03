import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../services/axiosClient';
import {
  getOrderStatusClasses,
  getOrderStatusLabel,
  normalizeOrderStatus,
  ORDER_STATUS,
} from '../utils/orderStatus';

const workflow = {
  [ORDER_STATUS.PENDING]: {
    next: ORDER_STATUS.CONFIRMED,
    label: 'Confirmar pedido',
  },
  [ORDER_STATUS.CONFIRMED]: {
    next: ORDER_STATUS.PREPARING,
    label: 'Iniciar surtido',
  },
  [ORDER_STATUS.PREPARING]: {
    next: ORDER_STATUS.READY,
    label: 'Marcar listo',
  },
};

export default function WarehouseDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [ordersResponse, productsResponse] = await Promise.all([
        axiosClient.get('/orders/warehouse'),
        axiosClient.get('/products'),
      ]);
      setOrders(ordersResponse.data || []);
      setProducts(productsResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la operación de bodega.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const updateOrderStatus = async (order, nextStatus) => {
    try {
      setUpdatingOrderId(order.id);
      setError('');
      setMessage('');
      await axiosClient.patch(`/orders/${order.id}/status`, { status: nextStatus });
      setOrders((current) =>
        nextStatus === ORDER_STATUS.CANCELLED
          ? current.filter((item) => item.id !== order.id)
          : current.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item))
      );
      setMessage(`Pedido #${order.id} actualizado a ${getOrderStatusLabel(nextStatus)}.`);

      if (nextStatus === ORDER_STATUS.READY) {
        const productsResponse = await axiosClient.get('/products');
        setProducts(productsResponse.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'No se pudo actualizar el pedido.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const adjustStock = async (productId, quantityChange) => {
    try {
      setUpdatingProductId(productId);
      setError('');
      const response = await axiosClient.patch(`/products/${productId}/stock`, { quantityChange });
      const updatedProduct = response.data;
      setProducts((current) =>
        current.map((product) => (product.id === productId ? updatedProduct : product))
      );
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'No se pudo ajustar la existencia.');
    } finally {
      setUpdatingProductId(null);
    }
  };

  const visibleOrders = useMemo(() => {
    if (filter === 'ALL') return orders;
    return orders.filter((order) => normalizeOrderStatus(order.status) === filter);
  }, [filter, orders]);

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.isActive && Number(product.stock) <= 10),
    [products]
  );

  const readyCount = orders.filter(
    (order) => normalizeOrderStatus(order.status) === ORDER_STATUS.READY
  ).length;
  const preparingCount = orders.filter((order) =>
    [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING].includes(normalizeOrderStatus(order.status))
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-mono">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse" />
            <h1 className="text-2xl font-black tracking-wide text-white uppercase">
              Operación de bodega
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Confirma, surte y libera pedidos para reparto.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold"
        >
          🔄 Actualizar operación
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500">Cola de trabajo</p>
          <p className="text-3xl font-black text-white mt-2">{loading ? '...' : orders.length}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500">En preparación</p>
          <p className="text-3xl font-black text-blue-400 mt-2">{loading ? '...' : preparingCount}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500">Listos para salida</p>
          <p className="text-3xl font-black text-cyan-400 mt-2">{loading ? '...' : readyCount}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500">Stock bajo</p>
          <p className="text-3xl font-black text-amber-400 mt-2">{loading ? '...' : lowStockProducts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: ORDER_STATUS.PENDING, label: 'Pendientes' },
              { id: ORDER_STATUS.CONFIRMED, label: 'Confirmados' },
              { id: ORDER_STATUS.PREPARING, label: 'Preparando' },
              { id: ORDER_STATUS.READY, label: 'Listos' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase ${
                  filter === item.id
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">Cargando pedidos...</div>
          ) : visibleOrders.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 text-center text-xs text-slate-500">
              No hay pedidos en esta etapa.
            </div>
          ) : (
            <div className="space-y-4">
              {visibleOrders.map((order) => {
                const normalizedStatus = normalizeOrderStatus(order.status);
                const action = workflow[normalizedStatus];

                return (
                  <article key={order.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-emerald-400">
                          PEDIDO #{String(order.id).padStart(4, '0')}
                        </p>
                        <h3 className="text-lg font-black text-white mt-1">{order.clientName}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {order.deliveryAddress || 'Sin dirección registrada'}
                        </p>
                      </div>
                      <span className={`self-start px-2.5 py-1 rounded-full border text-[10px] font-bold ${getOrderStatusClasses(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl divide-y divide-slate-800">
                      {(order.items || []).map((item) => {
                        const product = products.find((candidate) => candidate.id === item.productId);
                        const enoughStock = Number(product?.stock ?? 0) >= Number(item.quantity || 0);
                        return (
                          <div key={item.id || `${order.id}-${item.productId}`} className="flex items-center justify-between gap-3 p-3 text-xs">
                            <div>
                              <p className="font-bold text-white">{item.productName}</p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Existencia: {product?.stock ?? '---'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-slate-200">Solicitado: {item.quantity}</p>
                              <p className={`text-[10px] font-bold mt-1 ${enoughStock ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {enoughStock ? 'Existencia suficiente' : 'Existencia insuficiente'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800 pt-4">
                      <p className="text-xs text-slate-500">
                        Total: <span className="font-black text-white">${Number(order.totalAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </p>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {action ? (
                          <>
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order, ORDER_STATUS.CANCELLED)}
                              disabled={updatingOrderId === order.id}
                              className="rounded-xl border border-rose-800 bg-rose-950/60 px-3 py-2 text-[10px] font-black uppercase text-rose-300 hover:bg-rose-900 disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order, action.next)}
                              disabled={updatingOrderId === order.id}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-900 text-slate-950 rounded-xl text-[11px] font-black uppercase"
                            >
                              {updatingOrderId === order.id ? 'Actualizando...' : action.label}
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-cyan-400 font-bold uppercase">
                            Esperando asignación de unidad
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-black text-white uppercase">Alertas de inventario</h2>
              <span className="text-[10px] text-amber-400 font-bold">≤ 10 piezas</span>
            </div>

            <div className="mt-4 space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">Sin alertas de existencia.</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-white">{product.name}</p>
                        <p className="text-[10px] text-slate-500 mt-1">ID #{product.id}</p>
                      </div>
                      <span className="text-lg font-black text-amber-400">{product.stock}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => adjustStock(product.id, -1)}
                        disabled={updatingProductId === product.id || product.stock <= 0}
                        className="py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-900 text-rose-300 rounded-lg text-xs font-black disabled:opacity-40"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => adjustStock(product.id, 1)}
                        disabled={updatingProductId === product.id}
                        className="py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-black"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => adjustStock(product.id, 10)}
                        disabled={updatingProductId === product.id}
                        className="py-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-900 text-emerald-300 rounded-lg text-xs font-black"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
