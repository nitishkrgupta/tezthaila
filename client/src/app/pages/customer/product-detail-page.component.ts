import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../../services/toast.service';
import { LanguageService } from '../../services/language.service';
import { Product, Variant, Review } from '../../models';
import { ProductCardComponent } from '../../components/product/product-card.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  template: `
    @if (loading()) {
      <div class="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div class="h-64 max-w-md mx-auto bg-gray-200 dark:bg-slate-800 rounded-3xl mb-4"></div>
        <div class="h-6 w-1/3 mx-auto bg-gray-200 dark:bg-slate-800 rounded mb-2"></div>
        <div class="h-4 w-1/4 mx-auto bg-gray-200 dark:bg-slate-800 rounded"></div>
      </div>
    } @else if (!product()) {
      <div class="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-2">Product Not Found</h2>
        <p class="text-xs text-gray-500 dark:text-slate-400 mb-6">The requested product could not be located in our catalog.</p>
        <a routerLink="/products" class="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs">
          Browse All Products
        </a>
      </div>
    } @else {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <!-- Breadcrumb -->
        <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400">
          <a routerLink="/" class="hover:text-brand-700 dark:hover:text-brand-400">{{ lang.t('home') }}</a>
          <span>/</span>
          <a [routerLink]="['/products']" [queryParams]="{ category: product()!.categorySlug }" class="hover:text-brand-700 dark:hover:text-brand-400">
            {{ lang.getCategoryName(product()!.categorySlug) }}
          </a>
          <span>/</span>
          <span class="text-gray-800 dark:text-slate-200 font-bold truncate max-w-xs">{{ product()!.name }}</span>
        </div>

        <!-- Main Product Details Section -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-xs">
          <!-- Left Column: Image Gallery (5 cols) -->
          <div class="lg:col-span-5 space-y-4">
            <div class="relative pt-[90%] rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-inner group">
              <img
                [src]="selectedImage()"
                [alt]="product()!.name"
                class="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              @if (product()!.discountPercentage > 0) {
                <span class="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase shadow-xs">
                  {{ product()!.discountPercentage }}% OFF
                </span>
              }
            </div>

            <!-- Thumbnails Row -->
            @if (product()!.images && product()!.images!.length > 1) {
              <div class="flex items-center space-x-3 overflow-x-auto pb-1">
                @for (imgUrl of product()!.images!; track imgUrl) {
                  <button
                    (click)="selectedImage.set(imgUrl)"
                    class="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer"
                    [ngClass]="selectedImage() === imgUrl ? 'border-brand-600 ring-2 ring-brand-200' : 'border-gray-200 dark:border-slate-700 opacity-70 hover:opacity-100'"
                  >
                    <img [src]="imgUrl" alt="Thumbnail" class="w-full h-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Right Column: Information & Actions (7 cols) -->
          <div class="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
                  {{ product()!.brandName || 'Tez Thaila Fresh' }}
                </span>
                <span class="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full flex items-center">
                  <i class="pi pi-check mr-1 text-xs"></i>
                  {{ lang.t('inStock') }} ({{ product()!.stock }} available)
                </span>
              </div>

              <h1 class="text-xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
                {{ product()!.name }}
              </h1>

              <div class="flex items-center space-x-3 text-xs">
                <div class="flex items-center bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 font-bold px-2 py-0.5 rounded-lg">
                  <i class="pi pi-star-fill text-amber-400 mr-1 text-xs"></i>
                  <span>{{ product()!.rating || 4.8 }}</span>
                </div>
                <span class="text-gray-500 dark:text-slate-400">({{ reviews().length }} customer reviews)</span>
                <span class="text-gray-300 dark:text-slate-600">•</span>
                <span class="text-gray-400 dark:text-slate-500 font-mono">SKU: {{ product()!.sku }}</span>
              </div>

              <!-- Price section -->
              <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60 space-y-1">
                <div class="flex items-baseline space-x-3">
                  <span class="text-3xl font-black text-gray-900 dark:text-white">₹{{ currentPrice }}</span>
                  @if (originalPrice > currentPrice) {
                    <span class="text-base text-gray-400 dark:text-slate-500 line-through">MRP ₹{{ originalPrice }}</span>
                  }
                  @if (product()!.discountPercentage > 0) {
                    <span class="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      Save ₹{{ originalPrice - currentPrice }} ({{ product()!.discountPercentage }}% OFF)
                    </span>
                  }
                </div>
                <p class="text-[11px] text-gray-500 dark:text-slate-400">{{ lang.t('inclusiveTaxes') }}</p>
              </div>

              <!-- Variants Selector -->
              @if (product()!.variants && product()!.variants!.length > 0) {
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
                    Select {{ product()!.variants![0].name }}:
                  </label>
                  <div class="flex flex-wrap gap-2">
                    @for (v of product()!.variants!; track v.id) {
                      <button
                        (click)="selectedVariant.set(v)"
                        class="px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                        [ngClass]="selectedVariant()?.id === v.id ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 ring-2 ring-brand-200 dark:ring-brand-900/50' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800'"
                      >
                        <span>{{ v.value }}</span>
                        <span class="ml-2 font-normal text-gray-500 dark:text-slate-400">₹{{ v.price }}</span>
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Quantity Stepper -->
              <div class="flex flex-wrap items-center gap-3 pt-2">
                <span class="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">{{ lang.t('quantity') }}:</span>
                <div class="flex items-center space-x-3 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                  <button
                    (click)="quantity = (quantity > 1 ? quantity - 1 : 1)"
                    class="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg text-gray-700 dark:text-slate-200 shadow-xs hover:bg-gray-50 dark:hover:bg-slate-600 cursor-pointer"
                  >
                    <i class="pi pi-minus text-xs"></i>
                  </button>
                  <span class="text-xs font-bold text-gray-900 dark:text-white w-6 text-center">{{ quantity }}</span>
                  <button
                    (click)="quantity = (quantity < maxQty ? quantity + 1 : quantity)"
                    [disabled]="quantity >= maxQty"
                    class="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg text-gray-700 dark:text-slate-200 shadow-xs hover:bg-gray-50 dark:hover:bg-slate-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    [title]="quantity >= maxQty ? 'Maximum limit reached' : 'Increase'"
                  >
                    <i class="pi pi-plus text-xs"></i>
                  </button>
                </div>
                <span class="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1 rounded-xl font-semibold flex items-center">
                  <i class="pi pi-info-circle mr-1 text-[10px]"></i>Max {{ maxQty }} per order
                </span>
              </div>

              <!-- Pincode Checker -->
              <div class="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200/80 dark:border-slate-700 space-y-2">
                <div class="flex items-center space-x-2 text-xs font-bold text-gray-800 dark:text-slate-200">
                  <i class="pi pi-truck text-brand-600"></i>
                  <span>Delivery Options &amp; Express Availability</span>
                </div>
                <form (ngSubmit)="handlePincodeCheck()" class="flex gap-2">
                  <input
                    type="text"
                    maxLength="6"
                    [(ngModel)]="pincode"
                    name="pincode"
                    class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-brand-500 max-w-[140px]"
                    placeholder="PIN code"
                  />
                  <button
                    type="submit"
                    class="px-3.5 py-1.5 bg-gray-800 dark:bg-slate-700 hover:bg-gray-900 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Check
                  </button>
                </form>
                <p class="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{{ deliveryEstimate }}</p>
              </div>
            </div>

            <!-- Action CTAs: Add to Cart, Buy Now, Wishlist -->
            <div class="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
              <button
                (click)="handleAddToCart()"
                class="flex-1 min-w-[140px] py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-101 cursor-pointer"
              >
                <i class="pi pi-shopping-bag text-sm"></i>
                <span>{{ lang.t('addToCart') }}</span>
              </button>

              <button
                (click)="handleBuyNow()"
                class="flex-1 min-w-[140px] py-3.5 bg-accent-500 hover:bg-accent-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-accent-500/20 transition-all hover:scale-101 cursor-pointer"
              >
                {{ lang.t('buyNow') }}
              </button>

              <button
                (click)="toggleWishlist()"
                class="p-3.5 rounded-xl border transition-colors cursor-pointer"
                [ngClass]="wishlist.isInWishlist(product()!.id) ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-rose-500'"
                title="Add to Wishlist"
              >
                <i [class]="wishlist.isInWishlist(product()!.id) ? 'pi pi-heart-fill text-rose-500' : 'pi pi-heart'"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Product Description & Specifications -->
        <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <h3 class="text-lg font-black text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-slate-800">
            {{ lang.t('productDetails') }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed max-w-3xl">
            {{ product()!.description }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs">
            <div class="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl">
              <span class="text-gray-400 dark:text-slate-500 block mb-0.5">{{ lang.t('brand') }}</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ product()!.brandName || 'Tez Thaila Essentials' }}</span>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl">
              <span class="text-gray-400 dark:text-slate-500 block mb-0.5">Country of Origin</span>
              <span class="font-bold text-gray-900 dark:text-white">India 🇮🇳</span>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl">
              <span class="text-gray-400 dark:text-slate-500 block mb-0.5">{{ lang.t('category') }}</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ lang.getCategoryName(product()!.categorySlug) }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Reviews Section -->
        <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h3 class="text-lg font-black text-gray-900 dark:text-white flex items-center">
                <span>{{ lang.t('customerReviews') }}</span>
                <span class="ml-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  {{ reviews().length }} reviews
                </span>
              </h3>
              <p class="text-xs text-gray-500 dark:text-slate-400">From verified purchasers</p>
            </div>

            <button
              (click)="isReviewModalOpen.set(true)"
              class="px-4 py-2.5 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-bold text-xs rounded-xl border border-brand-200 dark:border-brand-900/60 flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
            >
              <i class="pi pi-comment text-xs"></i>
              <span>{{ lang.t('writeReview') }}</span>
            </button>
          </div>

          <!-- Reviews List -->
          <div class="space-y-4">
            @if (reviews().length === 0) {
              <p class="text-xs text-gray-400 dark:text-slate-500 italic py-4">No reviews yet for this product. Be the first to share your experience!</p>
            } @else {
              @for (rev of reviews(); track rev.id) {
                <div class="p-4 bg-gray-50/70 dark:bg-slate-800/70 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-2">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                      <span class="text-xs font-bold text-gray-900 dark:text-white">{{ rev.userName }}</span>
                      @if (rev.verified) {
                        <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-sm">
                          Verified Purchase
                        </span>
                      }
                    </div>
                    <span class="text-[11px] text-gray-400 dark:text-slate-500">{{ rev.date }}</span>
                  </div>

                  <div class="flex text-amber-400 space-x-0.5">
                    @for (i of getStars(rev.rating); track i) {
                      <i class="pi pi-star-fill text-xs text-amber-400"></i>
                    }
                  </div>

                  <h4 class="text-xs font-bold text-gray-900 dark:text-white">{{ rev.title }}</h4>
                  <p class="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{{ rev.comment }}</p>
                </div>
              }
            }
          </div>
        </div>

        <!-- Write Review Modal -->
        @if (isReviewModalOpen()) {
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200 dark:border-slate-800">
              <div class="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
                <h3 class="font-bold text-gray-900 dark:text-white text-sm">Write a Product Review</h3>
                <button (click)="isReviewModalOpen.set(false)" class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer">
                  <i class="pi pi-times text-lg"></i>
                </button>
              </div>

              <form (ngSubmit)="handleReviewSubmit()" class="space-y-3 text-xs">
                <div>
                  <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">Your Rating:</label>
                  <div class="flex space-x-2">
                    @for (star of [1,2,3,4,5]; track star) {
                      <button
                        type="button"
                        (click)="newRating = star"
                        class="p-1.5 rounded-lg border cursor-pointer"
                        [ngClass]="newRating >= star ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900' : 'text-gray-300 dark:text-slate-600 border-gray-200 dark:border-slate-700'"
                      >
                        <i class="pi pi-star-fill text-lg"></i>
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">Review Headline:</label>
                  <input
                    type="text"
                    [(ngModel)]="newTitle"
                    name="title"
                    placeholder="e.g. Delicious aroma &amp; fast delivery"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label class="font-bold text-gray-700 dark:text-slate-300 block mb-1">Detailed Feedback:</label>
                  <textarea
                    rows="4"
                    [(ngModel)]="newComment"
                    name="comment"
                    placeholder="Share details about quality, packaging, freshness, etc."
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 text-gray-900 dark:text-white"
                  ></textarea>
                </div>

                <div class="flex gap-2 pt-2">
                  <button
                    type="button"
                    (click)="isReviewModalOpen.set(false)"
                    class="flex-1 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    {{ lang.t('cancel') }}
                  </button>
                  <button
                    type="submit"
                    class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    {{ lang.t('writeReview') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Related Products Carousel -->
        @if (related().length > 0) {
          <div class="space-y-4">
            <h3 class="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              {{ lang.t('youMightLike') }}
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              @for (p of related(); track p.id) {
                <app-product-card [product]="p"></app-product-card>
              }
            </div>
          </div>
        }
      </div>
    }
  `
})
export class ProductDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  auth = inject(AuthService);
  cart = inject(CartService);
  wishlist = inject(WishlistService);
  lang = inject(LanguageService);
  private toast = inject(ToastService);

  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  selectedImage = signal<string>('');
  selectedVariant = signal<Variant | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal<boolean>(true);

  quantity = 1;
  pincode = '800001';
  deliveryEstimate = 'Express Delivery in Patna within 2 Hours';

  isReviewModalOpen = signal<boolean>(false);
  newRating = 5;
  newTitle = '';
  newComment = '';

  get currentPrice(): number {
    return this.selectedVariant() ? this.selectedVariant()!.price : (this.product()?.price || 0);
  }

  get originalPrice(): number {
    return this.product()?.originalPrice || this.currentPrice;
  }

  get maxQty(): number {
    return this.product()?.maxQuantityPerOrder || 10;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  async loadProduct(slug: string): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.getProductBySlug(slug));
      const prod = res.data.product;
      this.product.set(prod);
      this.selectedImage.set(prod.images?.[0] || prod.thumbnail);
      this.selectedVariant.set(prod.variants?.[0] || null);
      this.related.set(res.data.related || []);

      const revRes = await firstValueFrom(this.api.getProductReviews(prod.id));
      this.reviews.set(revRes.data || []);
    } catch (err) {
      console.error('Failed loading product', err);
    } finally {
      this.loading.set(false);
      window.scrollTo(0, 0);
    }
  }

  handleAddToCart(): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in first to add products to your cart');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.product()) {
      this.cart.addToCart(this.product()!, this.selectedVariant(), this.quantity);
    }
  }

  handleBuyNow(): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in first to buy products');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.product()) {
      this.cart.addToCart(this.product()!, this.selectedVariant(), this.quantity);
      this.cart.closeCart();
      this.router.navigate(['/checkout']);
    }
  }

  toggleWishlist(): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in first to add products to your wishlist');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.product()) {
      this.wishlist.toggleWishlist(this.product()!);
    }
  }

  handlePincodeCheck(): void {
    if (this.pincode.length === 6) {
      this.deliveryEstimate = 'Express Delivery in 2 Hours Available!';
      this.toast.success('Express delivery is available at your pincode');
    } else {
      this.toast.error('Please enter a valid 6-digit Indian PIN code');
    }
  }

  getStars(rating: number): number[] {
    return Array.from({ length: rating }, (_, i) => i);
  }

  async handleReviewSubmit(): Promise<void> {
    if (!this.newTitle.trim() || !this.newComment.trim()) {
      this.toast.error('Please provide both a headline and review comments');
      return;
    }
    try {
      const res = await firstValueFrom(this.api.createReview({
        productId: this.product()!.id,
        rating: this.newRating,
        title: this.newTitle.trim(),
        comment: this.newComment.trim()
      }));
      this.reviews.update(prev => [res.data, ...prev]);
      this.isReviewModalOpen.set(false);
      this.newTitle = '';
      this.newComment = '';
      this.toast.success('Thank you! Your verified review was added.');
    } catch (err: any) {
      this.toast.error(err.message || 'Failed submitting review');
    }
  }
}
