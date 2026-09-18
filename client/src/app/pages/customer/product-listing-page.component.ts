import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { Product } from '../../models';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '../../services/mockData';
import { ProductCardComponent } from '../../components/product/product-card.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-listing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Top Banner & Title -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center">
            <span>{{ pageTitle }}</span>
            <span class="ml-3 text-xs font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              {{ total() }} {{ lang.t('items') }}
            </span>
          </h1>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ lang.t('exploreBestPrices') }}</p>
        </div>

        <!-- Sorting Dropdown & Mobile Filter Button -->
        <div class="flex items-center space-x-3">
          <button
            (click)="isMobileFilterOpen.set(true)"
            class="md:hidden flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 shadow-xs cursor-pointer"
          >
            <i class="pi pi-filter text-brand-600"></i>
            <span>{{ lang.t('filters') }}</span>
          </button>

          <div class="flex items-center space-x-2">
            <i class="pi pi-sort-alt text-gray-400 dark:text-slate-500 hidden sm:block"></i>
            <select
              [(ngModel)]="sortBy"
              (ngModelChange)="onFilterChange()"
              class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 shadow-xs cursor-pointer"
            >
              <option value="popularity">{{ lang.t('sortPopularity') }}</option>
              <option value="price_asc">{{ lang.t('sortPriceAsc') }}</option>
              <option value="price_desc">{{ lang.t('sortPriceDesc') }}</option>
              <option value="rating">{{ lang.t('sortRating') }}</option>
              <option value="discount">{{ lang.t('sortDiscount') }}</option>
              <option value="newest">{{ lang.t('sortNewest') }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- SIDEBAR FILTERS (Desktop) -->
        <aside class="hidden md:block space-y-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs h-fit">
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white flex items-center">
              <i class="pi pi-sliders-h mr-2 text-brand-600"></i>
              {{ lang.t('filters') }}
            </h3>
            @if (hasActiveFilters) {
              <button
                (click)="clearFilters()"
                class="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-bold cursor-pointer"
              >
                {{ lang.t('clearAll') }}
              </button>
            }
          </div>

          <!-- Categories Filter -->
          <div>
            <h4 class="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">{{ lang.t('category') }}</h4>
            <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                (click)="setCategory('')"
                class="w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                [ngClass]="!selectedCategory ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 font-bold' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'"
              >
                {{ lang.t('allCategories') }}
              </button>
              @for (cat of categories; track cat.id) {
                <button
                  (click)="setCategory(cat.slug)"
                  class="w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors truncate cursor-pointer"
                  [ngClass]="selectedCategory === cat.slug ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 font-bold' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'"
                >
                  {{ lang.getCategoryName(cat.slug, cat.name) }}
                </button>
              }
            </div>
          </div>

          <!-- Brands Filter -->
          <div class="pt-4 border-t border-gray-100 dark:border-slate-800">
            <h4 class="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">{{ lang.t('brand') }}</h4>
            <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                (click)="setBrand('')"
                class="w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                [ngClass]="!selectedBrand ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 font-bold' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'"
              >
                {{ lang.t('allBrands') }}
              </button>
              @for (b of brands; track b.id) {
                <button
                  (click)="setBrand(b.name)"
                  class="w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors truncate cursor-pointer"
                  [ngClass]="selectedBrand === b.name ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 font-bold' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'"
                >
                  {{ b.name }}
                </button>
              }
            </div>
          </div>

          <!-- Price Range Slider -->
          <div class="pt-4 border-t border-gray-100 dark:border-slate-800">
            <div class="flex justify-between items-center mb-2">
              <h4 class="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">{{ lang.t('maxPriceLabel') }}</h4>
              <span class="text-xs font-bold text-brand-700 dark:text-brand-400">₹{{ maxPrice }}</span>
            </div>
            <input
              type="range"
              min="30"
              max="2500"
              step="50"
              [(ngModel)]="maxPrice"
              (ngModelChange)="onFilterChange()"
              class="w-full accent-brand-600 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-1">
              <span>₹30</span>
              <span>₹2,500</span>
            </div>
          </div>

          <!-- Customer Rating Filter -->
          <div class="pt-4 border-t border-gray-100 dark:border-slate-800">
            <h4 class="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">{{ lang.t('customerRatingLabel') }}</h4>
            <div class="space-y-1">
              @for (rating of ['4', '3']; track rating) {
                <label class="flex items-center space-x-2 text-xs text-gray-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    [value]="rating"
                    [checked]="minRating === rating"
                    (change)="minRating = (minRating === rating ? '' : rating); onFilterChange()"
                    class="accent-brand-600"
                  />
                  <span class="flex items-center">{{ rating }}★ {{ lang.t('andAbove') }}</span>
                </label>
              }
            </div>
          </div>

          <!-- Minimum Discount Filter -->
          <div class="pt-4 border-t border-gray-100 dark:border-slate-800">
            <h4 class="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">{{ lang.t('minDiscountLabel') }}</h4>
            <div class="space-y-1">
              @for (disc of ['10', '20', '30', '50']; track disc) {
                <label class="flex items-center space-x-2 text-xs text-gray-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="radio"
                    name="discount"
                    [value]="disc"
                    [checked]="minDiscount === disc"
                    (change)="minDiscount = (minDiscount === disc ? '' : disc); onFilterChange()"
                    class="accent-brand-600"
                  />
                  <span>{{ disc }}% {{ lang.t('orMore') }}</span>
                </label>
              }
            </div>
          </div>
        </aside>

        <!-- PRODUCTS GRID -->
        <section class="md:col-span-3">
          @if (loading()) {
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 animate-pulse space-y-3">
                  <div class="h-40 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
                  <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/2"></div>
                  <div class="h-6 bg-gray-200 dark:bg-slate-800 rounded w-1/3"></div>
                </div>
              }
            </div>
          } @else if (products().length === 0) {
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div class="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center">
                <i class="pi pi-exclamation-circle text-3xl"></i>
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ lang.t('noProductsFound') }}</h3>
              <p class="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                {{ lang.t('noProductsDesc') }}
              </p>
              <button
                (click)="clearFilters()"
                class="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                {{ lang.t('resetAllFilters') }}
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              @for (product of products(); track product.id) {
                <app-product-card [product]="product"></app-product-card>
              }
            </div>
          }
        </section>
      </div>

      <!-- MOBILE FILTER MODAL -->
      @if (isMobileFilterOpen()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div class="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
            <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-slate-800">
              <h3 class="font-bold text-gray-900 dark:text-white text-base">{{ lang.t('filterProductsModal') }}</h3>
              <button (click)="isMobileFilterOpen.set(false)" class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                <i class="pi pi-times text-lg"></i>
              </button>
            </div>

            <div class="space-y-4 text-xs">
              <div>
                <p class="font-bold text-gray-700 dark:text-slate-300 mb-2">{{ lang.t('category') }}</p>
                <div class="flex flex-wrap gap-1.5">
                  @for (cat of categories; track cat.id) {
                    <button
                      (click)="setCategory(cat.slug === selectedCategory ? '' : cat.slug)"
                      class="px-3 py-1.5 rounded-full border cursor-pointer"
                      [ngClass]="selectedCategory === cat.slug ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'"
                    >
                      {{ lang.getCategoryName(cat.slug, cat.name) }}
                    </button>
                  }
                </div>
              </div>

              <div>
                <p class="font-bold text-gray-700 dark:text-slate-300 mb-2">{{ lang.t('maxPriceLabel') }}: ₹{{ maxPrice }}</p>
                <input
                  type="range"
                  min="30"
                  max="2500"
                  step="50"
                  [(ngModel)]="maxPrice"
                  class="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div class="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  (click)="clearFilters(); isMobileFilterOpen.set(false)"
                  class="flex-1 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl font-bold text-gray-700 dark:text-slate-300 cursor-pointer"
                >
                  {{ lang.t('clearAll') }}
                </button>
                <button
                  (click)="onFilterChange(); isMobileFilterOpen.set(false)"
                  class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  {{ lang.t('applyFilters') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductListingPageComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  lang = inject(LanguageService);

  products = signal<Product[]>([]);
  loading = signal<boolean>(true);
  total = signal<number>(0);
  isMobileFilterOpen = signal<boolean>(false);

  categories = INITIAL_CATEGORIES;
  brands = INITIAL_BRANDS;

  searchQuery = '';
  selectedCategory = '';
  selectedBrand = '';
  minRating = '';
  maxPrice = 2500;
  minDiscount = '';
  sortBy = 'popularity';
  featuredParam = '';
  bestsellerParam = '';

  get pageTitle(): string {
    if (this.searchQuery) return `Results for "${this.searchQuery}"`;
    if (this.selectedCategory) {
      return this.categories.find(c => c.slug === this.selectedCategory)?.name || 'Category Products';
    }
    if (this.selectedBrand) return `${this.selectedBrand} Products`;
    return 'All Products';
  }

  get hasActiveFilters(): boolean {
    return !!(this.selectedCategory || this.selectedBrand || this.minRating || this.maxPrice < 2500 || this.minDiscount || this.searchQuery);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.selectedCategory = params['category'] || '';
      this.selectedBrand = params['brand'] || '';
      this.featuredParam = params['featured'] || '';
      this.bestsellerParam = params['bestseller'] || '';
      this.fetchProducts();
    });
  }

  async fetchProducts(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.getProducts({
        q: this.searchQuery,
        category: this.selectedCategory,
        brand: this.selectedBrand,
        maxPrice: this.maxPrice,
        minRating: this.minRating,
        minDiscount: this.minDiscount,
        sort: this.sortBy,
        featured: this.featuredParam,
        bestseller: this.bestsellerParam
      }));
      this.products.set(res.data.products || []);
      this.total.set(res.data.total || 0);
    } catch (err) {
      console.error('Failed fetching products', err);
    } finally {
      this.loading.set(false);
    }
  }

  setCategory(slug: string): void {
    this.selectedCategory = slug;
    this.onFilterChange();
  }

  setBrand(name: string): void {
    this.selectedBrand = name;
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.fetchProducts();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.minRating = '';
    this.maxPrice = 2500;
    this.minDiscount = '';
    this.sortBy = 'popularity';
    this.searchQuery = '';
    this.router.navigate(['/products']);
  }
}
