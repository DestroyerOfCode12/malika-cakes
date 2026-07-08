import { Decimal } from '@prisma/client/runtime/library';

const VAT_RATE = 0.15; // 15% VAT for South Africa

/**
 * Convert an "HH:mm" string into a Date for a Postgres @db.Time column.
 * Only the time-of-day is persisted; the date part is arbitrary.
 */
export const parsePickupTime = (hhmm: string): Date => {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
};

/**
 * Convert a @db.Time column's Date value back into an "HH:mm" string.
 */
export const formatPickupTime = (time: Date): string => {
  return time.toISOString().slice(11, 16);
};

interface PricingBreakdown {
  basePrice: number;
  fillingPrice: number;
  toppersPrice: number;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Calculate total order price
 */
export const calculateOrderPrice = (
  basePrice: number,
  fillingPrice: number,
  toppersPrice: number
): PricingBreakdown => {
  const basePriceNum = typeof basePrice === 'object' && 'toNumber' in basePrice
    ? (basePrice as any).toNumber()
    : Number(basePrice);

  const fillingPriceNum = typeof fillingPrice === 'object' && 'toNumber' in fillingPrice
    ? (fillingPrice as any).toNumber()
    : Number(fillingPrice);

  const toppersPriceNum = typeof toppersPrice === 'object' && 'toNumber' in toppersPrice
    ? (toppersPrice as any).toNumber()
    : Number(toppersPrice);

  const subtotal = basePriceNum + fillingPriceNum + toppersPriceNum;
  const tax = Number((subtotal * VAT_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return {
    basePrice: basePriceNum,
    fillingPrice: fillingPriceNum,
    toppersPrice: toppersPriceNum,
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    total,
  };
};

/**
 * Calculate price for toppers (sum of individual topper prices)
 */
export const calculateToppersPrice = (toppingPrices: number[]): number => {
  return Number(
    toppingPrices
      .reduce((sum, price) => {
        const priceNum = typeof price === 'object' && 'toNumber' in price
          ? (price as any).toNumber()
          : Number(price);
        return sum + priceNum;
      }, 0)
      .toFixed(2)
  );
};

/**
 * Format price for display (ZAR)
 */
export const formatPrice = (price: number | Decimal): string => {
  const numPrice = typeof price === 'object' && 'toNumber' in price
    ? (price as any).toNumber()
    : Number(price);
  return `R${numPrice.toFixed(2)}`;
};

/**
 * Get VAT rate
 */
export const getVatRate = (): number => {
  return VAT_RATE;
};
