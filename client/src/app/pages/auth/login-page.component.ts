import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-gray-200/80 dark:border-slate-800 shadow-xl max-w-md w-full space-y-6 relative transition-colors duration-200">
        <!-- Close Button -->
        <button
          type="button"
          (click)="handleClose()"
          class="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          title="Close and Return"
          aria-label="Close"
        >
          <i class="pi pi-times text-sm"></i>
        </button>

        <!-- Brand Header -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 mx-auto flex items-center justify-center text-white shadow-md shadow-brand-500/20 mb-2">
            <i class="pi pi-shopping-bag text-2xl"></i>
          </div>
          <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Welcome to Tez Thaila</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">Sign in to track orders, saved items, and express checkout</p>
        </div>

        <!-- Post-Registration Success Notice -->
        @if (registrationSuccessMsg()) {
          <div class="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start space-x-2.5 text-emerald-900 dark:text-emerald-200 text-xs shadow-xs">
            <i class="pi pi-check-circle text-emerald-600 dark:text-emerald-400 text-base flex-shrink-0 mt-0.5"></i>
            <div>
              <p class="font-bold">{{ registrationSuccessMsg() }}</p>
              <p class="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">Please sign in with your password to continue.</p>
            </div>
          </div>
        }

        <!-- Regular Login Form -->
        <form (ngSubmit)="handleLogin()" class="space-y-4 text-xs">
          <div>
            <label class="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email or Mobile Number</label>
            <div class="relative">
              <input
                type="text"
                required
                [(ngModel)]="email"
                name="email"
                placeholder="Email or Mobile (e.g. 9876543211)"
                class="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
              />
              <i class="pi pi-user text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="font-bold text-gray-700 dark:text-gray-300">Password</label>
              <span class="text-[11px] text-brand-600 dark:text-brand-400 font-semibold cursor-pointer">Forgot?</span>
            </div>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                required
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                class="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
              />
              <i class="pi pi-lock text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
              <button
                type="button"
                (click)="showPassword.set(!showPassword())"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                [title]="showPassword() ? 'Hide password' : 'Show password'"
                aria-label="Toggle password visibility"
              >
                <i class="pi" [ngClass]="showPassword() ? 'pi-eye-slash' : 'pi-eye'"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>Sign In</span>
            <i class="pi pi-arrow-right text-xs"></i>
          </button>
        </form>

        <div class="text-center pt-2 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400 space-y-2">
          <div>
            <span>Don't have an account? </span>
            <a routerLink="/register" class="font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300">
              Create Account
            </a>
          </div>
          <div>
            <a routerLink="/admin/login" class="text-[11px] text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center space-x-1">
              <i class="pi pi-shield text-[10px]"></i>
              <span>Authorized Admin Portal</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  readonly loading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly registrationSuccessMsg = signal<string | null>(null);

  ngOnInit() {
    // Check navigation state or history state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    if (state?.registrationSuccessMsg) {
      this.registrationSuccessMsg.set(state.registrationSuccessMsg);
    }
    if (state?.registeredEmail) {
      this.email = state.registeredEmail;
    }
  }

  async handleLogin() {
    if (!this.email || !this.password) {
      this.toast.error('Please enter both email and password');
      return;
    }

    this.loading.set(true);
    try {
      await this.auth.login(this.email, this.password);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(returnUrl);
    } catch {
      // Handled in AuthService
    } finally {
      this.loading.set(false);
    }
  }

  handleClose(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl && returnUrl !== '/login' && returnUrl !== '/cart' && returnUrl !== '/wishlist') {
      this.router.navigateByUrl(returnUrl);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
