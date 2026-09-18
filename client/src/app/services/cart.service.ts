import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { CartItem, Coupon, Product, Variant } from '../models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  cart = signal<CartItem[]>([]);
  coupon = signal<Coupon | null>(null);
  isCartOpen = signal<boolean>(false);
  loading = signal<boolean>(true);

  cartSubtotal = computed(() => 
    this.cart().reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0)
  );

  cartCount = computed(() => 
    this.cart().reduce((sum, item) => sum + item.quantity, 0)
  );

  shippingFee = computed(() => 
    this.cartSubtotal() >= 499 || this.cartSubtotal() === 0 ? 0 : 40
  );

  tax = computed(() => 
    Math.round(this.cartSubtotal() * 0.05)
  );

  discount = computed(() => {
    const c = this.coupon();
    if (!c) return 0;
    const sub = this.cartSubtotal();
    if (c.type === 'PERCENTAGE') {
      let disc = Math.round((sub * c.value) / 100);
      if (c.maximumDiscount && disc > c.maximumDiscount) {
        disc = c.maximumDiscount;
      }
      return disc;
    } else {
      return c.value;
    }
  });

  totalAmount = computed(() => 
    Math.max(0, this.cartSubtotal() - this.discount() + this.shippingFee() + this.tax())
  );

  constructor() {
    this.loadCart();
  }

  async loadCart(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.getCart());
      this.cart.set(res.data || []);
    } catch (err) {
      console.error('Failed loading cart', err);
    } finally {
      this.loading.set(false);
    }
  }

  async addToCart(product: Product, variant: Variant | null = null, quantity = 1): Promise<void> {
    const existing = this.cart().find(c => c.productId === product.id);
    const maxQty = product.maxQuantityPerOrder || 10;
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty + quantity > maxQty) {
      this.toast.error(`Maximum allowed quantity is ${maxQty} per order. You already have ${currentQty} in your cart.`);
      return;
    }
    try {
      const res = await firstValueFrom(this.api.addToCart({ product, variant, quantity }));
      this.cart.set(res.data);
      this.toast.success(`Added '${product.name.substring(0, 25)}...' to cart`);
      this.isCartOpen.set(true);
    } catch (err: any) {
      this.toast.error(err.error?.message || err.message || 'Failed to add item to bag');
    }
  }

  async updateQuantity(itemId: number | string, quantity: number): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.updateCartItem(itemId, quantity));
      this.cart.set(res.data);
    } catch (err: any) {
      this.toast.error(err.error?.message || err.message || 'Failed updating quantity');
    }
  }

  async removeFromCart(itemId: number | string): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.removeFromCart(itemId));
      this.cart.set(res.data);
      this.toast.info('Item removed from cart');
    } catch (err: any) {
      this.toast.error(err.message || 'Failed removing item');
    }
  }

  async applyCoupon(code: string): Promise<boolean> {
    if (!code || !code.trim()) {
      this.toast.error('Please enter a coupon code');
      return false;
    }
    try {
      const res = await firstValueFrom(this.api.validateCoupon(code.trim(), this.cartSubtotal()));
      this.coupon.set(res.data.coupon);
      this.toast.success(res.message || 'Coupon applied successfully!');
      return true;
    } catch (err: any) {
      this.toast.error(err.error?.message || err.message || 'Invalid coupon code');
      return false;
    }
  }

  removeCoupon(): void {
    this.coupon.set(null);
    this.toast.info('Coupon removed');
  }

  async clearCart(): Promise<void> {
    try {
      await firstValueFrom(this.api.clearCart());
    } catch (e) {
      console.warn('Cart clear API error', e);
    } finally {
      this.cart.set([]);
      this.coupon.set(null);
    }
  }

  openCart(): void {
    this.isCartOpen.set(true);
  }

  closeCart(): void {
    this.isCartOpen.set(false);
  }

  toggleCart(): void {
    this.isCartOpen.update(v => !v);
  }
}
