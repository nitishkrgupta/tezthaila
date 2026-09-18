import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      @if (cart.cart().length === 0) {
        <div class="max-w-4xl mx-auto px-4 py-20 text-center">
          <div class="w-20 h-20 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 rounded-3xl mx-auto flex items-center justify-center mb-4">
            <i class="pi pi-shopping-bag text-4xl"></i>
          </div>
          <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-2">{{ lang.t('emptyBag') }}</h2>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            {{ lang.t('emptyBagDesc') }}
          </p>
          <a
            routerLink="/products"
            class="inline-flex items-center space-x-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/20"
          >
            <span>{{ lang.t('startShopping') }}</span>
            <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>
      } @else {
        <!-- Header title -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800">
          <div>
            <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ lang.t('shoppingBag') }}</h1>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {{ cart.cart().length }} unique {{ lang.t('items') }} • Free Express Delivery on orders above ₹499
            </p>
          </div>
          <a
            routerLink="/products"
            class="text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 flex items-center space-x-1"
          >
            <i class="pi pi-arrow-left text-xs mr-1"></i>
            <span>{{ lang.t('continueShopping') }}</span>
          </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Cart Items List (8 cols) -->
          <div class="lg:col-span-8 space-y-4">
            @for (item of cart.cart(); track item.id) {
              <div
                class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div class="flex items-center space-x-4">
                  <img
                    [src]="item.thumbnail"
                    [alt]="item.productName"
                    class="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-slate-700 flex-shrink-0"
                  />
                  <div>
                    <a
                      [routerLink]="['/product', item.slug]"
                      class="text-sm font-bold text-gray-900 dark:text-white hover:text-brand-700 dark:hover:text-brand-400 line-clamp-1"
                    >
                      {{ item.productName }}
                    </a>
                    @if (item.variantName) {
                      <span class="text-xs text-gray-500 dark:text-slate-400 font-medium block mt-0.5">{{ item.variantName }}</span>
                    }
                    <div class="flex items-baseline space-x-2 mt-1">
                      <span class="text-sm font-extrabold text-gray-900 dark:text-white">₹{{ item.price }}</span>
                      @if (item.originalPrice > item.price) {
                        <span class="text-xs text-gray-400 dark:text-slate-500 line-through">₹{{ item.originalPrice }}</span>
                      }
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between w-full sm:w-auto sm:space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-slate-800">
                  <!-- Stepper -->
                  <div class="flex items-center space-x-2 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                    <button
                      (click)="cart.updateQuantity(item.id, item.quantity - 1)"
                      class="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 shadow-xs cursor-pointer"
                    >
                      <i class="pi pi-minus text-xs"></i>
                    </button>
                    <span class="text-xs font-bold text-gray-900 dark:text-white w-6 text-center">{{ item.quantity }}</span>
                    <button
                      (click)="cart.updateQuantity(item.id, item.quantity + 1)"
                      class="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 shadow-xs cursor-pointer"
                    >
                      <i class="pi pi-plus text-xs"></i>
                    </button>
                  </div>

                  <!-- Subtotal & Remove -->
                  <div class="text-right">
                    <span class="text-sm font-black text-gray-900 dark:text-white block">₹{{ item.subtotal }}</span>
                    <button
                      (click)="cart.removeFromCart(item.id)"
                      class="text-[11px] text-rose-500 hover:text-rose-700 dark:text-rose-400 font-semibold flex items-center mt-1 cursor-pointer"
                    >
                      <i class="pi pi-trash text-xs mr-1"></i>
                      <span>{{ lang.t('remove') }}</span>
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- Delivery Assurance -->
            <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/50 flex items-center space-x-3 text-emerald-900 dark:text-emerald-200 text-xs">
              <i class="pi pi-truck text-xl text-emerald-600 flex-shrink-0"></i>
              <div>
                <p class="font-bold">{{ lang.t('expressAssurance') }}</p>
                <p class="text-[11px] text-emerald-700 dark:text-emerald-400">{{ lang.t('expressAssuranceDesc') }}</p>
              </div>
            </div>
          </div>

          <!-- Price Breakdown & Coupon Sidebar (4 cols) -->
          <div class="lg:col-span-4 space-y-6">
            <!-- Coupon Code Card -->
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div class="flex items-center space-x-2 text-xs font-bold text-gray-800 dark:text-slate-200">
                <i class="pi pi-tag text-brand-600"></i>
                <span>{{ lang.t('applyCoupons') }}</span>
              </div>

              @if (cart.coupon()) {
                <div class="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs">
                  <div>
                    <span class="font-bold text-emerald-900 dark:text-emerald-300">{{ cart.coupon()!.code }}</span>
                    <p class="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {{ cart.coupon()!.type === 'PERCENTAGE' ? (cart.coupon()!.value + '% discount applied') : ('₹' + cart.coupon()!.value + ' flat discount applied') }}
                    </p>
                  </div>
                  <button (click)="cart.removeCoupon()" class="text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 p-1 cursor-pointer">
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>
              } @else {
                <form (ngSubmit)="handleApplyCoupon()" class="flex gap-2">
                  <input
                    type="text"
                    [(ngModel)]="couponInput"
                    name="coupon"
                    [placeholder]="lang.t('enterCouponCode')"
                    class="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl uppercase font-mono font-bold focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    [disabled]="isApplying"
                    class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {{ lang.t('apply') }}
                  </button>
                </form>
              }

              <!-- Quick Coupons Shortcuts -->
              @if (!cart.coupon()) {
                <div class="pt-2 border-t border-gray-100 dark:border-slate-800">
                  <p class="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase mb-2">{{ lang.t('availableCoupons') }}</p>
                  <div class="space-y-1.5">
                    @for (c of suggestedCoupons; track c.code) {
                      <div
                        (click)="applySuggestedCoupon(c.code)"
                        class="p-2 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-gray-200/80 dark:border-slate-700 cursor-pointer flex justify-between items-center transition-colors text-xs"
                      >
                        <div>
                          <span class="font-bold text-brand-700 dark:text-brand-400 font-mono">{{ c.code }}</span>
                          <p class="text-[10px] text-gray-500 dark:text-slate-400">{{ c.desc }}</p>
                        </div>
                        <span class="text-[10px] font-bold text-brand-700 dark:text-brand-400">{{ lang.t('apply') }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Order Summary Card -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 class="text-sm font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-slate-800">
                {{ lang.t('billSummary') }}
              </h3>

              <div class="space-y-2.5 text-xs text-gray-600 dark:text-slate-300">
                <div class="flex justify-between">
                  <span>{{ lang.t('itemsTotal') }}</span>
                  <span class="font-bold text-gray-800 dark:text-white">₹{{ cart.cartSubtotal() }}</span>
                </div>

                @if (cart.discount() > 0) {
                  <div class="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>{{ lang.t('discount') }} ({{ cart.coupon()?.code }})</span>
                    <span>-₹{{ cart.discount() }}</span>
                  </div>
                }

                <div class="flex justify-between">
                  <span>{{ lang.t('deliveryFee') }}</span>
                  <span class="font-bold text-gray-800 dark:text-white">
                    @if (cart.shippingFee() === 0) {
                      <span class="text-emerald-700 dark:text-emerald-400">{{ lang.t('free') }}</span>
                    } @else {
                      ₹{{ cart.shippingFee() }}
                    }
                  </span>
                </div>

                <div class="flex justify-between">
                  <span>{{ lang.t('taxesAndFees') }}</span>
                  <span class="font-bold text-gray-800 dark:text-white">₹{{ cart.tax() }}</span>
                </div>

                <div class="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between items-baseline text-sm font-black text-gray-900 dark:text-white">
                  <span>{{ lang.t('totalPayable') }}</span>
                  <span class="text-xl text-brand-800 dark:text-brand-400 font-black">₹{{ cart.totalAmount() }}</span>
                </div>
              </div>

              <button
                (click)="proceedToCheckout()"
                class="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>{{ lang.t('proceedToCheckout') }}</span>
                <i class="pi pi-arrow-right text-xs"></i>
              </button>

              <div class="text-[10px] text-gray-400 dark:text-slate-500 text-center flex items-center justify-center space-x-1">
                <i class="pi pi-shield text-emerald-600 text-xs"></i>
                <span>Safe &amp; Encrypted Payments</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CartPageComponent {
  cart = inject(CartService);
  lang = inject(LanguageService);
  private router = inject(Router);

  couponInput = '';
  isApplying = false;

  suggestedCoupons = [
    { code: 'WELCOME10', desc: '10% off on orders above ₹499' },
    { code: 'SAVE500', desc: 'Flat ₹500 off on cart above ₹2499' }
  ];

  async handleApplyCoupon(): Promise<void> {
    if (!this.couponInput.trim()) return;
    this.isApplying = true;
    await this.cart.applyCoupon(this.couponInput.trim());
    this.isApplying = false;
    this.couponInput = '';
  }

  async applySuggestedCoupon(code: string): Promise<void> {
    this.isApplying = true;
    await this.cart.applyCoupon(code);
    this.isApplying = false;
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
