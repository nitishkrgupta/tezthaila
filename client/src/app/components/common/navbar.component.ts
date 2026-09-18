import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { INITIAL_CATEGORIES } from '../../services/mockData';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 hidden sm:block transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center space-x-1 overflow-x-auto py-2 text-xs font-semibold scrollbar-none">
          <a
            routerLink="/products"
            [routerLinkActiveOptions]="{ exact: true }"
            routerLinkActive="bg-brand-700 text-white shadow-xs"
            class="px-3 py-1.5 rounded-full flex items-center space-x-1 flex-shrink-0 transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <span>{{ lang.t('allProducts') }}</span>
          </a>

          @for (cat of categories; track cat.id) {
            <a
              [routerLink]="['/products']"
              [queryParams]="{ category: cat.slug }"
              routerLinkActive="bg-brand-700 text-white shadow-xs"
              class="px-3 py-1.5 rounded-full flex-shrink-0 transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {{ lang.getCategoryName(cat.slug, cat.name) }}
            </a>
          }

          <a
            [routerLink]="['/products']"
            [queryParams]="{ featured: true }"
            routerLinkActive="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300"
            class="px-3 py-1.5 rounded-full flex items-center space-x-1 flex-shrink-0 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            <i class="pi pi-bolt text-amber-500"></i>
            <span>{{ lang.t('hotDeals') }}</span>
          </a>

          <a
            [routerLink]="['/products']"
            [queryParams]="{ bestseller: true }"
            routerLinkActive="bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-300"
            class="px-3 py-1.5 rounded-full flex items-center space-x-1 flex-shrink-0 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40"
          >
            <i class="pi pi-sparkles text-brand-500"></i>
            <span>{{ lang.t('bestSellers') }}</span>
          </a>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  lang = inject(LanguageService);
  categories = INITIAL_CATEGORIES;
}
