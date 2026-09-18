import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { User } from '../models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  user = signal<User | null>(null);
  loading = signal<boolean>(true);

  isAuthenticated = computed(() => !!this.user());
  isAdmin = computed(() => this.user()?.role === 'ADMIN');

  constructor() {
    this.initAuth();
  }

  async initAuth(): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tez_token') : null;
    if (token) {
      try {
        const res = await firstValueFrom(this.api.getMe());
        if (res?.data?.user) {
          this.user.set(res.data.user);
        }
      } catch (err) {
        console.warn('Session expired or invalid token', err);
        localStorage.removeItem('tez_token');
        localStorage.removeItem('tez_user_id');
        this.user.set(null);
      }
    }
    this.loading.set(false);
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const res = await firstValueFrom(this.api.login({ email, password }));
      if (res.data?.token) {
        localStorage.setItem('tez_token', res.data.token);
        localStorage.setItem('tez_user_id', res.data.user.id.toString());
      }
      this.user.set(res.data.user);
      this.toast.success(res.message || `Welcome back, ${res.data.user.name}!`);
      return res.data.user;
    } catch (err: any) {
      const msg = err.error?.message || err.message || 'Login failed';
      this.toast.error(msg);
      throw err;
    }
  }

  async register(userData: { name: string; email: string; phone: string; password: string }): Promise<any> {
    try {
      const res = await firstValueFrom(this.api.register(userData));
      // Do NOT set token or user automatically. Must log in with credentials
      this.toast.success(res.message || 'Registration successful, now you can login to Tez Thaila.');
      return res.data;
    } catch (err: any) {
      const msg = err.error?.message || err.message || 'Registration failed';
      this.toast.error(msg);
      throw err;
    }
  }

  async logout(redirectUrl = '/'): Promise<void> {
    try {
      await firstValueFrom(this.api.logout());
    } catch (err) {
      console.warn('Logout notification error', err);
    } finally {
      localStorage.removeItem('tez_token');
      localStorage.removeItem('tez_user_id');
      this.user.set(null);
      this.toast.info('Logged out successfully');
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  }

  updateUser(data: Partial<User>): void {
    const current = this.user();
    if (current) {
      this.user.set({ ...current, ...data });
    }
  }
}
