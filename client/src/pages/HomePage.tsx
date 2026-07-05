import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="bg-dark-chocolate text-white py-4">
        <div className="container-custom flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gold">🎂 Malika's Cake Boutique</h1>
          <div className="space-x-6">
            <a href="#home" className="hover:text-gold">Home</a>
            <a href="#about" className="hover:text-gold">About</a>
            <a href="#faq" className="hover:text-gold">FAQ</a>
            <Link to="/admin/login" className="hover:text-gold">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-custom text-center py-20">
        <h2 className="text-5xl font-bold text-dark-chocolate mb-4">Crafted with Love</h2>
        <p className="text-xl text-gray-600 mb-8">Custom cakes for every celebration</p>
        <Link
          to="/order"
          className="inline-block bg-gold text-dark-chocolate px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition"
        >
          Order Your Cake Now
        </Link>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h4 className="text-xl font-bold mb-2">Custom Design</h4>
              <p>Personalize every detail of your cake</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">✨</div>
              <h4 className="text-xl font-bold mb-2">Quality Ingredients</h4>
              <p>Only the finest ingredients used</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">📅</div>
              <h4 className="text-xl font-bold mb-2">Easy Booking</h4>
              <p>Order online in just a few steps</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pink py-16">
        <div className="container-custom text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Order?</h3>
          <p className="text-lg mb-8">Create your perfect custom cake today</p>
          <Link
            to="/order"
            className="inline-block bg-gold text-dark-chocolate px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition"
          >
            Start Ordering
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-chocolate text-white py-8">
        <div className="container-custom text-center">
          <p>&copy; 2026 Malika's Cake Boutique. All rights reserved.</p>
          <p className="text-gold mt-2">📧 orders@malikacakes.co.za | 📱 +27 71 234 5678</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
