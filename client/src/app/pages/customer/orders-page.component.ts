import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { Order } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div class="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ lang.t('orderHistory') }}</h1>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ lang.t('orderHistorySub') }}</p>
        </div>
        <a routerLink="/products" class="text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 flex items-center">
          <i class="pi pi-arrow-left text-xs mr-1"></i>
          <span>{{ lang.t('shopMore') }}</span>
        </a>
      </div>

      @if (loading()) {
        <div class="max-w-5xl mx-auto py-16 text-center animate-pulse">
          <div class="h-8 w-48 bg-gray-200 dark:bg-slate-800 rounded mx-auto mb-4"></div>
          <div class="h-32 bg-gray-200 dark:bg-slate-800 rounded-2xl mb-4"></div>
          <div class="h-32 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      } @else if (orders().length === 0) {
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div class="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
            <i class="pi pi-box text-3xl"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ lang.t('noOrdersYet') }}</h3>
          <p class="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
            {{ lang.t('noOrdersDesc') }}
          </p>
          <a
            routerLink="/products"
            class="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            {{ lang.t('startShopping') }}
          </a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <div
              class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-brand-200 dark:hover:border-slate-700 transition-colors"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 gap-2">
                <div class="flex items-center space-x-3">
                  <span class="font-mono text-xs font-bold text-brand-800 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg">
                    {{ order.orderNumber }}
                  </span>
                  <span class="text-xs text-gray-400 dark:text-slate-500">
                    {{ order.createdAt | date:'mediumDate' }}
                  </span>
                </div>

                <div class="flex items-center space-x-3">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300': order.orderStatus === 'DELIVERED',
                      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300': order.orderStatus === 'CANCELLED',
                      'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300': order.orderStatus === 'RETURN_REQUESTED',
                      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300': order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'RETURN_REQUESTED'
                    }"
                  >
                    {{ order.orderStatus }}
                  </span>
                  <span class="text-sm font-black text-gray-900 dark:text-white">₹{{ order.totalAmount }}</span>
                </div>
              </div>

              <!-- Items Preview -->
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center space-x-3 overflow-x-auto py-1">
                  @for (it of order.items; track it.id) {
                    <div class="flex items-center space-x-2 flex-shrink-0 bg-gray-50 dark:bg-slate-800/80 p-1.5 rounded-xl border border-gray-100 dark:border-slate-800">
                      <img [src]="it.thumbnail" [alt]="it.productName" class="w-10 h-10 object-cover rounded-lg" />
                      <div class="text-[11px] max-w-[140px] truncate">
                        <p class="font-bold text-gray-900 dark:text-white truncate">{{ it.productName }}</p>
                        <p class="text-gray-500 dark:text-slate-400">{{ lang.t('qty') }}: {{ it.quantity }} • ₹{{ it.price }}</p>
                      </div>
                    </div>
                  }
                </div>

                <a
                  [routerLink]="['/orders', order.orderNumber]"
                  class="px-4 py-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold text-xs rounded-xl flex items-center space-x-1 flex-shrink-0 transition-colors"
                >
                  <span>{{ lang.t('trackAndDetails') }}</span>
                  <i class="pi pi-arrow-right text-xs"></i>
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class OrdersPageComponent implements OnInit {
  private api = inject(ApiService);
  lang = inject(LanguageService);

  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.fetchOrders();
  }

  async fetchOrders(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.getOrders());
      this.orders.set(res.data || []);
    } catch (err) {
      console.error('Failed fetching orders', err);
    } finally {
      this.loading.set(false);
    }
  }
}
