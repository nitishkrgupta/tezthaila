import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { Product } from '../models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  wishlist = signal<Product[]>([]);
  wishlistCount = computed(() => this.wishlist().length);
  loading = signal<boolean>(true);

  constructor() {
    this.loadWishlist();
  }

  async loadWishlist(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.getWishlist());
      this.wishlist.set(res.data || []);
    } catch (err) {
      console.error('Failed loading wishlist', err);
    } finally {
      this.loading.set(false);
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist().some(item => item.id === productId);
  }

  async toggleWishlist(product: Product): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.toggleWishlist(product.id));
      if (res.data?.isAdded) {
        this.wishlist.update(prev => [...prev, product]);
        this.toast.success(`'${product.name.substring(0, 30)}...' added to Wishlist`);
      } else {
        this.wishlist.update(prev => prev.filter(item => item.id !== product.id));
        this.toast.info('Removed from Wishlist');
      }
    } catch (err: any) {
      this.toast.error(err.message || 'Wishlist update failed');
    }
  }
}
