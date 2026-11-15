import { CatalogSize, CatalogFlavor, CatalogFilling, CatalogTopper } from '../types';

// Mirrors server/prisma/seed.ts. Used only when the API can't be reached
// (e.g. the static Netlify build before the backend is deployed), so the
// order form can still be browsed. Keep prices in sync with the seed.
export const previewSizes: CatalogSize[] = [
  { id: 'preview-size-bento', name: 'Bento', basePrice: 250, servingsMin: 1, servingsMax: 1, description: 'Mini single cake', isActive: true },
  { id: 'preview-size-15', name: '15cm Round', basePrice: 400, servingsMin: 6, servingsMax: 8, description: 'Small round cake', isActive: true },
  { id: 'preview-size-20', name: '20cm Round', basePrice: 550, servingsMin: 12, servingsMax: 15, description: 'Medium round cake (Most Popular)', isActive: true },
  { id: 'preview-size-2tier', name: '2-Tier', basePrice: 750, servingsMin: 20, servingsMax: 25, description: 'Two tiers stacked', isActive: true },
  { id: 'preview-size-3tier', name: '3-Tier', basePrice: 950, servingsMin: 30, servingsMax: 40, description: 'Three tiers stacked', isActive: true },
  { id: 'preview-size-cupcakes', name: 'Cupcakes (Dozen)', basePrice: 200, servingsMin: 12, servingsMax: 12, description: 'Minimum 1 dozen', isActive: true },
];

export const previewFlavors: CatalogFlavor[] = [
  { id: 'preview-flavor-vanilla', name: 'Vanilla', description: 'Classic vanilla cake', isActive: true },
  { id: 'preview-flavor-chocolate', name: 'Chocolate', description: 'Rich chocolate cake', isActive: true },
  { id: 'preview-flavor-redvelvet', name: 'Red Velvet', description: 'Traditional red velvet', isActive: true },
  { id: 'preview-flavor-carrot', name: 'Carrot', description: 'Spiced carrot cake', isActive: true },
  { id: 'preview-flavor-lemon', name: 'Lemon', description: 'Zesty lemon cake', isActive: true },
  { id: 'preview-flavor-strawberry', name: 'Strawberry', description: 'Fresh strawberry cake', isActive: true },
];

export const previewFillings: CatalogFilling[] = [
  { id: 'preview-filling-vanilla', name: 'Vanilla Buttercream', priceAddon: 50, isActive: true },
  { id: 'preview-filling-ganache', name: 'Chocolate Ganache', priceAddon: 75, isActive: true },
  { id: 'preview-filling-creamcheese', name: 'Cream Cheese Frosting', priceAddon: 75, isActive: true },
  { id: 'preview-filling-caramel', name: 'Salted Caramel', priceAddon: 100, isActive: true },
  { id: 'preview-filling-jam', name: 'Jam', priceAddon: 50, isActive: true },
  { id: 'preview-filling-mousse', name: 'Mousse', priceAddon: 100, isActive: true },
];

export const previewToppers: CatalogTopper[] = [
  { id: 'preview-topper-berries', name: 'Fresh Berries', priceAddon: 80, isActive: true },
  { id: 'preview-topper-flowers', name: 'Fresh Flowers', priceAddon: 120, isActive: true },
  { id: 'preview-topper-sprinkles', name: 'Sprinkles', priceAddon: 30, isActive: true },
  { id: 'preview-topper-gold', name: 'Edible Gold', priceAddon: 50, isActive: true },
  { id: 'preview-topper-shards', name: 'Chocolate Shards', priceAddon: 40, isActive: true },
  { id: 'preview-topper-macarons', name: 'Macarons', priceAddon: 100, isActive: true },
  { id: 'preview-topper-fondant', name: 'Fondant Decoration', priceAddon: 60, isActive: true },
  { id: 'preview-topper-mirror', name: 'Mirror Glaze', priceAddon: 150, isActive: true },
];
