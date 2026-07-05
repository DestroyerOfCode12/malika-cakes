import React from 'react';
import { useAuthStore } from '../store/authStore';

const AdminPage: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-white py-4">
        <div className="container-custom flex justify-between items-center">
          <h1 className="brand-logo text-2xl">🧁 Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {user?.email}</span>
            <button
              onClick={() => {
                logout();
                window.location.href = '/admin/login';
              }}
              className="btn-outline py-2 px-4 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-pink">0</div>
            <p className="text-gray-600">Total Orders</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-pink">R0</div>
            <p className="text-gray-600">Total Revenue</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-pink">0</div>
            <p className="text-gray-600">Upcoming Pickups</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-pink">0</div>
            <p className="text-gray-600">Overdue Payments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Order Queue</h3>
            <p className="text-gray-600">Coming soon: Order management interface</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Customers</h3>
            <p className="text-gray-600">Coming soon: Customer management</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
