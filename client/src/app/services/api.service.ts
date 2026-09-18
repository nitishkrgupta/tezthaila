import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { 
  ApiResponse, 
  Product, 
  Category, 
  Subcategory,
  Brand, 
  CartItem, 
  Address, 
  Order, 
  Review, 
  Coupon, 
  Banner, 
  AdminStats, 
  User 
} from '../models';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_BRANDS, 
  INITIAL_PRODUCTS, 
  INITIAL_COUPONS, 
  INITIAL_ADDRESSES, 
  INITIAL_ORDERS 
} from './mockData';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl || '/api';

  // Health
  getHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  // Authentication
  login(credentials: { email: string; password: string }): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http.post<ApiResponse<{ user: User; token: string }>>(`${this.baseUrl}/auth/login`, credentials);
  }

  register(userData: { name: string; email: string; phone: string; password: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/register`, userData);
  }

  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/logout`, {});
  }

  getMe(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.baseUrl}/auth/me`);
  }

  updateProfile(data: { name: string; phone: string }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/auth/profile`, data);
  }

  // Products
  getProducts(params?: any): Observable<ApiResponse<{ products: Product[]; total: number }>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<{ products: Product[]; total: number }>>(`${this.baseUrl}/products`, { params: httpParams }).pipe(
      catchError(() => {
        // Fallback to initial products if backend is loading or offline
        let filtered = [...INITIAL_PRODUCTS];
        if (params?.q) {
          const q = params.q.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q));
        }
        if (params?.category) {
          filtered = filtered.filter(p => p.categorySlug === params.category);
        }
        if (params?.brand) {
          filtered = filtered.filter(p => p.brandName === params.brand);
        }
        return of({
          success: true,
          data: {
            products: filtered,
            total: filtered.length
          }
        });
      })
    );
  }

  getProductBySlug(slug: string): Observable<ApiResponse<{ product: Product; related: Product[] }>> {
    return this.http.get<ApiResponse<{ product: Product; related: Product[] }>>(`${this.baseUrl}/products/slug/${slug}`).pipe(
      catchError(() => {
        const prod = INITIAL_PRODUCTS.find(p => p.slug === slug) || INITIAL_PRODUCTS[0];
        const related = INITIAL_PRODUCTS.filter(p => p.categorySlug === prod.categorySlug && p.id !== prod.id).slice(0, 4);
        return of({
          success: true,
          data: { product: prod, related }
        });
      })
    );
  }

  createProduct(data: any): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.baseUrl}/products`, data);
  }

  updateProductStock(id: number, stock: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/products/${id}/stock`, { stock });
  }

  deleteProduct(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/products/${id}`);
  }

  bulkDeleteProducts(productIds: number[]): Observable<ApiResponse<{ count: number }>> {
    return this.http.post<ApiResponse<{ count: number }>>(`${this.baseUrl}/products/bulk-delete`, { productIds });
  }

  downloadProductTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/products/sample-template`, { responseType: 'blob' });
  }

  bulkUploadProducts(file: File): Observable<ApiResponse<{ count: number; products?: any[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<{ count: number; products?: any[] }>>(`${this.baseUrl}/products/bulk-upload`, formData);
  }

  // Categories & Brands
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/categories`).pipe(
      catchError(() => of({ success: true, data: INITIAL_CATEGORIES }))
    );
  }

  getSubcategories(categoryId?: number): Observable<ApiResponse<Subcategory[]>> {
    const url = categoryId
      ? `${this.baseUrl}/categories/${categoryId}/subcategories`
      : `${this.baseUrl}/categories/subcategories`;
    return this.http.get<ApiResponse<Subcategory[]>>(url).pipe(
      catchError(() => {
        const cat = INITIAL_CATEGORIES.find(c => c.id === categoryId);
        return of({ success: true, data: (cat as any)?.subcategories || [] });
      })
    );
  }

  createCategory(data: { name: string; description?: string; image?: string }): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.baseUrl}/categories`, data);
  }

  createSubcategory(data: { categoryId: number; name: string; description?: string }): Observable<ApiResponse<Subcategory>> {
    return this.http.post<ApiResponse<Subcategory>>(`${this.baseUrl}/categories/subcategories`, data);
  }

  getBrands(): Observable<ApiResponse<Brand[]>> {
    return this.http.get<ApiResponse<Brand[]>>(`${this.baseUrl}/brands`).pipe(
      catchError(() => of({ success: true, data: INITIAL_BRANDS }))
    );
  }

  // Cart
  getCart(): Observable<ApiResponse<CartItem[]>> {
    return this.http.get<ApiResponse<CartItem[]>>(`${this.baseUrl}/cart`).pipe(
      catchError(() => of({ success: true, data: [] }))
    );
  }

  addToCart(item: { product: any; variant?: any; quantity: number }): Observable<ApiResponse<CartItem[]>> {
    return this.http.post<ApiResponse<CartItem[]>>(`${this.baseUrl}/cart`, item);
  }

  updateCartItem(itemId: number | string, quantity: number): Observable<ApiResponse<CartItem[]>> {
    return this.http.put<ApiResponse<CartItem[]>>(`${this.baseUrl}/cart/${itemId}`, { quantity });
  }

  removeFromCart(itemId: number | string): Observable<ApiResponse<CartItem[]>> {
    return this.http.delete<ApiResponse<CartItem[]>>(`${this.baseUrl}/cart/${itemId}`);
  }

  clearCart(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/cart/clear`);
  }

  // Wishlist
  getWishlist(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/wishlist`).pipe(
      catchError(() => of({ success: true, data: [] }))
    );
  }

  toggleWishlist(productId: number): Observable<ApiResponse<{ isAdded: boolean }>> {
    return this.http.post<ApiResponse<{ isAdded: boolean }>>(`${this.baseUrl}/wishlist/${productId}`, {});
  }

  // Coupons
  validateCoupon(code: string, subtotal: number): Observable<ApiResponse<{ coupon: Coupon }>> {
    return this.http.post<ApiResponse<{ coupon: Coupon }>>(`${this.baseUrl}/coupons/validate`, { code, subtotal });
  }

  getAllCouponsAdmin(): Observable<ApiResponse<Coupon[]>> {
    return this.http.get<ApiResponse<Coupon[]>>(`${this.baseUrl}/coupons/admin`);
  }

  createCoupon(data: Partial<Coupon>): Observable<ApiResponse<Coupon>> {
    return this.http.post<ApiResponse<Coupon>>(`${this.baseUrl}/coupons`, data);
  }

  updateCoupon(id: number, data: Partial<Coupon>): Observable<ApiResponse<Coupon>> {
    return this.http.put<ApiResponse<Coupon>>(`${this.baseUrl}/coupons/${id}`, data);
  }

  deleteCoupon(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/coupons/${id}`);
  }

  // Banners
  getBanners(): Observable<ApiResponse<Banner[]>> {
    return this.http.get<ApiResponse<Banner[]>>(`${this.baseUrl}/banners`);
  }

  getAllBannersAdmin(): Observable<ApiResponse<Banner[]>> {
    return this.http.get<ApiResponse<Banner[]>>(`${this.baseUrl}/banners/admin`);
  }

  createBanner(data: Partial<Banner>): Observable<ApiResponse<Banner>> {
    return this.http.post<ApiResponse<Banner>>(`${this.baseUrl}/banners`, data);
  }

  updateBanner(id: number, data: Partial<Banner>): Observable<ApiResponse<Banner>> {
    return this.http.put<ApiResponse<Banner>>(`${this.baseUrl}/banners/${id}`, data);
  }

  deleteBanner(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/banners/${id}`);
  }

  // Addresses
  getAddresses(): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>(`${this.baseUrl}/addresses`).pipe(
      catchError(() => of({ success: true, data: INITIAL_ADDRESSES }))
    );
  }

  createAddress(data: Partial<Address>): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(`${this.baseUrl}/addresses`, data);
  }

  deleteAddress(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/addresses/${id}`);
  }

  // Orders
  getOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/orders`).pipe(
      catchError(() => of({ success: true, data: INITIAL_ORDERS as any }))
    );
  }

  createOrder(orderData: any): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.baseUrl}/orders`, orderData);
  }

  getOrderById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}`).pipe(
      catchError(() => {
        const o = (INITIAL_ORDERS as any).find((x: any) => x.orderNumber === id || x.id === id) || INITIAL_ORDERS[0];
        return of({ success: true, data: o as any });
      })
    );
  }

  cancelOrder(id: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/orders/${id}/cancel`, { reason });
  }

  requestReturn(id: string, reason: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/orders/${id}/return`, { reason });
  }

  // Reviews
  getProductReviews(productId: number): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.baseUrl}/reviews/product/${productId}`).pipe(
      catchError(() => of({ success: true, data: [] }))
    );
  }

  createReview(data: { productId: number; rating: number; title: string; comment: string }): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.baseUrl}/reviews`, data);
  }

  // Admin
  getAdminStats(): Observable<ApiResponse<AdminStats>> {
    return this.http.get<ApiResponse<AdminStats>>(`${this.baseUrl}/admin/analytics`).pipe(
      catchError(() => of({
        success: true,
        data: {
          totalRevenue: 2173,
          totalOrders: 2,
          pendingOrders: 1,
          totalProducts: INITIAL_PRODUCTS.length,
          lowStockItems: 2
        }
      }))
    );
  }

  updateOrderStatus(orderId: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/admin/orders/${orderId}/status`, { status });
  }

  // Deals of the Day
  getDeals(): Observable<ApiResponse<{ title: string; endsAt: string; durationHours: number; productIds: number[]; products: Product[]; isActive: boolean }>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/deals`);
  }

  updateDeals(data: { title?: string; productIds: number[]; durationHours?: number; durationMinutes?: number; endsAt?: string; isActive?: boolean }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/deals/admin`, data);
  }

  // Upload (File or Base64)
  uploadImage(fileOrBase64: File | Blob | string): Observable<ApiResponse<{ url: string }>> {
    if (typeof fileOrBase64 === 'string') {
      return this.http.post<ApiResponse<{ url: string }>>(`${this.baseUrl}/upload`, { image: fileOrBase64 });
    } else {
      const formData = new FormData();
      formData.append('image', fileOrBase64);
      return this.http.post<ApiResponse<{ url: string }>>(`${this.baseUrl}/upload`, formData);
    }
  }
}
