import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para el Modal (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Cargar lista de clientes
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Error al obtener clientes:', err);
      setError('No se pudieron cargar los clientes. Revisa la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Abrir modal para crear
  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({ name: '', phone: '', address: '', isActive: true });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone || '',
      address: client.address || '',
      isActive: client.isActive
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  // Guardar (POST o PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingClient) {
        // Actualizar cliente existente
        await api.put(`/clients/${editingClient.id}`, {
          id: editingClient.id,
          ...formData
        });
      } else {
        // Crear nuevo cliente
        await api.post('/clients', formData);
      }
      
      handleCloseModal();
      fetchClients(); // Recargar la lista
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      alert('Ocurrió un error al guardar el cliente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Cambiar estado rápido (Activo/Inactivo)
  const handleToggleStatus = async (client) => {
    try {
      await api.put(`/clients/${client.id}`, {
        ...client,
        isActive: !client.isActive
      });
      fetchClients();
    } catch (err) {
      console.error('Error al cambiar el estado del cliente:', err);
      alert('No se pudo actualizar el estado.');
    }
  };

  // Filtrado de la lista por nombre o teléfono
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Clientes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Administra la información de contacto y estado de los clientes.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      {/* Barra de Filtro / Búsqueda */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Contenido / Tabla */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando clientes...</div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Dirección</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron clientes registradas.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {client.phone || <span className="text-gray-400 italic">Sin teléfono</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {client.address || <span className="text-gray-400 italic">Sin dirección</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(client)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80 ${
                            client.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {client.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(client)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre Completo / Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej. Frutería El Don"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej. 9811234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dirección
                </label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Dirección fiscal o de entrega..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cliente Activo
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingClient ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}