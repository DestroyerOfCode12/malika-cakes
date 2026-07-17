import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '../utils/formatters';
import Logo from '../components/Logo';

const STATUS_STEPS = ['confirmed', 'paid', 'in_progress', 'ready', 'picked_up'];

const OrderStatusPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);

    if (!orderNumber.trim() || !email.trim()) {
      setError('Please enter both your order number and email.');
      return;
    }

    setLoading(true);
    try {
      const found = await orderService.lookupOrder(orderNumber.trim(), email.trim());
      setOrder(found);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Order not found. Check your order number and email.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-white py-3">
        <div className="container-custom flex justify-between items-center">
          <Link to="/" className="group-logo"><Logo onDark /></Link>
          <h1 className="text-xl font-semibold text-white">Order Status</h1>
          <div></div>
        </div>
      </header>

      <main className="container-custom py-12">
        <div className="card max-w-2xl mx-auto animate-rise">
          <h2 className="text-2xl font-bold mb-2">Check Your Order Status</h2>
          <p className="text-gray-600 mb-6">
            Enter the order number from your confirmation email (e.g. ORD-20260915-0001).
          </p>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label htmlFor="lookup-order-number" className="sr-only">Order number</label>
              <input
                id="lookup-order-number"
                type="text"
                className="input-base"
                placeholder="Order number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="lookup-email" className="sr-only">Email used on the order</label>
              <input
                id="lookup-email"
                type="email"
                className="input-base"
                placeholder="Email used on the order"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-primary sm:col-span-2" disabled={loading}>
              {loading ? 'Searching...' : 'Find My Order 🔍'}
            </button>
          </form>

          {error && (
            <div role="alert" aria-live="assertive" className="bg-red-100 text-red-800 p-3 rounded-lg text-sm mt-4">
              {error}
            </div>
          )}
        </div>

        {order && (
          <div className="card max-w-2xl mx-auto mt-6 animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">{order.orderNumber}</h3>
                <p className="text-gray-600 text-sm">
                  {order.size?.name} · {order.flavor?.name} · {order.filling?.name}
                </p>
              </div>
              <span className={`badge-status ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            {order.status === 'cancelled' ? (
              <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm mb-6">
                This order has been cancelled. Contact us if you have any questions.
              </div>
            ) : (
              /* Status timeline */
              <div className="flex items-center mb-8">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIndex;
                  return (
                    <React.Fragment key={step}>
                      {idx > 0 && (
                        <div className={`flex-1 h-1 ${idx <= currentStepIndex ? 'bg-pink' : 'bg-gray-200'}`} />
                      )}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            done ? 'bg-pink text-white' : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {done ? '✓' : idx + 1}
                        </div>
                        <span className="text-[10px] mt-1 text-gray-500 text-center w-16">
                          {getStatusLabel(step)}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-pink-light rounded-xl p-4 text-center">
                <p className="text-gray-500">{order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                <p className="font-bold">{formatDate(order.pickupDate)}</p>
                <p className="text-gray-600">at {order.pickupTime}</p>
              </div>
              <div className="bg-pink-light rounded-xl p-4 text-center">
                <p className="text-gray-500">Total</p>
                <p className="font-bold text-pink text-lg">{formatPrice(Number(order.totalPrice))}</p>
                <p className="text-gray-600">{order.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}</p>
              </div>
              <div className="bg-pink-light rounded-xl p-4 text-center">
                <p className="text-gray-500">Payment Due</p>
                <p className="font-bold">{formatDate(order.paymentDueDate)}</p>
              </div>
            </div>

            {order.deliveryMethod === 'delivery' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm">
                <p className="text-gray-500 mb-1">Delivering to</p>
                <p className="font-medium">{order.deliveryAddress}</p>
                {order.deliveryStatus && (
                  <p className="text-gray-600 mt-2">
                    Courier status: <span className="font-medium">{order.deliveryStatus.replace(/_/g, ' ')}</span>
                  </p>
                )}
                {order.uberTrackingUrl && (
                  <a
                    href={order.uberTrackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink hover:underline font-medium mt-2 inline-block"
                  >
                    Track your delivery →
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/" className="text-pink hover:underline">← Back to Home</Link>
        </div>
      </main>
    </div>
  );
};

export default OrderStatusPage;
