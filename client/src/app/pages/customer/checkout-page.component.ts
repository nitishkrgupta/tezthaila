import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { Address } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ lang.t('expressCheckout') }}</h1>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ lang.t('checkoutSubtitle') }}</p>
        </div>
        <a routerLink="/cart" class="text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 flex items-center">
          <i class="pi pi-arrow-left text-xs mr-1"></i>
          <span>{{ lang.t('backToBag') }}</span>
        </a>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Form: Address & Payment (8 cols) -->
        <div class="lg:col-span-8 space-y-6">
          <!-- STEP 1: DELIVERY ADDRESS -->
          <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div class="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
              <div class="flex items-center space-x-2">
                <span class="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-extrabold flex items-center justify-center">
                  1
                </span>
                <h3 class="text-sm font-bold text-gray-900 dark:text-white">{{ lang.t('deliveryAddress') }}</h3>
              </div>

              <button
                (click)="isNewAddressModalOpen.set(true)"
                class="text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 flex items-center space-x-1 cursor-pointer"
              >
                <i class="pi pi-plus text-xs"></i>
                <span>{{ lang.t('addNewAddress') }}</span>
              </button>
            </div>

            <!-- Address Selection Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              @for (addr of addresses(); track addr.id) {
                <div
                  (click)="selectedAddressId.set(addr.id)"
                  class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between"
                  [ngClass]="selectedAddressId() === addr.id ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-200 dark:ring-brand-900/50' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'"
                >
                  <div>
                    <div class="flex justify-between items-start mb-1">
                      <span class="text-xs font-bold text-gray-900 dark:text-white">{{ addr.fullName }}</span>
                      @if (selectedAddressId() === addr.id) {
                        <i class="pi pi-check-circle text-brand-600 text-base flex-shrink-0"></i>
                      }
                    </div>
                    <p class="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                      {{ addr.house }}, {{ addr.street }}, {{ addr.area }}, {{ addr.city }}, {{ addr.state }} - {{ addr.pincode }}
                    </p>
                    @if (addr.landmark) {
                      <p class="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">Landmark: {{ addr.landmark }}</p>
                    }
                  </div>
                  <p class="text-xs font-bold text-gray-700 dark:text-slate-300 mt-2">Ph: {{ addr.phone }}</p>
                </div>
              }
            </div>
          </div>

          <!-- STEP 2: PAYMENT METHOD (COD ONLY) -->
          <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div class="flex items-center space-x-2 pb-3 border-b border-gray-100 dark:border-slate-800">
              <span class="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-extrabold flex items-center justify-center">
                2
              </span>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">{{ lang.t('paymentMethod') }}</h3>
            </div>

            <div class="space-y-3">
              <!-- Cash On Delivery Option -->
              <div
                class="p-4 rounded-2xl border border-brand-600 dark:border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-200 dark:ring-brand-900/50 flex items-start space-x-3.5"
              >
                <div class="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
                  <i class="pi pi-check text-[10px]"></i>
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <i class="pi pi-wallet text-brand-700 dark:text-brand-400 text-lg"></i>
                    <span class="text-sm font-black text-gray-900 dark:text-white">{{ lang.t('codTitle') }}</span>
                    <span class="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      Zero Advance Payment
                    </span>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-slate-300 mt-1">
                    {{ lang.t('codDesc') }}
                  </p>
                </div>
              </div>

              <div class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 rounded-xl flex items-center space-x-2.5 text-xs text-amber-900 dark:text-amber-200">
                <i class="pi pi-info-circle text-amber-600 text-sm flex-shrink-0"></i>
                <span>{{ lang.t('codNoteNotice') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Summary: Items & Place Order (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-slate-800">
              {{ lang.t('orderReview') }} ({{ cart.cart().length }})
            </h3>

            <!-- Mini items list -->
            <div class="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              @for (item of cart.cart(); track item.id) {
                <div class="flex justify-between items-center text-xs">
                  <span class="truncate max-w-[180px] text-gray-700 dark:text-slate-300 font-medium">
                    {{ item.quantity }}x {{ item.productName }}
                  </span>
                  <span class="font-bold text-gray-900 dark:text-white">₹{{ item.subtotal }}</span>
                </div>
              }
            </div>

            <div class="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2 text-xs text-gray-600 dark:text-slate-300">
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
                <span class="font-bold text-gray-800 dark:text-white">{{ cart.shippingFee() === 0 ? lang.t('free') : '₹' + cart.shippingFee() }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ lang.t('taxesAndFees') }}</span>
                <span class="font-bold text-gray-800 dark:text-white">₹{{ cart.tax() }}</span>
              </div>

              <div class="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between items-baseline text-sm font-black text-gray-900 dark:text-white">
                <span>{{ lang.t('totalPayable') }}:</span>
                <span class="text-xl text-brand-800 dark:text-brand-400 font-black">₹{{ cart.totalAmount() }}</span>
              </div>
            </div>

            <button
              (click)="handlePlaceOrder()"
              [disabled]="isSubmitting()"
              class="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-xl shadow-lg shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-101 disabled:opacity-50 cursor-pointer"
            >
              @if (isSubmitting()) {
                <span>{{ lang.t('placingOrder') }}</span>
              } @else {
                <span>{{ lang.t('confirmCodOrder') }} (₹{{ cart.totalAmount() }})</span>
              }
            </button>

            <div class="text-[11px] text-gray-400 dark:text-slate-500 text-center flex items-center justify-center space-x-1">
              <i class="pi pi-truck text-brand-600 text-xs"></i>
              <span>{{ lang.t('expressDeliveryPromise') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- NEW ADDRESS MODAL -->
      @if (isNewAddressModalOpen()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-200 dark:border-slate-800">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 class="font-bold text-gray-900 dark:text-white text-sm">{{ lang.t('addNewAddressTitle') }}</h3>
              <button (click)="isNewAddressModalOpen.set(false)" class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer">
                <i class="pi pi-times text-lg"></i>
              </button>
            </div>

            <form (ngSubmit)="handleCreateAddress()" class="space-y-3 text-xs">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">{{ lang.t('fullNameLabel') }}</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="formData.fullName"
                    name="fullName"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">{{ lang.t('phoneLabel') }}</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="formData.phone"
                    name="phone"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">{{ lang.t('flatHouseLabel') }}</label>
                <input
                  type="text"
                  required
                  [(ngModel)]="formData.house"
                  name="house"
                  placeholder="e.g. Flat 302, Sai Residency"
                  class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">{{ lang.t('streetAreaLabel') }}</label>
                <input
                  type="text"
                  required
                  [(ngModel)]="formData.street"
                  name="street"
                  placeholder="e.g. Boring Canal Road"
                  class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">{{ lang.t('cityLabel') }}</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="formData.city"
                    name="city"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">{{ lang.t('stateLabel') }}</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="formData.state"
                    name="state"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">{{ lang.t('pincodeLabel') }}</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    [(ngModel)]="formData.pincode"
                    name="pincode"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">{{ lang.t('landmarkLabel') }}</label>
                <input
                  type="text"
                  [(ngModel)]="formData.landmark"
                  name="landmark"
                  placeholder="e.g. Near Panch Shiv Mandir"
                  class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div class="flex gap-2 pt-2">
                <button
                  type="button"
                  (click)="isNewAddressModalOpen.set(false)"
                  class="flex-1 py-2.5 border border-gray-200 dark:border-slate-700 font-bold rounded-xl text-gray-700 dark:text-slate-300 cursor-pointer"
                >
                  {{ lang.t('cancel') }}
                </button>
                <button
                  type="submit"
                  class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  {{ lang.t('saveAddress') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class CheckoutPageComponent implements OnInit {
  cart = inject(CartService);
  auth = inject(AuthService);
  lang = inject(LanguageService);
  private toast = inject(ToastService);
  private api = inject(ApiService);
  private router = inject(Router);

  addresses = signal<Address[]>([]);
  selectedAddressId = signal<number | null>(null);
  isNewAddressModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  formData = {
    fullName: this.auth.user()?.name || 'Customer',
    phone: this.auth.user()?.phone || '9876543210',
    house: '',
    street: '',
    area: '',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    landmark: ''
  };

  ngOnInit(): void {
    if (this.cart.cart().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    this.loadAddresses();
  }

  async loadAddresses(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.getAddresses());
      this.addresses.set(res.data || []);
      const defaultAddr = res.data?.find(a => a.isDefault) || res.data?.[0];
      if (defaultAddr) {
        this.selectedAddressId.set(defaultAddr.id);
      }
    } catch (err) {
      console.error('Failed loading addresses', err);
    }
  }

  async handleCreateAddress(): Promise<void> {
    if (!this.formData.fullName || !this.formData.house || !this.formData.street || !this.formData.pincode) {
      this.toast.error('Please fill all mandatory address fields');
      return;
    }

    try {
      const res = await firstValueFrom(this.api.createAddress(this.formData));
      this.addresses.update(prev => [...prev, res.data]);
      this.selectedAddressId.set(res.data.id);
      this.isNewAddressModalOpen.set(false);
      this.toast.success('New delivery address saved');
    } catch (err: any) {
      this.toast.error(err.message || 'Failed saving address');
    }
  }

  async handlePlaceOrder(): Promise<void> {
    if (!this.selectedAddressId()) {
      this.toast.error('Please choose or add a delivery address');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const orderPayload = {
        addressId: this.selectedAddressId(),
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        couponCode: this.cart.coupon()?.code || null,
        items: this.cart.cart(),
        subtotal: this.cart.cartSubtotal(),
        discount: this.cart.discount(),
        shippingFee: this.cart.shippingFee(),
        tax: this.cart.tax(),
        totalAmount: this.cart.totalAmount(),
        paymentDetails: { note: 'Cash on Delivery' }
      };

      const res = await firstValueFrom(this.api.createOrder(orderPayload));
      this.cart.clearCart();
      this.toast.success('🎉 Order placed successfully with Cash on Delivery!');
      this.router.navigate(['/order-success', res.data.orderNumber], { state: { order: res.data } });
    } catch (err: any) {
      this.toast.error(err.message || 'Failed placing order');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
