import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrderFormStore } from '../../store/orderFormStore';
import { formatPrice, formatDate } from '../../utils/formatters';
import { paymentService, detectWallets, PayMethod } from '../../services/paymentService';

const OrderConfirmation: React.FC = () => {
  const { submittedOrder, resetForm } = useOrderFormStore();
  const [paying, setPaying] = useState<PayMethod | 'any' | null>(null);
  const wallets = useMemo(detectWallets, []);
  const [payError, setPayError] = useState<string | null>(null);

  if (!submittedOrder) return null;

  const handlePayNow = async (method?: PayMethod) => {
    setPaying(method ?? 'any');
    setPayError(null);
    try {
      const payment = await paymentService.getPayfastPayment(submittedOrder.id, method);
      paymentService.redirectToPayfast(payment);
      // Browser navigates away to PayFast here — no further state needed.
    } catch (err: any) {
      if (err?.response?.status === 503) {
        setPayError("Online payment isn't set up yet — we'll be in touch to arrange payment manually.");
      } else {
        setPayError(err?.response?.data?.error || 'Could not start payment. Please try again.');
      }
      setPaying(null);
    }
  };

  return (
    <div className="text-center py-6 animate-rise">
      <div className="text-6xl mb-4 animate-pop">🎉🧁</div>
      <h2 className="text-2xl font-bold text-charcoal mb-2">Order Confirmed!</h2>
      <p className="text-gray-600 mb-6">
        Thank you! We've received your order and sent a confirmation email.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto mb-6 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Order Number</span>
          <span className="font-bold">{submittedOrder.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total</span>
          <span className="font-bold text-pink">{formatPrice(submittedOrder.totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Pickup Date</span>
          <span className="font-bold">{formatDate(submittedOrder.pickupDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment Due</span>
          <span className="font-bold">{formatDate(submittedOrder.paymentDueDate)}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-6">
        <div className="space-y-3">
          {wallets.applePay && (
            <button
              type="button"
              onClick={() => handlePayNow('ap')}
              disabled={paying !== null}
              aria-label="Pay with Apple Pay"
              className="w-full h-12 rounded-full bg-black text-white font-semibold text-lg flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {paying === 'ap' ? (
                'Opening Apple Pay...'
              ) : (
                <>
                  <svg viewBox="0 0 170 170" className="w-5 h-5 -mt-1" fill="currentColor" aria-hidden="true">
                    <path d="M150.4 130.3c-2.4 5.5-5.2 10.6-8.4 15.3-4.4 6.3-8 10.7-10.8 13.1-4.3 4-9 6-13.9 6.1-3.5 0-7.8-1-12.7-3.1-5-2-9.5-3.1-13.7-3.1-4.4 0-9.1 1-14.1 3.1-5 2.1-9.1 3.2-12.2 3.3-4.7.2-9.4-1.9-14.1-6.3-3-2.6-6.8-7.1-11.3-13.5-4.8-6.8-8.8-14.7-11.9-23.7-3.3-9.7-5-19.2-5-28.3 0-10.4 2.3-19.4 6.8-27 3.5-6.1 8.2-10.9 14.1-14.4s12.2-5.3 19.1-5.4c3.7 0 8.6 1.2 14.7 3.4 6.1 2.3 10 3.4 11.7 3.4 1.3 0 5.6-1.3 13-4 7-2.5 12.9-3.6 17.7-3.2 13.1 1.1 22.9 6.2 29.4 15.5-11.7 7.1-17.5 17-17.4 29.8.1 9.9 3.7 18.2 10.8 24.7 3.2 3.1 6.8 5.4 10.8 7.1-.9 2.5-1.8 4.9-2.7 7.2zM119.1 7.2c0 7.8-2.9 15.1-8.6 21.8-6.9 8-15.2 12.7-24.2 11.9-.1-.9-.2-1.9-.2-3 0-7.5 3.3-15.5 9.1-22.1 2.9-3.3 6.6-6.1 11.1-8.3 4.4-2.2 8.6-3.4 12.6-3.6.1 1.1.2 2.2.2 3.3z" />
                  </svg>
                  <span>Pay</span>
                </>
              )}
            </button>
          )}
          {wallets.googlePay && (
            <button
              type="button"
              onClick={() => handlePayNow('gp')}
              disabled={paying !== null}
              aria-label="Pay with Google Pay"
              className="w-full h-12 rounded-full bg-black text-white font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {paying === 'gp' ? (
                'Opening Google Pay...'
              ) : (
                <>
                  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                  </svg>
                  <span>Pay</span>
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => handlePayNow()}
            disabled={paying !== null}
            className={wallets.applePay || wallets.googlePay ? 'btn-outline w-full' : 'btn-primary w-full'}
          >
            {paying === 'any' ? 'Redirecting to secure payment...' : '🔒 Pay with card or EFT'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Secure payment by PayFast</p>
        {payError && <p className="text-sm text-red-600 mt-2">{payError}</p>}
        <p className="text-sm text-gray-500 mt-3">
          Prefer to pay another way? We'll be in touch to arrange payment before your deadline —
          keep your order number handy!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link to="/" onClick={resetForm} className="btn-outline">
          Back to Home
        </Link>
        <Link to="/order-status" onClick={resetForm} className="btn-secondary">
          Track My Order
        </Link>
        <Link to="/order" onClick={resetForm} className="btn-primary">
          Place Another Order
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
