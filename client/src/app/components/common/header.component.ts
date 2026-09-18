import { Component, inject, signal, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { INITIAL_CATEGORIES } from '../../services/mockData';
import { Product } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <!-- Top Micro Bar (Desktop Only) -->
      <div class="bg-brand-900 dark:bg-slate-950 text-white text-xs py-1.5 px-4 hidden md:block border-b border-brand-800/40 dark:border-slate-800">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <span class="flex items-center space-x-1.5 text-emerald-200 dark:text-emerald-400">
              <i class="pi pi-sparkles text-accent-400 text-xs"></i>
              <span>{{ lang.t('freeDeliveryBanner') }}</span>
            </span>
            <span class="text-white/40">•</span>
            <span class="text-emerald-300 dark:text-emerald-400 font-medium">{{ lang.t('genuineFarmFresh') }}</span>
          </div>
          <div class="flex items-center space-x-1.5 text-emerald-200 dark:text-emerald-400 font-bold">
            <i class="pi pi-map-marker text-accent-400 text-xs"></i>
            <span>{{ lang.t('availableInPatna') }}</span>
          </div>
        </div>
      </div>

      <!-- Main Header Container -->
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <!-- Row 1: Logo, Desktop Search, Controls & Actions -->
        <div class="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2 sm:gap-4">
          
          <!-- Left: Mobile Menu + Brand Logo -->
          <div class="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            <!-- Mobile Menu Drawer Toggle -->
            <button
              (click)="isMobileMenuOpen.set(!isMobileMenuOpen())"
              class="md:hidden p-1.5 text-gray-700 dark:text-gray-200 hover:text-brand-700 dark:hover:text-brand-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <i [class]="isMobileMenuOpen() ? 'pi pi-times text-lg' : 'pi pi-bars text-lg'"></i>
            </button>

            <!-- Brand Logo -->
            <a routerLink="/" class="flex items-center space-x-1.5 sm:space-x-2">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 flex-shrink-0">
                <i class="pi pi-shopping-bag text-base sm:text-lg"></i>
              </div>
              <div class="flex items-center space-x-0.5 sm:space-x-1">
                <span class="text-base sm:text-2xl font-black text-brand-800 dark:text-brand-400 tracking-tight">TEZ</span>
                <span class="text-base sm:text-2xl font-black text-accent-500 dark:text-accent-400 tracking-tight">THAILA</span>
              </div>
            </a>

            <!-- Delivery Location (Large screen only) -->
            <button
              (click)="isCityModalOpen.set(true)"
              class="hidden lg:flex items-center space-x-2 text-left p-1.5 px-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-colors max-w-[170px] cursor-pointer"
            >
              <i class="pi pi-map-marker text-brand-600 dark:text-brand-400 text-base flex-shrink-0"></i>
              <div class="overflow-hidden">
                <p class="text-[9px] text-gray-500 dark:text-gray-400 font-semibold uppercase leading-tight">{{ lang.t('deliverTo') }}</p>
                <p class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate flex items-center">
                  <span>{{ selectedCity() }}</span>
                  <i class="pi pi-chevron-down text-[9px] ml-1 text-gray-400"></i>
                </p>
              </div>
            </button>
          </div>

          <!-- Middle: Desktop Search Bar (Hidden on mobile, shown on md+) -->
          <div class="hidden md:block flex-1 max-w-xl lg:max-w-2xl mx-2 relative search-container-desktop">
            <form (ngSubmit)="handleSearchSubmit()" class="relative">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
                (focus)="showSuggestions.set(true)"
                name="searchDesktop"
                [placeholder]="lang.t('searchPlaceholder')"
                class="w-full pl-10 pr-24 py-2.5 bg-gray-100 dark:bg-slate-800/90 hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-gray-900 dark:text-gray-100 rounded-full border border-gray-200 dark:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              />
              <i class="pi pi-search text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
              <button
                type="submit"
                class="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs transition-colors cursor-pointer"
              >
                {{ lang.t('searchBtn') }}
              </button>
            </form>

            <!-- Desktop Suggestions Dropdown -->
            @if (showSuggestions() && suggestions().length > 0) {
              <div class="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50">
                <div class="p-2 border-b border-gray-100 dark:border-slate-800 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3">
                  {{ lang.t('matchingProducts') }}
                </div>
                @for (p of suggestions(); track p.id) {
                  <div
                    (click)="selectSuggestion(p)"
                    class="flex items-center space-x-3 px-3 py-2 hover:bg-brand-50/60 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <img [src]="p.thumbnail" [alt]="p.name" class="w-8 h-8 object-cover rounded-lg border border-gray-200 dark:border-slate-700" />
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{{ p.name }}</p>
                      <p class="text-[10px] text-gray-500 dark:text-gray-400">{{ p.brandName }} • ₹{{ p.price }}</p>
                    </div>
                    <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      ₹{{ p.price }}
                    </span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Right: Switches (EN/HI, Sun/Moon) & User Actions -->
          <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            
            <!-- 1. Language Toggle Switch (ONLY EN and HI visible side-by-side, no overlapping) -->
            <button
              type="button"
              (click)="lang.toggleLang()"
              class="flex items-center bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-full p-0.5 cursor-pointer flex-shrink-0 transition-colors select-none"
              [title]="lang.currentLang() === 'en' ? 'Switch to Hindi (HI)' : 'Switch to English (EN)'"
              aria-label="Toggle language"
            >
              <span
                class="px-1.5 py-0.5 rounded-full text-[10px] font-black transition-all flex items-center justify-center leading-none"
                [ngClass]="lang.currentLang() === 'en' ? 'bg-brand-600 text-white shadow-xs' : 'text-gray-400 dark:text-slate-400'"
              >
                EN
              </span>
              <span
                class="px-1.5 py-0.5 rounded-full text-[10px] font-black transition-all flex items-center justify-center leading-none"
                [ngClass]="lang.currentLang() === 'hi' ? 'bg-brand-600 text-white shadow-xs' : 'text-gray-400 dark:text-slate-400'"
              >
                HI
              </span>
            </button>

            <!-- 2. Display Theme Toggle Switch (ONLY Moon and Sun icons visible side-by-side, no overlapping) -->
            <button
              type="button"
              (click)="theme.toggleTheme()"
              class="flex items-center bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-full p-0.5 cursor-pointer flex-shrink-0 transition-colors select-none"
              [title]="theme.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
              aria-label="Toggle dark and light mode"
            >
              <span
                class="w-5 h-5 rounded-full flex items-center justify-center transition-all"
                [ngClass]="!theme.isDark() ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-400 dark:text-slate-500'"
              >
                <i class="pi pi-sun text-[10px]"></i>
              </span>
              <span
                class="w-5 h-5 rounded-full flex items-center justify-center transition-all"
                [ngClass]="theme.isDark() ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-400 dark:text-slate-500'"
              >
                <i class="pi pi-moon text-[10px]"></i>
              </span>
            </button>

            <!-- User Menu or Sign In -->
            <div class="relative user-menu-container flex-shrink-0">
              @if (auth.isAuthenticated() && auth.user()) {
                <button
                  (click)="isUserMenuOpen.set(!isUserMenuOpen())"
                  class="flex items-center p-0.5 sm:p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <img
                    [src]="auth.user()?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'"
                    [alt]="auth.user()?.name"
                    class="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-brand-300 dark:border-brand-500 flex-shrink-0"
                  />
                  <i class="pi pi-chevron-down text-[9px] text-gray-400 hidden md:block ml-0.5"></i>
                </button>

                <!-- User Dropdown Menu -->
                @if (isUserMenuOpen()) {
                  <div class="absolute right-0 mt-2 w-52 sm:w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50">
                    <div class="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                      <p class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{{ auth.user()?.name }}</p>
                      <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">{{ auth.user()?.email }}</p>
                    </div>

                    <div class="py-1 text-xs">
                      <a
                        routerLink="/account"
                        (click)="isUserMenuOpen.set(false)"
                        class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-800 dark:hover:text-brand-400"
                      >
                        <i class="pi pi-user mr-2 text-gray-400"></i>
                        {{ lang.t('myProfile') }}
                      </a>
                      <a
                        routerLink="/orders"
                        (click)="isUserMenuOpen.set(false)"
                        class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-800 dark:hover:text-brand-400"
                      >
                        <i class="pi pi-box mr-2 text-gray-400"></i>
                        {{ lang.t('ordersTracking') }}
                      </a>
                      <a
                        routerLink="/wishlist"
                        (click)="isUserMenuOpen.set(false)"
                        class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-800 dark:hover:text-brand-400"
                      >
                        <i class="pi pi-heart mr-2 text-gray-400"></i>
                        {{ lang.t('wishlist') }} ({{ wishlist.wishlistCount() }})
                      </a>
                    </div>

                    <div class="border-t border-gray-100 dark:border-slate-800 pt-1">
                      <button
                        (click)="handleLogout()"
                        class="flex items-center w-full px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        <i class="pi pi-sign-out mr-2 text-rose-500"></i>
                        {{ lang.t('logout') }}
                      </button>
                    </div>
                  </div>
                }
              } @else {
                <a
                  routerLink="/login"
                  class="flex items-center space-x-1 p-1 sm:px-3 rounded-xl text-xs font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-slate-700 border border-brand-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <i class="pi pi-user text-xs"></i>
                  <span class="hidden sm:inline">{{ lang.t('signIn') }}</span>
                </a>
              }
            </div>

            <!-- Wishlist Button -->
            <button
              type="button"
              (click)="handleWishlistClick()"
              class="relative p-1.5 sm:p-2 text-gray-700 dark:text-gray-200 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex-shrink-0"
              title="Wishlist"
            >
              <i class="pi pi-heart text-base sm:text-lg"></i>
              @if (auth.isAuthenticated() && wishlist.wishlistCount() > 0) {
                <span class="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[9px] font-black w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center animate-pulse">
                  {{ wishlist.wishlistCount() }}
                </span>
              }
            </button>

            <!-- Cart Button -->
            <button
              type="button"
              (click)="handleCartClick()"
              class="relative flex items-center space-x-1 bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 text-white p-1.5 px-2.5 sm:px-3.5 rounded-xl font-bold shadow-md shadow-brand-600/20 transition-all cursor-pointer flex-shrink-0"
              title="Cart"
            >
              <i class="pi pi-shopping-cart text-sm sm:text-base"></i>
              <span class="hidden lg:inline text-xs">{{ lang.t('cart') }}</span>
              @if (auth.isAuthenticated() && cart.cartCount() > 0) {
                <span class="bg-accent-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {{ cart.cartCount() }}
                </span>
              }
            </button>
          </div>
        </div>

        <!-- Row 2: Mobile Search Bar (Only visible on screens < md) -->
        <div class="md:hidden pb-3 pt-1 relative search-container-mobile">
          <form (ngSubmit)="handleSearchSubmit()" class="relative">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              (focus)="showSuggestions.set(true)"
              name="searchMobile"
              [placeholder]="lang.t('searchPlaceholder')"
              class="w-full pl-9 pr-20 py-2 bg-gray-100 dark:bg-slate-800 text-xs text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
            />
            <i class="pi pi-search text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 text-xs"></i>
            <button
              type="submit"
              class="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {{ lang.t('searchBtn') }}
            </button>
          </form>

          <!-- Mobile Suggestions Dropdown -->
          @if (showSuggestions() && suggestions().length > 0) {
            <div class="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50">
              <div class="p-2 border-b border-gray-100 dark:border-slate-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3">
                {{ lang.t('matchingProducts') }}
              </div>
              @for (p of suggestions(); track p.id) {
                <div
                  (click)="selectSuggestion(p)"
                  class="flex items-center space-x-3 px-3 py-2 hover:bg-brand-50/60 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <img [src]="p.thumbnail" [alt]="p.name" class="w-8 h-8 object-cover rounded-lg border border-gray-200 dark:border-slate-700" />
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{{ p.name }}</p>
                    <p class="text-[10px] text-gray-500 dark:text-gray-400">{{ p.brandName }} • ₹{{ p.price }}</p>
                  </div>
                  <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    ₹{{ p.price }}
                  </span>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Location Delivery Selector Modal -->
      @if (isCityModalOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-gray-900 dark:text-gray-100 text-base flex items-center">
                <i class="pi pi-map-marker text-brand-600 dark:text-brand-400 mr-2 text-lg"></i>
                {{ lang.t('deliverTo') }}
              </h3>
              <button (click)="isCityModalOpen.set(false)" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                <i class="pi pi-times text-lg"></i>
              </button>
            </div>
            <div class="space-y-2 mb-4">
              @for (loc of cities; track loc) {
                <button
                  (click)="setCity(loc)"
                  class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer"
                  [ngClass]="selectedCity() === loc.split(' - ')[0]
                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 font-bold'
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'"
                >
                  {{ loc }}
                </button>
              }
            </div>
            <button
              (click)="isCityModalOpen.set(false)"
              class="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              {{ lang.t('done') }}
            </button>
          </div>
        </div>
      }

      <!-- Mobile Navigation Drawer -->
      @if (isMobileMenuOpen()) {
        <div class="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <div class="border-b border-gray-100 dark:border-slate-800 pb-3">
            <p class="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{{ lang.t('categories') }}</p>
            <div class="grid grid-cols-2 gap-2">
              @for (cat of categories.slice(0, 6); track cat.id) {
                <a
                  [routerLink]="['/products']"
                  [queryParams]="{ category: cat.slug }"
                  (click)="isMobileMenuOpen.set(false)"
                  class="text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-400 py-1"
                >
                  {{ lang.getCategoryName(cat.slug, cat.name) }}
                </a>
              }
            </div>
          </div>
          <div class="flex flex-col space-y-2 pt-1 text-xs font-semibold text-gray-800 dark:text-gray-200">
            <a routerLink="/orders" (click)="isMobileMenuOpen.set(false)" class="py-1">
              {{ lang.t('ordersTracking') }}
            </a>
            <button
              type="button"
              (click)="handleWishlistClick(); isMobileMenuOpen.set(false)"
              class="py-1 flex items-center justify-between text-left cursor-pointer"
            >
              <span>{{ lang.t('wishlist') }}</span>
              @if (auth.isAuthenticated() && wishlist.wishlistCount() > 0) {
                <span class="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {{ wishlist.wishlistCount() }}
                </span>
              }
            </button>
            <button
              type="button"
              (click)="handleCartClick(); isMobileMenuOpen.set(false)"
              class="py-1 flex items-center justify-between text-left cursor-pointer"
            >
              <span>{{ lang.t('cart') }}</span>
              @if (auth.isAuthenticated() && cart.cartCount() > 0) {
                <span class="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {{ cart.cartCount() }}
                </span>
              }
            </button>
          </div>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  wishlist = inject(WishlistService);
  theme = inject(ThemeService);
  lang = inject(LanguageService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private el = inject(ElementRef);

  searchQuery = '';
  suggestions = signal<Product[]>([]);
  showSuggestions = signal<boolean>(false);
  selectedCity = signal<string>('Boring Road, Patna');
  isCityModalOpen = signal<boolean>(false);
  isUserMenuOpen = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  categories = INITIAL_CATEGORIES;

  cities = [
    'Boring Road, Patna - 800001',
    'Kankarbagh, Patna - 800020',
    'Bailey Road, Patna - 800014',
    'Fraser Road, Patna - 800001',
    'Rajendra Nagar, Patna - 800016'
  ];

  private debounceTimer: any = null;

  onSearchChange(val: string): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (!val || !val.trim()) {
      this.suggestions.set([]);
      return;
    }
    this.debounceTimer = setTimeout(async () => {
      try {
        const res = await firstValueFrom(this.api.getProducts({ q: val.trim(), limit: 5 }));
        this.suggestions.set(res.data?.products || []);
      } catch {
        this.suggestions.set([]);
      }
    }, 250);
  }

  handleSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this.showSuggestions.set(false);
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  selectSuggestion(product: Product): void {
    this.searchQuery = '';
    this.showSuggestions.set(false);
    this.router.navigate(['/product', product.slug]);
  }

  setCity(loc: string): void {
    this.selectedCity.set(loc.split(' - ')[0]);
    this.isCityModalOpen.set(false);
  }

  handleCartClick(): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in first to view your shopping bag');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    this.cart.openCart();
  }

  handleWishlistClick(): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in first to view your wishlist');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/wishlist' } });
      return;
    }
    this.router.navigate(['/wishlist']);
  }

  handleLogout(): void {
    this.isUserMenuOpen.set(false);
    this.auth.logout('/');
  }

  @HostListener('document:mousedown', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isInsideDesktop = this.el.nativeElement.querySelector('.search-container-desktop')?.contains(target);
    const isInsideMobile = this.el.nativeElement.querySelector('.search-container-mobile')?.contains(target);
    if (!isInsideDesktop && !isInsideMobile) {
      this.showSuggestions.set(false);
    }
    if (!this.el.nativeElement.querySelector('.user-menu-container')?.contains(target)) {
      this.isUserMenuOpen.set(false);
    }
  }
}
