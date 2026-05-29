import { useState } from 'react';
import { Search, Star, Package, TrendingUp, Mail, Phone, MapPin } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSuppliers } from '../hooks/useSuppliers';
import { useOrders } from '../hooks/useOrders';
import type { Supplier } from '../types';
import { formatDate } from '../lib/utils';

export default function Suppliers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selected, setSelected] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading, error } = useSuppliers({
    search: search || undefined,
    status: statusFilter,
  });

  const { data: orders = [] } = useOrders(
    selected ? { supplierId: selected.id } : undefined,
  );

  if (isLoading) return <LoadingSpinner message="Loading suppliers…" />;
  if (error) return <div className="text-center py-24 text-red-500 text-sm">Failed to load suppliers.</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Suppliers', value: suppliers.length, icon: <Package className="w-4 h-4 text-primary-500" />, bg: 'bg-primary-50' },
          { label: 'Active', value: suppliers.filter(s => s.status === 'active').length, icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-50' },
          { label: 'Avg Performance', value: suppliers.length ? (suppliers.reduce((a, s) => a + s.performanceScore, 0) / suppliers.length).toFixed(1) : '—', icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />, bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 flex items-center gap-3 ${s.bg}`}>
            {s.icon}
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                  statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.length === 0 ? (
          <p className="text-gray-400 text-sm col-span-full text-center py-12">No suppliers found.</p>
        ) : (
          suppliers.map(s => (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              className="card cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center font-bold text-primary-700 text-sm">
                    {s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.category}</p>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>

              {/* Performance bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Performance Score</span>
                  <span className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                    {s.performanceScore}
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${s.performanceScore >= 4 ? 'bg-emerald-500' : s.performanceScore >= 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${(s.performanceScore / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500">
                <span>Total Orders: <strong className="text-gray-800">{s.totalOrders}</strong></span>
                <span>On-Time: <strong className="text-gray-800">{s.onTimeDelivery}%</strong></span>
                <span>Last Delivery: <strong className="text-gray-800">{s.lastDelivery !== 'N/A' ? formatDate(s.lastDelivery) : 'N/A'}</strong></span>
              </div>

              <div className="border-t border-gray-50 pt-3 space-y-1.5 text-xs text-gray-500">
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{s.email}</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{s.phone}</p>
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{s.address}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="bg-white w-full max-w-sm shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Supplier</p>
                <h2 className="font-bold text-gray-900 text-lg">{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <div className="p-6 space-y-5 flex-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400">Category</p><p className="font-medium">{selected.category}</p></div>
                <div><p className="text-xs text-gray-400">Status</p><StatusBadge status={selected.status} /></div>
                <div><p className="text-xs text-gray-400">Contact</p><p className="font-medium">{selected.contact}</p></div>
                <div><p className="text-xs text-gray-400">Performance</p><p className="font-bold text-gray-900 flex items-center gap-1">{selected.performanceScore} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /></p></div>
                <div><p className="text-xs text-gray-400">Total Orders</p><p className="font-medium">{selected.totalOrders}</p></div>
                <div><p className="text-xs text-gray-400">On-Time %</p><p className="font-medium">{selected.onTimeDelivery}%</p></div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{selected.email}</p>
                <p className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{selected.phone}</p>
                <p className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" />{selected.address}</p>
              </div>

              {/* Recent orders from this supplier */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Orders</p>
                <div className="space-y-2">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 text-sm">
                      <div>
                        <p className="font-medium text-primary-600">{o.orderNumber}</p>
                        <p className="text-xs text-gray-400">{formatDate(o.createdAt)}</p>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-xs text-gray-400">No orders yet.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
