import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register-page',
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

        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 mx-auto flex items-center justify-center text-white shadow-md shadow-brand-500/20 mb-2">
            <i class="pi pi-shopping-bag text-2xl"></i>
          </div>
          <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Create Tez Thaila Account</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">Sign up for express delivery, order tracking &amp; instant coupons</p>
        </div>

        <form (ngSubmit)="handleSubmit()" class="space-y-3.5 text-xs">
          <div>
            <label class="font-bold text-gray-700 dark:text-gray-300 block mb-1">Full Name</label>
            <div class="relative">
              <input
                type="text"
                required
                [(ngModel)]="name"
                name="name"
                placeholder="e.g. Ramesh Kumar"
                class="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
              />
              <i class="pi pi-user text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
            </div>
          </div>

          <div>
            <label class="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email Address</label>
            <div class="relative">
              <input
                type="email"
                required
                [(ngModel)]="email"
                name="email"
                placeholder="ramesh@example.com"
                class="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
              />
              <i class="pi pi-envelope text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="font-bold text-gray-700 dark:text-gray-300">Mobile Phone Number</label>
              <span class="text-[10px] text-gray-400 font-medium">10 digits (starts with 6, 7, 8, 9)</span>
            </div>
            <div class="relative flex items-center">
              <span class="absolute left-3 text-xs font-bold text-gray-500 dark:text-gray-400 select-none">
                +91
              </span>
              <input
                type="tel"
                required
                maxlength="13"
                [(ngModel)]="phone"
                name="phone"
                (ngModelChange)="onPhoneChange($event)"
                placeholder="9876543210"
                class="w-full pl-12 pr-3 py-2.5 bg-white dark:bg-slate-950 border rounded-xl text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                [ngClass]="phoneWarning() ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-gray-900 dark:text-white focus:border-amber-600' : 'border-gray-300 dark:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'"
              />
            </div>
            @if (phoneWarning()) {
              <div class="mt-1.5 flex items-start space-x-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800 text-[11px] font-medium leading-tight">
                <i class="pi pi-exclamation-circle text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 text-xs"></i>
                <span>{{ phoneWarning() }}</span>
              </div>
            }
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="font-bold text-gray-700 dark:text-gray-300 block">Password</label>
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  [title]="showPassword() ? 'Hide' : 'Show'"
                >
                  <i class="pi" [ngClass]="showPassword() ? 'pi-eye-slash' : 'pi-eye'"></i>
                </button>
              </div>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  required
                  [(ngModel)]="password"
                  name="password"
                  placeholder="••••••••"
                  class="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                />
                <i class="pi pi-lock text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="font-bold text-gray-700 dark:text-gray-300 block">Confirm</label>
              </div>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  required
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  class="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                />
                <i class="pi pi-lock text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
              </div>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer pt-2"
          >
            <span>Register Account</span>
            <i class="pi pi-arrow-right text-xs"></i>
          </button>
        </form>

        <div class="text-center pt-2 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400">
          <span>Already have an account? </span>
          <a routerLink="/login" class="font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300">
            Sign In
          </a>
        </div>
      </div>
    </div>
  `
})
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  readonly phoneWarning = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  // Validate Indian Phone format (starts with 6, 7, 8, 9 and exactly 10 digits)
  private validateIndianPhone(rawPhone: string) {
    const clean = rawPhone.trim().replace(/^(\+91|0)/, '').replace(/\D/g, '');
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return {
      isValid: indianPhoneRegex.test(clean),
      cleanPhone: clean
    };
  }

  onPhoneChange(val: string) {
    if (this.phoneWarning()) {
      const { isValid } = this.validateIndianPhone(val);
      if (isValid) {
        this.phoneWarning.set('');
      }
    }
  }

  async handleSubmit() {
    this.phoneWarning.set('');

    // Check Indian phone number validation
    const { isValid, cleanPhone } = this.validateIndianPhone(this.phone);
    if (!isValid) {
      const warningMsg = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210).';
      this.phoneWarning.set(warningMsg);
      this.toast.warning(warningMsg);
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toast.error('Passwords do not match');
      return;
    }
    if (this.password.length < 6) {
      this.toast.error('Password must be at least 6 characters long');
      return;
    }

    this.loading.set(true);
    try {
      await this.auth.register({
        name: this.name,
        email: this.email,
        phone: cleanPhone,
        password: this.password
      });

      // Do NOT log in directly; redirect to login page with success prompt
      this.router.navigate(['/login'], {
        state: {
          registeredEmail: this.email,
          registrationSuccessMsg: 'Registration successful, now you can login to Tez Thaila.'
        }
      });
    } catch {
      // Handled in AuthService
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
