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
  };
  pricing: {
    basePrice: number;
    fillingPrice: number;
    toppersPrice: number;
    subtotal: number;
    tax: number;
    total: number;
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
};

const initialPricing: OrderFormState['pricing'] = {
  basePrice: 0,
  fillingPrice: 0,
  toppersPrice: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
};

const recalculate = (basePrice: number, fillingPrice: number, toppersPrice: number) => {
  const subtotal = Number((basePrice + fillingPrice + toppersPrice).toFixed(2));
  const tax = Number((subtotal * VAT_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  return { basePrice, fillingPrice, toppersPrice, subtotal, tax, total };
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
          pricing: recalculate(basePrice, state.pricing.fillingPrice, state.pricing.toppersPrice),
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
          pricing: recalculate(state.pricing.basePrice, price, state.pricing.toppersPrice),
        }));
      },

      addTopper: (topperId: string, price: number) => {
        set((state) => {
          const newTopperIds = [...state.formData.topperIds, topperId];
          const newToppersPrice = Number((state.pricing.toppersPrice + price).toFixed(2));

          return {
            formData: { ...state.formData, topperIds: newTopperIds },
            pricing: recalculate(state.pricing.basePrice, state.pricing.fillingPrice, newToppersPrice),
          };
        });
      },

      removeTopper: (topperId: string, price: number) => {
        set((state) => {
          const newTopperIds = state.formData.topperIds.filter((id) => id !== topperId);
          const newToppersPrice = Number((state.pricing.toppersPrice - price).toFixed(2));

          return {
            formData: { ...state.formData, topperIds: newTopperIds },
            pricing: recalculate(state.pricing.basePrice, state.pricing.fillingPrice, newToppersPrice),
          };
        });
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
