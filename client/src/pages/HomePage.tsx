import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Reveal from '../components/Reveal';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur border-b border-pink-light sticky top-0 z-40">
        <div className="container-custom !py-3 flex justify-between items-center">
          <Link to="/" className="group-logo">
            <Logo />
          </Link>
          <div className="space-x-6 font-medium text-charcoal">
            <Link to="/order" className="hover:text-pink transition-colors">Order</Link>
            <Link to="/order-status" className="hover:text-pink transition-colors">Track Order</Link>
            <Link to="/faq" className="hover:text-pink transition-colors">FAQ</Link>
            <Link to="/admin/login" className="hover:text-pink transition-colors">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-custom text-center py-16">
        <div className="animate-rise animate-float inline-block">
          <Logo variant="stacked" />
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-charcoal mt-8 mb-4 animate-rise delay-150">
          Crafted with Love 💕
        </h2>
        <p className="text-xl text-gray-600 mb-8 animate-rise delay-225">
          Custom cakes for every celebration
        </p>
        <div className="animate-rise delay-300">
          <Link to="/order" className="btn-primary text-lg inline-block">
            Order Your Cake Now 🎉
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <Reveal>
            <h3 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h3>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delay={0}>
              <div className="card text-center h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl mb-4 hover-wiggle inline-block">🎨</div>
                <h4 className="text-xl font-bold mb-2">Custom Design</h4>
                <p>Personalize every detail of your cake</p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="card text-center h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl mb-4 hover-wiggle inline-block">🧁</div>
                <h4 className="text-xl font-bold mb-2">Quality Ingredients</h4>
                <p>Only the finest ingredients used</p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="card text-center h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl mb-4 hover-wiggle inline-block">📅</div>
                <h4 className="text-xl font-bold mb-2">Easy Booking</h4>
                <p>Order online in just a few steps</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pink py-16">
        <div className="container-custom text-center text-white">
          <Reveal>
            <h3 className="text-3xl font-bold mb-4 text-white">Ready to Order? 🎂</h3>
            <p className="text-lg mb-8 text-pink-light">Create your perfect custom cake today</p>
            <Link
              to="/order"
              className="inline-block bg-white text-pink px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Start Ordering
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-10">
        <div className="container-custom text-center">
          <div className="flex justify-center mb-4">
            <Logo onDark />
          </div>
          <p>&copy; 2026 Malika's Cake Boutique. All rights reserved.</p>
          <p className="text-blush mt-2">📧 orders@malikacakes.co.za | 📱 +27 71 234 5678</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
