import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Obtener catálogo de productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudo conectar con el catálogo de productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', stock: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      isActive: product.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10)
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, { id: editingProduct.id, ...payload });
      } else {
        await api.post('/products', payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      alert('Error al guardar el producto en el catálogo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Cálculo de métricas
  const lowStockThreshold = 15;
  const lowStockCount = products.filter((p) => p.stock <= lowStockThreshold).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Industrial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h1 className="text-2xl font-black tracking-wide text-white uppercase font-mono">
              Inventario & Productos
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Control de existencias en bodega, catálogo general y valorización de inventario.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 text-sm tracking-wide"
        >
          <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          NUEVO PRODUCTO
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">Catálogo Total</p>
            <p className="text-2xl font-extrabold text-white mt-1">{products.length} Ítems</p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-lg text-slate-300">📦</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">Stock Crítico / Bajo</p>
            <p className={`text-2xl font-extrabold mt-1 ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {lowStockCount} Productos
            </p>
          </div>
          <div className="p-3 bg-amber-950/40 rounded-lg text-amber-400">⚠️</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">Valor del Stock</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
              ${totalInventoryValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-emerald-950/40 rounded-lg text-emerald-400">💵</div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar producto por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabla de Productos */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono">Cargando existencias...</div>
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
                  <th className="px-6 py-3.5">Producto</th>
                  <th className="px-6 py-3.5">Descripción</th>
                  <th className="px-6 py-3.5">Precio Unit.</th>
                  <th className="px-6 py-3.5">Stock Disponible</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500 font-mono">
                      No hay productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const isLow = product.stock <= lowStockThreshold;
                    const isOut = product.stock === 0;

                    return (
                      <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs max-w-xs truncate">
                          {product.description || <span className="italic text-slate-600">Sin descripción</span>}
                        </td>
                        <td className="px-6 py-4 font-mono text-cyan-400 font-semibold">
                          ${product.price ? product.price.toFixed(2) : '0.00'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold ${
                                isOut
                                  ? 'text-rose-500'
                                  : isLow
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {product.stock} u.
                            </span>
                            {isOut && (
                              <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800 px-1.5 py-0.5 rounded font-mono uppercase">
                                AGOTADO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                              product.isActive
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${product.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                            {product.isActive ? 'DISPONIBLE' : 'INACTIVO'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="text-slate-400 hover:text-cyan-400 font-mono text-xs underline underline-offset-4 transition-colors"
                          >
                            EDITAR
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Neón */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold font-mono tracking-wide text-white uppercase">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm font-mono">
              <div>
                <label className="block text-slate-400 mb-1 text-xs uppercase">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Ej. Costal de Jitomate 25kg"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-xs uppercase">Descripción</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Detalles sobre calidad, variedad o empaque..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 text-xs uppercase">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="450.00"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-xs uppercase">Stock (Unidades) *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="productActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="productActive" className="text-slate-300 text-xs uppercase">
                  Producto Activo en Catálogo
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'GUARDANDO...' : 'GUARDAR PRODUCTO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}