import React from 'react';
import { Link } from 'react-router-dom';

const OrderStatusPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-dark-chocolate text-white py-4">
        <div className="container-custom flex justify-between items-center">
          <Link to="/" className="text-gold text-2xl font-bold">🎂 Malika's</Link>
          <h1 className="text-xl">Order Status</h1>
          <div></div>
        </div>
      </header>

      <main className="container-custom py-12">
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Check Your Order Status</h2>
          <p className="text-gray-600 mb-8">Coming soon: Search your order by order number or email</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default OrderStatusPage;
