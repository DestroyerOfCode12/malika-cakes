import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="bg-charcoal text-white py-4">
        <div className="container-custom flex justify-between items-center">
          <h1 className="brand-logo text-3xl">
            <span className="hover-wiggle inline-block">🧁</span> Malika's
          </h1>
          <div className="space-x-6 font-medium">
            <a href="#home" className="hover:text-pink transition-colors">Home</a>
            <a href="#about" className="hover:text-pink transition-colors">About</a>
            <Link to="/faq" className="hover:text-pink transition-colors">FAQ</Link>
            <Link to="/admin/login" className="hover:text-pink transition-colors">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-custom text-center py-20">
        <p className="brand-logo text-2xl mb-2">Cake Boutique</p>
        <h2 className="text-5xl font-extrabold text-charcoal mb-4">Crafted with Love 💕</h2>
        <p className="text-xl text-gray-600 mb-8">Custom cakes for every celebration</p>
        <Link to="/order" className="btn-primary text-lg inline-block">
          Order Your Cake Now 🎉
        </Link>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4 hover-wiggle inline-block">🎨</div>
              <h4 className="text-xl font-bold mb-2">Custom Design</h4>
              <p>Personalize every detail of your cake</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4 hover-wiggle inline-block">🧁</div>
              <h4 className="text-xl font-bold mb-2">Quality Ingredients</h4>
              <p>Only the finest ingredients used</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4 hover-wiggle inline-block">📅</div>
              <h4 className="text-xl font-bold mb-2">Easy Booking</h4>
              <p>Order online in just a few steps</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pink py-16">
        <div className="container-custom text-center text-white">
          <h3 className="text-3xl font-bold mb-4 text-white">Ready to Order? 🎂</h3>
          <p className="text-lg mb-8 text-pink-light">Create your perfect custom cake today</p>
          <Link
            to="/order"
            className="inline-block bg-white text-pink px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Start Ordering
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-8">
        <div className="container-custom text-center">
          <p className="brand-logo text-xl mb-2">Malika's</p>
          <p>&copy; 2026 Malika's Cake Boutique. All rights reserved.</p>
          <p className="text-pink-light mt-2">📧 orders@malikacakes.co.za | 📱 +27 71 234 5678</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
