import React from 'react';
import { Link } from 'react-router-dom';

const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-dark-chocolate text-white py-4">
        <div className="container-custom flex justify-between items-center">
          <Link to="/" className="text-gold text-2xl font-bold">🎂 Malika's</Link>
          <h1 className="text-xl">FAQ</h1>
          <div></div>
        </div>
      </header>

      <main className="container-custom py-12">
        <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>

        <div className="max-w-3xl space-y-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-2">What is the minimum lead time?</h3>
            <p className="text-gray-600">We require a minimum of 14 days notice for all custom cake orders.</p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-2">When is payment due?</h3>
            <p className="text-gray-600">Payment must be received 7 days before your pickup date.</p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-2">What are your cancellation terms?</h3>
            <p className="text-gray-600">
              • More than 14 days before pickup: Full refund<br />
              • 7-14 days before pickup: 50% refund<br />
              • Less than 7 days before pickup: No refund
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-2">Do you offer delivery?</h3>
            <p className="text-gray-600">Currently, we offer pickup only. Delivery options coming soon!</p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-2">Can you accommodate dietary restrictions?</h3>
            <p className="text-gray-600">Yes! Please specify any allergies or dietary needs in the special requests section during ordering.</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default FAQPage;
