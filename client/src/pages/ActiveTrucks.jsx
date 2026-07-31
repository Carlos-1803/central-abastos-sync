import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ActiveTrucks() {
  const [activeUnits, setActiveUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveUnits();
  }, []);

  const fetchActiveUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/trucks').catch(() => api.get('/fleet'));
      const all = res?.data || [];
      // Filtrar solo las unidades activas (excluir mantenimiento)
      const activeOnly = all.filter((t) => t.status !== 'MAINTENANCE');
      setActiveUnits(activeOnly);
    } catch (err) {
      console.error('Error al cargar unidades activas:', err);
      // Datos demo de contingencia si falla el servidor
      setActiveUnits([
        { id: 1, unitNumber: 'CAM-01', plate: 'CR-88-290', model: 'Kenworth T370', driverName: 'Roberto Gómez', capacityTons: 12, status: 'IN_ROUTE', activeOrder: 'ORD-1092' },
        { id: 2, unitNumber: 'CAM-02', plate: 'CR-91-102', model: 'Isuzu Forward 1100', driverName: 'Carlos Pech', capacityTons: 8, status: 'AVAILABLE', activeOrder: null },
        { id: 4, unitNumber: 'CAM-04', plate: 'CR-33-019', model: 'Hino Series 500', driverName: 'Jorge Canul', capacityTons: 10, status: 'IN_ROUTE', activeOrder: 'ORD-1095' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar rápido el estado de la unidad (ej. Mandar a Taller o liberar a Disponible)
  const handleStatusChange = async (unitId, newStatus) => {
    try {
      await api.patch(`/trucks/${unitId}/status`, { status: newStatus }).catch(() => null);
      
      if (newStatus === 'MAINTENANCE') {
        // Remover de la vista de activas si pasa a mantenimiento
        setActiveUnits((prev) => prev.filter((u) => u.id !== unitId));
      } else {
        setActiveUnits((prev) =>
          prev.map((u) => (u.id === unitId ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err) {
      console.error('Error al actualizar estatus:', err);
      setError('No se pudo actualizar el estado de la unidad.');
    }
  };

  // Métricas rápidas
  const inRouteCount = activeUnits.filter((u) => u.status === 'IN_ROUTE').length;
  const availableCount = activeUnits.filter((u) => u.status === 'AVAILABLE').length;
  const totalCapacityInTransit = activeUnits
    .filter((u) => u.status === 'IN_ROUTE')
    .reduce((acc, curr) => acc + (parseFloat(curr.capacityTons) || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-mono">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h1 className="text-2xl font-black tracking-wide text-white uppercase">
            Monitoreo de Unidades Activas
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Flotilla disponible y en tránsito para logística de entregas • Central Abastos Sync
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/40 text-rose-400 border border-rose-900/60 p-4 rounded-xl text-xs flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tarjetas KPI de Estado Operativo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">En Ruta Activa</span>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-2">
            <span>🚚</span> {inRouteCount} <span className="text-xs font-normal text-slate-400">unidades</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Listos para Asignar</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
            <span>✅</span> {availableCount} <span className="text-xs font-normal text-slate-400">unidades</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Carga en Tránsito</span>
          <div className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <span>📦</span> ~{totalCapacityInTransit} <span className="text-xs font-normal text-slate-400">Tons</span>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Camiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 animate-pulse">
            Consultando estado de telemetría y unidades...
          </div>
        ) : activeUnits.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
            No hay unidades operativas registradas en este momento.
          </div>
        ) : (
          activeUnits.map((unit) => (
            <div
              key={unit.id}
              className={`bg-slate-900/60 backdrop-blur-md border rounded-2xl p-5 space-y-4 shadow-xl transition-all ${
                unit.status === 'IN_ROUTE'
                  ? 'border-amber-500/30 hover:border-amber-500/60'
                  : 'border-emerald-500/30 hover:border-emerald-500/60'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-lg font-black text-white block">{unit.unitNumber}</span>
                  <span className="text-xs text-slate-400">{unit.model || 'Camión de Carga'}</span>
                </div>
                {unit.status === 'IN_ROUTE' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    En Ruta
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    Disponible
                  </span>
                )}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Placas:</span>
                  <span className="font-mono text-slate-200 font-bold">{unit.plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operador:</span>
                  <span className="text-white font-medium">{unit.driverName || 'Sin Asignar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacidad Máx:</span>
                  <span className="text-emerald-400 font-bold">{unit.capacityTons} Toneladas</span>
                </div>
                {unit.activeOrder && (
                  <div className="flex justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-slate-500">Orden Asignada:</span>
                    <span className="text-amber-400 font-bold">{unit.activeOrder}</span>
                  </div>
                )}
              </div>

              {/* Acciones de Control Rápido */}
              <div className="flex gap-2 pt-1">
                {unit.status === 'IN_ROUTE' ? (
                  <button
                    onClick={() => handleStatusChange(unit.id, 'AVAILABLE')}
                    className="flex-1 py-2 bg-slate-950 hover:bg-emerald-950/60 text-emerald-400 border border-slate-800 rounded-xl text-[11px] font-bold uppercase transition-all"
                  >
                    🏁 Finalizar Ruta
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(unit.id, 'IN_ROUTE')}
                    className="flex-1 py-2 bg-slate-950 hover:bg-amber-950/60 text-amber-400 border border-slate-800 rounded-xl text-[11px] font-bold uppercase transition-all"
                  >
                    🚀 Enviar a Ruta
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange(unit.id, 'MAINTENANCE')}
                  title="Enviar a mantenimiento / taller"
                  className="px-3 py-2 bg-slate-950 hover:bg-rose-950/60 text-rose-400 border border-slate-800 rounded-xl text-xs"
                >
                  🛠️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}