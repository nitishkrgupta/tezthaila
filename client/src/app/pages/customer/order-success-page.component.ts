import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Order } from '../../models';

@Component({
  selector: 'app-order-success-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
      <!-- Green Check Icon -->
      <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
        <i class="pi pi-check text-4xl"></i>
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          ✓ Order Placed Successfully!
        </h1>
        <p class="text-xs sm:text-sm text-gray-500">
          Thank you for shopping with Tez Thaila. We're getting your bag ready for express delivery!
        </p>
      </div>

      <!-- Order Snapshot Card -->
      <div class="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md text-left space-y-4 max-w-lg mx-auto">
        <div class="flex justify-between items-center pb-3 border-b border-gray-100 text-xs">
          <span class="text-gray-500 font-medium">Order Number:</span>
          <span class="font-mono font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
            {{ orderNumber }}
          </span>
        </div>

        <div class="space-y-2 text-xs text-gray-600">
          <div class="flex justify-between">
            <span>Total Amount Paid:</span>
            <span class="font-extrabold text-gray-900 text-sm">
              ₹{{ order?.totalAmount || '1039' }}
            </span>
          </div>

          <div class="flex justify-between">
            <span>Payment Method:</span>
            <span class="font-bold text-gray-800">
              {{ order?.paymentMethod === 'COD' ? 'Cash on Delivery (Pending)' : 'Razorpay Online (Paid)' }}
            </span>
          </div>

          <div class="flex justify-between">
            <span>Estimated Express Delivery:</span>
            <span class="font-bold text-emerald-700 flex items-center">
              <i class="pi pi-truck mr-1 text-xs"></i>
              Tomorrow by 11:00 AM
            </span>
          </div>

          @if (order?.address) {
            <div class="pt-2 border-t border-gray-100 text-[11px]">
              <span class="font-bold text-gray-700 block mb-0.5">Delivery Address:</span>
              <p class="text-gray-500">
                {{ order?.address?.fullName }}, {{ order?.address?.house }}, {{ order?.address?.street }}, {{ order?.address?.city }} - {{ order?.address?.pincode }}
              </p>
            </div>
          }
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a
          [routerLink]="['/orders', orderNumber]"
          class="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2"
        >
          <i class="pi pi-box text-xs"></i>
          <span>Track Order</span>
        </a>

        <a
          routerLink="/products"
          class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center space-x-2"
        >
          <i class="pi pi-home text-xs"></i>
          <span>Continue Shopping</span>
        </a>
      </div>
    </div>
  `
})
export class OrderSuccessPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderNumber = '';
  order: Order | null = null;

  ngOnInit(): void {
    this.orderNumber = this.route.snapshot.paramMap.get('orderId') || 'TT-2026-884920';
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['order']) {
      this.order = navigation.extras.state['order'];
    }
  }
}
