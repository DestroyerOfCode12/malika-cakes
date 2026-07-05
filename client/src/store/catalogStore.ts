import { create } from 'zustand';
import { CatalogSize, CatalogFlavor, CatalogFilling, CatalogTopper } from '../types';
import { catalogService } from '../services/catalogService';

interface CatalogStore {
  sizes: CatalogSize[];
  flavors: CatalogFlavor[];
  fillings: CatalogFilling[];
  toppers: CatalogTopper[];
  loading: boolean;
  error: string | null;

  fetchCatalog: () => Promise<void>;
  getSizeById: (id: string) => CatalogSize | undefined;
  getFlavorById: (id: string) => CatalogFlavor | undefined;
  getFillingById: (id: string) => CatalogFilling | undefined;
  getToppingById: (id: string) => CatalogTopper | undefined;
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  sizes: [],
  flavors: [],
  fillings: [],
  toppers: [],
  loading: false,
  error: null,

  fetchCatalog: async () => {
    set({ loading: true, error: null });
    try {
      const [sizes, flavors, fillings, toppers] = await Promise.all([
        catalogService.getSizes(),
        catalogService.getFlavors(),
        catalogService.getFillings(),
        catalogService.getToppers(),
      ]);

      set({
        sizes,
        flavors,
        fillings,
        toppers,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load catalog',
        loading: false,
      });
    }
  },

  getSizeById: (id: string) => {
    return get().sizes.find(s => s.id === id);
  },

  getFlavorById: (id: string) => {
    return get().flavors.find(f => f.id === id);
  },

  getFillingById: (id: string) => {
    return get().fillings.find(f => f.id === id);
  },

  getToppingById: (id: string) => {
    return get().toppers.find(t => t.id === id);
  },
}));
