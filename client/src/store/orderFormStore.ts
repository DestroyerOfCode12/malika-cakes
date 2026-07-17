import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const VAT_RATE = 0.15;

interface OrderFormState {
  currentStep: number;
  formData: {
    customerName: string;
    email: string;
    phone: string;
    sizeId: string;
    flavorId: string;
    fillingId: string;
    topperIds: string[];
    pickupDate: string;
    pickupTime: string;
    allergiesRestrictions: string;
    specialRequests: string;
    deliveryMethod: 'pickup' | 'delivery';
    deliveryAddress: string;
    deliveryLatitude: number | null;
    deliveryLongitude: number | null;
  };
  pricing: {
    basePrice: number;
    fillingPrice: number;
    toppersPrice: number;
    subtotal: number;
    tax: number;
    total: number; // cake total (subtotal + tax), excludes delivery
    deliveryFee: number;
    deliveryEta: string;
    grandTotal: number; // total + deliveryFee — the actual amount due
  };
  submittedOrder: {
    id: string;
    orderNumber: string;
    totalPrice: number;
    pickupDate: string;
    paymentDueDate: string;
  } | null;
  error: string | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<OrderFormState['formData']>) => void;
  setSize: (sizeId: string, basePrice: number) => void;
  setFlavor: (flavorId: string) => void;
  setFilling: (fillingId: string, price: number) => void;
  addTopper: (topperId: string, price: number) => void;
  removeTopper: (topperId: string, price: number) => void;
  setDeliveryMethod: (method: 'pickup' | 'delivery') => void;
  setDeliveryQuote: (address: string, latitude: number, longitude: number, feeRands: number, eta: string) => void;
  clearDeliveryQuote: () => void;
  setSubmittedOrder: (order: OrderFormState['submittedOrder']) => void;
  setError: (error: string | null) => void;
  resetForm: () => void;
}

const initialFormData: OrderFormState['formData'] = {
  customerName: '',
  email: '',
  phone: '',
  sizeId: '',
  flavorId: '',
  fillingId: '',
  topperIds: [],
  pickupDate: '',
  pickupTime: '12:00',
  allergiesRestrictions: '',
  specialRequests: '',
  deliveryMethod: 'pickup',
  deliveryAddress: '',
  deliveryLatitude: null,
  deliveryLongitude: null,
};

const initialPricing: OrderFormState['pricing'] = {
  basePrice: 0,
  fillingPrice: 0,
  toppersPrice: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
  deliveryFee: 0,
  deliveryEta: '',
  grandTotal: 0,
};

const recalculate = (
  basePrice: number,
  fillingPrice: number,
  toppersPrice: number,
  deliveryFee: number = 0,
  deliveryEta: string = ''
) => {
  const subtotal = Number((basePrice + fillingPrice + toppersPrice).toFixed(2));
  const tax = Number((subtotal * VAT_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const grandTotal = Number((total + deliveryFee).toFixed(2));
  return { basePrice, fillingPrice, toppersPrice, subtotal, tax, total, deliveryFee, deliveryEta, grandTotal };
};

export const useOrderFormStore = create<OrderFormState>()(
  persist(
    (set) => ({
      currentStep: 1,
      formData: initialFormData,
      pricing: initialPricing,
      submittedOrder: null,
      error: null,

      setStep: (step: number) => {
        set({ currentStep: step, error: null });
      },

      nextStep: () => {
        set((state) => ({ currentStep: Math.min(7, state.currentStep + 1), error: null }));
      },

      prevStep: () => {
        set((state) => ({ currentStep: Math.max(1, state.currentStep - 1), error: null }));
      },

      updateFormData: (data: Partial<OrderFormState['formData']>) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      setSize: (sizeId: string, basePrice: number) => {
        set((state) => ({
          formData: { ...state.formData, sizeId },
          pricing: recalculate(
            basePrice,
            state.pricing.fillingPrice,
            state.pricing.toppersPrice,
            state.pricing.deliveryFee,
            state.pricing.deliveryEta
          ),
        }));
      },

      setFlavor: (flavorId: string) => {
        set((state) => ({
          formData: { ...state.formData, flavorId },
        }));
      },

      setFilling: (fillingId: string, price: number) => {
        set((state) => ({
          formData: { ...state.formData, fillingId },
          pricing: recalculate(
            state.pricing.basePrice,
            price,
            state.pricing.toppersPrice,
            state.pricing.deliveryFee,
            state.pricing.deliveryEta
          ),
        }));
      },

      addTopper: (topperId: string, price: number) => {
        set((state) => {
          const newTopperIds = [...state.formData.topperIds, topperId];
          const newToppersPrice = Number((state.pricing.toppersPrice + price).toFixed(2));

          return {
            formData: { ...state.formData, topperIds: newTopperIds },
            pricing: recalculate(
              state.pricing.basePrice,
              state.pricing.fillingPrice,
              newToppersPrice,
              state.pricing.deliveryFee,
              state.pricing.deliveryEta
            ),
          };
        });
      },

      removeTopper: (topperId: string, price: number) => {
        set((state) => {
          const newTopperIds = state.formData.topperIds.filter((id) => id !== topperId);
          const newToppersPrice = Number((state.pricing.toppersPrice - price).toFixed(2));

          return {
            formData: { ...state.formData, topperIds: newTopperIds },
            pricing: recalculate(
              state.pricing.basePrice,
              state.pricing.fillingPrice,
              newToppersPrice,
              state.pricing.deliveryFee,
              state.pricing.deliveryEta
            ),
          };
        });
      },

      setDeliveryMethod: (method: 'pickup' | 'delivery') => {
        set((state) => ({
          formData: {
            ...state.formData,
            deliveryMethod: method,
            ...(method === 'pickup' && { deliveryAddress: '', deliveryLatitude: null, deliveryLongitude: null }),
          },
          pricing:
            method === 'pickup'
              ? recalculate(state.pricing.basePrice, state.pricing.fillingPrice, state.pricing.toppersPrice, 0, '')
              : state.pricing,
        }));
      },

      setDeliveryQuote: (address: string, latitude: number, longitude: number, feeRands: number, eta: string) => {
        set((state) => ({
          formData: { ...state.formData, deliveryAddress: address, deliveryLatitude: latitude, deliveryLongitude: longitude },
          pricing: recalculate(
            state.pricing.basePrice,
            state.pricing.fillingPrice,
            state.pricing.toppersPrice,
            feeRands,
            eta
          ),
        }));
      },

      clearDeliveryQuote: () => {
        set((state) => ({
          formData: { ...state.formData, deliveryAddress: '', deliveryLatitude: null, deliveryLongitude: null },
          pricing: recalculate(
            state.pricing.basePrice,
            state.pricing.fillingPrice,
            state.pricing.toppersPrice,
            0,
            ''
          ),
        }));
      },

      setSubmittedOrder: (order) => {
        set({ submittedOrder: order });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      resetForm: () => {
        set({
          currentStep: 1,
          formData: initialFormData,
          pricing: initialPricing,
          submittedOrder: null,
          error: null,
        });
      },
    }),
    {
      name: 'order-form-storage',
      partialize: (state) => ({
        formData: state.formData,
        pricing: state.pricing,
      }),
    }
  )
);
