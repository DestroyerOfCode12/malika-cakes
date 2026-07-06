import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Reveal from '../components/Reveal';

const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-white py-3">
        <div className="container-custom flex justify-between items-center">
          <Link to="/" className="group-logo"><Logo onDark /></Link>
          <h1 className="text-xl font-semibold text-white">FAQ</h1>
          <div></div>
        </div>
      </header>

      <main className="container-custom py-12">
        <h2 className="text-3xl font-bold mb-8 animate-rise">Frequently Asked Questions</h2>

        <div className="max-w-3xl space-y-6">
          {[
            {
              q: 'What is the minimum lead time?',
              a: 'We require a minimum of 14 days notice for all custom cake orders.',
            },
            {
              q: 'When is payment due?',
              a: 'Payment must be received 7 days before your pickup date.',
            },
            {
              q: 'What are your cancellation terms?',
              a: '• More than 14 days before pickup: Full refund\n• 7-14 days before pickup: 50% refund\n• Less than 7 days before pickup: No refund',
            },
            {
              q: 'Do you offer delivery?',
              a: 'Currently, we offer pickup only. Delivery options coming soon!',
            },
            {
              q: 'Can you accommodate dietary restrictions?',
              a: 'Yes! Please specify any allergies or dietary needs in the special requests section during ordering.',
            },
          ].map((item, idx) => (
            <Reveal key={item.q} delay={idx * 80}>
              <div className="card">
                <h3 className="text-xl font-bold mb-2">{item.q}</h3>
                <p className="text-gray-600 whitespace-pre-line">{item.a}</p>
              </div>
            </Reveal>
          ))}
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
