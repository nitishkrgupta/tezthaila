import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Product } from '../../models';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative">
      <!-- Discount Badge -->
      @if (product.discountPercentage > 0) {
        <span class="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
          {{ product.discountPercentage }}% {{ lang.t('off') }}
        </span>
      }

      <!-- Wishlist Button -->
      <button
        (click)="handleWishlistClick($event)"
        class="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer"
        [ngClass]="wishlist.isInWishlist(product.id)
          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs text-gray-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 shadow-xs'"
        title="Wishlist"
      >
        <i [class]="wishlist.isInWishlist(product.id) ? 'pi pi-heart-fill text-rose-500' : 'pi pi-heart'"></i>
      </button>

      <!-- Product Image Link -->
      <a [routerLink]="['/product', product.slug]" class="relative pt-[80%] overflow-hidden bg-gray-50 dark:bg-slate-800">
        <img
          [src]="product.thumbnail"
          [alt]="product.name"
          class="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </a>

      <!-- Card Body -->
      <div class="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <!-- Brand & Rating -->
          <div class="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
            <span class="font-semibold text-brand-700 dark:text-brand-400">{{ product.brandName || 'Tez Select' }}</span>
            @if (product.rating) {
              <span class="flex items-center text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded text-[10px]">
                <i class="pi pi-star-fill text-amber-400 mr-1 text-[10px]"></i>
                {{ product.rating }}
              </span>
            }
          </div>

          <!-- Title -->
          <a
            [routerLink]="['/product', product.slug]"
            class="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-brand-700 dark:hover:text-brand-400 transition-colors mb-2"
          >
            {{ product.name }}
          </a>
        </div>

        <!-- Price & Add to Cart Section -->
        <div class="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div class="flex items-baseline space-x-1.5">
              <span class="text-sm sm:text-base font-black text-gray-900 dark:text-white">₹{{ product.price }}</span>
              @if (product.originalPrice > product.price) {
                <span class="text-[11px] text-gray-400 line-through">₹{{ product.originalPrice }}</span>
              }
            </div>
            @if (product.variants && product.variants.length > 0) {
              <p class="text-[10px] text-gray-500 dark:text-gray-400">{{ product.variants[0].value }}</p>
            }
          </div>

          <!-- Action Button: Add or Stepper -->
          @if (cartItem) {
            <div class="flex items-center space-x-1.5 bg-brand-700 dark:bg-brand-600 text-white rounded-xl p-1 shadow-xs">
              <button
                (click)="handleDecrement($event)"
                class="w-6 h-6 flex items-center justify-center hover:bg-brand-800 dark:hover:bg-brand-700 rounded-lg transition-colors cursor-pointer"
                title="Decrease"
              >
                <i class="pi pi-minus text-[10px]"></i>
              </button>
              <span class="text-xs font-bold w-4 text-center">{{ cartItem.quantity }}</span>
              <button
                (click)="handleIncrement($event)"
                [disabled]="cartItem.quantity >= (product.maxQuantityPerOrder || 10)"
                class="w-6 h-6 flex items-center justify-center hover:bg-brand-800 dark:hover:bg-brand-700 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                [title]="cartItem.quantity >= (product.maxQuantityPerOrder || 10) ? 'Limit reached (' + (product.maxQuantityPerOrder || 10) + ')' : 'Increase'"
              >
                <i class="pi pi-plus text-[10px]"></i>
              </button>
            </div>
          } @else {
            <button
              (click)="handleAdd($event)"
              class="px-3 py-1.5 bg-brand-50 dark:bg-slate-800 hover:bg-brand-600 dark:hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white dark:hover:text-white border border-brand-300 dark:border-slate-700 hover:border-transparent rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
            >
              <i class="pi pi-plus text-xs"></i>
              <span>{{ lang.t('add') }}</span>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  cart = inject(CartService);
  wishlist = inject(WishlistService);
  lang = inject(LanguageService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  get cartItem() {
    return this.cart.cart().find(item => item.productId === this.product.id);
  }

  handleAdd(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in first to add products to your cart');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const defaultVariant = this.product.variants && this.product.variants.length > 0 ? this.product.variants[0] : null;
    this.cart.addToCart(this.product, defaultVariant, 1);
  }

  handleIncrement(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in first to manage your cart');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.cartItem) {
      const maxLimit = this.product.maxQuantityPerOrder || 10;
      if (this.cartItem.quantity >= maxLimit) {
        return;
      }
      this.cart.updateQuantity(this.cartItem.id, this.cartItem.quantity + 1);
    }
  }

  handleDecrement(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.cartItem) {
      this.cart.updateQuantity(this.cartItem.id, this.cartItem.quantity - 1);
    }
  }

  handleWishlistClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in first to add products to your wishlist');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.wishlist.toggleWishlist(this.product);
  }
}
