import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-slate-900 dark:bg-slate-950 text-gray-300 border-t border-slate-800 transition-colors duration-200">
      <!-- Value Proposition Highlights -->
      <div class="border-b border-slate-800/80 bg-slate-950/40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="flex items-center space-x-3.5">
              <div class="w-12 h-12 rounded-2xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 flex-shrink-0">
                <i class="pi pi-truck text-2xl"></i>
              </div>
              <div>
                <h4 class="text-white font-bold text-sm">{{ lang.t('expressDelivery') }}</h4>
                <p class="text-xs text-gray-400">{{ lang.t('expressDeliverySub') }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-3.5">
              <div class="w-12 h-12 rounded-2xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 flex-shrink-0">
                <i class="pi pi-shield text-2xl"></i>
              </div>
              <div>
                <h4 class="text-white font-bold text-sm">{{ lang.t('genuinePromise') }}</h4>
                <p class="text-xs text-gray-400">{{ lang.t('genuinePromiseSub') }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-3.5">
              <div class="w-12 h-12 rounded-2xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 flex-shrink-0">
                <i class="pi pi-sync text-2xl"></i>
              </div>
              <div>
                <h4 class="text-white font-bold text-sm">{{ lang.t('easyReturns') }}</h4>
                <p class="text-xs text-gray-400">{{ lang.t('easyReturnsSub') }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-3.5">
              <div class="w-12 h-12 rounded-2xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 flex-shrink-0">
                <i class="pi pi-wallet text-2xl"></i>
              </div>
              <div>
                <h4 class="text-white font-bold text-sm">{{ lang.t('codPay') }}</h4>
                <p class="text-xs text-gray-400">{{ lang.t('codPaySub') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Links / Collapsible Sections -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          <!-- Brand Info (Always open) -->
          <div class="md:col-span-4 space-y-4">
            <a routerLink="/" class="flex items-center space-x-2.5">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white">
                <i class="pi pi-shopping-bag text-lg"></i>
              </div>
              <div class="flex items-center space-x-1">
                <span class="text-xl font-black text-white tracking-tight">TEZ</span>
                <span class="text-xl font-black text-accent-500 tracking-tight">THAILA</span>
              </div>
            </a>
            <p class="text-xs text-gray-400 leading-relaxed max-w-sm">
              {{ lang.t('footerAbout') }}
            </p>
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-400 pt-1">
              <span class="flex items-center"><i class="pi pi-phone mr-1.5 text-brand-400"></i> 1800-TEZ-THAILA</span>
              <span class="hidden sm:inline">•</span>
              <span class="flex items-center"><i class="pi pi-envelope mr-1.5 text-brand-400"></i> support&#64;tezthaila.com</span>
            </div>
          </div>

          <!-- Collapsible Column 1: Categories -->
          <div class="md:col-span-2 border-b md:border-b-0 border-slate-800 pb-4 md:pb-0">
            <button
              (click)="toggleSection('categories')"
              class="w-full flex items-center justify-between md:cursor-default text-left py-1 cursor-pointer"
            >
              <h4 class="text-white font-bold text-xs uppercase tracking-wider">{{ lang.t('categories') }}</h4>
              <i class="pi md:hidden text-xs text-gray-400 transition-transform duration-200"
                [ngClass]="openSections()['categories'] ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
            </button>
            <div [ngClass]="openSections()['categories'] ? 'block' : 'hidden md:block'" class="pt-3">
              <ul class="space-y-2 text-xs">
                <li><a routerLink="/products" [queryParams]="{ category: 'groceries-staples' }" class="hover:text-white transition-colors">{{ lang.getCategoryName('groceries-staples', 'Groceries & Staples') }}</a></li>
                <li><a routerLink="/products" [queryParams]="{ category: 'dairy-breakfast' }" class="hover:text-white transition-colors">{{ lang.getCategoryName('dairy-breakfast', 'Dairy & Breakfast') }}</a></li>
                <li><a routerLink="/products" [queryParams]="{ category: 'fresh-fruits-vegetables' }" class="hover:text-white transition-colors">{{ lang.getCategoryName('fresh-fruits-vegetables', 'Fruits & Vegetables') }}</a></li>
                <li><a routerLink="/products" [queryParams]="{ category: 'snacks-beverages' }" class="hover:text-white transition-colors">{{ lang.getCategoryName('snacks-beverages', 'Snacks & Beverages') }}</a></li>
                <li><a routerLink="/products" [queryParams]="{ category: 'electronics-audio' }" class="hover:text-white transition-colors">{{ lang.getCategoryName('electronics-audio', 'Electronics & Audio') }}</a></li>
              </ul>
            </div>
          </div>

          <!-- Collapsible Column 2: Customer Care -->
          <div class="md:col-span-2 border-b md:border-b-0 border-slate-800 pb-4 md:pb-0">
            <button
              (click)="toggleSection('customerCare')"
              class="w-full flex items-center justify-between md:cursor-default text-left py-1 cursor-pointer"
            >
              <h4 class="text-white font-bold text-xs uppercase tracking-wider">{{ lang.t('customerCare') }}</h4>
              <i class="pi md:hidden text-xs text-gray-400 transition-transform duration-200"
                [ngClass]="openSections()['customerCare'] ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
            </button>
            <div [ngClass]="openSections()['customerCare'] ? 'block' : 'hidden md:block'" class="pt-3">
              <ul class="space-y-2 text-xs">
                <li><a routerLink="/orders" class="hover:text-white transition-colors">{{ lang.t('trackOrder') }}</a></li>
                <li><a routerLink="/account" class="hover:text-white transition-colors">{{ lang.t('myProfile') }}</a></li>
                <li><a routerLink="/cart" class="hover:text-white transition-colors">{{ lang.t('cart') }}</a></li>
                <li><a routerLink="/wishlist" class="hover:text-white transition-colors">{{ lang.t('wishlist') }}</a></li>
                <li><a routerLink="/checkout" class="hover:text-white transition-colors">{{ lang.t('codPay') }}</a></li>
              </ul>
            </div>
          </div>

          <!-- Collapsible Column 3: Physical Store Locations -->
          <div class="md:col-span-4 border-b md:border-b-0 border-slate-800 pb-4 md:pb-0">
            <button
              (click)="toggleSection('locations')"
              class="w-full flex items-center justify-between md:cursor-default text-left py-1 cursor-pointer"
            >
              <div class="flex items-center space-x-2">
                <i class="pi pi-map-marker text-accent-400"></i>
                <h4 class="text-white font-bold text-xs uppercase tracking-wider">{{ lang.t('storeLocations') }}</h4>
              </div>
              <i class="pi md:hidden text-xs text-gray-400 transition-transform duration-200"
                [ngClass]="openSections()['locations'] ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
            </button>
            <div [ngClass]="openSections()['locations'] ? 'block' : 'hidden md:block'" class="pt-3 space-y-2.5">
              <div class="p-3 rounded-xl bg-slate-800/80 dark:bg-slate-900/90 border border-slate-700/80 text-xs space-y-2">
                <div class="flex items-center justify-between text-white font-bold">
                  <div class="flex items-center space-x-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="text-emerald-300">{{ lang.t('patnaHubName') }}</span>
                  </div>
                  <span class="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">{{ lang.t('open') }}</span>
                </div>
                
                <p class="text-gray-300 text-[11px] leading-relaxed">
                  <i class="pi pi-building mr-1.5 text-accent-400"></i>
                  {{ lang.t('patnaHubAddress') }}
                </p>

                <div class="flex items-center text-[10px] text-gray-400 space-x-3">
                  <span><i class="pi pi-clock mr-1 text-accent-400"></i>{{ lang.t('timing') }}</span>
                  <span><i class="pi pi-phone mr-1 text-accent-400"></i>+91 612 2554400</span>
                </div>

                <div class="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span class="text-gray-400 font-mono text-[10px] flex items-center">
                    <i class="pi pi-compass mr-1 text-emerald-400"></i>
                    25.6154° N, 85.1240° E
                  </span>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=25.6154,85.1240"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center space-x-1 text-accent-400 hover:text-accent-300 font-bold text-[11px] transition-colors"
                  >
                    <span>{{ lang.t('viewOnMap') }}</span>
                    <i class="pi pi-external-link text-[10px]"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Legal -->
      <div class="border-t border-slate-800 py-6 text-center text-xs text-gray-500">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>{{ lang.t('copyright') }}</p>
          <div class="flex items-center space-x-2">
            <span class="text-[11px] font-semibold text-gray-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/80">
              {{ lang.t('codOnlyBadge') }}
            </span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  lang = inject(LanguageService);

  openSections = signal<{ [key: string]: boolean }>({
    categories: false,
    customerCare: false,
    locations: true
  });

  toggleSection(key: string): void {
    this.openSections.update(state => ({
      ...state,
      [key]: !state[key]
    }));
  }
}
