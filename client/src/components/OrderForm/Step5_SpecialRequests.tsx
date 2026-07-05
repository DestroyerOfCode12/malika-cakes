import React from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { getMinPickupDate, validatePickupDate } from '../../utils/validators';

const Step5_SpecialRequests: React.FC = () => {
  const { formData, updateFormData } = useOrderFormStore();
  const minDate = getMinPickupDate();

  const pickupDateInvalid = formData.pickupDate.length > 0 && !validatePickupDate(formData.pickupDate);

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Special Requests & Logistics</h3>
      <p className="text-gray-600 mb-6">Tell us about allergies, design ideas, and when to pick up.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">
            Allergies / Dietary Restrictions
          </label>
          <textarea
            className="input-base"
            rows={2}
            maxLength={500}
            placeholder="e.g., No nuts, gluten-free, vegan..."
            value={formData.allergiesRestrictions}
            onChange={(e) => updateFormData({ allergiesRestrictions: e.target.value })}
          />
          <p className="text-xs text-gray-400 mt-1">{formData.allergiesRestrictions.length}/500</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Special Requests / Design Notes</label>
          <textarea
            className="input-base"
            rows={3}
            maxLength={500}
            placeholder="Describe any custom design ideas or delivery instructions..."
            value={formData.specialRequests}
            onChange={(e) => updateFormData({ specialRequests: e.target.value })}
          />
          <p className="text-xs text-gray-400 mt-1">{formData.specialRequests.length}/500</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pickup Date *</label>
            <input
              type="date"
              className="input-base"
              min={minDate}
              value={formData.pickupDate}
              onChange={(e) => updateFormData({ pickupDate: e.target.value })}
            />
            {pickupDateInvalid && (
              <p className="text-xs text-red-600 mt-1">
                Pickup date must be at least 14 days from today.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pickup Time</label>
            <input
              type="time"
              className="input-base"
              min="08:00"
              max="17:00"
              value={formData.pickupTime}
              onChange={(e) => updateFormData({ pickupTime: e.target.value })}
            />
            <p className="text-xs text-gray-400 mt-1">Available 8:00 AM – 5:00 PM (default 12:00 PM)</p>
          </div>
        </div>

        <hr className="divider" />

        <div>
          <label className="block text-sm font-medium mb-2">Your Name *</label>
          <input
            type="text"
            className="input-base"
            placeholder="Jane Doe"
            value={formData.customerName}
            onChange={(e) => updateFormData({ customerName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              className="input-base"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone *</label>
            <input
              type="tel"
              className="input-base"
              placeholder="+27712345678"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
          📍 Delivery option: <strong>Pickup only</strong> (Uber Connect delivery coming Q1 2027)
        </div>
      </div>
    </div>
  );
};

export default Step5_SpecialRequests;
