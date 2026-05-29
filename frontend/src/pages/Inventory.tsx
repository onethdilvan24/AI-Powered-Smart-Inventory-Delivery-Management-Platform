import { useState } from 'react';
import { Search, Plus, X, AlertTriangle, Clock, Filter } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useProducts, useCreateProduct } from '../hooks/useProducts';
import { useSuppliers } from '../hooks/useSuppliers';
import type { StockStatus } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';

const statusOptions: { label: string; value: StockStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'ok' },
  { label: 'Low Stock', value: 'low' },
  { label: 'Critical', value: 'critical' },
  { label: 'Expired', value: 'expired' },
];

const emptyForm = {
  name: '', category: '', quantity: '', unit: 'kg',
  minStock: '', expiryDate: '', costPerUnit: '', supplierId: '',
};

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: products = [], isLoading, error } = useProducts({
    search: search || undefined,
    category: categoryFilter !== 'All' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const { data: suppliers = [] } = useSuppliers({ status: 'active' });
  const createProduct = useCreateProduct();

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  async function handleAddProduct() {
    if (!form.name || !form.category || !form.quantity || !form.supplierId) return;
    try {
      await createProduct.mutateAsync({
        name: form.name,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        minStock: Number(form.minStock),
        expiryDate: new Date(form.expiryDate).toISOString(),
        costPerUnit: Number(form.costPerUnit),
        supplierId: form.supplierId,
      });
      setForm(emptyForm);
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create product');
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading inventory…" />;
  if (error) return <div className="text-center py-24 text-red-500 text-sm">Failed to load inventory.</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products tracked</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Summary strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: products.length, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Low Stock', value: products.filter(p => p.status === 'low').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
          { label: 'Critical', value: products.filter(p => p.status === 'critical').length, color: 'text-red-600', bg: 'bg-red-50', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
          { label: 'Expired', value: products.filter(p => p.status === 'expired').length, color: 'text-gray-500', bg: 'bg-gray-50', icon: <Clock className="w-4 h-4 text-gray-400" /> },
        ].map(s => (
          <div key={s.label} className={`card p-4 flex items-center gap-3 ${s.bg}`}>
            {s.icon}
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
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
              placeholder="Search products or suppliers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StockStatus | 'all')}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Min Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost/Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Supplier</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No products found.</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5"><p className="font-medium text-gray-900">{p.name}</p></td>
                    <td className="px-4 py-3.5 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-semibold ${p.quantity <= p.minStock * 0.5 ? 'text-red-600' : p.quantity <= p.minStock ? 'text-amber-600' : 'text-gray-900'}`}>
                        {p.quantity} {p.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-500">{p.minStock} {p.unit}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm ${p.status === 'expired' ? 'text-red-500' : 'text-gray-600'}`}>
                        {formatDate(p.expiryDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-700">{formatCurrency(p.costPerUnit)}</td>
                    <td className="px-4 py-3.5 text-gray-600 text-sm">{p.supplier}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-lg">Add New Product</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Product Name', key: 'name', type: 'text', span: true },
                { label: 'Category', key: 'category', type: 'text' },
                { label: 'Unit (kg/L/pcs)', key: 'unit', type: 'text' },
                { label: 'Quantity', key: 'quantity', type: 'number' },
                { label: 'Min Stock', key: 'minStock', type: 'number' },
                { label: 'Cost Per Unit ($)', key: 'costPerUnit', type: 'number' },
                { label: 'Expiry Date', key: 'expiryDate', type: 'date' },
              ].map(f => (
                <div key={f.key} className={f.span ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              {/* Supplier select */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Supplier</label>
                <select
                  value={form.supplierId}
                  onChange={e => setForm(prev => ({ ...prev, supplierId: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select supplier…</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleAddProduct}
                disabled={createProduct.isPending}
                className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-lg font-medium"
              >
                {createProduct.isPending ? 'Saving…' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
