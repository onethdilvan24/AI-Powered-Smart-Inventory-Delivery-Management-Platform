import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, Clock, MapPin, Phone, Navigation, CheckCircle2, AlertTriangle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { deliveries } from '../data/deliveries';
import type { Delivery as DeliveryType } from '../types';

// Fix default leaflet marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const truckIcon = (color: string) => L.divIcon({
  className: '',
  html: `<div style="
    background:${color};
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:2px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
    display:flex;align-items:center;justify-content:center;
  ">
    <span style="transform:rotate(45deg);font-size:14px;">🚚</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#059669;width:14px;height:14px;border-radius:50%;
    border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const STATUS_COLORS: Record<string, string> = {
  in_transit: '#8b5cf6',
  delayed: '#ef4444',
  scheduled: '#3b82f6',
  delivered: '#059669',
};

function MapCenter({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(pos, 13, { animate: true }); }, [pos, map]);
  return null;
}

export default function Delivery() {
  const [selected, setSelected] = useState<DeliveryType>(deliveries[0]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Delivery Tracking</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live fleet overview — {deliveries.length} active routes</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4" style={{ height: 620 }}>
        {/* Delivery list */}
        <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 620 }}>
          {deliveries.map(d => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className={`w-full text-left card p-4 transition-all ${selected.id === d.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ background: STATUS_COLORS[d.status] ?? '#6b7280' }}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{d.orderNumber}</p>
                    <p className="text-xs text-gray-500">{d.driver.name}</p>
                  </div>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="truncate">{d.destination.label}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>ETA: {d.eta}</span>
                  <span className="text-gray-400">·</span>
                  <span>{d.distance}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Map + detail panel */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Map */}
          <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 shadow-sm" style={{ minHeight: 380 }}>
            <MapContainer
              center={[selected.currentPosition.lat, selected.currentPosition.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenter pos={[selected.currentPosition.lat, selected.currentPosition.lng]} />
              {deliveries.map(d => (
                <Marker
                  key={d.id}
                  position={[d.currentPosition.lat, d.currentPosition.lng]}
                  icon={truckIcon(STATUS_COLORS[d.status] ?? '#6b7280')}
                  eventHandlers={{ click: () => setSelected(d) }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{d.orderNumber}</p>
                      <p className="text-gray-500">{d.driver.name}</p>
                      <p className="text-gray-500">ETA: {d.eta}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* Destination marker */}
              <Marker
                position={[selected.destination.lat, selected.destination.lng]}
                icon={destIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{selected.destination.label}</p>
                    <p className="text-gray-500">{selected.customerName}</p>
                  </div>
                </Popup>
              </Marker>
              {/* Route line */}
              <Polyline
                positions={[
                  [selected.origin.lat, selected.origin.lng],
                  [selected.currentPosition.lat, selected.currentPosition.lng],
                  [selected.destination.lat, selected.destination.lng],
                ]}
                pathOptions={{ color: STATUS_COLORS[selected.status] ?? '#6b7280', weight: 3, dashArray: '6 4', opacity: 0.8 }}
              />
            </MapContainer>
          </div>

          {/* Driver + delivery details */}
          <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Driver Details</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
                  {selected.driver.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selected.driver.name}</p>
                  <p className="text-xs text-gray-500">{selected.driver.vehicle}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selected.driver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selected.driver.licensePlate}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Delivery Info</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <Navigation className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Origin</p>
                    <p className="text-gray-800">{selected.origin.label}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Destination</p>
                    <p className="text-gray-800">{selected.destination.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-400">ETA</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary-500" /> {selected.eta}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Distance</p>
                    <p className="font-semibold text-gray-900">{selected.distance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <div className="mt-0.5">
                      {selected.status === 'delayed' ? (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Delayed
                        </span>
                      ) : selected.status === 'delivered' ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                        </span>
                      ) : (
                        <StatusBadge status={selected.status} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
