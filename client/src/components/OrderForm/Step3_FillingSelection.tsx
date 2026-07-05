import React from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { useCatalogStore } from '../../store/catalogStore';
import { formatPrice } from '../../utils/formatters';

const Step3_FillingSelection: React.FC = () => {
  const { formData, setFilling } = useOrderFormStore();
  const { fillings, loading } = useCatalogStore();

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading fillings...</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Choose Your Filling</h3>
      <p className="text-gray-600 mb-6">This applies to all layers of your cake.</p>

      <div className="space-y-3">
        {fillings.map((filling) => {
          const isSelected = formData.fillingId === filling.id;
          const price = Number(filling.priceAddon);
          return (
            <button
              key={filling.id}
              type="button"
              onClick={() => setFilling(filling.id, price)}
              className={`w-full flex justify-between items-center p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-gold bg-pink shadow-md'
                  : 'border-gray-200 hover:border-gold/50 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {isSelected && <span className="text-gold text-xl">✓</span>}
                <span className="font-medium">{filling.name}</span>
              </div>
              <span className="text-gold font-bold">+{formatPrice(price)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step3_FillingSelection;
