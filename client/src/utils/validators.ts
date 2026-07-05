const LEAD_TIME_DAYS = 14;

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (ZA)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+27|0)[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate pickup date (at least 14 days from today)
 */
export const validatePickupDate = (date: string): boolean => {
  const pickupDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + LEAD_TIME_DAYS);

  return pickupDate >= minDate;
};

/**
 * Get minimum pickup date (today + 14 days)
 */
export const getMinPickupDate = (): string => {
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + LEAD_TIME_DAYS);

  return minDate.toISOString().split('T')[0];
};

/**
 * Calculate payment due date (7 days before pickup)
 */
export const calculatePaymentDueDate = (pickupDate: string): Date => {
  const date = new Date(pickupDate);
  date.setDate(date.getDate() - 7);
  return date;
};

/**
 * Validate text length
 */
export const validateTextLength = (text: string, maxLength: number): boolean => {
  return text.length <= maxLength;
};

/**
 * Get error message for validation
 */
export const getValidationError = (field: string, value: any): string | null => {
  if (!value && field !== 'allergiesRestrictions' && field !== 'specialRequests' && field !== 'pickupTime') {
    return `${formatFieldName(field)} is required`;
  }

  switch (field) {
    case 'email':
      if (value && !validateEmail(value)) {
        return 'Invalid email format';
      }
      break;
    case 'phone':
      if (value && !validatePhone(value)) {
        return 'Invalid phone format (e.g., +27712345678 or 0712345678)';
      }
      break;
    case 'pickupDate':
      if (value && !validatePickupDate(value)) {
        return `Pickup date must be at least ${LEAD_TIME_DAYS} days from today`;
      }
      break;
    case 'allergiesRestrictions':
    case 'specialRequests':
      if (value && !validateTextLength(value, 500)) {
        return 'Text must be 500 characters or less';
      }
      break;
  }

  return null;
};

/**
 * Format field name for display
 */
const formatFieldName = (field: string): string => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
