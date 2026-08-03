import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { normalizeRole, ROLES } from '../utils/roles';

export default function Trucks() {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState(null);

  // Estados para Modal de Alta/Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [formData, setFormData] = useState({
    unitNumber: '',
    plate: '',
    model: '',
    year: new Date().getFullYear(),
    driverId: '',
    capacityTons: '',
    status: 'AVAILABLE', // AVAILABLE, MAINTENANCE
  });

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      setError(null);
      const [trucksResponse, usersResponse] = await Promise.all([
        api.get('/trucks'),
        api.get('/users'),
      ]);

      const normalizedTrucks = (trucksResponse.data || []).map((truck) => ({
        ...truck,
        unitNumber: truck.unitNumber || `CAM-${String(truck.id).padStart(2, '0')}`,
        plate: truck.plateNumber || truck.plate || '',
        capacityTons: Number(truck.capacityKg || 0) / 1000,
        status: truck.isActive === false ? 'MAINTENANCE' : 'AVAILABLE',
      }));

      const availableDrivers = (usersResponse.data || []).filter(
        (user) => normalizeRole(user.roleName || user.role) === ROLES.DRIVER
      );

      setTrucks(normalizedTrucks);
      setDrivers(availableDrivers);
    } catch (err) {
      console.error('Error al cargar flotilla:', err);
      setTrucks([]);
      setDrivers([]);
      setError(err.response?.data?.message || 'No se pudo cargar la flotilla.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTruck(null);
    setFormData({
      unitNumber: '',
      plate: '',
      model: '',
      year: new Date().getFullYear(),
      driverId: '',
      capacityTons: '',
      status: 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (truck) => {
    setEditingTruck(truck);
    setFormData({
      unitNumber: truck.unitNumber || '',
      plate: truck.plate || '',
      model: truck.model || '',
      year: truck.year || new Date().getFullYear(),
      driverId: truck.driverId || '',
      capacityTons: truck.capacityTons || '',
      status: truck.status || 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        plateNumber: formData.plate.trim().toUpperCase(),
        model: formData.model.trim(),
        year: Number(formData.year),
        capacityKg: (parseFloat(formData.capacityTons) || 0) * 1000,
        isActive: formData.status !== 'MAINTENANCE',
        driverId: Number(formData.driverId),
      };

      const selectedDriver = drivers.find((driver) => driver.id === Number(formData.driverId));
      const localTruckData = {
        ...payload,
        unitNumber: formData.unitNumber,
        plate: payload.plateNumber,
        capacityTons: payload.capacityKg / 1000,
        status: formData.status,
        driverName: selectedDriver?.username || 'Sin chofer',
      };

      if (editingTruck) {
        await api.put(`/trucks/${editingTruck.id}`, payload);
        setTrucks((prev) =>
          prev.map((t) => (t.id === editingTruck.id ? { ...t, ...localTruckData } : t))
        );
      } else {
        const res = await api.post('/trucks', payload);
        const newUnit = { ...res.data, ...localTruckData, id: res.data.id };
        setTrucks((prev) => [newUnit, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Error al procesar la unidad.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas dar de baja esta unidad de la flotilla?')) return;
    try {
      await api.delete(`/trucks/${id}`);
      setTrucks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el camión.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
            En Taller
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Disponible
          </span>
        );
    }
  };

  const filteredTrucks = trucks.filter((t) => {
    const matchesSearch =
      t.unitNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.plate?.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-2xl font-black tracking-wide text-white uppercase">
              Control de Flotilla y Camiones
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de unidades de carga, choferes y mantenimientos • Central Abastos Sync
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs tracking-wider uppercase shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <span>🚛</span> Registrar Camión
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/40 text-rose-400 border border-rose-900/60 p-4 rounded-xl text-xs flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Buscador y Filtros */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-500 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Buscar por unidad, placas o chofer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'AVAILABLE', label: 'Disponibles' },
            { id: 'MAINTENANCE', label: 'En Taller' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                statusFilter === st.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Camiones */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4">Unidad</th>
                <th className="py-3.5 px-4">Modelo / Placas</th>
                <th className="py-3.5 px-4">Chofer Asignado</th>
                <th className="py-3.5 px-4">Capacidad</th>
                <th className="py-3.5 px-4">Estatus</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 animate-pulse">
                    Cargando flotilla de camiones...
                  </td>
                </tr>
              ) : filteredTrucks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No se encontraron unidades registradas.
                  </td>
                </tr>
              ) : (
                filteredTrucks.map((truck) => (
                  <tr key={truck.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{truck.unitNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{truck.model || 'Sin especificar'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{truck.plate}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {truck.driverName || 'Sin Chofer'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {truck.capacityTons} Tons
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(truck.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(truck)}
                          title="Editar Camión"
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(truck.id)}
                          title="Dar de Baja"
                          className="p-1.5 bg-slate-950 hover:bg-rose-950/60 text-rose-400 border border-slate-800 rounded-lg text-xs"
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

      {/* Modal para Registrar / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase text-white">
                {editingTruck ? 'Editar Unidad' : 'Registrar Nuevo Camión'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    No. Unidad
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CAM-01"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Placas
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CR-88-290"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Modelo / Marca
                </label>
                <input
                  type="text"
                  placeholder="Kenworth T370"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Año de la unidad
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Chofer Asignado
                </label>
                <select
                  required
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="">-- Selecciona un chofer --</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.username}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Capacidad (Tons)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="10"
                    value={formData.capacityTons}
                    onChange={(e) => setFormData({ ...formData, capacityTons: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Estatus Inicial
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="AVAILABLE">Disponible</option>
                    <option value="MAINTENANCE">En Taller</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase"
                >
                  {editingTruck ? 'Guardar Cambios' : 'Registrar Unidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}