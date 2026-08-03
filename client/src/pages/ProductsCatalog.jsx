import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { normalizeRole, ROLES } from '../utils/roles';

export default function ProductsCatalog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentRole = normalizeRole(user?.role);
  const canCreateOrder = currentRole === ROLES.ADMIN;
  const canDelete = currentRole === ROLES.ADMIN;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [error, setError] = useState(null);

  // Estados para Modales (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Crear, Obj = Editar
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    price: '',
    stock: '',
    unit: 'Kg',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      setProducts((response.data || []).map((product) => ({
        ...product,
        code: product.code || `PRD-${String(product.id).padStart(3, '0')}`,
        category: product.category || 'GENERAL',
        unit: product.unit || 'Pza',
      })));
    } catch (err) {
      console.error('Error al obtener productos:', err);
      setProducts([]);
      setError(err.response?.data?.message || 'No se pudo cargar el catálogo de productos.');
    } finally {
      setLoading(false);
    }
  };

  // Abrir Modal para Crear
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({ code: '', name: '', category: 'VERDURAS', price: '', stock: '', unit: 'Kg' });
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code || '',
      name: product.name || '',
      category: product.category || 'GENERAL',
      price: product.price || 0,
      stock: product.stock || 0,
      unit: product.unit || 'Kg',
    });
    setIsModalOpen(true);
  };

  // Guardar (Crear o Actualizar)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        description: `${formData.category.toUpperCase()} • Unidad: ${formData.unit}`,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        isActive: true,
      };

      if (editingProduct) {
        // Actualizar vía API
        await api.put(`/products/${editingProduct.id}`, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload, code: formData.code, category: formData.category, unit: formData.unit } : p))
        );
      } else {
        // Crear vía API
        const res = await api.post('/products', payload);
        const newProd = { ...res.data, code: formData.code || `PRD-${String(res.data.id).padStart(3, '0')}`, category: formData.category, unit: formData.unit };
        setProducts((prev) => [newProd, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError('No se pudo guardar la información del producto.');
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto del catálogo?')) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError('No se pudo eliminar el producto.');
    }
  };

  // Obtener categorías únicas
  const categories = ['ALL', ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filtrado dinámico
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (stock) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-950/80 text-rose-400 border border-rose-800/50">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
          Agotado (0)
        </span>
      );
    }
    if (stock < 50) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-950/80 text-amber-400 border border-amber-800/50">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Stock Bajo ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        En Stock ({stock})
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-2xl font-black tracking-wide text-white uppercase">
              Catálogo de Productos
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de inventarios, precios y existencias • Central Abastos Sync
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs tracking-wider uppercase shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <span>➕</span> Agregar Producto
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
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Precio Unit.</th>
                <th className="py-3.5 px-4">Disponibilidad</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 animate-pulse">
                    Cargando catálogo de productos...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No se encontraron productos coincidentes.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{p.code || `PRD-${p.id}`}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {p.name}
                      <span className="text-[10px] text-slate-500 block font-normal">{p.unit || 'Pieza'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{p.category || 'GENERAL'}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ${p.price ? Number(p.price).toFixed(2) : '0.00'} MXN
                    </td>
                    <td className="py-3.5 px-4">{getStockBadge(p.stock)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canCreateOrder && (
                          <button
                            onClick={() => navigate(`/orders/new?product=${p.id}`)}
                            title="Crear orden con este producto"
                            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-lg text-xs"
                          >
                            🛒
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          title="Editar Producto"
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs"
                        >
                          ✏️
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Eliminar Producto"
                            className="p-1.5 bg-slate-950 hover:bg-rose-950/60 text-rose-400 border border-slate-800 rounded-lg text-xs"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear/Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase text-white">
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PRD-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VERDURAS"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jitomate Saladette"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.50"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Unidad
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Caja">Caja</option>
                    <option value="Costal">Costal</option>
                    <option value="Pieza">Pieza</option>
                    <option value="Tonelada">Tonelada</option>
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
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}