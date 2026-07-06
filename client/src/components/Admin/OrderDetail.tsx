import React, { useState } from 'react';
import { Order } from '../../types';
import { adminService } from '../../services/adminService';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '../../utils/formatters';

const ORDER_STATUSES = ['confirmed', 'paid', 'in_progress', 'ready', 'picked_up', 'cancelled'];
const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onUpdated: (order: Order) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onClose, onUpdated }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = async (status: string) => {
    if (status === order.status) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminService.updateOrderStatus(order.id, status);
      onUpdated(updated);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const changePayment = async (paymentStatus: string) => {
    if (paymentStatus === order.paymentStatus) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminService.updatePaymentStatus(order.id, paymentStatus);
      onUpdated({ ...order, paymentStatus: updated.paymentStatus });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update payment status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{order.orderNumber}</h3>
            <span className={`badge-status ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-charcoal text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Customer</p>
            <p className="font-bold">{order.customer?.name}</p>
            {order.customer?.email && (
              <a href={`mailto:${order.customer.email}`} className="text-sm text-pink block hover:underline">
                {order.customer.email}
              </a>
            )}
            {order.customer?.phone && (
              <a
                href={`https://wa.me/${order.customer.phone.replace(/^0/, '27')}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-pink hover:underline"
              >
                WhatsApp: {order.customer.phone}
              </a>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Pickup</p>
            <p className="font-bold">{formatDate(order.pickupDate)}</p>
            <p className="text-sm text-gray-600">at {order.pickupTime}</p>
            <p className="text-sm text-gray-600 mt-1">
              Payment due: {formatDate(order.paymentDueDate)}
            </p>
          </div>
        </div>

        <div className="bg-pink-light rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-500 mb-2">Cake</p>
          <p className="font-bold">
            {order.size?.name} · {order.flavor?.name} · {order.filling?.name}
          </p>
          {order.customizations?.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Toppers: {order.customizations.map((c) => c.topper?.name).join(', ')}
            </p>
          )}
          {order.allergiesRestrictions && (
            <p className="text-sm text-red-700 mt-2">⚠️ Allergies: {order.allergiesRestrictions}</p>
          )}
          {order.specialRequests && (
            <p className="text-sm text-gray-600 mt-1">📝 {order.specialRequests}</p>
          )}
          <p className="text-lg font-bold text-pink mt-3">{formatPrice(Number(order.totalPrice))}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Order Status</label>
            <select
              className="input-base"
              value={order.status}
              disabled={saving}
              onChange={(e) => changeStatus(e.target.value)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Setting "Ready for Pickup" emails the customer.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Status</label>
            <select
              className="input-base"
              value={order.paymentStatus}
              disabled={saving}
              onChange={(e) => changePayment(e.target.value)}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm mt-4">{error}</div>}
        {saving && <p className="text-sm text-gray-400 mt-2">Saving...</p>}
      </div>
    </div>
  );
};

export default OrderDetail;
