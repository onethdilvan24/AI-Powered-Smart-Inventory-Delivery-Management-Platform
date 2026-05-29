import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Clock, MapPin, User, Phone, Navigation } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDeliveries } from '../hooks/useDeliveries';
import type { Delivery } from '../types';
import { formatDate } from '../lib/utils';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icon paths broken by Vite bundling
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const truckIcon = new L.DivIcon({
  className: '',
  html: `<div class="flex items-center justify-center w-9 h-9 bg-primary-600 rounded-full border-2 border-white shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const destIcon = new L.DivIcon({
  className: '',
  html: `<div class="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function MapFlyTo({ delivery }: { delivery: Delivery }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([delivery.currentPosition.lat, delivery.currentPosition.lng], 12, { duration: 1 });
  }, [delivery.id, map]);
  return null;
}

const STATUS_COLORS: Record<string, string> = {
  in_transit: 'bg-blue-100 text-blue-700',
  scheduled: 'bg-amber-100 text-amber-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  delayed: 'bg-red-100 text-red-700',
};

export default function Delivery() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: deliveries = [], isLoading, error } = useDeliveries();

  const selected = deliveries.find(d => d.id === selectedId) ?? deliveries[0] ?? null;

  if (isLoading) return <LoadingSpinner message="Loading deliveries…" />;
  if (error) return <div className="text-center py-24 text-red-500 text-sm">Failed to load deliveries.</div>;

  const mapCenter: [number, number] = selected
    ? [selected.currentPosition.lat, selected.currentPosition.lng]
    : [6.9271, 79.8612]; // default: Colombo

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Delivery Tracking</h1>
        <p className="text-sm text-gray-500 mt-0.5">{deliveries.length} active deliveries • refreshes every 30s</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[70vh]">
        {/* Delivery list */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary-600" />
            <span className="font-semibold text-gray-900 text-sm">Active Deliveries</span>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {deliveries.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10">No deliveries found.</p>
            ) : (
              deliveries.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selected?.id === d.id ? 'bg-primary-50 border-l-2 border-primary-600' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${STATUS_COLORS[d.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{d.orderNumber}</p>
                        <p className="text-xs text-gray-500">{d.driver.name}</p>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 ml-10.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.destination.label}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />ETA: {d.eta}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Map + details */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Map */}
          <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
            <MapContainer
              center={mapCenter}
              zoom={12}
              className="w-full h-full"
              style={{ minHeight: 300 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              />
              {deliveries.map(d => (
                <Marker
                  key={d.id}
                  position={[d.currentPosition.lat, d.currentPosition.lng]}
                  icon={truckIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{d.orderNumber}</p>
                      <p className="text-gray-600">Driver: {d.driver.name}</p>
                      <p className="text-gray-600">ETA: {d.eta}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {selected && (
                <>
                  <Marker
                    position={[selected.destination.lat, selected.destination.lng]}
                    icon={destIcon}
                  >
                    <Popup>{selected.destination.label}</Popup>
                  </Marker>
                  <Polyline
                    positions={[
                      [selected.currentPosition.lat, selected.currentPosition.lng],
                      [selected.destination.lat, selected.destination.lng],
                    ]}
                    color="#059669"
                    weight={3}
                    dashArray="8,8"
                  />
                  <MapFlyTo delivery={selected} />
                </>
              )}
            </MapContainer>
          </div>

          {/* Selected delivery details */}
          {selected && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Selected Delivery</p>
                  <p className="font-bold text-gray-900">{selected.orderNumber}</p>
                  <p className="text-sm text-gray-500">{selected.customerName}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-400">Driver</p>
                    <p className="font-medium text-gray-800">{selected.driver.name}</p>
                    <p className="text-gray-500">{selected.driver.vehicle}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-400">Contact</p>
                    <p className="font-medium text-gray-800">{selected.driver.phone}</p>
                    <p className="text-gray-500">{selected.driver.licensePlate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-400">Destination</p>
                    <p className="font-medium text-gray-800">{selected.destination.label}</p>
                    <p className="text-gray-500">{selected.distance}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-400">ETA</p>
                    <p className="font-medium text-gray-800">{selected.eta}</p>
                    <p className="text-gray-500">Started: {formatDate(selected.startedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
