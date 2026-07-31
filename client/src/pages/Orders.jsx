import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RouteModal from '../components/RouteModal';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Estados para modales
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError('No se pudo sincronizar el historial de órdenes con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenRoute = (e, order) => {
    e.stopPropagation(); // Evita abrir el modal de detalles
    setSelectedRoute({
      orderId: order.id,
      origin: [19.3712, -99.0906],
      destination: [
        order.deliveryLatitude || 19.4326,
        order.deliveryLongitude || -99.1332
      ]
    });
  };

  const handleOpenDetails = (order) => {
    setSelectedOrderDetails(order);
  };

  const handleDeleteOrder = async (e, orderId) => {
    if (e) e.stopPropagation(); // Evita abrir el modal si el clic viene de la tabla

    if (!window.confirm(`¿Estás seguro de que deseas eliminar la orden #${orderId.toString().padStart(4, '0')}?`)) {
      return;
    }

    try {
      setDeletingId(orderId);
      await api.delete(`/orders/${orderId}`);
      
      // Actualizamos el estado local removiendo la orden eliminada
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      
      // Si el modal de detalles de esa orden estaba abierto, lo cerramos
      if (selectedOrderDetails?.id === orderId) {
        setSelectedOrderDetails(null);
      }
    } catch (err) {
      console.error('Error al eliminar la orden:', err);
      alert('Ocurrió un error al intentar eliminar la orden del servidor.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'ALL') return true;
    return order.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Out for Delivery':
      case 'En Ruta':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-950/80 text-amber-400 border border-amber-800/50">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            EN RUTA
          </span>
        );
      case 'Delivered':
      case 'Entregado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            ENTREGADO
          </span>
        );
      case 'Pending':
      case 'Pendiente':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            PENDIENTE
          </span>
        );
    }
  };

  const calculateTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((acc, item) => acc + (item.unitPrice || item.price || 0) * (item.quantity || 1), 0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Industrial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-2xl font-black tracking-wide text-white uppercase font-mono">
              Gestión de Órdenes & Pedidos
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Haz clic en una orden para ver detalles o elimina despachos no requeridos.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 font-mono text-xs">
          {['ALL', 'Pending', 'Out for Delivery', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterStatus === status
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {status === 'ALL' ? 'TODAS' : status.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Órdenes */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono">Cargando órdenes...</div>
      ) : error ? (
        <div className="bg-rose-950/30 text-rose-400 border border-rose-900/50 p-4 rounded-xl text-sm font-mono">
          {error}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">ID Orden</th>
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Atendido Por</th>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5">Estatus</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500 font-mono">
                      No hay órdenes registradas.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => handleOpenDetails(order)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                        #{order.id.toString().padStart(4, '0')}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {order.customerName || order.client?.name || 'Cliente General'}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {order.createdByName || order.user?.fullName || 'Sistema Admin'}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleOpenRoute(e, order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/60 rounded-lg font-mono text-xs transition-colors"
                          >
                            🗺️ Ruta
                          </button>
                          <button
                            onClick={(e) => handleDeleteOrder(e, order.id)}
                            disabled={deletingId === order.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 border border-rose-800/60 rounded-lg font-mono text-xs transition-colors disabled:opacity-50"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETALLES DE LA ORDEN */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 font-mono text-slate-100">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    DETALLE DE PEDIDO
                  </span>
                  <h2 className="text-xl font-bold text-white">
                    #{selectedOrderDetails.id.toString().padStart(4, '0')}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Registrado el {new Date(selectedOrderDetails.orderDate || Date.now()).toLocaleString('es-MX')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg text-xs"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Metadatos (Cliente y Creador) */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Cliente:</span>
                <p className="font-bold text-white text-sm mt-0.5">
                  {selectedOrderDetails.customerName || selectedOrderDetails.client?.name || 'Cliente General'}
                </p>
                <p className="text-slate-400 text-[11px] mt-1">
                  📍 {selectedOrderDetails.deliveryAddress || 'Dirección de entrega estándar'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 uppercase text-[10px]">Creado / Atendido por:</span>
                <p className="font-bold text-cyan-400 text-sm mt-0.5">
                  👤 {selectedOrderDetails.createdByName || selectedOrderDetails.user?.fullName || 'Administrador Central'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-slate-500 text-[10px]">Estado:</span>
                  {getStatusBadge(selectedOrderDetails.status)}
                </div>
              </div>
            </div>

            {/* Desglose de Productos */}
            <div>
              <h3 className="text-xs uppercase text-slate-400 font-bold mb-3 tracking-wider">
                Ítems & Productos Solicitados
              </h3>
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Producto</th>
                      <th className="p-3 text-center">Cant.</th>
                      <th className="p-3 text-right">Precio Unit.</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                      selectedOrderDetails.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="p-3 font-bold text-white">{item.productName || item.product?.name || 'Producto'}</td>
                          <td className="p-3 text-center font-mono">{item.quantity}</td>
                          <td className="p-3 text-right font-mono">${(item.unitPrice || item.price || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-mono text-emerald-400 font-bold">
                            ${((item.quantity || 1) * (item.unitPrice || item.price || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-slate-500">
                          No hay desglose de ítems para esta orden.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer con Total y Botón de Eliminar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-emerald-950/30 border border-emerald-800/50 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteOrder(null, selectedOrderDetails.id)}
                  disabled={deletingId === selectedOrderDetails.id}
                  className="px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800/80 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  🗑️ Eliminar Orden
                </button>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total de la Orden:</span>
                <span className="text-2xl font-black text-emerald-400">
                  ${calculateTotal(selectedOrderDetails.items).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Flotante de Mapa */}
      <RouteModal
        isOpen={!!selectedRoute}
        onClose={() => setSelectedRoute(null)}
        orderId={selectedRoute?.orderId}
        origin={selectedRoute?.origin}
        destination={selectedRoute?.destination}
      />
    </div>
  );
}