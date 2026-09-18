import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Order } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    @if (loading()) {
      <div class="max-w-4xl mx-auto px-4 py-16 text-center animate-pulse">
        <div class="h-8 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
        <div class="h-48 bg-gray-200 rounded-3xl"></div>
      </div>
    } @else if (!order()) {
      <div class="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 class="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <a routerLink="/orders" class="text-brand-600 font-bold text-xs">Back to Orders</a>
      </div>
    } @else {
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div class="flex items-center space-x-2">
              <a routerLink="/orders" class="text-gray-400 hover:text-gray-700">
                <i class="pi pi-arrow-left text-lg"></i>
              </a>
              <h1 class="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Order #{{ order()!.orderNumber }}
              </h1>
            </div>
            <p class="text-xs text-gray-500 mt-1 ml-7">
              Placed on {{ order()!.createdAt | date:'fullDate' }}
            </p>
          </div>

          <!-- Status Actions -->
          <div class="flex items-center space-x-2">
            @if (!isCancelled && !isDelivered && !isReturnRequested) {
              <button
                (click)="isCancelModalOpen.set(true)"
                class="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel Order
              </button>
            }

            @if (isDelivered && !isReturnRequested) {
              <button
                (click)="isReturnModalOpen.set(true)"
                class="px-3.5 py-1.5 border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
              >
                <i class="pi pi-replay text-xs"></i>
                <span>Request Return</span>
              </button>
            }
          </div>
        </div>

        <!-- TRACKING TIMELINE CARD -->
        <div class="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div class="flex justify-between items-center pb-3 border-b border-gray-100 text-xs">
            <div>
              <span class="text-gray-400 font-medium">Tracking Number: </span>
              <span class="font-mono font-bold text-gray-800">{{ order()!.trackingNumber || 'TT-EXP-8891' }}</span>
            </div>
            <div class="text-right">
              <span class="text-gray-400 font-medium">Estimated Express Delivery: </span>
              <span class="font-bold text-emerald-700">Tomorrow by 11:00 AM</span>
            </div>
          </div>

          <!-- Visual Progress Stepper -->
          @if (isCancelled) {
            <div class="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-xs font-semibold">
              <i class="pi pi-exclamation-circle text-rose-600 text-lg flex-shrink-0"></i>
              <div>
                <p class="font-bold">This order was cancelled</p>
                <p class="text-[11px] text-rose-700 font-normal">Reason: {{ order()!.cancelReason || 'Cancelled by customer' }}</p>
              </div>
            </div>
          } @else {
            <div class="relative pt-4 pb-2">
              <div class="grid grid-cols-2 sm:grid-cols-6 gap-4 text-center">
                @for (step of trackingSteps; track step.key; let idx = $index) {
                  <div class="flex flex-col items-center relative">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all"
                      [ngClass]="currentStepIndex >= idx ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' : 'bg-gray-100 text-gray-400 border border-gray-200'"
                    >
                      <i [class]="currentStepIndex >= idx ? 'pi pi-check text-xs' : 'pi pi-circle text-[8px]'"></i>
                    </div>
                    <span
                      class="text-[11px] leading-tight"
                      [ngClass]="{
                        'font-black text-brand-800': currentStepIndex === idx,
                        'font-bold text-gray-800': currentStepIndex > idx,
                        'text-gray-400': currentStepIndex < idx
                      }"
                    >
                      {{ step.label }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- ITEMS SNAPSHOT -->
        <div class="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
            Items Ordered ({{ order()!.items?.length || 0 }})
          </h3>

          <div class="space-y-4">
            @for (item of order()!.items; track item.id) {
              <div class="flex items-center justify-between gap-4 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div class="flex items-center space-x-3">
                  <img
                    [src]="item.thumbnail"
                    [alt]="item.productName"
                    class="w-14 h-14 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                  />
                  <div>
                    <h4 class="text-xs font-bold text-gray-900 line-clamp-1">{{ item.productName }}</h4>
                    @if (item.variantName) {
                      <span class="text-[11px] text-gray-500">{{ item.variantName }}</span>
                    }
                    <p class="text-xs text-gray-600 mt-0.5">
                      Qty: {{ item.quantity }} × ₹{{ item.price }}
                    </p>
                  </div>
                </div>
                <span class="text-xs font-black text-gray-900">₹{{ item.subtotal }}</span>
              </div>
            }
          </div>
        </div>

        <!-- ADDRESS & PAYMENT BREAKDOWN -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-2 text-xs">
            <h3 class="font-bold text-gray-900 flex items-center pb-2 border-b border-gray-100">
              <i class="pi pi-map-marker text-brand-600 mr-1.5 text-base"></i>
              <span>Delivery Destination</span>
            </h3>
            @if (order()!.address) {
              <div class="space-y-1 text-gray-600 pt-1">
                <p class="font-bold text-gray-900">{{ order()!.address!.fullName }}</p>
                <p>{{ order()!.address!.house }}, {{ order()!.address!.street }}</p>
                <p>{{ order()!.address!.area }}, {{ order()!.address!.city }}, {{ order()!.address!.state }} - {{ order()!.address!.pincode }}</p>
                <p class="font-semibold text-gray-800">Phone: {{ order()!.address!.phone }}</p>
              </div>
            } @else {
              <p class="text-gray-400">Default delivery address</p>
            }
          </div>

          <div class="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-2.5 text-xs text-gray-600">
            <h3 class="font-bold text-gray-900 pb-2 border-b border-gray-100">
              Payment &amp; Charges
            </h3>
            <div class="flex justify-between">
              <span>Payment Method:</span>
              <span class="font-bold text-gray-800">{{ order()!.paymentMethod }}</span>
            </div>
            <div class="flex justify-between">
              <span>Payment Status:</span>
              <span class="font-bold text-emerald-700">{{ order()!.paymentStatus }}</span>
            </div>
            <div class="flex justify-between">
              <span>Items Subtotal:</span>
              <span>₹{{ order()!.subtotal }}</span>
            </div>
            @if (order()!.discount > 0) {
              <div class="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Discount:</span>
                <span>-₹{{ order()!.discount }}</span>
              </div>
            }
            <div class="flex justify-between">
              <span>Express Shipping:</span>
              <span>{{ order()!.shippingFee === 0 ? 'FREE' : '₹' + order()!.shippingFee }}</span>
            </div>
            <div class="flex justify-between">
              <span>Taxes (GST):</span>
              <span>₹{{ order()!.tax }}</span>
            </div>
            <div class="pt-2 border-t border-gray-100 flex justify-between font-black text-sm text-gray-900">
              <span>Total Paid:</span>
              <span class="text-brand-800 text-base">₹{{ order()!.totalAmount }}</span>
            </div>
          </div>
        </div>

        <!-- CANCEL MODAL -->
        @if (isCancelModalOpen()) {
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 class="font-bold text-gray-900 text-sm">Cancel Order #{{ order()!.orderNumber }}</h3>
                <button (click)="isCancelModalOpen.set(false)" class="text-gray-400 cursor-pointer">
                  <i class="pi pi-times text-lg"></i>
                </button>
              </div>
              <p class="text-xs text-gray-500">
                Are you sure you want to cancel this order? Please select a reason:
              </p>
              <select
                [(ngModel)]="cancelReason"
                class="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
              >
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery delay expected">Delivery delay expected</option>
                <option value="Change in address">Change in address</option>
              </select>
              <div class="flex gap-2 pt-2">
                <button
                  (click)="isCancelModalOpen.set(false)"
                  class="flex-1 py-2.5 border border-gray-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  (click)="handleCancelOrder()"
                  class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        }

        <!-- RETURN MODAL -->
        @if (isReturnModalOpen()) {
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 class="font-bold text-gray-900 text-sm">Request Return / Refund</h3>
                <button (click)="isReturnModalOpen.set(false)" class="text-gray-400 cursor-pointer">
                  <i class="pi pi-times text-lg"></i>
                </button>
              </div>
              <p class="text-xs text-gray-500">
                Please share the issue with your delivered order. Our executive will visit your address to inspect and pick up the item.
              </p>
              <select
                [(ngModel)]="returnReason"
                class="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
              >
                <option value="Item damaged or expired">Item damaged or expired</option>
                <option value="Wrong product delivered">Wrong product delivered</option>
                <option value="Quality not as described">Quality not as described</option>
                <option value="Missing contents in package">Missing contents in package</option>
              </select>
              <div class="flex gap-2 pt-2">
                <button
                  (click)="isReturnModalOpen.set(false)"
                  class="flex-1 py-2.5 border border-gray-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  (click)="handleRequestReturn()"
                  class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class OrderDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  order = signal<Order | null>(null);
  loading = signal<boolean>(true);

  isCancelModalOpen = signal<boolean>(false);
  isReturnModalOpen = signal<boolean>(false);
  cancelReason = 'Found cheaper elsewhere';
  returnReason = 'Item damaged or expired';

  trackingSteps = [
    { key: 'ORDER_PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  get currentStepIndex(): number {
    if (!this.order()) return 0;
    return this.trackingSteps.findIndex(s => s.key === this.order()!.orderStatus);
  }

  get isDelivered(): boolean {
    return this.order()?.orderStatus === 'DELIVERED';
  }

  get isCancelled(): boolean {
    return this.order()?.orderStatus === 'CANCELLED';
  }

  get isReturnRequested(): boolean {
    return this.order()?.orderStatus === 'RETURN_REQUESTED';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadOrder(id);
    });
  }

  async loadOrder(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.getOrderById(id));
      this.order.set(res.data);
    } catch (err) {
      console.error('Failed loading order', err);
    } finally {
      this.loading.set(false);
    }
  }

  async handleCancelOrder(): Promise<void> {
    try {
      await firstValueFrom(this.api.cancelOrder(this.order()!.orderNumber, this.cancelReason));
      this.isCancelModalOpen.set(false);
      this.toast.success('Order cancelled successfully');
      this.loadOrder(this.order()!.orderNumber);
    } catch (err: any) {
      this.toast.error(err.message || 'Failed cancelling order');
    }
  }

  async handleRequestReturn(): Promise<void> {
    try {
      await firstValueFrom(this.api.requestReturn(this.order()!.orderNumber, this.returnReason));
      this.isReturnModalOpen.set(false);
      this.toast.success('Return request submitted. Pickup in 48 hours.');
      this.loadOrder(this.order()!.orderNumber);
    } catch (err: any) {
      this.toast.error(err.message || 'Failed requesting return');
    }
  }
}
