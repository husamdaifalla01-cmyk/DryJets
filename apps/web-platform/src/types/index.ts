// User types
export type UserRole = 'CUSTOMER' | 'BUSINESS' | 'ENTERPRISE' | 'MERCHANT' | 'DRIVER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Customer types
export interface Customer extends User {
  firstName: string;
  lastName: string;
  loyaltyPoints: number;
  preferences?: CustomerPreferences;
}

export interface CustomerPreferences {
  detergent?: string;
  foldOption?: 'HANGER' | 'FOLD';
  starchLevel?: 'NONE' | 'LIGHT' | 'MEDIUM' | 'HEAVY';
}

// Business account types
export interface BusinessAccount extends User {
  companyName: string;
  taxId?: string;
  industry?: string;
  billingEmail: string;
  subscriptionTier: string;
}

// Enterprise organization types
export interface EnterpriseOrganization {
  id: string;
  name: string;
  tenantId: string;
  subscriptionPlan: string;
  billingEmail: string;
  apiKey: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  managerId?: string;
}

// Order types
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKED_UP'
  | 'PROCESSING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  customerId: string;
  merchantId: string;
  status: OrderStatus;
  totalAmount: number;
  pickupAddress: string;
  deliveryAddress: string;
  pickupTime: Date;
  deliveryTime?: Date;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  garmentType: string;
  serviceType: string;
  quantity: number;
  price: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
