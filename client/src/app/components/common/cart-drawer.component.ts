import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cart.isCartOpen()) {
      <div class="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          (click)="cart.closeCart()"
        ></div>

        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div class="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-slate-800">
            <!-- Header -->
            <div class="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div class="flex items-center space-x-2">
                <i class="pi pi-shopping-bag text-brand-600 text-lg"></i>
                <h2 class="text-base font-bold text-gray-900 dark:text-white">
                  {{ lang.t('shoppingBag') }} ({{ cart.cartCount() }})
                </h2>
              </div>
              <button
                (click)="cart.closeCart()"
                class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <i class="pi pi-times text-lg"></i>
              </button>
            </div>

            <!-- Free Shipping Progress Indicator -->
            <div class="p-3 bg-brand-50/70 dark:bg-brand-950/40 border-b border-brand-100 dark:border-brand-900/50 text-xs">
              @if (remainingForFreeShipping > 0) {
                <div>
                  <p class="text-brand-900 dark:text-brand-200 font-medium mb-1.5">
                    Add <span class="font-bold text-brand-700 dark:text-brand-400">₹{{ remainingForFreeShipping }}</span> more for <span class="font-bold text-emerald-700 dark:text-emerald-400">FREE Express Delivery</span>
                  </p>
                  <div class="w-full bg-brand-200 dark:bg-brand-900/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      class="bg-brand-600 h-full rounded-full transition-all duration-300"
                      [style.width.%]="freeShippingPercentage"
                    ></div>
                  </div>
                </div>
              } @else {
                <p class="text-emerald-700 dark:text-emerald-400 font-bold flex items-center">
                  <i class="pi pi-shield mr-1.5 text-emerald-600"></i>
                  {{ lang.t('unlockedFreeDelivery') }}
                </p>
              }
            </div>

            <!-- Items List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              @if (cart.cart().length === 0) {
                <div class="text-center py-16 px-4">
                  <div class="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-500 mx-auto flex items-center justify-center mb-3">
                    <i class="pi pi-shopping-bag text-3xl"></i>
                  </div>
                  <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">{{ lang.t('emptyBag') }}</h3>
                  <p class="text-xs text-gray-500 dark:text-slate-400 mb-6">
                    {{ lang.t('emptyBagDesc') }}
                  </p>
                  <button
                    (click)="cart.closeCart()"
                    class="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    {{ lang.t('startShopping') }}
                  </button>
                </div>
              } @else {
                @for (item of cart.cart(); track item.id) {
                  <div class="flex space-x-3 p-3 bg-gray-50/70 dark:bg-slate-800/70 rounded-xl border border-gray-100 dark:border-slate-800">
                    <img
                      [src]="item.thumbnail"
                      [alt]="item.productName"
                      class="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div class="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 class="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{{ item.productName }}</h4>
                        @if (item.variantName) {
                          <span class="text-[11px] text-gray-500 dark:text-slate-400 font-medium">{{ item.variantName }}</span>
                        }
                        <div class="flex items-baseline space-x-1.5 mt-0.5">
                          <span class="text-xs font-extrabold text-gray-900 dark:text-white">₹{{ item.price }}</span>
                          @if (item.originalPrice > item.price) {
                            <span class="text-[10px] text-gray-400 line-through">₹{{ item.originalPrice }}</span>
                          }
                        </div>
                      </div>

                      <div class="flex items-center justify-between mt-2">
                        <!-- Quantity Stepper -->
                        <div class="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-1">
                          <button
                            (click)="cart.updateQuantity(item.id, item.quantity - 1)"
                            class="w-5 h-5 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:text-brand-700 cursor-pointer"
                          >
                            <i class="pi pi-minus text-[10px]"></i>
                          </button>
                          <span class="text-xs font-bold text-gray-800 dark:text-white w-4 text-center">{{ item.quantity }}</span>
                          <button
                            (click)="cart.updateQuantity(item.id, item.quantity + 1)"
                            class="w-5 h-5 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:text-brand-700 cursor-pointer"
                          >
                            <i class="pi pi-plus text-[10px]"></i>
                          </button>
                        </div>

                        <button
                          (click)="cart.removeFromCart(item.id)"
                          class="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
                          [title]="lang.t('remove')"
                        >
                          <i class="pi pi-trash text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Footer Checkout Summary -->
            @if (cart.cart().length > 0) {
              <div class="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div class="flex justify-between items-center text-sm font-semibold text-gray-700 dark:text-slate-300">
                  <span>{{ lang.t('subtotal') }}:</span>
                  <span class="text-base font-extrabold text-gray-900 dark:text-white">₹{{ cart.cartSubtotal() }}</span>
                </div>
                <p class="text-[11px] text-gray-400 dark:text-slate-500">{{ lang.t('taxesAtCheckout') }}</p>

                <div class="grid grid-cols-2 gap-2">
                  <button
                    (click)="goToCart()"
                    class="py-2.5 px-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {{ lang.t('viewCart') }}
                  </button>
                  <button
                    (click)="goToCheckout()"
                    class="py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow-md shadow-brand-600/20 transition-colors cursor-pointer"
                  >
                    <span>{{ lang.t('checkout') }}</span>
                    <i class="pi pi-arrow-right text-xs ml-1"></i>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class CartDrawerComponent {
  cart = inject(CartService);
  lang = inject(LanguageService);
  private router = inject(Router);

  get remainingForFreeShipping(): number {
    return Math.max(0, 499 - this.cart.cartSubtotal());
  }

  get freeShippingPercentage(): number {
    return Math.min(100, Math.round((this.cart.cartSubtotal() / 499) * 100));
  }

  goToCart(): void {
    this.cart.closeCart();
    this.router.navigate(['/cart']);
  }

  goToCheckout(): void {
    this.cart.closeCart();
    this.router.navigate(['/checkout']);
  }
}
