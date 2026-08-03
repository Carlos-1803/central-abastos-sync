import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { normalizeOrderStatus, ORDER_STATUS } from '../utils/orderStatus';

export default function ActiveTrucks() {
  const navigate = useNavigate();
  const [activeUnits, setActiveUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActiveUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [trucksResponse, ordersResponse] = await Promise.all([
        api.get('/trucks'),
        api.get('/orders'),
      ]);

      const orders = ordersResponse.data || [];
      const normalizedUnits = (trucksResponse.data || [])
        .filter((truck) => truck.isActive !== false)
        .map((truck) => {
          const truckOrders = orders.filter(
            (order) => Number(order.assignedTruckId) === Number(truck.id)
          );
          const routeOrders = truckOrders.filter(
            (order) => normalizeOrderStatus(order.status) === ORDER_STATUS.OUT_FOR_DELIVERY
          );
          const waitingOrders = truckOrders.filter((order) =>
            [ORDER_STATUS.READY, ORDER_STATUS.PREPARING, ORDER_STATUS.CONFIRMED].includes(
              normalizeOrderStatus(order.status)
            )
          );

          return {
            ...truck,
            unitNumber: truck.unitNumber || `CAM-${String(truck.id).padStart(2, '0')}`,
            plate: truck.plateNumber || truck.plate || 'Sin placas',
            capacityTons: Number(truck.capacityKg || 0) / 1000,
            status: routeOrders.length > 0 ? 'IN_ROUTE' : 'AVAILABLE',
            activeOrders: routeOrders,
            waitingOrders,
          };
        });

      setActiveUnits(normalizedUnits);
    } catch (err) {
      console.error('Error al cargar unidades activas:', err);
      setActiveUnits([]);
      setError(err.response?.data?.message || 'No se pudo cargar el monitoreo de unidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveUnits();
  }, [fetchActiveUnits]);

  const metrics = useMemo(() => {
    const inRoute = activeUnits.filter((unit) => unit.status === 'IN_ROUTE');
    const available = activeUnits.filter((unit) => unit.status === 'AVAILABLE');
    return {
      inRoute: inRoute.length,
      available: available.length,
      capacityInTransit: inRoute.reduce(
        (total, unit) => total + Number(unit.capacityTons || 0),
        0
      ),
    };
  }, [activeUnits]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 font-mono text-slate-100">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            <h1 className="text-2xl font-black uppercase tracking-wide text-white">
              Monitoreo de unidades activas
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            El estado En ruta se obtiene de los pedidos que el Chofer inició.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchActiveUnits}
          className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
        >
          🔄 Actualizar monitoreo
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-900/60 bg-rose-950/40 p-4 text-xs text-rose-400">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => setError('')} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="block text-[10px] font-bold uppercase text-slate-500">En ruta activa</span>
          <div className="mt-1 flex items-center gap-2 text-2xl font-black text-amber-400">
            🚚 {metrics.inRoute} <span className="text-xs font-normal text-slate-400">unidades</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="block text-[10px] font-bold uppercase text-slate-500">Disponibles</span>
          <div className="mt-1 flex items-center gap-2 text-2xl font-black text-emerald-400">
            ✅ {metrics.available} <span className="text-xs font-normal text-slate-400">unidades</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="block text-[10px] font-bold uppercase text-slate-500">Capacidad en tránsito</span>
          <div className="mt-1 flex items-center gap-2 text-2xl font-black text-white">
            📦 {metrics.capacityInTransit.toLocaleString('es-MX', { maximumFractionDigits: 1 })}
            <span className="text-xs font-normal text-slate-400">t</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Consultando unidades y pedidos...</div>
      ) : activeUnits.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 py-16 text-center text-xs text-slate-500">
          No hay unidades activas registradas.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeUnits.map((unit) => (
            <article
              key={unit.id}
              className={`space-y-4 rounded-2xl border bg-slate-900/60 p-5 shadow-xl ${
                unit.status === 'IN_ROUTE'
                  ? 'border-amber-500/40'
                  : 'border-emerald-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="block text-lg font-black text-white">{unit.unitNumber}</span>
                  <span className="text-xs text-slate-400">{unit.model || 'Camión de carga'}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                    unit.status === 'IN_ROUTE'
                      ? 'border-amber-800 bg-amber-950 text-amber-400'
                      : 'border-emerald-800 bg-emerald-950 text-emerald-400'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {unit.status === 'IN_ROUTE' ? 'En ruta' : 'Disponible'}
                </span>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950 p-3 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Placas</span>
                  <span className="font-bold text-slate-200">{unit.plate}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Chofer</span>
                  <span className="font-medium text-white">{unit.driverName || 'Sin asignar'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Capacidad</span>
                  <span className="font-bold text-emerald-400">
                    {unit.capacityTons.toLocaleString('es-MX', { maximumFractionDigits: 1 })} t
                  </span>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-800/60 pt-2">
                  <span className="text-slate-500">Pedidos en ruta</span>
                  <span className="font-bold text-amber-400">{unit.activeOrders.length}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Pedidos esperando</span>
                  <span className="font-bold text-cyan-400">{unit.waitingOrders.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="rounded-xl border border-slate-700 bg-slate-950 py-2 text-[10px] font-black uppercase text-cyan-300 hover:bg-slate-800"
                >
                  📦 Ver pedidos
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/fleet')}
                  className="rounded-xl border border-slate-700 bg-slate-950 py-2 text-[10px] font-black uppercase text-emerald-300 hover:bg-slate-800"
                >
                  ⚙️ Gestionar unidad
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
