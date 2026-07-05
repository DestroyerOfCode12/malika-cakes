import React from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { useCatalogStore } from '../../store/catalogStore';

const Step2_FlavorSelection: React.FC = () => {
  const { formData, setFlavor } = useOrderFormStore();
  const { flavors, loading } = useCatalogStore();

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading flavors...</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Pick Your Flavor</h3>
      <p className="text-gray-600 mb-6">Choose one flavor for your cake.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {flavors.map((flavor) => {
          const isSelected = formData.flavorId === flavor.id;
          return (
            <button
              key={flavor.id}
              type="button"
              onClick={() => setFlavor(flavor.id)}
              className={`text-center p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-gold bg-pink shadow-md'
                  : 'border-gray-200 hover:border-gold/50 bg-white'
              }`}
            >
              <div className="text-3xl mb-2">🍰</div>
              <h4 className="font-bold">{flavor.name}</h4>
              {flavor.description && (
                <p className="text-xs text-gray-500 mt-1">{flavor.description}</p>
              )}
              {isSelected && <span className="text-gold block mt-2">✓ Selected</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step2_FlavorSelection;
