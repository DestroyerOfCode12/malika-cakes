import React from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { useCatalogStore } from '../../store/catalogStore';
import { formatPrice } from '../../utils/formatters';

const Step1_SizeSelection: React.FC = () => {
  const { formData, setSize } = useOrderFormStore();
  const { sizes, loading } = useCatalogStore();

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading sizes...</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Choose Your Cake Size</h3>
      <p className="text-gray-600 mb-6">Select the size that best fits your celebration.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sizes.map((size) => {
          const isSelected = formData.sizeId === size.id;
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => setSize(size.id, Number(size.basePrice))}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                isSelected
                  ? 'border-pink bg-pink-light shadow-md scale-[1.02]'
                  : 'border-gray-200 hover:border-pink/50 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">{size.name}</h4>
                {isSelected && <span className="text-pink text-xl">✓</span>}
              </div>
              <p className="text-pink font-bold text-xl mb-1">{formatPrice(Number(size.basePrice))}</p>
              {(size.servingsMin || size.servingsMax) && (
                <p className="text-sm text-gray-500 mb-1">
                  Serves {size.servingsMin}
                  {size.servingsMax && size.servingsMax !== size.servingsMin ? `–${size.servingsMax}` : ''}
                </p>
              )}
              {size.description && <p className="text-sm text-gray-600">{size.description}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step1_SizeSelection;
