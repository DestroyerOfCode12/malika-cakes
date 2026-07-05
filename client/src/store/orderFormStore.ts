import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  error: string | null;

  setStep: (step: number) => void;
  updateFormData: (data: Partial<OrderFormState['formData']>) => void;
  updatePricing: (pricing: Partial<OrderFormState['pricing']>) => void;
  addTopper: (topperId: string, price: number) => void;
  removeTopper: (topperId: string, price: number) => void;
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

export const useOrderFormStore = create<OrderFormState>()(
  persist(
    (set) => ({
      currentStep: 1,
      formData: initialFormData,
      pricing: initialPricing,
      error: null,

      setStep: (step: number) => {
        set({ currentStep: step });
      },

      updateFormData: (data: Partial<OrderFormState['formData']>) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      updatePricing: (pricing: Partial<OrderFormState['pricing']>) => {
        set((state) => ({
          pricing: { ...state.pricing, ...pricing },
        }));
      },

      addTopper: (topperId: string, price: number) => {
        set((state) => {
          const newTopperIds = [...state.formData.topperIds, topperId];
          const newToppersPrice = state.pricing.toppersPrice + price;
          const subtotal = state.pricing.basePrice + state.pricing.fillingPrice + newToppersPrice;
          const tax = Number((subtotal * 0.15).toFixed(2));
          const total = Number((subtotal + tax).toFixed(2));

          return {
            formData: { ...state.formData, topperIds: newTopperIds },
            pricing: {
              ...state.pricing,
              toppersPrice: Number(newToppersPrice.toFixed(2)),
              subtotal: Number(subtotal.toFixed(2)),
              tax,
              total,
            },
          };
        });
      },

      removeTopper: (topperId: string, price: number) => {
        set((state) => {
          const newTopperIds = state.formData.topperIds.filter(id => id !== topperId);
          const newToppersPrice = state.pricing.toppersPrice - price;
          const subtotal = state.pricing.basePrice + state.pricing.fillingPrice + newToppersPrice;
          const tax = Number((subtotal * 0.15).toFixed(2));
          const total = Number((subtotal + tax).toFixed(2));

          return {
            formData: { ...state.formData, topperIds: newTopperIds },
            pricing: {
              ...state.pricing,
              toppersPrice: Number(newToppersPrice.toFixed(2)),
              subtotal: Number(subtotal.toFixed(2)),
              tax,
              total,
            },
          };
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      resetForm: () => {
        set({
          currentStep: 1,
          formData: initialFormData,
          pricing: initialPricing,
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
