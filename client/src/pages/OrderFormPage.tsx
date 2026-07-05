import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrderFormStore } from '../store/orderFormStore';
import { useCatalogStore } from '../store/catalogStore';
import OrderFormWizard from '../components/OrderForm/OrderFormWizard';
import PriceSummary from '../components/OrderForm/PriceSummary';

const OrderFormPage: React.FC = () => {
  const { fetchCatalog } = useCatalogStore();
  const submittedOrder = useOrderFormStore((state) => state.submittedOrder);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-charcoal text-white py-4">
        <div className="container-custom flex justify-between items-center">
          <Link to="/" className="brand-logo text-2xl">🧁 Malika's</Link>
          <h1 className="text-xl font-semibold text-white">Custom Cake Order</h1>
          <div></div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="md:col-span-2">
            <OrderFormWizard />
          </div>

          {/* Price Summary Sidebar (hidden after order submitted) */}
          {!submittedOrder && (
            <div>
              <PriceSummary />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-4 mt-12">
        <div className="container-custom text-center text-sm">
          <p>&copy; 2026 Malika's Cake Boutique</p>
        </div>
      </footer>
    </div>
  );
};

export default OrderFormPage;
