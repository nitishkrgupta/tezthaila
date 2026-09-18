import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-razorpay-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
        <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
          <!-- Header -->
          <div class="bg-[#0c2340] text-white p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-xl font-black tracking-tight text-white">Razorpay</span>
                <span class="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-1.5 py-0.5 rounded uppercase">
                  Sandbox Mode
                </span>
              </div>
              <p class="text-[11px] text-gray-400 mt-0.5 flex items-center">
                <i class="pi pi-shield text-emerald-400 mr-1 text-xs"></i>
                Secured with 256-bit bank-grade encryption
              </p>
            </div>

            <button
              (click)="onCancel.emit()"
              [disabled]="isProcessing()"
              class="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <i class="pi pi-times text-lg"></i>
            </button>
          </div>

          <!-- Order Price Banner -->
          <div class="bg-slate-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <div>
              <p class="text-[11px] text-gray-500 font-medium">Paying to Tez Thaila E-Commerce</p>
              <p class="text-xs font-bold text-gray-800">Order Settlement</p>
            </div>
            <div class="text-right">
              <span class="text-xl font-extrabold text-brand-800">₹{{ amount }}</span>
            </div>
          </div>

          <!-- Payment Methods Tabs -->
          <div class="p-5 space-y-4">
            <p class="text-xs font-bold text-gray-600 uppercase tracking-wider">Choose Payment Mode</p>

            <div class="grid grid-cols-4 gap-2">
              @for (m of methods; track m.id) {
                <button
                  (click)="selectedMethod = m.id"
                  class="p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer"
                  [ngClass]="selectedMethod === m.id ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold shadow-xs' : 'border-gray-200 hover:bg-gray-50 text-gray-600'"
                >
                  <i [class]="m.icon + ' text-sky-600 mb-1 text-base'"></i>
                  <span class="text-[10px] leading-tight">{{ m.label }}</span>
                </button>
              }
            </div>

            <!-- Tab Content -->
            @if (selectedMethod === 'upi') {
              <div class="space-y-3 pt-2">
                <label class="block text-xs font-medium text-gray-700">Enter Virtual Payment Address (UPI ID)</label>
                <input
                  type="text"
                  [(ngModel)]="upiId"
                  class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-sky-500"
                  placeholder="example@upi"
                />
                <div class="flex gap-2">
                  @for (app of ['Google Pay', 'PhonePe', 'Paytm', 'BHIM']; track app) {
                    <button
                      type="button"
                      (click)="upiId = 'user@' + app.toLowerCase().replace(' ', '')"
                      class="px-2.5 py-1 bg-gray-100 hover:bg-sky-50 text-gray-700 text-[10px] font-semibold rounded-lg border border-gray-200 cursor-pointer"
                    >
                      {{ app }}
                    </button>
                  }
                </div>
              </div>
            }

            @if (selectedMethod === 'card') {
              <div class="space-y-3 pt-2 text-xs">
                <div>
                  <label class="block font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    [(ngModel)]="cardNumber"
                    class="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-medium text-gray-700 mb-1">Valid Thru</label>
                    <input
                      type="text"
                      [(ngModel)]="cardExpiry"
                      class="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="password"
                      [(ngModel)]="cardCvv"
                      class="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                  </div>
                </div>
              </div>
            }

            @if (selectedMethod === 'netbanking') {
              <div class="grid grid-cols-2 gap-2 pt-2">
                @for (b of ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank']; track b) {
                  <button
                    type="button"
                    class="p-2.5 text-xs text-left border border-gray-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 text-gray-800 font-medium cursor-pointer"
                  >
                    {{ b }}
                  </button>
                }
              </div>
            }

            @if (selectedMethod === 'wallet') {
              <div class="grid grid-cols-2 gap-2 pt-2">
                @for (w of ['Amazon Pay', 'Paytm Wallet', 'MobiKwik', 'Freecharge']; track w) {
                  <button
                    type="button"
                    class="p-2.5 text-xs text-left border border-gray-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 text-gray-800 font-medium cursor-pointer"
                  >
                    {{ w }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Action Button -->
          <div class="p-5 border-t border-gray-100 bg-gray-50 flex flex-col space-y-2">
            <button
              (click)="handlePayNow()"
              [disabled]="isProcessing()"
              class="w-full py-3 bg-[#0c2340] hover:bg-[#153a6b] text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              @if (isProcessing()) {
                <i class="pi pi-spin pi-spinner text-base"></i>
                <span>Processing Payment...</span>
              } @else {
                <i class="pi pi-lock text-sm"></i>
                <span>Pay ₹{{ amount }}</span>
              }
            </button>
            <p class="text-[10px] text-gray-400 text-center">
              Simulated Sandbox Environment • No actual money will be debited
            </p>
          </div>
        </div>
      </div>
    }
  `
})
export class RazorpayModalComponent {
  @Input() isOpen = false;
  @Input() amount = 0;
  @Output() onSuccess = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  selectedMethod = 'upi';
  upiId = 'user@okhdfcbank';
  cardNumber = '4532 •••• •••• 8892';
  cardExpiry = '08/28';
  cardCvv = '321';
  isProcessing = signal<boolean>(false);

  methods = [
    { id: 'upi', label: 'UPI / QR', icon: 'pi pi-mobile' },
    { id: 'card', label: 'Cards', icon: 'pi pi-credit-card' },
    { id: 'netbanking', label: 'NetBanking', icon: 'pi pi-building' },
    { id: 'wallet', label: 'Wallets', icon: 'pi pi-wallet' }
  ];

  handlePayNow(): void {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.onSuccess.emit({
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_order_id: `order_sim_${Date.now()}`,
        razorpay_signature: `sig_verified_${Math.random().toString(36).substring(7)}`
      });
    }, 1200);
  }
}
