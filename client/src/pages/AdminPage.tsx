import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { adminService } from '../services/adminService';
import { AdminDashboardStats } from '../types';
import { formatPrice } from '../utils/formatters';
import OrderQueue from '../components/Admin/OrderQueue';
import CustomerList from '../components/Admin/CustomerList';
import Logo from '../components/Logo';

type Tab = 'orders' | 'customers';

const AdminPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>('orders');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    adminService
      .getDashboard()
      .then((result) => setStats(result.data))
      .catch(() => setStats(null));
  }, []);

  const statCards = [
    { label: 'Total Orders', value: stats ? String(stats.totalOrders) : '—' },
    { label: 'Total Revenue', value: stats ? formatPrice(stats.totalRevenue) : '—' },
    { label: 'Pickups (next 7 days)', value: stats ? String(stats.upcomingPickups) : '—' },
    { label: 'Overdue Payments', value: stats ? String(stats.overduePayments) : '—' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-white py-4">
        <div className="container-custom flex justify-between items-center">
          <span className="flex items-center gap-3">
            <Logo onDark />
            <span className="text-sm uppercase tracking-widest text-blush hidden md:inline">Admin</span>
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden sm:inline">Welcome, {user?.email}</span>
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
        <h1 className="sr-only">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, idx) => (
            <div
              key={card.label}
              className={`card text-center animate-rise ${['', 'delay-75', 'delay-150', 'delay-225'][idx]}`}
            >
              <div className="text-2xl md:text-3xl font-bold text-pink">{card.value}</div>
              <p className="text-gray-600 text-sm">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6" role="tablist" aria-label="Admin sections">
          <button
            role="tab"
            aria-selected={tab === 'orders'}
            aria-controls="admin-panel"
            id="tab-orders"
            className={tab === 'orders' ? 'btn-primary py-2' : 'btn-secondary py-2'}
            onClick={() => setTab('orders')}
          >
            Order Queue
          </button>
          <button
            role="tab"
            aria-selected={tab === 'customers'}
            aria-controls="admin-panel"
            id="tab-customers"
            className={tab === 'customers' ? 'btn-primary py-2' : 'btn-secondary py-2'}
            onClick={() => setTab('customers')}
          >
            Customers
          </button>
        </div>

        <div className="card" id="admin-panel" role="tabpanel" aria-labelledby={tab === 'orders' ? 'tab-orders' : 'tab-customers'}>
          {tab === 'orders' ? <OrderQueue /> : <CustomerList />}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
