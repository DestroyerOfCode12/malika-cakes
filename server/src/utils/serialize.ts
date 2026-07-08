import { formatPickupTime } from './pricing';

/**
 * Orders come back from Prisma with pickupTime as a Date (Postgres
 * @db.Time column). The API contract with the frontend is "HH:mm", so
 * every response that includes an order needs this applied.
 */
export const serializeOrder = <T extends { pickupTime: Date }>(order: T) => ({
  ...order,
  pickupTime: formatPickupTime(order.pickupTime),
});

export const serializeOrders = <T extends { pickupTime: Date }>(orders: T[]) =>
  orders.map(serializeOrder);
