import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-charcoal text-white py-3">
        <div className="container-custom flex justify-between items-center">
          <Link to="/" className="group-logo"><Logo onDark /></Link>
          <h1 className="text-xl font-semibold text-white">Payment</h1>
          <div></div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center animate-rise">
          <div className="text-6xl mb-4 animate-pop">✅</div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">Thanks for your payment!</h2>
          <p className="text-gray-600 mb-6">
            {orderNumber && (
              <>
                Order <strong>{orderNumber}</strong> is being confirmed.{' '}
              </>
            )}
            It can take a minute or two for the payment to reflect — check your order status if it
            still shows unpaid shortly.
          </p>
          {orderNumber && (
            <Link to={`/order-status`} className="btn-primary w-full mb-3 inline-block">
              Check Order Status
            </Link>
          )}
          <Link to="/" className="btn-outline w-full inline-block">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;
