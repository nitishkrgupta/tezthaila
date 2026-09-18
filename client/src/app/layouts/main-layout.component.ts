import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../components/common/header.component';
import { NavbarComponent } from '../components/common/navbar.component';
import { FooterComponent } from '../components/common/footer.component';
import { CartDrawerComponent } from '../components/common/cart-drawer.component';
import { ToastContainerComponent } from '../components/common/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    NavbarComponent,
    FooterComponent,
    CartDrawerComponent,
    ToastContainerComponent
  ],
  template: `
    <div class="min-h-screen w-full overflow-x-hidden flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-200">
      <!-- Sticky Header -->
      <app-header></app-header>

      <!-- Category Navigation Sub-bar -->
      <app-navbar></app-navbar>

      <!-- Main Body Container -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Site Footer -->
      <app-footer></app-footer>

      <!-- Sliding Shopping Bag Drawer -->
      <app-cart-drawer></app-cart-drawer>

      <!-- Global Toast Container -->
      <app-toast-container></app-toast-container>
    </div>
  `
})
export class MainLayoutComponent {}
