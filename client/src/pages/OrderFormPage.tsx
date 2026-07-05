import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrderFormStore } from '../store/orderFormStore';
import { useCatalogStore } from '../store/catalogStore';

const OrderFormPage: React.FC = () => {
  const { currentStep, formData, pricing } = useOrderFormStore();
  const { sizes, flavors, fillings, toppers, fetchCatalog } = useCatalogStore();

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-dark-chocolate text-white py-4">
        <div className="container-custom flex justify-between items-center">
          <Link to="/" className="text-gold text-2xl font-bold">🎂 Malika's</Link>
          <h1 className="text-xl">Custom Cake Order</h1>
          <div></div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="md:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Step {currentStep} of 7</h2>

              {/* Step indicator */}
              <div className="flex justify-between mb-8">
                {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                      step === currentStep
                        ? 'bg-gold text-dark-chocolate'
                        : step < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>

              {/* Form content placeholder */}
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Step {currentStep} content coming soon</p>
                <p className="text-sm text-gray-500">
                  This will include: {currentStep === 1 && 'Size Selection'}
                  {currentStep === 2 && 'Flavor Selection'}
                  {currentStep === 3 && 'Filling Selection'}
                  {currentStep === 4 && 'Toppers Selection'}
                  {currentStep === 5 && 'Special Requests & Logistics'}
                  {currentStep === 6 && 'Order Summary'}
                  {currentStep === 7 && 'Payment'}
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                <button className="btn-outline" disabled={currentStep === 1}>
                  Previous
                </button>
                <button className="btn-primary" disabled={currentStep === 7}>
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div>
            <div className="card sticky top-4">
              <h3 className="text-2xl font-bold mb-6 text-gold">Order Summary</h3>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>R{pricing.basePrice.toFixed(2)}</span>
                </div>
                {pricing.fillingPrice > 0 && (
                  <div className="flex justify-between">
                    <span>Filling:</span>
                    <span>R{pricing.fillingPrice.toFixed(2)}</span>
                  </div>
                )}
                {pricing.toppersPrice > 0 && (
                  <div className="flex justify-between">
                    <span>Toppers:</span>
                    <span>R{pricing.toppersPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R{pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (15%):</span>
                  <span>R{pricing.tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total:</span>
                <span className="text-gold">R{pricing.total.toFixed(2)}</span>
              </div>

              {formData.pickupDate && (
                <div className="bg-pink p-3 rounded mb-4">
                  <p className="text-sm font-medium">Pickup: {formData.pickupDate}</p>
                  <p className="text-sm text-gray-600">Payment due 7 days before</p>
                </div>
              )}

              <button className="btn-primary w-full" disabled={currentStep !== 7}>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-chocolate text-white py-4 mt-12">
        <div className="container-custom text-center text-sm">
          <p>&copy; 2026 Malika's Cake Boutique</p>
        </div>
      </footer>
    </div>
  );
};

export default OrderFormPage;
