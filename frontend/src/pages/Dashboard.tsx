import { Package, DollarSign, Users, TrendingDown, AlertTriangle, Clock, CheckCircle2, Star } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency } from '../lib/utils';

const ORDER_TREND = [
  { day: 'Mon', orders: 12 },
  { day: 'Tue', orders: 18 },
  { day: 'Wed', orders: 14 },
  { day: 'Thu', orders: 22 },
  { day: 'Fri', orders: 19 },
  { day: 'Sat', orders: 25 },
  { day: 'Sun', orders: 16 },
];

export default function Dashboard() {
  const { data: stats, isLoading, error } = useDashboard();

  if (isLoading) return <LoadingSpinner message="Loading dashboard…" />;
  if (error || !stats) return (
    <div className="text-center py-24 text-red-500 text-sm">Failed to load dashboard. Please refresh.</div>
  );

  const { inventory, orders, suppliers, salesSeries, wasteSeries } = stats;
  const lowStockItems = inventory.lowStock + inventory.critical;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back! Here's what's happening with your food management today.
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Inventory Value"
          value={formatCurrency(inventory.totalValue)}
          delta="8.2% vs last month"
          deltaType="up"
          icon={<Package className="w-5 h-5" />}
          iconBg="bg-primary-600"
        />
        <StatCard
          label="Monthly Revenue"
          value="$67,000"
          delta="12.5% vs last month"
          deltaType="up"
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-primary-600"
        />
        <StatCard
          label="Active Suppliers"
          value={String(suppliers.active)}
          delta="2 new this month"
          deltaType="up"
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-primary-600"
        />
        <StatCard
          label="Waste Reduction"
          value="5.2%"
          delta="2.3% vs last month"
          deltaType="up"
          icon={<TrendingDown className="w-5 h-5" />}
          iconBg="bg-orange-500"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inventory Status */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Inventory Status</h2>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Items</span>
            <span className="text-2xl font-bold text-gray-900">{inventory.totalProducts}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
            <div
              className="bg-primary-500 h-1.5 rounded-full"
              style={{ width: `${Math.round(((inventory.totalProducts - lowStockItems - inventory.expired) / Math.max(inventory.totalProducts, 1)) * 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs text-amber-600">Low Stock</p>
                <p className="text-lg font-bold text-amber-700">{lowStockItems}</p>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-xs text-red-500">Expired</p>
                <p className="text-lg font-bold text-red-600">{inventory.expired}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Orders Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Orders Summary</h2>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-1">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{orders.byStatus.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{orders.byStatus.delivered}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> 7-Day Order Trend
          </p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={ORDER_TREND}>
              <Line type="monotone" dataKey="orders" stroke="#059669" strokeWidth={2} dot={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ display: 'none' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {stats.recentOrders.slice(0, 2).map((o) => {
              const order = o as { id: string; orderNumber: string; status: string; supplier?: { name: string } };
              return (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{order.supplier?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{order.orderNumber}</p>
                  </div>
                  <StatusBadge status={order.status.toLowerCase() as 'pending'} />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Supplier Overview */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Supplier Overview</h2>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500">Active Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.active}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Performance Score</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-1 justify-end">
                {suppliers.avgPerformance.toFixed(1)}
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </p>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-2">Recent Deliveries</p>
          <div className="space-y-2">
            {suppliers.recentDeliveries.map(s => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.lastDelivery ?? 'N/A'}</p>
                </div>
                <StatusBadge status={s.status.toLowerCase() as 'active'} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales & Expenses */}
        <Card>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="font-semibold text-gray-900">Sales & Expenses</h2>
              <p className="text-xs text-gray-400">6-month financial overview</p>
            </div>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex gap-6 my-3">
            <div>
              <p className="text-xs text-gray-500">Total Sales</p>
              <p className="text-xl font-bold text-primary-600">
                {formatCurrency(salesSeries.reduce((s, d) => s + d.sales, 0))}
              </p>
              <p className="text-xs text-emerald-500">↑ 12.5%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Expenses</p>
              <p className="text-xl font-bold text-gray-700">
                {formatCurrency(salesSeries.reduce((s, d) => s + d.expenses, 0))}
              </p>
              <p className="text-xs text-emerald-500">↑ 8.3%</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={salesSeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
              <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={2} fill="url(#salesGrad)" name="Sales" />
              <Area type="monotone" dataKey="expenses" stroke="#9ca3af" strokeWidth={2} fill="none" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Food Waste Tracker */}
        <Card>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="font-semibold text-gray-900">Food Waste Tracker</h2>
              <p className="text-xs text-gray-400">Monthly waste percentage</p>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="my-3">
            <p className="text-xs text-gray-500">Current Month Waste</p>
            <p className="text-2xl font-bold text-gray-900">
              {wasteSeries[wasteSeries.length - 1]?.waste ?? 0}%
            </p>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-0.5">
              <TrendingDown className="w-3 h-3" /> -2.3% Reduction from last month
            </p>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-2">6-Month Trend</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={wasteSeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Waste']} />
              <Bar dataKey="waste" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
