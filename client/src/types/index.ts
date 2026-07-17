// Customer
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  sizeId: string;
  size: CatalogSize;
  flavorId: string;
  flavor: CatalogFlavor;
  fillingId: string;
  filling: CatalogFilling;
  basePrice: number;
  customizationTotal: number;
  tax: number;
  totalPrice: number;
  orderDate: Date;
  pickupDate: Date;
  pickupTime: string;
  paymentDueDate: Date;
  status: 'draft' | 'confirmed' | 'paid' | 'in_progress' | 'ready' | 'picked_up' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  allergiesRestrictions?: string;
  specialRequests?: string;
  customizations: OrderCustomization[];
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryFee: number;
  deliveryStatus?: string;
  uberTrackingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderCustomization {
  id: string;
  orderId: string;
  topperId: string;
  topper: CatalogTopper;
  quantity: number;
  priceAtTime: number;
}

// Catalog
export interface CatalogSize {
  id: string;
  name: string;
  basePrice: number;
  servingsMin?: number;
  servingsMax?: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface CatalogFlavor {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface CatalogFilling {
  id: string;
  name: string;
  priceAddon: number;
  isActive: boolean;
}

export interface CatalogTopper {
  id: string;
  name: string;
  priceAddon: number;
  imageUrl?: string;
  isActive: boolean;
}

// Form DTOs
export interface CreateOrderRequest {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  sizeId: string;
  flavorId: string;
  fillingId: string;
  topperIds: string[];
  pickupDate: string;
  pickupTime?: string;
  allergiesRestrictions?: string;
  specialRequests?: string;
  email: string;
  phone: string;
  deliveryMethod?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryFee?: number;
}

// Delivery
export interface DeliveryQuote {
  quoteId: string;
  feeRands: number;
  dropoffEta: string;
  expiresAt: string;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// Admin
export interface AdminDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  upcomingPickups: number;
  overduePayments: number;
  averageOrderValue: number;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
