import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { HomePageComponent } from './pages/customer/home-page.component';
import { ProductListingPageComponent } from './pages/customer/product-listing-page.component';
import { ProductDetailPageComponent } from './pages/customer/product-detail-page.component';
import { CartPageComponent } from './pages/customer/cart-page.component';
import { CheckoutPageComponent } from './pages/customer/checkout-page.component';
import { OrderSuccessPageComponent } from './pages/customer/order-success-page.component';
import { OrdersPageComponent } from './pages/customer/orders-page.component';
import { OrderDetailPageComponent } from './pages/customer/order-detail-page.component';
import { WishlistPageComponent } from './pages/customer/wishlist-page.component';
import { AccountPageComponent } from './pages/customer/account-page.component';
import { LoginPageComponent } from './pages/auth/login-page.component';
import { RegisterPageComponent } from './pages/auth/register-page.component';
import { AdminLoginPageComponent } from './pages/admin/admin-login-page.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Customer Storefront Layout
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomePageComponent },
      { path: 'products', component: ProductListingPageComponent },
      { path: 'product/:slug', component: ProductDetailPageComponent },
      { path: 'cart', component: CartPageComponent, canActivate: [authGuard] },
      { path: 'checkout', component: CheckoutPageComponent, canActivate: [authGuard] },
      { path: 'order-success/:orderId', component: OrderSuccessPageComponent, canActivate: [authGuard] },
      { path: 'orders', component: OrdersPageComponent, canActivate: [authGuard] },
      { path: 'orders/:id', component: OrderDetailPageComponent, canActivate: [authGuard] },
      { path: 'wishlist', component: WishlistPageComponent, canActivate: [authGuard] },
      { path: 'account', component: AccountPageComponent, canActivate: [authGuard] },
      { path: 'login', component: LoginPageComponent },
      { path: 'auth/login', redirectTo: 'login', pathMatch: 'full' },
      { path: 'register', component: RegisterPageComponent },
      { path: 'auth/register', redirectTo: 'register', pathMatch: 'full' }
    ]
  },

  // Dedicated Admin Portal (Separated from Customer Storefront)
  {
    path: 'admin/login',
    component: AdminLoginPageComponent
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
