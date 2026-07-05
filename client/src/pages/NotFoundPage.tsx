import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-2 animate-pop">🧁</div>
        <h1 className="text-6xl font-bold text-pink mb-4">404</h1>
        <h2 className="text-3xl font-bold text-charcoal mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">Oops! Looks like this slice went missing.</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
