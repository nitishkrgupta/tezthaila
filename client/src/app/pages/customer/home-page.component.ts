import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { Product, Category, Banner } from '../../models';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '../../services/mockData';
import { ProductCardComponent } from '../../components/product/product-card.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <div class="space-y-10 pb-16 overflow-x-hidden">
      <!-- 1. DYNAMIC BANNER OR HERO BANNER -->
      @if (banners().length > 0) {
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl min-h-[320px] sm:min-h-[440px] flex items-center">
            @for (b of banners(); track b.id; let idx = $index) {
              @if (idx === currentBannerIndex()) {
                <div class="relative w-full h-full min-h-[320px] sm:min-h-[440px] flex items-center">
                  <!-- Banner Image -->
                  <img
                    [src]="b.image"
                    [alt]="b.title"
                    class="absolute inset-0 w-full h-full object-cover object-center opacity-45 sm:opacity-55"
                  />
                  <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>

                  <!-- Banner Content -->
                  <div class="relative z-10 max-w-2xl px-6 sm:px-12 py-10 space-y-4">
                    <div class="inline-flex items-center space-x-2 bg-accent-500/20 text-accent-300 border border-accent-500/30 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                      <i class="pi pi-sparkles text-accent-400"></i>
                      <span>{{ lang.t('specialHighlight') }}</span>
                    </div>

                    <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                      {{ b.title }}
                    </h1>

                    @if (b.subtitle) {
                      <p class="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-lg">
                        {{ b.subtitle }}
                      </p>
                    }

                    <div class="pt-2">
                      <a
                        [routerLink]="b.link || '/products'"
                        class="inline-flex items-center space-x-2 px-6 py-3.5 bg-accent-500 hover:bg-accent-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:scale-102"
                      >
                        <span>{{ lang.t('shopNow') }}</span>
                        <i class="pi pi-arrow-right text-xs"></i>
                      </a>
                    </div>
                  </div>
                </div>
              }
            }

            <!-- Carousel Controls -->
            @if (banners().length > 1) {
              <button
                (click)="prevBanner()"
                class="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors border border-white/20"
                title="Previous"
              >
                <i class="pi pi-chevron-left"></i>
              </button>
              <button
                (click)="nextBanner()"
                class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors border border-white/20"
                title="Next"
              >
                <i class="pi pi-chevron-right"></i>
              </button>

              <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                @for (b of banners(); track b.id; let idx = $index) {
                  <button
                    (click)="currentBannerIndex.set(idx)"
                    class="h-2.5 rounded-full transition-all cursor-pointer"
                    [ngClass]="idx === currentBannerIndex() ? 'bg-accent-400 w-7' : 'bg-white/50 w-2.5'"
                  ></button>
                }
              </div>
            }
          </div>
        </section>
      } @else {
        <!-- Fallback Default HERO BANNER -->
        <section class="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-950 text-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 relative z-10">
            <div class="max-w-2xl space-y-4 sm:space-y-6">
              <div class="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-accent-300 border border-white/15">
                <i class="pi pi-bolt text-accent-400"></i>
                <span>{{ lang.t('tezDeliveryBadge') }}</span>
              </div>

              <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                {{ lang.t('heroTitle1') }} <br />
                <span class="text-accent-400">{{ lang.t('heroTitle2') }}</span>
              </h1>

              <p class="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-xl">
                {{ lang.t('heroSubtitle') }}
              </p>

              <div class="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <a
                  routerLink="/products"
                  class="px-6 py-3.5 bg-accent-500 hover:bg-accent-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-accent-500/20 flex items-center space-x-2 transition-all hover:scale-102"
                >
                  <span>{{ lang.t('browseProducts') }}</span>
                  <i class="pi pi-arrow-right text-xs"></i>
                </a>
              </div>

              <!-- Quick Metrics -->
              <div class="pt-6 border-t border-white/15 grid grid-cols-3 gap-3 sm:gap-4 max-w-md">
                <div>
                  <p class="text-xl sm:text-2xl font-black text-white">100%</p>
                  <p class="text-[10px] sm:text-[11px] text-emerald-200">{{ lang.t('genuineBrands') }}</p>
                </div>
                <div>
                  <p class="text-xl sm:text-2xl font-black text-white">₹499+</p>
                  <p class="text-[10px] sm:text-[11px] text-emerald-200">{{ lang.t('freeExpress') }}</p>
                </div>
                <div>
                  <p class="text-xl sm:text-2xl font-black text-white">4.8 ★</p>
                  <p class="text-[10px] sm:text-[11px] text-emerald-200">{{ lang.t('verifiedPlatform') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Decorative background element -->
          <div class="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </section>
      }

      <!-- 2. SHOP BY CATEGORY -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ lang.t('shopByCategory') }}</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ lang.t('shopByCategorySub') }}</p>
          </div>
          <a
            routerLink="/products"
            class="text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 flex items-center space-x-1"
          >
            <span>{{ lang.t('seeAll') }}</span>
            <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          @for (cat of categories(); track cat.id) {
            <a
              [routerLink]="['/products']"
              [queryParams]="{ category: cat.slug }"
              class="group bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-200/80 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 group-hover:scale-105 transition-transform">
                <img [src]="cat.image" [alt]="cat.name" class="w-full h-full object-cover" />
              </div>
              <span class="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                {{ lang.getCategoryName(cat.slug, cat.name) }}
              </span>
            </a>
          }
        </div>
      </section>

      <!-- EMPTY CATALOG NOTICE -->
      @if (!loading() && products().length === 0) {
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-gradient-to-tr from-slate-900 via-brand-950 to-slate-900 text-white p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl border border-brand-800/40">
            <div class="w-16 h-16 rounded-2xl bg-accent-500/20 text-accent-400 mx-auto flex items-center justify-center">
              <i class="pi pi-box text-3xl"></i>
            </div>
            <h3 class="text-2xl font-black tracking-tight">Fresh Stock Arriving Soon!</h3>
            <p class="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto">
              Our inventory team is currently restocking fresh daily essentials, groceries, and staples. Please check back shortly or explore our featured categories above!
            </p>
          </div>
        </section>
      }

      <!-- 3. DEALS OF THE DAY -->
      @if (products().length > 0) {
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-4 sm:p-7 text-white shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center space-x-3">
              <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white flex-shrink-0">
                <i class="pi pi-bolt text-xl sm:text-2xl"></i>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] sm:text-xs font-black uppercase tracking-widest bg-black/30 px-2.5 py-0.5 rounded-full">
                    {{ lang.t('flashSale') }}
                  </span>
                  <span class="text-[11px] sm:text-xs font-bold text-amber-100">{{ lang.t('hotEverydayOffers') }}</span>
                </div>
                <h3 class="text-lg sm:text-2xl font-black tracking-tight mt-0.5">
                  {{ lang.t('dealsOfTheDay') }}
                </h3>
              </div>
            </div>

            <!-- Countdown Clock -->
            <div class="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 self-start sm:self-auto">
              <i class="pi pi-clock text-amber-300 mr-1 text-xs"></i>
              <span class="text-xs font-bold text-amber-200">{{ lang.t('endsIn') }}</span>
              <div class="flex items-center space-x-1 font-mono font-black text-xs sm:text-sm select-none">
                <span class="bg-white/20 px-2 py-1 rounded">{{ pad(hours()) }}h</span>
                <span>:</span>
                <span class="bg-white/20 px-2 py-1 rounded">{{ pad(minutes()) }}m</span>
                <span>:</span>
                <span class="bg-white/20 px-2 py-1 rounded text-amber-300 font-extrabold min-w-[28px] text-center">{{ pad(seconds()) }}s</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            @for (product of dealProducts(); track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        </section>
      }

      <!-- 4. PROMOTIONAL COUPON BANNER -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-brand-900 dark:bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-brand-700/60 dark:border-slate-800 relative overflow-hidden shadow-lg">
          <div class="space-y-2 text-center md:text-left z-10">
            <span class="text-xs font-bold text-accent-400 uppercase tracking-wider">
              {{ lang.t('memberGift') }}
            </span>
            <h3 class="text-2xl sm:text-3xl font-black tracking-tight">
              {{ lang.t('memberOfferTitle') }}
            </h3>
            <p class="text-xs sm:text-sm text-emerald-200 dark:text-emerald-300">
              {{ lang.t('memberOfferSub') }}
            </p>
          </div>

          <div class="flex items-center space-x-3 z-10">
            <a
              routerLink="/products"
              class="px-6 py-3 bg-accent-500 hover:bg-accent-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors"
            >
              {{ lang.t('exploreProductsNow') }}
            </a>
          </div>
        </div>
      </section>

      <!-- 5. BEST SELLERS / CATALOG HIGHLIGHTS -->
      @if (products().length > 0) {
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center">
                <span>{{ lang.t('featuredProducts') }}</span>
                <i class="pi pi-sparkles text-amber-500 ml-2"></i>
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ lang.t('recentPublished') }}</p>
            </div>
            <a
              routerLink="/products"
              class="text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 flex items-center space-x-1"
            >
              <span>{{ lang.t('viewAll') }}</span>
              <i class="pi pi-arrow-right text-xs"></i>
            </a>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            @for (product of bestSellers(); track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        </section>
      }

      <!-- 6. TRUSTED INDIAN BRANDS -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-6">
          <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{{ lang.t('featuredBrands') }}</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ lang.t('featuredBrandsSub') }}</p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-2.5 sm:gap-6">
          @for (brand of brands; track brand.id) {
            <a
              [routerLink]="['/products']"
              [queryParams]="{ brand: brand.name }"
              class="px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-xs transition-colors flex items-center space-x-2"
            >
              <img [src]="brand.logo" [alt]="brand.name" class="w-5 h-5 sm:w-6 sm:h-6 object-cover rounded-full" />
              <span class="text-xs font-bold text-gray-800 dark:text-gray-200">{{ brand.name }}</span>
            </a>
          }
        </div>
      </section>

      <!-- 7. CUSTOMER TESTIMONIALS -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gray-100/70 dark:bg-slate-900/60 rounded-3xl p-5 sm:p-10 border border-gray-200/60 dark:border-slate-800">
          <div class="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <h2 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{{ lang.t('whatShoppersSay') }}</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ lang.t('reviewsSub') }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            @for (review of reviews; track review.name; let rIdx = $index) {
              <div class="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-xs space-y-3">
                <div class="flex text-amber-400 space-x-0.5">
                  @for (i of [1,2,3,4,5]; track i) {
                    <i class="pi pi-star-fill text-xs text-amber-400"></i>
                  }
                </div>
                <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">"{{ lang.t('review' + (rIdx + 1) + 'Comment', review.comment) }}"</p>
                <div class="pt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center text-xs">
                  <div>
                    <p class="font-bold text-gray-900 dark:text-white">{{ review.name }}</p>
                    <p class="text-[10px] text-gray-400">{{ review.city }}</p>
                  </div>
                  <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center">
                    <i class="pi pi-check-circle mr-1 text-emerald-600 dark:text-emerald-400 text-xs"></i> {{ lang.t('verifiedBuyer') }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomePageComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  lang = inject(LanguageService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>(INITIAL_CATEGORIES);
  banners = signal<Banner[]>([]);
  currentBannerIndex = signal<number>(0);
  loading = signal<boolean>(true);

  brands = INITIAL_BRANDS;

  readonly hours = signal<number>(11);
  readonly minutes = signal<number>(59);
  readonly seconds = signal<number>(59);
  private timer: any = null;
  private bannerTimer: any = null;

  reviews = [
    {
      name: 'Ananya Deshmukh',
      city: 'Pune, Maharashtra',
      comment: 'The fastest delivery service! Ordered staples in the morning and had them in my kitchen by noon. Packaging was impeccable.',
      rating: 5
    },
    {
      name: 'Karthik Ramanathan',
      city: 'Bengaluru, Karnataka',
      comment: 'Very competitive prices compared to local supermarket. Authentic products straight from verified brands.',
      rating: 5
    },
    {
      name: 'Sunita Verma',
      city: 'Delhi NCR',
      comment: 'I love the fresh farm vegetables and unpolished dals. Very convenient checkout with express tracking.',
      rating: 5
    }
  ];

  dealProductsList = signal<Product[]>([]);
  dealTitle = signal<string>('Deals of the Day');
  private endsAtTimestamp: number = 0;

  dealProducts = computed(() => {
    if (this.dealProductsList().length > 0) {
      return this.dealProductsList();
    }
    const list = this.products().filter(p => p.discountPercentage >= 10);
    return (list.length > 0 ? list : this.products()).slice(0, 4);
  });

  bestSellers = computed(() => {
    const list = this.products().filter(p => p.bestseller || p.stock > 0);
    return (list.length > 0 ? list : this.products()).slice(0, 8);
  });

  ngOnInit(): void {
    this.updateCountdown(); // Start ticking immediately on view render
    this.loadHomeData();
    this.timer = setInterval(() => {
      this.updateCountdown();
    }, 1000);

    // Auto rotate banners every 5s
    this.bannerTimer = setInterval(() => {
      if (this.banners().length > 1) {
        this.nextBanner();
      }
    }, 5000);
  }

  updateCountdown(): void {
    if (!this.endsAtTimestamp || this.endsAtTimestamp <= Date.now()) {
      // Default to 12 hours from now so countdown is always actively ticking 10, 9, 8, 7, 6...
      this.endsAtTimestamp = Date.now() + 12 * 3600 * 1000;
    }
    const now = Date.now();
    const diff = Math.max(0, Math.floor((this.endsAtTimestamp - now) / 1000));
    this.hours.set(Math.floor(diff / 3600));
    this.minutes.set(Math.floor((diff % 3600) / 60));
    this.seconds.set(diff % 60);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.bannerTimer) clearInterval(this.bannerTimer);
  }

  nextBanner(): void {
    const count = this.banners().length;
    if (count > 0) {
      this.currentBannerIndex.update(idx => (idx + 1) % count);
    }
  }

  prevBanner(): void {
    const count = this.banners().length;
    if (count > 0) {
      this.currentBannerIndex.update(idx => (idx - 1 + count) % count);
    }
  }

  pad(num: number): string {
    return String(num).padStart(2, '0');
  }

  async loadHomeData(): Promise<void> {
    try {
      const [prodsRes, catsRes, bannersRes, dealsRes] = await Promise.all([
        firstValueFrom(this.api.getProducts({ limit: 40 })),
        firstValueFrom(this.api.getCategories()),
        firstValueFrom(this.api.getBanners()).catch(() => ({ data: [] })),
        firstValueFrom(this.api.getDeals()).catch(() => null)
      ]);
      this.products.set(prodsRes.data?.products || []);
      if (catsRes.data?.length) {
        this.categories.set(catsRes.data);
      }
      if (bannersRes?.data?.length) {
        this.banners.set(bannersRes.data);
      }
      if (dealsRes?.data) {
        if (dealsRes.data.products && dealsRes.data.products.length > 0) {
          this.dealProductsList.set(dealsRes.data.products);
        }
        if (dealsRes.data.title) {
          this.dealTitle.set(dealsRes.data.title);
        }
        if (dealsRes.data.endsAt) {
          this.endsAtTimestamp = new Date(dealsRes.data.endsAt).getTime();
          this.updateCountdown();
        }
      }
    } catch (err) {
      console.error('Failed fetching home data', err);
    } finally {
      this.loading.set(false);
    }
  }
}
