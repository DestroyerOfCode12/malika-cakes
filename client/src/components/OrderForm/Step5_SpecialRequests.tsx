import React, { useState } from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { getMinPickupDate, validatePickupDate } from '../../utils/validators';
import { deliveryService } from '../../services/deliveryService';
import { formatPrice } from '../../utils/formatters';
import AddressAutocomplete from './AddressAutocomplete';

const Step5_SpecialRequests: React.FC = () => {
  const { formData, pricing, updateFormData, setDeliveryMethod, setDeliveryQuote, clearDeliveryQuote } =
    useOrderFormStore();
  const minDate = getMinPickupDate();

  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const pickupDateInvalid = formData.pickupDate.length > 0 && !validatePickupDate(formData.pickupDate);

  const handleAddressSelect = async (result: { address: string; latitude: number; longitude: number }) => {
    setQuoting(true);
    setQuoteError(null);
    try {
      const quote = await deliveryService.getQuote(result.address, result.latitude, result.longitude);
      setDeliveryQuote(result.address, result.latitude, result.longitude, quote.feeRands, quote.dropoffEta);
    } catch (err: any) {
      clearDeliveryQuote();
      if (err?.response?.status === 503) {
        setQuoteError("Delivery isn't available yet — please choose pickup for now.");
      } else {
        setQuoteError(err?.response?.data?.error || "Couldn't get a delivery quote for that address.");
      }
    } finally {
      setQuoting(false);
    }
  };

  const handleAddressClear = () => {
    clearDeliveryQuote();
    setQuoteError(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Special Requests & Logistics</h2>
      <p className="text-gray-600 mb-6">Tell us about allergies, design ideas, and when to pick up.</p>

      <div className="space-y-5">
        <div>
          <label htmlFor="allergies" className="block text-sm font-medium mb-2">
            Allergies / Dietary Restrictions
          </label>
          <textarea
            id="allergies"
            className="input-base"
            rows={2}
            maxLength={500}
            placeholder="e.g., No nuts, gluten-free, vegan..."
            value={formData.allergiesRestrictions}
            onChange={(e) => updateFormData({ allergiesRestrictions: e.target.value })}
            aria-describedby="allergies-count"
          />
          <p id="allergies-count" className="text-xs text-gray-400 mt-1">
            {formData.allergiesRestrictions.length}/500
          </p>
        </div>

        <div>
          <label htmlFor="special-requests" className="block text-sm font-medium mb-2">
            Special Requests / Design Notes
          </label>
          <textarea
            id="special-requests"
            className="input-base"
            rows={3}
            maxLength={500}
            placeholder="Describe any custom design ideas..."
            value={formData.specialRequests}
            onChange={(e) => updateFormData({ specialRequests: e.target.value })}
            aria-describedby="requests-count"
          />
          <p id="requests-count" className="text-xs text-gray-400 mt-1">
            {formData.specialRequests.length}/500
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pickup-date" className="block text-sm font-medium mb-2">Pickup Date *</label>
            <input
              id="pickup-date"
              type="date"
              className="input-base"
              min={minDate}
              value={formData.pickupDate}
              onChange={(e) => updateFormData({ pickupDate: e.target.value })}
              aria-invalid={pickupDateInvalid}
              aria-describedby={pickupDateInvalid ? 'pickup-date-error' : undefined}
              required
            />
            {pickupDateInvalid && (
              <p id="pickup-date-error" role="alert" className="text-xs text-red-600 mt-1">
                Pickup date must be at least 14 days from today.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pickup-time" className="block text-sm font-medium mb-2">Pickup Time</label>
            <input
              id="pickup-time"
              type="time"
              className="input-base"
              min="08:00"
              max="17:00"
              value={formData.pickupTime}
              onChange={(e) => updateFormData({ pickupTime: e.target.value })}
              aria-describedby="pickup-time-hint"
            />
            <p id="pickup-time-hint" className="text-xs text-gray-400 mt-1">
              Available 8:00 AM – 5:00 PM (default 12:00 PM)
            </p>
          </div>
        </div>

        <hr className="divider" />

        <div>
          <label htmlFor="customer-name" className="block text-sm font-medium mb-2">Your Name *</label>
          <input
            id="customer-name"
            type="text"
            autoComplete="name"
            className="input-base"
            placeholder="Jane Doe"
            value={formData.customerName}
            onChange={(e) => updateFormData({ customerName: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customer-email" className="block text-sm font-medium mb-2">Email *</label>
            <input
              id="customer-email"
              type="email"
              autoComplete="email"
              className="input-base"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="customer-phone" className="block text-sm font-medium mb-2">Phone *</label>
            <input
              id="customer-phone"
              type="tel"
              autoComplete="tel"
              className="input-base"
              placeholder="+27712345678"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              required
            />
          </div>
        </div>

        <hr className="divider" />

        <div>
          <span className="block text-sm font-medium mb-2">Pickup or Delivery?</span>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Pickup or delivery">
            <button
              type="button"
              role="radio"
              aria-checked={formData.deliveryMethod === 'pickup'}
              onClick={() => setDeliveryMethod('pickup')}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                formData.deliveryMethod === 'pickup'
                  ? 'border-pink bg-pink-light'
                  : 'border-gray-200 hover:border-pink/50 bg-white'
              }`}
            >
              <span className="font-medium text-sm">📍 Pickup</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={formData.deliveryMethod === 'delivery'}
              onClick={() => setDeliveryMethod('delivery')}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                formData.deliveryMethod === 'delivery'
                  ? 'border-pink bg-pink-light'
                  : 'border-gray-200 hover:border-pink/50 bg-white'
              }`}
            >
              <span className="font-medium text-sm">🚗 Delivery</span>
            </button>
          </div>

          {formData.deliveryMethod === 'pickup' && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mt-3">
              📍 Pickup from our Midrand location — details in your confirmation email.
            </div>
          )}

          {formData.deliveryMethod === 'delivery' && (
            <div className="mt-3">
              <label htmlFor="delivery-address" className="block text-sm font-medium mb-2">
                Delivery Address *
              </label>
              <AddressAutocomplete
                value={formData.deliveryAddress}
                onSelect={handleAddressSelect}
                onClear={handleAddressClear}
                disabled={quoting}
              />
              <div className="mt-2 text-sm" aria-live="polite">
                {quoting && <p className="text-gray-500">Getting delivery quote...</p>}
                {!quoting && quoteError && <p className="text-red-600">{quoteError}</p>}
                {!quoting && !quoteError && pricing.deliveryFee > 0 && (
                  <p className="text-pink font-medium">
                    Delivery: {formatPrice(pricing.deliveryFee)}
                    {pricing.deliveryEta && ` · Est. ${pricing.deliveryEta}`}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step5_SpecialRequests;
