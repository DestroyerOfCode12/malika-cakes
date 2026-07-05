import { CreateOrderDTO } from '../types';
import { ApiError } from '../middleware/errorHandler';

const LEAD_TIME_DAYS = 14;
const PAYMENT_DEADLINE_DAYS = 7;
const VAT_RATE = 0.15;

/**
 * Validate that pickup date is at least 14 days from today
 */
export const validateLeadTime = (pickupDate: string): boolean => {
  const pickup = new Date(pickupDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minPickupDate = new Date(today);
  minPickupDate.setDate(minPickupDate.getDate() + LEAD_TIME_DAYS);

  return pickup >= minPickupDate;
};

/**
 * Calculate payment due date (7 days before pickup)
 */
export const calculatePaymentDueDate = (pickupDate: string): Date => {
  const pickup = new Date(pickupDate);
  const dueDate = new Date(pickup);
  dueDate.setDate(dueDate.getDate() - PAYMENT_DEADLINE_DAYS);
  return dueDate;
};

/**
 * Validate pickup time (8am - 5pm)
 */
export const validatePickupTime = (time: string): boolean => {
  if (!time) return true; // Optional field, defaults to 12:00

  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  const startMinutes = 8 * 60; // 8:00 AM
  const endMinutes = 17 * 60; // 5:00 PM

  return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (basic check for ZA numbers)
 */
export const validatePhone = (phone: string): boolean => {
  // Allow +27, 0, or empty
  const phoneRegex = /^(\+27|0)[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate order creation request
 */
export const validateOrderCreation = (dto: CreateOrderDTO): void => {
  // Customer validation
  if (!dto.customer.name || dto.customer.name.length < 2) {
    throw new ApiError(400, 'Customer name must be at least 2 characters');
  }

  if (!validateEmail(dto.email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  if (!validatePhone(dto.phone)) {
    throw new ApiError(400, 'Invalid phone number format (ZA only, e.g., +27712345678 or 0712345678)');
  }

  // Pickup date validation
  if (!validateLeadTime(dto.pickupDate)) {
    throw new ApiError(
      400,
      `Pickup date must be at least ${LEAD_TIME_DAYS} days from today`,
      { minDays: LEAD_TIME_DAYS }
    );
  }

  // Pickup time validation
  if (dto.pickupTime && !validatePickupTime(dto.pickupTime)) {
    throw new ApiError(400, 'Pickup time must be between 8:00 AM and 5:00 PM');
  }

  // Customizations validation
  if (!dto.sizeId) {
    throw new ApiError(400, 'Size is required');
  }

  if (!dto.flavorId) {
    throw new ApiError(400, 'Flavor is required');
  }

  if (!dto.fillingId) {
    throw new ApiError(400, 'Filling is required');
  }

  if (!Array.isArray(dto.topperIds)) {
    throw new ApiError(400, 'Toppers must be an array');
  }

  // Text field length validation
  if (dto.allergiesRestrictions && dto.allergiesRestrictions.length > 500) {
    throw new ApiError(400, 'Allergies/restrictions must be 500 characters or less');
  }

  if (dto.specialRequests && dto.specialRequests.length > 500) {
    throw new ApiError(400, 'Special requests must be 500 characters or less');
  }
};

/**
 * Calculate refund amount based on cancellation timing
 */
export const calculateRefund = (pickupDate: Date, totalPrice: number): { amount: number; percentage: number } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntilPickup = Math.ceil((pickupDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let refundPercentage = 0;

  if (daysUntilPickup > 14) {
    refundPercentage = 100; // Full refund
  } else if (daysUntilPickup >= 7) {
    refundPercentage = 50; // 50% refund
  } else {
    refundPercentage = 0; // No refund
  }

  return {
    amount: (totalPrice * refundPercentage) / 100,
    percentage: refundPercentage,
  };
};
