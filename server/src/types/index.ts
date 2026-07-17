// Customer types
export interface CreateCustomerDTO {
  name: string;
  email?: string;
  phone?: string;
}

export interface CustomerResponse extends CreateCustomerDTO {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface CreateOrderDTO {
  customer: CreateCustomerDTO;
  sizeId: string;
  flavorId: string;
  fillingId: string;
  topperIds: string[];
  pickupDate: string; // ISO date string
  pickupTime?: string; // HH:mm format, default 12:00
  allergiesRestrictions?: string;
  specialRequests?: string;
  email: string;
  phone: string;
  deliveryMethod?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  // From the Google Places selection that produced deliveryAddress —
  // persisted so the admin's later "mark ready" re-quote can hand Uber
  // exact coordinates instead of re-parsing the address string.
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  // The estimate shown to the customer from POST /delivery/quote. Uber
  // quotes are only valid ~30 minutes, so a fresh quote is re-fetched
  // right before actually dispatching the courier (see admin status
  // route) — this field is for display/order-total purposes only.
  deliveryFee?: number;
}

export interface UpdateOrderDTO {
  sizeId?: string;
  flavorId?: string;
  fillingId?: string;
  topperIds?: string[];
  pickupDate?: string;
  pickupTime?: string;
  allergiesRestrictions?: string;
  specialRequests?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: CustomerResponse;
  sizeId: string;
  flavorId: string;
  fillingId: string;
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
  customizations: OrderCustomizationResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderCustomizationResponse {
  id: string;
  topperId: string;
  topper: {
    id: string;
    name: string;
    priceAddon: number;
  };
  quantity: number;
  priceAtTime: number;
}

// Catalog types
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

// Auth types
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

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Admin types
export interface AdminDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  upcomingPickups: number;
  overduePayments: number;
  averageOrderValue: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
