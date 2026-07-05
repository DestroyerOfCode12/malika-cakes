import React from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { validateEmail, validatePhone, validatePickupDate } from '../../utils/validators';

import Step1_SizeSelection from './Step1_SizeSelection';
import Step2_FlavorSelection from './Step2_FlavorSelection';
import Step3_FillingSelection from './Step3_FillingSelection';
import Step4_ToppersSelection from './Step4_ToppersSelection';
import Step5_SpecialRequests from './Step5_SpecialRequests';
import Step6_OrderSummary from './Step6_OrderSummary';
import Step7_Payment from './Step7_Payment';
import OrderConfirmation from './OrderConfirmation';

const STEP_LABELS = [
  'Size',
  'Flavor',
  'Filling',
  'Toppers',
  'Details',
  'Review',
  'Payment',
];

const OrderFormWizard: React.FC = () => {
  const { currentStep, formData, submittedOrder, nextStep, prevStep, setStep, setError, error } =
    useOrderFormStore();

  if (submittedOrder) {
    return (
      <div className="card">
        <OrderConfirmation />
      </div>
    );
  }

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1:
        return formData.sizeId ? null : 'Please select a cake size to continue.';
      case 2:
        return formData.flavorId ? null : 'Please select a flavor to continue.';
      case 3:
        return formData.fillingId ? null : 'Please select a filling to continue.';
      case 4:
        return null; // Toppers optional
      case 5:
        if (!formData.customerName || formData.customerName.length < 2) {
          return 'Please enter your name (at least 2 characters).';
        }
        if (!validateEmail(formData.email)) {
          return 'Please enter a valid email address.';
        }
        if (!validatePhone(formData.phone)) {
          return 'Please enter a valid phone number (e.g., +27712345678 or 0712345678).';
        }
        if (!formData.pickupDate) {
          return 'Please select a pickup date.';
        }
        if (!validatePickupDate(formData.pickupDate)) {
          return 'Pickup date must be at least 14 days from today.';
        }
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    nextStep();
  };

  const handlePrev = () => {
    setError(null);
    prevStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_SizeSelection />;
      case 2:
        return <Step2_FlavorSelection />;
      case 3:
        return <Step3_FillingSelection />;
      case 4:
        return <Step4_ToppersSelection />;
      case 5:
        return <Step5_SpecialRequests />;
      case 6:
        return <Step6_OrderSummary />;
      case 7:
        return <Step7_Payment />;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      {/* Step indicator */}
      <div className="flex justify-between items-center mb-8 overflow-x-auto">
        {STEP_LABELS.map((label, idx) => {
          const step = idx + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <button
              key={step}
              type="button"
              onClick={() => step < currentStep && setStep(step)}
              className="flex flex-col items-center gap-1 flex-1 min-w-[60px]"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  isActive
                    ? 'bg-gold text-dark-chocolate'
                    : isDone
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isDone ? '✓' : step}
              </div>
              <span className={`text-xs ${isActive ? 'font-bold text-dark-chocolate' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="min-h-[300px]">{renderStep()}</div>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm mt-6">{error}</div>
      )}

      {/* Navigation buttons (hidden on payment step, which has its own CTA) */}
      {currentStep < 7 && (
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="btn-outline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button type="button" onClick={handleNext} className="btn-primary">
            {currentStep === 6 ? 'Proceed to Payment' : 'Next'}
          </button>
        </div>
      )}

      {currentStep === 7 && (
        <div className="mt-4">
          <button type="button" onClick={handlePrev} className="text-sm text-gray-500 hover:underline">
            ← Back to review
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderFormWizard;
