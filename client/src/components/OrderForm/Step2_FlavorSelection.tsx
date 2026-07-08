import React from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { useCatalogStore } from '../../store/catalogStore';
import { CardGridSkeleton } from '../Skeleton';

const Step2_FlavorSelection: React.FC = () => {
  const { formData, setFlavor } = useOrderFormStore();
  const { flavors, loading } = useCatalogStore();

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-2">Pick Your Flavor</h2>
        <p className="text-gray-600 mb-6">Choose one flavor for your cake.</p>
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Pick Your Flavor</h2>
      <p className="text-gray-600 mb-6">Choose one flavor for your cake.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {flavors.map((flavor) => {
          const isSelected = formData.flavorId === flavor.id;
          return (
            <button
              key={flavor.id}
              type="button"
              onClick={() => setFlavor(flavor.id)}
              className={`text-center p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                isSelected
                  ? 'border-pink bg-pink-light shadow-md scale-[1.02]'
                  : 'border-gray-200 hover:border-pink/50 bg-white'
              }`}
            >
              <div className="text-3xl mb-2 hover-wiggle">🍰</div>
              <h3 className="font-bold">{flavor.name}</h3>
              {flavor.description && (
                <p className="text-xs text-gray-500 mt-1">{flavor.description}</p>
              )}
              {isSelected && <span className="text-pink block mt-2">✓ Selected</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step2_FlavorSelection;
