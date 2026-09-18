import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      <!-- Subtle background glow -->
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-md w-full relative z-10">
        <!-- Portal Header -->
        <div class="text-center mb-8 space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/80 shadow-2xl mx-auto flex items-center justify-center text-accent-400">
            <i class="pi pi-shield text-2xl"></i>
          </div>
          <div>
            <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-accent-400 uppercase tracking-wider mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse"></span>
              <span>Restricted Access • Internal Operations</span>
            </div>
            <h1 class="text-2xl font-black text-white tracking-tight">
              Tez Thaila Admin Portal
            </h1>
            <p class="text-xs text-gray-400 mt-1">
              Authorized personnel sign in to access catalog, order fulfillment &amp; analytics
            </p>
          </div>
        </div>

        <!-- Login Box -->
        <div class="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
          <!-- Close Button -->
          <button
            type="button"
            (click)="handleClose()"
            class="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close / Return to Storefront"
            aria-label="Close"
          >
            <i class="pi pi-times text-sm"></i>
          </button>

          @if (errorMsg()) {
            <div class="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start space-x-2.5">
              <i class="pi pi-exclamation-circle text-rose-400 text-sm flex-shrink-0 mt-0.5"></i>
              <div class="flex-1 font-medium">{{ errorMsg() }}</div>
            </div>
          }

          <form (ngSubmit)="handleAdminLogin()" class="space-y-4 text-xs">
            <div>
              <label class="font-bold text-gray-300 block mb-1.5">Administrator Email</label>
              <div class="relative">
                <input
                  type="text"
                  required
                  [(ngModel)]="email"
                  name="email"
                  (ngModelChange)="errorMsg.set('')"
                  placeholder="admin@tezthaila.com or admin"
                  class="w-full pl-9 pr-3 py-3 bg-slate-950 border border-slate-800 focus:border-accent-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors"
                />
                <i class="pi pi-envelope text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
              </div>
            </div>

            <div>
              <label class="font-bold text-gray-300 block mb-1.5">Security Password</label>
              <div class="relative">
                <input
                  type="password"
                  required
                  [(ngModel)]="password"
                  name="password"
                  (ngModelChange)="errorMsg.set('')"
                  placeholder="••••••••••••"
                  class="w-full pl-9 pr-3 py-3 bg-slate-950 border border-slate-800 focus:border-accent-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors"
                />
                <i class="pi pi-lock text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-3.5 px-4 bg-accent-500 hover:bg-accent-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-accent-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              @if (loading()) {
                <i class="pi pi-spin pi-spinner text-sm"></i>
                <span>Authenticating...</span>
              } @else {
                <span>Enter Operations Central</span>
                <i class="pi pi-arrow-right text-xs"></i>
              }
            </button>
          </form>

          <div class="pt-4 border-t border-slate-800/80 text-center">
            <a
              routerLink="/"
              class="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <i class="pi pi-arrow-left text-xs"></i>
              <span>Return to Customer Storefront</span>
            </a>
          </div>
        </div>

        <p class="text-center text-[11px] text-gray-600 mt-6">
          Tez Thaila Internal Systems • Restricted to Authorized Operations Personnel
        </p>
      </div>
    </div>
  `
})
export class AdminLoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  readonly loading = signal<boolean>(false);
  readonly errorMsg = signal<string>('');

  async handleAdminLogin() {
    this.errorMsg.set('');

    if (!this.email.trim() || !this.password) {
      this.errorMsg.set('Please enter both administrative email and password.');
      return;
    }

    this.loading.set(true);
    try {
      const user = await this.auth.login(this.email.trim(), this.password);

      // Verify administrative privilege
      if (user?.role !== 'ADMIN') {
        await this.auth.logout('');
        this.errorMsg.set('Access Denied: Your account does not have administrator privileges.');
        this.toast.error('Unauthorized: Administrator role required');
        return;
      }

      this.toast.success('Administrator authenticated successfully');
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
      this.router.navigateByUrl(returnUrl);
    } catch (err: any) {
      const msg = err.error?.message || err.message || 'Authentication failed. Please verify credentials.';
      this.errorMsg.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  handleClose(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
