import React from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { useCatalogStore } from '../../store/catalogStore';
import { formatPrice, formatDate } from '../../utils/formatters';
import { calculatePaymentDueDate } from '../../utils/validators';

const Step6_OrderSummary: React.FC = () => {
  const { formData, pricing, setStep } = useOrderFormStore();
  const { getSizeById, getFlavorById, getFillingById, getToppingById } = useCatalogStore();

  const size = getSizeById(formData.sizeId);
  const flavor = getFlavorById(formData.flavorId);
  const filling = getFillingById(formData.fillingId);
  const selectedToppers = formData.topperIds
    .map((id) => getToppingById(id))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const paymentDueDate = formData.pickupDate ? calculatePaymentDueDate(formData.pickupDate) : null;

  const EditLink: React.FC<{ step: number }> = ({ step }) => (
    <button
      type="button"
      onClick={() => setStep(step)}
      className="text-sm text-pink hover:underline"
    >
      Edit
    </button>
  );

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Review Your Order</h3>
      <p className="text-gray-600 mb-6">Check everything looks right before proceeding to payment.</p>

      <div className="space-y-4">
        <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="font-bold">{size?.name || '—'}</p>
          </div>
          <EditLink step={1} />
        </div>

        <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Flavor</p>
            <p className="font-bold">{flavor?.name || '—'}</p>
          </div>
          <EditLink step={2} />
        </div>

        <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Filling</p>
            <p className="font-bold">{filling?.name || '—'}</p>
          </div>
          <EditLink step={3} />
        </div>

        <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Toppers</p>
            {selectedToppers.length > 0 ? (
              <p className="font-bold">{selectedToppers.map((t) => t.name).join(', ')}</p>
            ) : (
              <p className="text-gray-400">None selected</p>
            )}
          </div>
          <EditLink step={4} />
        </div>

        <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Pickup</p>
            <p className="font-bold">
              {formData.pickupDate ? formatDate(formData.pickupDate) : '—'} at {formData.pickupTime}
            </p>
            {formData.allergiesRestrictions && (
              <p className="text-sm text-gray-600 mt-1">Allergies: {formData.allergiesRestrictions}</p>
            )}
            {formData.specialRequests && (
              <p className="text-sm text-gray-600 mt-1">Notes: {formData.specialRequests}</p>
            )}
          </div>
          <EditLink step={5} />
        </div>

        <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Customer Details</p>
            <p className="font-bold">{formData.customerName}</p>
            <p className="text-sm text-gray-600">{formData.email}</p>
            <p className="text-sm text-gray-600">{formData.phone}</p>
          </div>
          <EditLink step={5} />
        </div>

        <hr className="divider" />

        <div className="p-4 bg-pink-light rounded-xl space-y-2">
          <div className="flex justify-between text-sm">
            <span>Base Price</span>
            <span>{formatPrice(pricing.basePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Filling</span>
            <span>{formatPrice(pricing.fillingPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Toppers</span>
            <span>{formatPrice(pricing.toppersPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>VAT (15%)</span>
            <span>{formatPrice(pricing.tax)}</span>
          </div>
          <hr className="border-pink/30" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-pink">{formatPrice(pricing.total)}</span>
          </div>
        </div>

        {paymentDueDate && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            ⏰ Payment due by <strong>{formatDate(paymentDueDate)}</strong> (7 days before pickup)
          </div>
        )}
      </div>
    </div>
  );
};

export default Step6_OrderSummary;
