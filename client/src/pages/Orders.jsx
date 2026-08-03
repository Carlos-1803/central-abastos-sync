import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import RouteModal from '../components/RouteModal';
import {
  getOrderStatusClasses,
  getOrderStatusLabel,
  normalizeOrderStatus,
  ORDER_STATUS,
} from '../utils/orderStatus';

const FILTERS = [
  { value: 'ALL', label: 'Todas' },
  { value: ORDER_STATUS.PENDING, label: 'Pendientes' },
  { value: ORDER_STATUS.PREPARING, label: 'Preparando' },
  { value: ORDER_STATUS.READY, label: 'Listas' },
  { value: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'En ruta' },
  { value: ORDER_STATUS.DELIVERED, label: 'Entregadas' },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersResponse, trucksResponse] = await Promise.all([
        api.get('/orders'),
        api.get('/trucks'),
      ]);

      setOrders(ordersResponse.data || []);
      setTrucks((trucksResponse.data || []).filter((truck) => truck.isActive !== false));
    } catch (err) {
      console.error('Error al cargar órdenes y camiones:', err);
      setError('No se pudo sincronizar la información con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'ALL') return orders;
    return orders.filter((order) => normalizeOrderStatus(order.status) === filterStatus);
  }, [orders, filterStatus]);

  const handleOpenRoute = (event, order) => {
    event?.stopPropagation();
    setSelectedRoute({
      orderId: order.id,
      origin: [19.3712, -99.0906],
      destination: [
        order.deliveryLatitude || 19.4326,
        order.deliveryLongitude || -99.1332,
      ],
    });
  };

  const handleOpenAssignment = (event, order) => {
    event?.stopPropagation();
    setAssigningOrder(order);
    setSelectedTruckId(order.assignedTruckId ? String(order.assignedTruckId) : '');
  };

  const handleAssignTruck = async (event) => {
    event.preventDefault();
    if (!assigningOrder || !selectedTruckId) return;

    try {
      setAssigning(true);
      setError(null);
      const truckId = Number(selectedTruckId);
      await api.put(`/orders/${assigningOrder.id}/assign-truck`, null, {
        params: { truckId },
      });

      const truck = trucks.find((item) => item.id === truckId);
      const updatedOrder = {
        ...assigningOrder,
        assignedTruckId: truckId,
        truckPlateNumber: truck?.plateNumber || truck?.plate || null,
      };

      setOrders((previous) =>
        previous.map((order) => (order.id === assigningOrder.id ? updatedOrder : order))
      );
      setSelectedOrderDetails((previous) =>
        previous?.id === assigningOrder.id ? updatedOrder : previous
      );
      setAssigningOrder(null);
      setSelectedTruckId('');
    } catch (err) {
      console.error('Error al asignar camión:', err);
      setError(err.response?.data?.message || 'No se pudo asignar el camión al pedido.');
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteOrder = async (event, orderId) => {
    event?.stopPropagation();

    if (!window.confirm(`¿Eliminar la orden #${String(orderId).padStart(4, '0')}?`)) {
      return;
    }

    try {
      setDeletingId(orderId);
      await api.delete(`/orders/${orderId}`);
      setOrders((previous) => previous.filter((order) => order.id !== orderId));
      if (selectedOrderDetails?.id === orderId) setSelectedOrderDetails(null);
    } catch (err) {
      console.error('Error al eliminar la orden:', err);
      setError(err.response?.data?.message || 'No se pudo eliminar la orden.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${getOrderStatusClasses(status)}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {getOrderStatusLabel(status)}
    </span>
  );

  const calculateTotal = (order) => {
    if (Number.isFinite(Number(order?.totalAmount))) return Number(order.totalAmount);
    return (order?.items || []).reduce(
      (total, item) => total + Number(item.unitPrice || item.price || 0) * Number(item.quantity || 0),
      0
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 text-slate-100">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            <h1 className="font-mono text-2xl font-black uppercase tracking-wide text-white">
              Gestión de órdenes y pedidos
            </h1>
          </div>
          <p className="mt-1 font-mono text-xs text-slate-400">
            Supervisa el surtido, asigna unidades y consulta las rutas de entrega.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setFilterStatus(filter.value)}
              className={`rounded-lg border px-3 py-1.5 transition-all ${
                filterStatus === filter.value
                  ? 'border-emerald-500/50 bg-emerald-500/20 font-bold text-emerald-400'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {filter.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-900/60 bg-rose-950/30 p-4 font-mono text-sm text-rose-400">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center font-mono text-slate-500">Cargando órdenes...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/80 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Orden</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Registró</th>
                  <th className="px-5 py-3.5">Camión</th>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Estatus</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center font-mono text-slate-500">
                      No hay órdenes para este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderDetails(order)}
                      className="cursor-pointer transition-colors hover:bg-slate-800/60"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-emerald-400">
                        #{String(order.id).padStart(4, '0')}
                      </td>
                      <td className="px-5 py-4 font-semibold text-white">
                        {order.clientName || order.customerName || 'Cliente general'}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">
                        {order.createdByUsername || order.createdByName || 'Sistema'}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">
                        {order.truckPlateNumber ? (
                          <span className="text-cyan-400">🚛 {order.truckPlateNumber}</span>
                        ) : (
                          <span className="text-slate-500">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(event) => handleOpenAssignment(event, order)}
                            className="rounded-lg border border-cyan-800/60 bg-cyan-950/60 px-3 py-1.5 font-mono text-xs text-cyan-400 transition-colors hover:bg-cyan-900/80"
                            title="Asignar camión y chofer"
                          >
                            🚛 Asignar
                          </button>
                          <button
                            type="button"
                            onClick={(event) => handleOpenRoute(event, order)}
                            className="rounded-lg border border-emerald-800/60 bg-emerald-950/60 px-3 py-1.5 font-mono text-xs text-emerald-400 transition-colors hover:bg-emerald-900/80"
                          >
                            🗺️ Ruta
                          </button>
                          <button
                            type="button"
                            onClick={(event) => handleDeleteOrder(event, order.id)}
                            disabled={deletingId === order.id}
                            className="rounded-lg border border-rose-800/60 bg-rose-950/60 px-2.5 py-1.5 font-mono text-xs text-rose-400 transition-colors hover:bg-rose-900/80 disabled:opacity-50"
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

      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl space-y-6 overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900 p-6 font-mono text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="rounded border border-emerald-800 bg-emerald-950 px-2 py-0.5 text-xs font-bold text-emerald-400">
                  DETALLE DE PEDIDO
                </span>
                <h2 className="mt-2 text-xl font-bold text-white">
                  #{String(selectedOrderDetails.id).padStart(4, '0')}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(selectedOrderDetails.orderDate || Date.now()).toLocaleString('es-MX')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs sm:grid-cols-2">
              <div>
                <span className="text-[10px] uppercase text-slate-500">Cliente</span>
                <p className="mt-0.5 text-sm font-bold text-white">
                  {selectedOrderDetails.clientName || selectedOrderDetails.customerName || 'Cliente general'}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  📍 {selectedOrderDetails.deliveryAddress || 'Sin dirección registrada'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500">Registrado por</span>
                <p className="mt-0.5 text-sm font-bold text-cyan-400">
                  👤 {selectedOrderDetails.createdByUsername || selectedOrderDetails.createdByName || 'Sistema'}
                </p>
                <div className="mt-2">{getStatusBadge(selectedOrderDetails.status)}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500">Unidad asignada</span>
                <p className="mt-0.5 text-sm font-bold text-white">
                  {selectedOrderDetails.truckPlateNumber || 'Sin camión asignado'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500">Notas</span>
                <p className="mt-0.5 text-sm text-slate-300">
                  {selectedOrderDetails.notes || 'Sin observaciones'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Productos solicitados
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/80 text-[10px] uppercase text-slate-400">
                    <tr>
                      <th className="p-3">Producto</th>
                      <th className="p-3 text-center">Cantidad</th>
                      <th className="p-3 text-right">Precio</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(selectedOrderDetails.items || []).map((item) => (
                      <tr key={item.id || `${item.productId}-${item.productName}`}>
                        <td className="p-3 font-bold text-white">{item.productName || 'Producto'}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">${Number(item.unitPrice || 0).toFixed(2)}</td>
                        <td className="p-3 text-right font-bold text-emerald-400">
                          ${(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-4 sm:flex-row">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(event) => handleOpenAssignment(event, selectedOrderDetails)}
                  className="rounded-lg border border-cyan-800 bg-cyan-950 px-3 py-2 text-xs font-bold text-cyan-400 hover:bg-cyan-900"
                >
                  🚛 Asignar unidad
                </button>
                <button
                  type="button"
                  onClick={(event) => handleDeleteOrder(event, selectedOrderDetails.id)}
                  disabled={deletingId === selectedOrderDetails.id}
                  className="rounded-lg border border-rose-800 bg-rose-950 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-900 disabled:opacity-50"
                >
                  🗑️ Eliminar
                </button>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase text-slate-400">Total</span>
                <span className="text-2xl font-black text-emerald-400">
                  ${calculateTotal(selectedOrderDetails).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {assigningOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
          <form
            onSubmit={handleAssignTruck}
            className="w-full max-w-md space-y-5 rounded-2xl border border-cyan-800/50 bg-slate-900 p-6 font-mono shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Asignación logística</p>
                <h2 className="mt-1 text-lg font-black text-white">
                  Orden #{String(assigningOrder.id).padStart(4, '0')}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Selecciona una unidad activa con chofer asignado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <label className="block text-xs text-slate-300">
              Camión y chofer
              <select
                required
                value={selectedTruckId}
                onChange={(event) => setSelectedTruckId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500"
              >
                <option value="">Selecciona una unidad</option>
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id} disabled={!truck.driverId}>
                    {truck.plateNumber || truck.plate} · {truck.model} · {truck.driverName || 'Sin chofer'}
                  </option>
                ))}
              </select>
            </label>

            {trucks.length === 0 && (
              <p className="rounded-lg border border-amber-800/50 bg-amber-950/30 p-3 text-xs text-amber-400">
                No hay unidades activas. Registra un camión y asígnale un chofer desde Flotilla.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={assigning || !selectedTruckId}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? 'Asignando...' : 'Confirmar asignación'}
              </button>
            </div>
          </form>
        </div>
      )}

      <RouteModal
        isOpen={Boolean(selectedRoute)}
        onClose={() => setSelectedRoute(null)}
        orderId={selectedRoute?.orderId}
        origin={selectedRoute?.origin}
        destination={selectedRoute?.destination}
      />
    </div>
  );
}
