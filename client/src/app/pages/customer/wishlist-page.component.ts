import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { LanguageService } from '../../services/language.service';
import { Product } from '../../models';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (wishlist().length === 0) {
      <div class="max-w-4xl mx-auto px-4 py-20 text-center">
        <div class="w-20 h-20 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-3xl mx-auto flex items-center justify-center mb-4">
          <i class="pi pi-heart text-3xl"></i>
        </div>
        <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-2">{{ lang.t('wishlistEmpty') }}</h2>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          {{ lang.t('wishlistEmptyDesc') }}
        </p>
        <a
          routerLink="/products"
          class="inline-flex items-center space-x-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/20 transition-colors cursor-pointer"
        >
          <span>{{ lang.t('exploreProducts') }}</span>
          <i class="pi pi-arrow-right text-xs"></i>
        </a>
      </div>
    } @else {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div class="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-800">
          <div>
            <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ lang.t('savedWishlist') }}</h1>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ wishlist().length }} {{ lang.t('savedProducts') }}</p>
          </div>
          <a routerLink="/products" class="text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 flex items-center">
            <i class="pi pi-arrow-left text-xs mr-1"></i>
            <span>{{ lang.t('continueShopping') }}</span>
          </a>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (product of wishlist(); track product.id) {
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div class="relative pt-[80%] rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-800 mb-3">
                  <img [src]="product.thumbnail" [alt]="product.name" class="absolute inset-0 w-full h-full object-cover" />
                  <button
                    (click)="wishlistService.toggleWishlist(product)"
                    class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-rose-500 flex items-center justify-center shadow-xs hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <i class="pi pi-trash text-xs"></i>
                  </button>
                </div>

                <span class="text-[10px] font-bold text-brand-700 dark:text-brand-400 block">{{ product.brandName }}</span>
                <a [routerLink]="['/product', product.slug]" class="text-xs font-bold text-gray-900 dark:text-white hover:text-brand-700 dark:hover:text-brand-400 line-clamp-2 mt-0.5">
                  {{ product.name }}
                </a>
              </div>

              <div class="pt-3 border-t border-gray-100 dark:border-slate-800 mt-3 space-y-2">
                <div class="flex items-baseline space-x-2">
                  <span class="text-sm font-black text-gray-900 dark:text-white">₹{{ product.price }}</span>
                  @if (product.originalPrice > product.price) {
                    <span class="text-xs text-gray-400 dark:text-slate-500 line-through">₹{{ product.originalPrice }}</span>
                  }
                </div>

                <button
                  (click)="handleMoveToCart(product)"
                  class="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <i class="pi pi-shopping-bag text-xs"></i>
                  <span>{{ lang.t('moveToBag') }}</span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class WishlistPageComponent {
  readonly wishlistService = inject(WishlistService);
  readonly lang = inject(LanguageService);
  private readonly cartService = inject(CartService);

  readonly wishlist = this.wishlistService.wishlist;

  handleMoveToCart(product: Product) {
    this.cartService.addToCart(product, product.variants?.[0] || null, 1);
    this.wishlistService.toggleWishlist(product);
  }
}
