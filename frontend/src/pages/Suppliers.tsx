import { useState } from 'react';
import { Search, Star, Phone, Mail, MapPin, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { suppliers } from '../data/suppliers';
import { orders } from '../data/orders';

export default function Suppliers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = suppliers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function supplierOrders(supplierId: string) {
    return orders.filter(o => o.supplierId === supplierId);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Suppliers</h1>
        <p className="text-sm text-gray-500 mt-0.5">{suppliers.filter(s => s.status === 'active').length} active suppliers</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Total Suppliers</p>
          <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{suppliers.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Avg Performance</p>
          <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
            {(suppliers.filter(s => s.status === 'active').reduce((acc, s) => acc + s.performanceScore, 0) /
              suppliers.filter(s => s.status === 'active').length).toFixed(1)}
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Avg On-Time %</p>
          <p className="text-2xl font-bold text-primary-600">
            {Math.round(suppliers.filter(s => s.status === 'active').reduce((acc, s) => acc + s.onTimeDelivery, 0) /
              suppliers.filter(s => s.status === 'active').length)}%
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers or categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(v => (
              <button
                key={v}
                onClick={() => setStatusFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                  statusFilter === v
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(s => {
          const sOrders = supplierOrders(s.id);
          return (
            <Card key={s.id} className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold text-sm">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.category}</p>
                    </div>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg py-2 px-1">
                  <p className="text-xs text-gray-400">Orders</p>
                  <p className="font-bold text-gray-900">{s.totalOrders}</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2 px-1">
                  <p className="text-xs text-gray-400">On-Time</p>
                  <p className="font-bold text-primary-600">{s.onTimeDelivery}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2 px-1">
                  <p className="text-xs text-gray-400">Score</p>
                  <p className="font-bold text-gray-900 flex items-center justify-center gap-0.5">
                    {s.performanceScore}
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </p>
                </div>
              </div>

              {/* Performance bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>On-Time Delivery</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{s.onTimeDelivery}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-primary-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${s.onTimeDelivery}%` }}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs">{s.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs">{s.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs">{s.address}</span>
                </div>
              </div>

              {/* Recent Orders */}
              {sOrders.length > 0 && (
                <div className="border-t border-gray-50 pt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Recent Orders</p>
                  <div className="space-y-1.5">
                    {sOrders.slice(0, 2).map(o => (
                      <div key={o.id} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{o.orderNumber}</span>
                        <StatusBadge status={o.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400">Last delivery: {s.lastDelivery}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
