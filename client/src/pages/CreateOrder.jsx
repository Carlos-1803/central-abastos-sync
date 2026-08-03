import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole, ROLES } from '../utils/roles';
import api from '../services/api';
import { saveOrderOffline, getPendingOfflineOrders, removeOfflineOrder } from '../services/offlineStorage';

const CLIENT_CACHE_KEY = 'central-abastos-clients';
const PRODUCT_CACHE_KEY = 'central-abastos-products';

const readCachedList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export default function NewOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const returnPath = normalizeRole(user?.role) === ROLES.ADMIN ? '/orders' : '/levanta-pedidos';
  const requestedProductId = searchParams.get('product');

  const [customers, setCustomers] = useState(() => readCachedList(CLIENT_CACHE_KEY));
  const [products, setProducts] = useState(() => readCachedList(PRODUCT_CACHE_KEY));
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', address: '' });

  // Coordenadas reales obtenidas por GPS
  const [location, setLocation] = useState({ lat: null, lng: null, accuracy: null });
  const [locationError, setLocationError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Red & Estado Offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);

  // Formulario
  const [customerId, setCustomerId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: 0 }]);

  useEffect(() => {
    if (!requestedProductId || products.length === 0) return;

    const selectedProduct = products.find(
      (product) => String(product.id) === String(requestedProductId) && product.isActive !== false
    );
    if (!selectedProduct) return;

    setItems((current) => {
      if (current.some((item) => String(item.productId) === String(requestedProductId))) {
        return current;
      }

      const firstEmptyIndex = current.findIndex((item) => !item.productId);
      if (firstEmptyIndex < 0) {
        return [
          ...current,
          { productId: String(selectedProduct.id), quantity: 1, unitPrice: selectedProduct.price || 0 },
        ];
      }

      return current.map((item, index) =>
        index === firstEmptyIndex
          ? { ...item, productId: String(selectedProduct.id), unitPrice: selectedProduct.price || 0 }
          : item
      );
    });
  }, [products, requestedProductId]);

  // Escuchar estado de conexión (Online / Offline)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingOrders(); // Intentar sincronizar cuando vuelva el internet
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cargar posición GPS inicial
    getCurrentGPSLocation();

    // Cargar datos base y checar cola offline
    loadInitialData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      if (navigator.onLine) {
        const [clientsResult, productsResult] = await Promise.allSettled([
          api.get('/clients'),
          api.get('/products'),
        ]);

        if (clientsResult.status === 'fulfilled') {
          const clients = clientsResult.value.data || [];
          setCustomers(clients);
          localStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(clients));
        }

        if (productsResult.status === 'fulfilled') {
          const availableProducts = productsResult.value.data || [];
          setProducts(availableProducts);
          localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(availableProducts));
        }

        if (clientsResult.status === 'rejected' || productsResult.status === 'rejected') {
          setMessage({
            type: 'warning',
            text: 'No se pudo actualizar todo el catálogo. Se conservaron los datos disponibles en el dispositivo.',
          });
        }
      }
      checkOfflineQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const checkOfflineQueue = async () => {
    const pending = await getPendingOfflineOrders();
    setOfflineCount(pending.length);
  };

  // Obtener geolocalización física real
  const getCurrentGPSLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu dispositivo no soporta geolocalización por hardware.');
      return;
    }

    setGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy, // Precisión en metros
        });
        setGettingLocation(false);
      },
      (err) => {
        console.error('Error GPS:', err);
        setLocationError('No se pudo obtener la ubicación GPS real. Verifica tus permisos.');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true, // Forzar uso de GPS real
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Función para sincronizar pedidos guardados offline hacia la API central
  const syncPendingOrders = async () => {
    const pending = await getPendingOfflineOrders();
    if (pending.length === 0) return;

    setMessage({ type: 'info', text: `Sincronizando ${pending.length} orden(es) almacenadas en el dispositivo...` });
    let synchronized = 0;
    let failed = 0;

    for (const order of pending) {
      try {
        const { offlineId, createdOfflineAt, ...payload } = order;
        await api.post('/orders', payload);
        await removeOfflineOrder(offlineId);
        synchronized += 1;
      } catch (err) {
        failed += 1;
        console.error('Error sincronizando orden individual:', err);
      }
    }

    await checkOfflineQueue();
    if (failed > 0) {
      setMessage({
        type: 'warning',
        text: `${synchronized} orden(es) sincronizadas y ${failed} pendientes. Revisa clientes, productos o conexión.`,
      });
    } else {
      setMessage({ type: 'success', text: 'Todas las órdenes offline fueron sincronizadas correctamente.' });
    }
  };

  const handleCreateClient = async (event) => {
    event.preventDefault();

    if (!newClient.name.trim()) {
      setMessage({ type: 'error', text: 'Escribe el nombre del cliente.' });
      return;
    }

    try {
      setCreatingClient(true);
      setMessage(null);
      const response = await api.post('/clients', {
        name: newClient.name.trim(),
        phone: newClient.phone.trim(),
        address: newClient.address.trim(),
        isActive: true,
      });
      const createdClient = response.data;
      const updatedClients = [...customers, createdClient].sort((a, b) =>
        String(a.name).localeCompare(String(b.name), 'es')
      );
      setCustomers(updatedClients);
      localStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(updatedClients));
      setCustomerId(String(createdClient.id));
      setNewClient({ name: '', phone: '', address: '' });
      setShowClientForm(false);
      setMessage({ type: 'success', text: 'Cliente registrado y seleccionado.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.response?.data || 'No se pudo registrar el cliente.',
      });
    } finally {
      setCreatingClient(false);
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'productId') {
      const selected = products.find((p) => p.id.toString() === value.toString());
      if (selected) updated[index].unitPrice = selected.price || 0;
    }
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      setMessage({ type: 'error', text: 'Selecciona un cliente.' });
      return;
    }

    if (!deliveryAddress.trim()) {
      setMessage({ type: 'error', text: 'Escribe la dirección o referencia de entrega.' });
      return;
    }

    if (items.some((item) => !item.productId || Number(item.quantity) < 1)) {
      setMessage({ type: 'error', text: 'Selecciona un producto y una cantidad válida en cada partida.' });
      return;
    }

    if (location.lat == null || location.lng == null) {
      setMessage({ type: 'error', text: 'Se requiere la posición GPS real antes de levantar la orden.' });
      return;
    }

    const payload = {
      clientId: parseInt(customerId),
      createdByUserId: user?.id || null,
      deliveryAddress: deliveryAddress.trim(),
      deliveryLatitude: location.lat,
      deliveryLongitude: location.lng,
      notes: notes || null,
      items: items.map((i) => ({
        productId: parseInt(i.productId),
        quantity: parseInt(i.quantity),
        unitPrice: parseFloat(i.unitPrice),
      })),
    };

    setSubmitting(true);

    if (!navigator.onLine) {
      // MODO OFFLINE: Guardar localmente en el navegador
      await saveOrderOffline(payload);
      await checkOfflineQueue();
      setSubmitting(false);
      setMessage({
        type: 'warning',
        text: '📶 Sin señal de internet/telefonía. La orden fue guardada de forma segura en tu dispositivo y se enviará automáticamente cuando recuperes señal.',
      });
      // Reset campos
      setItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
      setNotes('');
      return;
    }

    // MODO ONLINE: Enviar directo a la API Central
    try {
      await api.post('/orders', payload);
      setMessage({ type: 'success', text: 'Orden enviada e ingresada correctamente a la Central.' });
      setTimeout(() => navigate(returnPath), 1200);
    } catch (err) {
      console.error(err);

      if (!err.response) {
        // Solo los errores reales de conexión se conservan para reintento offline.
        await saveOrderOffline(payload);
        await checkOfflineQueue();
        setMessage({
          type: 'warning',
          text: 'Conexión inestable. Se guardó la orden en el dispositivo para reintentar la sincronización.',
        });
      } else {
        setMessage({
          type: 'error',
          text: err.response?.data?.message || err.response?.data || 'La API rechazó el pedido. Revisa los datos capturados.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-slate-100 font-mono">
      {/* Banner de Estado de Red / Pendientes Offline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border border-slate-800 p-3.5 rounded-2xl mb-6">
        <div className="flex items-center gap-2.5">
          <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
          <span className="text-xs font-bold uppercase">
            Estado de Red: {isOnline ? <span className="text-emerald-400">ONLINE</span> : <span className="text-rose-400">SIN SEÑAL / OFFLINE</span>}
          </span>
        </div>

        {offlineCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded-full text-[11px] font-bold">
              📦 {offlineCount} orden(es) pendientes en cola
            </span>
            {isOnline && (
              <button
                type="button"
                onClick={syncPendingOrders}
                className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-lg uppercase hover:bg-emerald-400"
              >
                Sincronizar Ya
              </button>
            )}
          </div>
        )}
      </div>

      {/* Header Formulario */}
      <div className="border-b border-slate-800 pb-5 mb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">Crear Nueva Orden</h1>
        <p className="text-xs text-slate-400 mt-1">
          Captura geográfica en tiempo real con soporte offline de contingencia • Central Abastos Sync
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs border ${
            message.type === 'error'
              ? 'bg-rose-950/40 text-rose-400 border-rose-900'
              : message.type === 'warning'
              ? 'bg-amber-950/40 text-amber-400 border-amber-900'
              : 'bg-emerald-950/40 text-emerald-400 border-emerald-900'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl space-y-6 shadow-2xl">
        {/* Bloque GPS Real Obligatorio */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase">📍 Posición GPS Real del Dispositivo</span>
            <button
              type="button"
              onClick={getCurrentGPSLocation}
              disabled={gettingLocation}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 rounded-lg text-xs"
            >
              {gettingLocation ? 'Obteniendo GPS...' : '🔄 Actualizar Ubicación'}
            </button>
          </div>

          {location.lat && location.lng ? (
            <div className="text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">LATITUD</span>
                <span className="text-emerald-400 font-bold">{location.lat.toFixed(6)}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">LONGITUD</span>
                <span className="text-emerald-400 font-bold">{location.lng.toFixed(6)}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PRECISIÓN GPS</span>
                <span className="text-slate-300 font-bold">±{Math.round(location.accuracy || 0)} m</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-400">{locationError || 'Buscando señal de satélites GPS...'}</p>
          )}
        </div>

        {/* Cliente */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="block text-xs font-bold uppercase text-slate-400">Cliente *</label>
            {isOnline && (
              <button
                type="button"
                onClick={() => setShowClientForm((current) => !current)}
                className="rounded-lg border border-cyan-800/70 bg-cyan-950/50 px-3 py-1.5 text-[10px] font-black uppercase text-cyan-300"
              >
                {showClientForm ? 'Cerrar registro' : '➕ Cliente nuevo'}
              </button>
            )}
          </div>

          <select
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            disabled={loadingData}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white disabled:opacity-50"
          >
            <option value="">-- Selecciona un cliente --</option>
            {customers.filter((client) => client.isActive !== false).map((client) => (
              <option key={client.id} value={client.id}>
                {client.name || client.businessName}
              </option>
            ))}
          </select>

          {customers.length === 0 && (
            <p className="rounded-lg border border-amber-800/50 bg-amber-950/30 p-3 text-xs text-amber-300">
              No hay clientes disponibles. Con conexión, registra uno nuevo antes de guardar el pedido.
            </p>
          )}

          {showClientForm && (
            <div className="grid gap-3 rounded-xl border border-cyan-900/60 bg-slate-950 p-4 sm:grid-cols-2">
              <input
                type="text"
                value={newClient.name}
                onChange={(event) => setNewClient((current) => ({ ...current, name: event.target.value }))}
                placeholder="Nombre o negocio *"
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-white sm:col-span-2"
              />
              <input
                type="tel"
                value={newClient.phone}
                onChange={(event) => setNewClient((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Teléfono"
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-white"
              />
              <input
                type="text"
                value={newClient.address}
                onChange={(event) => setNewClient((current) => ({ ...current, address: event.target.value }))}
                placeholder="Dirección"
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleCreateClient}
                disabled={creatingClient}
                className="rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-black uppercase text-slate-950 disabled:opacity-50 sm:col-span-2"
              >
                {creatingClient ? 'Registrando...' : 'Guardar cliente'}
              </button>
            </div>
          )}
        </div>

        {/* Dirección de Entrega opcional */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Dirección / Referencia de Entrega *</label>
          <input
            type="text"
            placeholder="Bodega, tramo de carretera, referencia visual..."
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600"
          />
        </div>

        {/* Ítems del Pedido */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase text-slate-400">Productos a Pedir</label>
          {items.map((item, index) => (
            <div key={index} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <select
                  required
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="">-- Selecciona un producto --</option>
                  {products.filter((product) => product.isActive !== false).map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} • Stock: {product.stock}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-28">
                <input
                  type="number"
                  min="1"
                  placeholder="Cantidad"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="w-full sm:w-32">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Precio"
                  value={item.unitPrice}
                  readOnly
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400"
                />
              </div>
              {items.length > 1 && (
                <button type="button" onClick={() => handleRemoveItem(index)} className="text-rose-400 font-bold px-2">
                  🗑️
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-2 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl text-xs font-bold"
          >
            ➕ Otro producto
          </button>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Notas</label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
          ></textarea>
        </div>

        {/* Botón Acción */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate(returnPath)}
            className="px-5 py-2.5 bg-slate-950 text-slate-400 border border-slate-800 rounded-xl text-xs font-bold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2.5 font-black rounded-xl text-xs uppercase shadow-lg transition-all ${
              !isOnline
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
            }`}
          >
            {submitting
              ? 'Procesando...'
              : !isOnline
              ? '💾 Guardar en Dispositivo (Offline)'
              : '🚀 Crear y Enviar Orden'}
          </button>
        </div>
      </form>
    </div>
  );
}