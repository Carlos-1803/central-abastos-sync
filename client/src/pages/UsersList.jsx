import { useEffect, useState } from 'react';
import axiosClient from '../services/axiosClient';

export const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulario para crear usuario
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleId, setNewRoleId] = useState(1);

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Crear usuario
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/users', {
        username: newUsername,
        password: newPassword,
        roleId: Number(newRoleId),
      });

      setNewUsername('');
      setNewPassword('');
      fetchUsers(); // Recargar lista
    } catch (err) {
      alert(err.response?.data || 'Error al crear el usuario.');
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario ${username}?`)) return;

    try {
      await axiosClient.delete(`/users/${id}`);
      fetchUsers(); // Recargar lista
    } catch (err) {
      alert('Error al eliminar el usuario.');
    }
  };

  return (
    <div className="users-container">
      <h2>Gestión de Empleados</h2>

      {/* Formulario de Alta de Empleado */}
      <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Registrar Nuevo Empleado</h3>
        <form onSubmit={handleCreateUser}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <select value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)}>
            <option value={1}>ADMIN</option>
            <option value={2}>LEVANTA PEDIDOS</option>
            <option value={3}>BODEGA</option>
            <option value={4}>CHOFER</option>
          </select>
          <button type="submit">Crear Empleado</button>
        </form>
      </section>

      {/* Tabla/Lista de Usuarios */}
      {loading ? (
        <p>Cargando empleados...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.roleName}</td>
                <td>
                  <button onClick={() => handleDeleteUser(u.id, u.username)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersList;