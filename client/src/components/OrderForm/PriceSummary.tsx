import React from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { useCatalogStore } from '../../store/catalogStore';
import { formatPrice } from '../../utils/formatters';

const PriceSummary: React.FC = () => {
  const { formData, pricing } = useOrderFormStore();
  const { getSizeById, getFlavorById } = useCatalogStore();

  const size = getSizeById(formData.sizeId);
  const flavor = getFlavorById(formData.flavorId);

  return (
    <div className="card sticky top-4">
      <h2 className="brand-logo text-2xl mb-4">Your Order</h2>

      {(size || flavor) && (
        <div className="mb-4 pb-4 border-b text-sm space-y-1">
          {size && <p><span className="text-gray-500">Size:</span> {size.name}</p>}
          {flavor && <p><span className="text-gray-500">Flavor:</span> {flavor.name}</p>}
          {formData.topperIds.length > 0 && (
            <p><span className="text-gray-500">Toppers:</span> {formData.topperIds.length} selected</p>
          )}
        </div>
      )}

      <div className="space-y-2 mb-4 pb-4 border-b text-sm">
        <div className="flex justify-between">
          <span>Base Price</span>
          <span>{formatPrice(pricing.basePrice)}</span>
        </div>
        {pricing.fillingPrice > 0 && (
          <div className="flex justify-between">
            <span>Filling</span>
            <span>{formatPrice(pricing.fillingPrice)}</span>
          </div>
        )}
        {pricing.toppersPrice > 0 && (
          <div className="flex justify-between">
            <span>Toppers</span>
            <span>{formatPrice(pricing.toppersPrice)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(pricing.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT (15%)</span>
          <span>{formatPrice(pricing.tax)}</span>
        </div>
        {formData.deliveryMethod === 'delivery' && pricing.deliveryFee > 0 && (
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{formatPrice(pricing.deliveryFee)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between text-lg font-bold mb-2">
        <span>Total</span>
        <span className="text-pink">{formatPrice(pricing.grandTotal)}</span>
      </div>

      {formData.pickupDate && (
        <div className="bg-pink-light p-3 rounded-xl mt-4 text-sm">
          <p className="font-medium">
            {formData.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}: {formData.pickupDate} at{' '}
            {formData.pickupTime}
          </p>
          <p className="text-gray-600">Payment due 7 days prior</p>
        </div>
      )}
    </div>
  );
};

export default PriceSummary;
