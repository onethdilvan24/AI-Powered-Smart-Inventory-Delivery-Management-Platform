import { useState } from 'react';
import { Search, X, FileText, ChevronRight, Package } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { orders } from '../data/orders';
import type { Order, OrderStatus } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';

const STATUSES: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'packed', label: 'Packed' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
];

const PIPELINE: OrderStatus[] = ['pending', 'packed', 'out_for_delivery', 'delivered'];
const PIPELINE_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pipelineStepIndex = (status: OrderStatus) => PIPELINE.indexOf(status);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PIPELINE.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(prev => prev === s ? 'all' : s)}
            className={`card p-4 text-left transition-all ${statusFilter === s ? 'ring-2 ring-primary-500' : ''}`}
          >
            <p className="text-xs text-gray-500 mb-1">{PIPELINE_LABELS[s]}</p>
            <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === s).length}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order # or supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === s.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders list */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Supplier</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expected</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">No orders found.</td>
                </tr>
              ) : (
                filtered.map(o => (
                  <tr
                    key={o.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => { setSelectedOrder(o); setShowInvoice(false); }}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-primary-600">{o.orderNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800">{o.supplierName}</td>
                    <td className="px-4 py-3.5 text-gray-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3.5 text-gray-500">{formatDate(o.expectedDelivery)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-900">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3.5 text-gray-500">{o.items.length} item{o.items.length > 1 ? 's' : ''}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3.5">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="bg-white w-full max-w-md shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Order</p>
                <h2 className="font-bold text-gray-900 text-lg">{selectedOrder.orderNumber}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {!showInvoice ? (
              <div className="flex-1 p-6 space-y-5">
                {/* Status Pipeline */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Status</p>
                  <div className="flex items-center gap-1">
                    {PIPELINE.map((step, i) => {
                      const active = pipelineStepIndex(selectedOrder.status) >= i;
                      const current = selectedOrder.status === step;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`flex flex-col items-center flex-1 ${i > 0 ? '' : ''}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {i + 1}
                            </div>
                            <p className={`text-[10px] mt-1 text-center leading-tight ${current ? 'text-primary-600 font-semibold' : active ? 'text-gray-600' : 'text-gray-400'}`}>
                              {PIPELINE_LABELS[step]}
                            </p>
                          </div>
                          {i < PIPELINE.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 rounded ${active && pipelineStepIndex(selectedOrder.status) > i ? 'bg-primary-500' : 'bg-gray-100'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Supplier</p>
                    <p className="font-medium text-gray-800">{selectedOrder.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Created</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Expected Delivery</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedOrder.expectedDelivery)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-bold text-primary-600">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">{item.productName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{item.quantity} {item.unit}</p>
                          <p className="text-xs text-gray-400">{formatCurrency(item.unitPrice)}/unit</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="bg-amber-50 rounded-lg px-4 py-3">
                    <p className="text-xs font-medium text-amber-700">Note</p>
                    <p className="text-sm text-amber-600 mt-0.5">{selectedOrder.notes}</p>
                  </div>
                )}

                <button
                  onClick={() => setShowInvoice(true)}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2.5 rounded-lg"
                >
                  <FileText className="w-4 h-4" /> View Invoice
                </button>
              </div>
            ) : (
              <div className="flex-1 p-6">
                <button
                  onClick={() => setShowInvoice(false)}
                  className="text-sm text-primary-600 hover:underline mb-4 flex items-center gap-1"
                >
                  ← Back to order
                </button>
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">INVOICE</p>
                      <p className="text-sm text-gray-500">{selectedOrder.orderNumber}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Bill To</p>
                      <p className="font-medium">FoodFlow Restaurant</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">From</p>
                      <p className="font-medium">{selectedOrder.supplierName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Invoice Date</p>
                      <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Due Date</p>
                      <p className="font-medium">{formatDate(selectedOrder.expectedDelivery)}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-400">
                          <th className="text-left pb-2">Item</th>
                          <th className="text-right pb-2">Qty</th>
                          <th className="text-right pb-2">Unit Price</th>
                          <th className="text-right pb-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, i) => (
                          <tr key={i} className="border-t border-gray-50">
                            <td className="py-2 font-medium">{item.productName}</td>
                            <td className="py-2 text-right text-gray-600">{item.quantity} {item.unit}</td>
                            <td className="py-2 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-2 text-right font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  <StatusBadge status={selectedOrder.status} className="w-full justify-center py-1.5 text-sm" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
