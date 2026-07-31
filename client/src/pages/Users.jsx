import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [error, setError] = useState(null);

  // Estados para Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    role: 'LOGISTICS', // ADMIN, LOGISTICS, DRIVER, LEVANTA_PEDIDOS
    status: 'ACTIVE',   // ACTIVE, INACTIVE
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudo conectar con el servidor para cargar los usuarios.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      role: 'LOGISTICS',
      status: 'ACTIVE',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      role: user.roleName || 'LOGISTICS',
      status: user.status || 'ACTIVE',
      password: '', // Dejar en blanco si no se va a actualizar la clave
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mapeo del nombre del rol a ID numérico para tu API de .NET
      // (Ajusta el número '4' si en tu base de datos 'Levanta Pedidos' tiene otro ID)
      const roleMapping = {
        'ADMIN': 1,
        'LOGISTICS': 2,
        'DRIVER': 3,
        'LEVANTA_PEDIDOS': 4,
      };

      const payload = {
        username: formData.username,
        roleId: roleMapping[formData.role] || 2,
      };

      if (formData.password) {
        payload.password = formData.password;
        payload.newPassword = formData.password;
      }

      if (editingUser) {
        const res = await api.put(`/users/${editingUser.id || editingUser.Id}`, payload);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id || u.Id === editingUser.Id ? { ...u, ...res.data } : u))
        );
      } else {
        const res = await api.post('/users', payload);
        const newUser = res.data;
        setUsers((prev) => [newUser, ...prev]);
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error detallado al guardar:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error al guardar el usuario en el servidor.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id && u.Id !== id));
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el usuario en el servidor.');
    }
  };

  const getRoleBadge = (roleName) => {
    switch (roleName?.toUpperCase()) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-400 border border-purple-800/60 uppercase">
            ⚡ Admin
          </span>
        );
      case 'DRIVER':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60 uppercase">
            🚛 Chofer
          </span>
        );
      case 'LOGISTICS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800/60 uppercase">
            📦 Logística
          </span>
        );
      case 'LEVANTA_PEDIDOS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 uppercase">
            📝 Levanta Pedidos
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
            👤 {roleName || 'Usuario'}
          </span>
        );
    }
  };

  const filteredUsers = users.filter((u) => {
    const username = u.username || u.name || '';
    const roleName = u.roleName || u.role || '';
    
    const matchesSearch = username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || roleName.toUpperCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-2xl font-black tracking-wide text-white uppercase">
              Gestión de Usuarios
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Administración de cuentas, roles y permisos • Central Abastos Sync
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs tracking-wider uppercase shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <span>👤+</span> Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/40 text-rose-400 border border-rose-900/60 p-4 rounded-xl text-xs flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Buscador y Filtro por Rol */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-500 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre de usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'ADMIN', label: 'Admins' },
            { id: 'LOGISTICS', label: 'Logística' },
            { id: 'DRIVER', label: 'Choferes' },
            { id: 'LEVANTA_PEDIDOS', label: 'Levanta Pedidos' },
          ].map((rf) => (
            <button
              key={rf.id}
              onClick={() => setRoleFilter(rf.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                roleFilter === rf.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {rf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Rol</th>
                <th className="py-3.5 px-4">Estatus</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500 animate-pulse">
                    Cargando usuarios del sistema...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    No se encontraron usuarios coincidentes.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const userId = u.id || u.Id;
                  const username = u.username || u.name;
                  const roleName = u.roleName || u.role;
                  const status = u.status || 'ACTIVE';

                  return (
                    <tr key={userId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-black text-xs">
                          {username?.charAt(0).toUpperCase()}
                        </div>
                        {username}
                      </td>
                      <td className="py-3.5 px-4">{getRoleBadge(roleName)}</td>
                      <td className="py-3.5 px-4">
                        {status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-rose-400 font-bold uppercase">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Editar Usuario"
                            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(userId)}
                            title="Eliminar Usuario"
                            className="p-1.5 bg-slate-950 hover:bg-rose-950/60 text-rose-400 border border-slate-800 rounded-lg text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase text-white">
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. juanPerez"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Contraseña {editingUser && '(Dejar en blanco para no cambiar)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="LOGISTICS">Logística</option>
                    <option value="DRIVER">Chofer</option>
                    <option value="LEVANTA_PEDIDOS">Levanta Pedidos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Estatus
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
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
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}