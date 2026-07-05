import React from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { useCatalogStore } from '../../store/catalogStore';
import { formatPrice } from '../../utils/formatters';

const Step4_ToppersSelection: React.FC = () => {
  const { formData, addTopper, removeTopper } = useOrderFormStore();
  const { toppers, loading } = useCatalogStore();

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading toppers...</p>;
  }

  const toggleTopper = (topperId: string, price: number) => {
    if (formData.topperIds.includes(topperId)) {
      removeTopper(topperId, price);
    } else {
      addTopper(topperId, price);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Add Toppers & Decorations</h3>
      <p className="text-gray-600 mb-6">Optional — select as many as you'd like.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {toppers.map((topper) => {
          const isSelected = formData.topperIds.includes(topper.id);
          const price = Number(topper.priceAddon);
          return (
            <button
              key={topper.id}
              type="button"
              onClick={() => toggleTopper(topper.id, price)}
              className={`text-center p-4 rounded-xl border-2 transition-all hover:scale-[1.02] relative ${
                isSelected
                  ? 'border-pink bg-pink-light shadow-md scale-[1.02]'
                  : 'border-gray-200 hover:border-pink/50 bg-white'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 text-pink text-lg">✓</span>
              )}
              <div className="text-2xl mb-2 hover-wiggle">✨</div>
              <h4 className="font-medium text-sm">{topper.name}</h4>
              <p className="text-pink font-bold text-sm mt-1">
                {price > 0 ? `+${formatPrice(price)}` : 'Free'}
              </p>
            </button>
          );
        })}
      </div>

      {formData.topperIds.length > 0 && (
        <p className="text-sm text-gray-500 mt-4">
          {formData.topperIds.length} topper{formData.topperIds.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};

export default Step4_ToppersSelection;
