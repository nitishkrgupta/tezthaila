export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string;
}

export interface Variant {
  id: number;
  name: string;
  value: string;
  price: number;
  stock: number;
  sku: string;
}

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  categoryId: number;
  subcategoryId?: number | null;
  subcategoryName?: string;
  subcategory?: { id: number; name: string; slug: string };
  quantityValue?: number;
  quantityUnit?: string;
  brandId?: number | null;
  brandName: string;
  categorySlug: string;
  thumbnail: string;
  images?: string[];
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
  bestseller?: boolean;
  active?: boolean;
  maxQuantityPerOrder?: number;
  variants?: Variant[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image: string;
  itemCount?: number;
  subcategories?: Subcategory[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
}

export interface CartItem {
  id: number | string;
  productId: number;
  productName: string;
  slug: string;
  variantId?: number | null;
  variantName?: string;
  price: number;
  originalPrice: number;
  quantity: number;
  subtotal: number;
  thumbnail: string;
}

export interface Address {
  id: number;
  userId?: number;
  fullName: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface Order {
  id: number | string;
  orderNumber: string;
  userId: number;
  createdAt: string;
  orderStatus: 'ORDER_PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';
  paymentMethod: 'RAZORPAY' | 'COD';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  couponCode?: string | null;
  trackingNumber?: string;
  estimatedDelivery?: string;
  cancelReason?: string;
  returnReason?: string;
  address?: Address;
  items?: CartItem[];
}

export interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified?: boolean;
}

export interface Coupon {
  id?: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minimumOrderAmount: number;
  maximumDiscount?: number | null;
  description?: string;
  usageLimit?: number | null;
  usedCount?: number;
  active?: boolean;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id?: number;
  title: string;
  subtitle?: string;
  link?: string;
  image: string;
  active?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockItems: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
  count?: number;
}
