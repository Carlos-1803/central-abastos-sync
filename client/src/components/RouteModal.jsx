import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Icono personalizado para los marcadores en el mapa
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function RouteModal({ isOpen, onClose, origin, destination, orderId }) {
  if (!isOpen) return null;

  // Coordenadas por defecto (ej. Central de Abastos como origen)
  const originCoords = origin || [19.3712, -99.0906]; 
  const destCoords = destination || [19.4326, -99.1332]; // Coordenadas del cliente

  const polylineCoords = [originCoords, destCoords];
  const centerCoords = [
    (originCoords[0] + destCoords[0]) / 2,
    (originCoords[1] + destCoords[1]) / 2
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold font-mono tracking-wide text-white uppercase flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Ruta de Entrega - Orden #{orderId || '---'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">Trazado directo desde Central de Abastos al destino</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Contenedor del Mapa */}
        <div className="h-96 w-full rounded-xl overflow-hidden border border-slate-800">
          <MapContainer
            center={centerCoords}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Marcador de Origen */}
            <Marker position={originCoords} icon={customIcon}>
              <Popup>
                <strong className="font-mono">Punto de Origen</strong><br />Central de Abastos
              </Popup>
            </Marker>

            {/* Marcador de Destino */}
            <Marker position={destCoords} icon={customIcon}>
              <Popup>
                <strong className="font-mono">Punto de Entrega</strong><br />Cliente
              </Popup>
            </Marker>

            {/* Línea de Ruta */}
            <Polyline positions={polylineCoords} color="#10b981" weight={4} dashArray="8, 8" />
          </MapContainer>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>📍 <span className="text-slate-300">Origen:</span> {originCoords.join(', ')}</div>
          <div>🏁 <span className="text-slate-300">Destino:</span> {destCoords.join(', ')}</div>
        </div>
      </div>
    </div>
  );
}