import React, { useEffect, useState, useCallback } from 'react';
import { Order } from '../../types';
import { adminService } from '../../services/adminService';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '../../utils/formatters';
import OrderDetail from './OrderDetail';
import { TableRowsSkeleton } from '../Skeleton';

const STATUS_FILTERS = ['', 'confirmed', 'paid', 'in_progress', 'ready', 'picked_up', 'cancelled'];

// Row highlighting per spec: red = payment overdue, yellow = pickup today/urgent
const rowClass = (order: Order): string => {
  if (order.status === 'cancelled' || order.status === 'picked_up') return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pickup = new Date(order.pickupDate);
  pickup.setHours(0, 0, 0, 0);
  const dueDate = new Date(order.paymentDueDate);
  const daysToPickup = Math.round((pickup.getTime() - today.getTime()) / 86400000);

  if (order.paymentStatus === 'unpaid' && dueDate < today) return 'bg-red-50';
  if (daysToPickup === 0) return 'bg-yellow-100';
  if (daysToPickup > 0 && daysToPickup <= 2) return 'bg-yellow-50';
  return '';
};

const OrderQueue: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getOrders({
        page,
        limit: 20,
        status: statusFilter || undefined,
        sortBy: 'pickupDate',
        sortOrder: 'asc',
      });
      setOrders(result.data);
      setTotalPages(result.pagination.pages || 1);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Client-side search over the loaded page (name, order #, email)
  const visible = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q)
    );
  });

  const handleUpdated = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
    setSelected((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label htmlFor="order-search" className="sr-only">Search orders</label>
        <input
          id="order-search"
          type="text"
          className="input-base sm:max-w-xs"
          placeholder="Search name, order #, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label htmlFor="order-status-filter" className="sr-only">Filter by status</label>
        <select
          id="order-status-filter"
          className="input-base sm:max-w-[200px]"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s ? getStatusLabel(s) : 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="bg-red-100 text-red-800 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <TableRowsSkeleton rows={6} />
      ) : visible.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No orders found. 🧁</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-3">Order #</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Cake</th>
                <th className="py-2 pr-3">Pickup</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Payment</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(order);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View order ${order.orderNumber} for ${order.customer?.name}`}
                  className={`border-b cursor-pointer hover:bg-pink-light transition-colors ${rowClass(order)}`}
                >
                  <td className="py-3 pr-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3 pr-3">{order.customer?.name}</td>
                  <td className="py-3 pr-3 text-gray-600">
                    {order.size?.name} · {order.flavor?.name}
                  </td>
                  <td className="py-3 pr-3">
                    {formatDate(order.pickupDate)}
                    {order.deliveryMethod === 'delivery' && (
                      <span className="ml-1" title="Delivery order">🚗</span>
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`badge-status ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`badge-status ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : order.paymentStatus === 'refunded'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-pink">
                    {formatPrice(Number(order.totalPrice))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            className="btn-outline py-1 px-4 text-sm disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-outline py-1 px-4 text-sm disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {selected && (
        <OrderDetail order={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
};

export default OrderQueue;
