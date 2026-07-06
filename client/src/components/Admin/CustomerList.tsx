import React, { useEffect, useState } from 'react';
import { adminService, CustomerWithStats } from '../../services/adminService';
import { formatPrice, formatDate } from '../../utils/formatters';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService
      .getCustomers(1, 100)
      .then((result) => setCustomers(result.data))
      .catch((err) => setError(err?.response?.data?.error || 'Failed to load customers'))
      .finally(() => setLoading(false));
  }, []);

  const visible = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
  });

  if (loading) return <p className="text-center text-gray-500 py-8">Loading customers...</p>;
  if (error) return <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm">{error}</div>;

  return (
    <div>
      <input
        type="text"
        className="input-base max-w-xs mb-4"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {visible.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No customers yet. 🧁</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3 text-center">Orders</th>
                <th className="py-2 pr-3 text-right">Total Spent</th>
                <th className="py-2">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className="border-b hover:bg-pink-light transition-colors">
                  <td className="py-3 pr-3 font-medium">{c.name}</td>
                  <td className="py-3 pr-3">
                    {c.email ? (
                      <a href={`mailto:${c.email}`} className="text-pink hover:underline">
                        {c.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 pr-3">{c.phone || '—'}</td>
                  <td className="py-3 pr-3 text-center">{c.orderCount}</td>
                  <td className="py-3 pr-3 text-right font-bold text-pink">{formatPrice(c.totalSpent)}</td>
                  <td className="py-3">{c.lastOrderDate ? formatDate(c.lastOrderDate) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
