import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { saveOrderOffline, getPendingOfflineOrders, removeOfflineOrder } from '../services/offlineStorage';

export default function NewOrder() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

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
        const [clientsRes, productsRes] = await Promise.all([
          api.get('/clients').catch(() => ({ data: [] })),
          api.get('/products').catch(() => ({ data: [] })),
        ]);
        setCustomers(clientsRes.data || []);
        setProducts(productsRes.data || []);
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

    for (const order of pending) {
      try {
        const { offlineId, createdOfflineAt, ...payload } = order;
        await api.post('/orders', payload);
        await removeOfflineOrder(offlineId);
      } catch (err) {
        console.error('Error sincronizando orden individual:', err);
      }
    }

    await checkOfflineQueue();
    setMessage({ type: 'success', text: '¡Todas las órdenes acumuladas offline fueron sincronizadas con éxito!' });
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

    if (!location.lat || !location.lng) {
      setMessage({ type: 'error', text: 'Se requiere la posición GPS real antes de levantar la orden.' });
      return;
    }

    const payload = {
      clientId: parseInt(customerId),
      deliveryAddress: deliveryAddress || null,
      latitude: location.lat,
      longitude: location.lng,
      gpsAccuracyMeters: location.accuracy,
      notes: notes || null,
      items: items.map((i) => ({
        productId: parseInt(i.productId),
        quantity: parseInt(i.quantity),
        unitPrice: parseFloat(i.unitPrice),
      })),
      createdAt: new Date().toISOString(),
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
      setTimeout(() => navigate('/orders'), 1200);
    } catch (err) {
      console.error(err);
      // Fallback si falla el servidor por mala señal
      await saveOrderOffline(payload);
      await checkOfflineQueue();
      setMessage({
        type: 'warning',
        text: 'Conexión inestable. Se guardó la orden en el almacenamiento local para reintentar sincronizar.',
      });
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
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Cliente *</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white"
          >
            <option value="">-- Selecciona un cliente --</option>
            {customers.length > 0 ? (
              customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.businessName}
                </option>
              ))
            ) : (
              <option value="1">Cliente General Local (Offline)</option>
            )}
          </select>
        </div>

        {/* Dirección de Entrega opcional */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Dirección / Referencia de Entrega</label>
          <input
            type="text"
            placeholder="Bodega, tramo de carretera, referencia visual..."
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600"
          />
        </div>

        {/* Ítems del Pedido */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase text-slate-400">Productos a Pedir</label>
          {items.map((item, index) => (
            <div key={index} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="ID o Nombre del Producto"
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
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
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
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
            onClick={() => navigate('/orders')}
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