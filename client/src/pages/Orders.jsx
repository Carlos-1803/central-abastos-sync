import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Search,
  MapPin,
  ChevronDown,
  Mail,
  Phone,
  User,
  Printer,
  ClipboardList
} from 'lucide-react';

const statusOrder = [
  'Pending',
  'Confirmed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const statusConfig = {
  Pending: { label: 'Abierto', color: 'bg-yellow-100 text-yellow-800' },
  Confirmed: { label: 'En preparación', color: 'bg-orange-100 text-orange-800' },
  Shipped: { label: 'Listo', color: 'bg-blue-100 text-blue-800' },
  'Out for Delivery': { label: 'En camino', color: 'bg-purple-100 text-purple-800' },
  Delivered: { label: 'Finalizado', color: 'bg-green-100 text-green-800' },
  Cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState(new Set());

  const toggleSection = (status) => {
    const newSet = new Set(openSections);
    if (newSet.has(status)) {
      newSet.delete(status);
    } else {
      newSet.add(status);
    }
    setOpenSections(newSet);
  };

  const isSectionOpen = (status) => openSections.has(status);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        setOrders(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('No se pudieron cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter and search
  const filteredOrders = orders.filter(
    (order) =>
      order.id?.toString().includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by status
  const grouped = {};
  filteredOrders.forEach((order) => {
    const status = order.status || 'Pending';
    if (!grouped[status]) {
      grouped[status] = [];
    }
    grouped[status].push(order);
  });

  // Render status sections
  const renderStatusSections = () => {
    return statusOrder.map((status) => {
      const items = grouped[status] || [];
      const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
      const isOpen = isSectionOpen(status);
      return (
        <div key={status} className="w-full">
          <div
            onClick={() => toggleSection(status)}
            className="flex w-full items-center justify-between bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
              >
                {items.length}
              </span>
              <span className="text-sm font-medium">{config.label}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transform duration-200 ${
                isOpen ? '-rotate-180' : ''
              }`}
            />
          </div>
          {isOpen && (
            <div className="mt-2 space-y-2">
              {items.length === 0 ? (
                <p className="text-sm text-gray-500 px-4 py-2">No hay órdenes en este estado</p>
              ) : (
                items.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => {
                      if (!order.items || order.items.length === 0) {
                        api
                          .get(`/orders/${order.id}`)
                          .then((res) => {
                            setSelectedOrder(res.data);
                          })
                          .catch((err) => console.error(err));
                      } else {
                        setSelectedOrder(order);
                      }
                    }}
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}
                    >
                      {config.label}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Orden #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {order.customerName || 'Cliente desconocido'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.date)}
                      </p>
                      <p className="text-sm font-semibold">
                        Total: ${Number(order.totalAmount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    });
  };

  // Order detail panel
  const renderOrderDetail = () => {
    if (!selectedOrder) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
          Selecciona una orden para ver los detalles.
        </div>
      );
    }

    const config = statusConfig[selectedOrder.status] || statusConfig.Pending;
    const items = selectedOrder.items || [];
    const subtotal = items.reduce(
      (sum, item) => sum + (item.unitPrice * item.quantity),
      0
    );

    return (
      <div className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Left: Order Info & Actions */}
          <div className="w-full flex-1 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Marcar como listo (funcionalidad pendiente)')}
                    className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                  >
                    Listo
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Está seguro de cancelar esta orden?')) {
                        alert('Cancelar orden (funcionalidad pendiente)');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              {/* Customer & Contact */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Cliente: {selectedOrder.customerName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Tel: {selectedOrder.customerPhone || 'No proporcionado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Dirección de entrega</p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {selectedOrder.deliveryAddress || 'Dirección no disponible'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Correo</p>
                    <p className="text-sm text-gray-500">{selectedOrder.customerEmail || 'No proporcionado'}</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="mb-2 font-semibold text-sm">Productos</p>
                <div className="space-y-2">
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <div key={index} className="flex justify-between py-2 border-t border-gray-100 first:border-t-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.productName || 'Producto'}</p>
                          <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right text-sm font-medium">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-2">No hay artículos en esta orden</p>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm font-medium">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold mt-1">
                  <span>Total:</span>
                  <span>${Number(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="font-semibold mb-2 text-sm">Notas</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{selectedOrder.notes}</p>
              </div>
            )}
          </div>

          {/* Right Summary Panel */}
          <div className="w-full sm:w-64 bg-white rounded-lg border border-gray-200 p-4 space-y-4 h-fit">
            <div className="space-y-2">
              <p className="font-semibold text-sm">Resumen</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span>Estado:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Artículos:</span>
                  <span>{items.length}</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="font-semibold mb-2 text-sm">Acciones rápidas</p>
              <div className="space-y-2">
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir ticket</span>
                </button>
                <button
                  onClick={() => alert('Notificar al cliente (pendiente)')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Notificar cliente</span>
                </button>
                <button
                  onClick={() => alert('Asignar conductor (pendiente)')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Asignar conductor</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setSelectedOrder(null)}
            className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            ← Volver a la lista
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="flex h-full items-center justify-center p-8">Cargando...</div>;
  if (error)
    return (
      <div className="flex h-full items-center justify-center text-red-500 p-8">
        {error}
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-gray-50">
      {/* Encabezado */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-blue-600" />
          Gestión de Órdenes
        </h1>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por ID o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          onClick={() => setSearchTerm('')}
          className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors text-sm font-medium disabled:opacity-50"
          disabled={!searchTerm}
        >
          Limpiar
        </button>
      </div>

      {/* Main content: two columns (list + detail) */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left: Status sections & orders list */}
        <div className="flex-1 w-full space-y-4">
          {renderStatusSections()}
        </div>

        {/* Right: Order detail panel */}
        <div className="w-full md:w-1/2 min-w-0">
          {renderOrderDetail()}
        </div>
      </div>
    </div>
  );
};

export default Orders;