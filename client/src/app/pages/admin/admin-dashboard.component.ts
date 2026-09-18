import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Product, Category, Subcategory, Order, AdminStats, Coupon, Banner } from '../../models';
import { INITIAL_CATEGORIES } from '../../services/mockData';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col font-sans">
      <!-- Admin Top Header -->
      <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-accent-500 text-slate-950 flex items-center justify-center font-black">
              TT
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-black text-sm tracking-tight text-white">TEZ THAILA</span>
                <span class="text-[10px] font-bold bg-accent-500 text-slate-900 px-2 py-0.5 rounded-full uppercase">
                  Admin Central
                </span>
              </div>
              <p class="text-[10px] text-gray-400">Operations, Inventory &amp; Marketing Dashboard</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <a
              routerLink="/"
              class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
            >
              <i class="pi pi-arrow-left text-xs"></i>
              <span>Return to Storefront</span>
            </a>

            <button
              (click)="handleLogout()"
              class="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <i class="pi pi-sign-out text-xs"></i>
              <span>Admin Logout</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Admin Body -->
      <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <!-- Navigation Tabs -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 border-b border-gray-200 text-xs font-bold scrollbar-none">
          @for (tab of [
            { id: 'dashboard', label: 'Overview & Analytics', icon: 'pi pi-chart-bar' },
            { id: 'orders', label: 'Manage Orders (' + orders().length + ')', icon: 'pi pi-box' },
            { id: 'products', label: 'Products & Stock (' + products().length + ')', icon: 'pi pi-server' },
            { id: 'deals', label: 'Deals of the Day (' + dealProductIds().length + ')', icon: 'pi pi-bolt' },
            { id: 'banners', label: 'Banners & Hero (' + banners().length + ')', icon: 'pi pi-image' },
            { id: 'coupons', label: 'Coupons & Promos (' + coupons().length + ')', icon: 'pi pi-tag' },
            { id: 'customers', label: 'Customers', icon: 'pi pi-users' }
          ]; track tab.id) {
            <button
              (click)="activeTab.set(tab.id)"
              class="px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all flex-shrink-0 cursor-pointer"
              [ngClass]="activeTab() === tab.id
                ? 'bg-brand-800 text-white shadow-md shadow-brand-900/20'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
            >
              <i [class]="tab.icon"></i>
              <span>{{ tab.label }}</span>
            </button>
          }
        </div>

        <!-- 1. OVERVIEW / DASHBOARD TAB -->
        @if (activeTab() === 'dashboard') {
          <div class="space-y-6">
            <!-- KPI Cards Grid -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
                  <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <i class="pi pi-arrow-up-right"></i>
                  </div>
                </div>
                <h3 class="text-2xl font-black text-gray-900">₹{{ (stats()?.totalRevenue || 2173).toLocaleString('en-IN') }}</h3>
                <p class="text-[11px] text-emerald-600 font-semibold mt-1">↑ Active Storefront</p>
              </div>

              <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
                  <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i class="pi pi-box"></i>
                  </div>
                </div>
                <h3 class="text-2xl font-black text-gray-900">{{ stats()?.totalOrders || orders().length }}</h3>
                <p class="text-[11px] text-blue-600 font-semibold mt-1">{{ stats()?.pendingOrders || 1 }} active fulfillment</p>
              </div>

              <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Catalog Products</span>
                  <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <i class="pi pi-server"></i>
                  </div>
                </div>
                <h3 class="text-2xl font-black text-gray-900">{{ products().length }}</h3>
                <p class="text-[11px] text-purple-600 font-semibold mt-1">8 Active Categories</p>
              </div>

              <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Promos</span>
                  <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <i class="pi pi-tag"></i>
                  </div>
                </div>
                <h3 class="text-2xl font-black text-gray-900">{{ coupons().length }} Coupons</h3>
                <p class="text-[11px] text-amber-600 font-semibold mt-1">{{ banners().length }} Active Banners</p>
              </div>
            </div>

            <!-- Recent Orders in Dashboard -->
            <div class="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-bold text-sm text-gray-900">Recent Customer Orders</h3>
                  <p class="text-xs text-gray-500">Live feed of orders placed through customer checkout (COD)</p>
                </div>
                <button (click)="activeTab.set('orders')" class="text-xs font-bold text-brand-700 hover:text-brand-800 cursor-pointer">
                  View All Orders →
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                      <th class="py-2.5">Order ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (o of orders().slice(0, 5); track o.id) {
                      <tr class="hover:bg-gray-50/60">
                        <td class="py-3 font-mono font-bold text-brand-800">{{ o.orderNumber }}</td>
                        <td class="text-gray-500">{{ o.createdAt | date:'shortDate' }}</td>
                        <td class="font-bold text-gray-900">₹{{ o.totalAmount }}</td>
                        <td>
                          <span class="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {{ o.paymentMethod }}
                          </span>
                        </td>
                        <td>
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            [ngClass]="{
                              'bg-emerald-100 text-emerald-800': o.orderStatus === 'DELIVERED',
                              'bg-rose-100 text-rose-800': o.orderStatus === 'CANCELLED',
                              'bg-amber-100 text-amber-800': o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
                            }"
                          >
                            {{ o.orderStatus }}
                          </span>
                        </td>
                        <td>
                          <select
                            [value]="o.orderStatus"
                            (change)="handleUpdateStatus(o.orderNumber, $any($event.target).value)"
                            class="text-[11px] font-semibold border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-brand-500 cursor-pointer"
                          >
                            <option value="ORDER_PLACED">ORDER_PLACED</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PACKED">PACKED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- 2. ORDERS MANAGEMENT TAB -->
        @if (activeTab() === 'orders') {
          <div class="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <div class="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 class="font-bold text-base text-gray-900">Customer Orders Management</h3>
                <p class="text-xs text-gray-500">Update fulfillment lifecycle (silent Telegram alerts notify admin on placement)</p>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th class="py-3">Order Number</th>
                    <th>Customer Details</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Tracking Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (o of orders(); track o.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="py-3.5 font-mono font-bold text-brand-800">{{ o.orderNumber }}</td>
                      <td>
                        <p class="font-bold text-gray-800">{{ o.address?.fullName || 'Customer' }}</p>
                        <p class="text-[11px] text-gray-400">{{ o.address?.city }} • {{ o.address?.phone }}</p>
                      </td>
                      <td class="text-gray-500">{{ o.createdAt | date:'shortDate' }}</td>
                      <td class="font-extrabold text-gray-900">₹{{ o.totalAmount }}</td>
                      <td>
                        <span class="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded mr-1">
                          {{ o.paymentMethod }}
                        </span>
                        <span class="text-[10px] font-bold" [ngClass]="o.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'">
                          {{ o.paymentStatus }}
                        </span>
                      </td>
                      <td>
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold"
                          [ngClass]="{
                            'bg-emerald-100 text-emerald-800': o.orderStatus === 'DELIVERED',
                            'bg-rose-100 text-rose-800': o.orderStatus === 'CANCELLED',
                            'bg-amber-100 text-amber-800': o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
                          }"
                        >
                          {{ o.orderStatus }}
                        </span>
                      </td>
                      <td>
                        <select
                          [value]="o.orderStatus"
                          (change)="handleUpdateStatus(o.orderNumber, $any($event.target).value)"
                          class="text-xs font-bold border border-gray-300 rounded-xl px-2.5 py-1.5 bg-white shadow-xs focus:border-brand-500 cursor-pointer"
                        >
                          <option value="ORDER_PLACED">ORDER_PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PACKED">PACKED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- 3. PRODUCTS & INVENTORY TAB (WITH BULK ACTIONS & EXCEL IMPORT/EXPORT) -->
        @if (activeTab() === 'products') {
          <div class="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-gray-100">
              <div>
                <h3 class="font-bold text-base text-gray-900">Products Catalog &amp; Inventory</h3>
                <p class="text-xs text-gray-500">Manage individual products, bulk import via Excel, or set order limits</p>
              </div>

              <!-- Action Buttons Bar -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- Sample Excel Download -->
                <button
                  (click)="handleDownloadTemplate()"
                  class="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Download sample Excel format (.xlsx)"
                >
                  <i class="pi pi-download text-xs"></i>
                  <span>Sample Excel</span>
                </button>

                <!-- Excel File Input & Import -->
                <input
                  #excelFileInput
                  type="file"
                  accept=".xlsx, .xls"
                  class="hidden"
                  (change)="handleExcelUpload($event)"
                />
                <button
                  (click)="excelFileInput.click()"
                  class="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Bulk add products by uploading an Excel file"
                >
                  <i class="pi pi-file-excel text-xs"></i>
                  <span>Import from Excel</span>
                </button>

                <!-- Bulk Delete Selected Button -->
                @if (selectedProductIds().length > 0) {
                  <button
                    (click)="handleBulkDelete()"
                    [disabled]="deleting()"
                    class="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <i class="pi pi-trash text-xs"></i>
                    <span>Delete Selected ({{ selectedProductIds().length }})</span>
                  </button>
                }

                <!-- Add Product Button -->
                <button
                  (click)="isAddProductModalOpen.set(true)"
                  class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <i class="pi pi-plus text-xs"></i>
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <!-- Products Table with Checkboxes & Order Limits -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th class="py-3 px-2 w-8">
                      <input
                        type="checkbox"
                        [checked]="isAllSelected"
                        (change)="toggleSelectAll($event)"
                        class="rounded accent-brand-600 cursor-pointer"
                        title="Select All"
                      />
                    </th>
                    <th class="py-3">Product</th>
                    <th>SKU</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Cart Limit</th>
                    <th>Stock Units</th>
                    <th>Inventory Status</th>
                    <th>Adjust Stock</th>
                    <th class="text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (p of products(); track p.id) {
                    <tr class="hover:bg-gray-50" [ngClass]="{ 'bg-brand-50/30': isProductSelected(p.id) }">
                      <td class="py-3 px-2">
                        <input
                          type="checkbox"
                          [checked]="isProductSelected(p.id)"
                          (change)="toggleSelectProduct(p.id, $event)"
                          class="rounded accent-brand-600 cursor-pointer"
                        />
                      </td>
                      <td class="py-3 flex items-center space-x-3">
                        <img [src]="p.thumbnail" [alt]="p.name" class="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                        <span class="font-bold text-gray-900 max-w-xs truncate">{{ p.name }}</span>
                      </td>
                      <td class="font-mono text-gray-500">{{ p.sku }}</td>
                      <td class="font-semibold text-brand-700">{{ p.brandName || 'Tez Brand' }}</td>
                      <td class="font-extrabold text-gray-900">₹{{ p.price }}</td>
                      <td>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          Max {{ p.maxQuantityPerOrder || 10 }} units
                        </span>
                      </td>
                      <td class="font-bold text-gray-800">{{ p.stock }} units</td>
                      <td>
                        @let status = p.stock === 0 ? 'OUT_OF_STOCK' : (p.stock < 35 ? 'LOW_STOCK' : 'IN_STOCK');
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          [ngClass]="{
                            'bg-emerald-100 text-emerald-800': status === 'IN_STOCK',
                            'bg-amber-100 text-amber-800': status === 'LOW_STOCK',
                            'bg-rose-100 text-rose-800': status === 'OUT_OF_STOCK'
                          }"
                        >
                          {{ status }}
                        </span>
                      </td>
                      <td>
                        <div class="flex items-center space-x-1">
                          <button
                            (click)="handleStockAdjust(p.id, p.stock, -10)"
                            class="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold flex items-center justify-center cursor-pointer"
                            title="-10 units"
                          >
                            -
                          </button>
                          <button
                            (click)="handleStockAdjust(p.id, p.stock, 25)"
                            class="w-6 h-6 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded font-bold flex items-center justify-center cursor-pointer"
                            title="+25 units"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td class="text-right pr-2">
                        <button
                          (click)="productToDelete.set(p)"
                          class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition-colors cursor-pointer"
                          [title]="'Remove ' + p.name"
                        >
                          <i class="pi pi-trash text-rose-600 text-xs"></i>
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- DEALS OF THE DAY CONFIGURATION TAB -->
        @if (activeTab() === 'deals') {
          <div class="space-y-6">
            <!-- 1. Live Deal Timer & Status Banner -->
            <div class="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 rounded-3xl p-6 text-white shadow-lg space-y-4">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs font-black uppercase tracking-widest bg-black/30 px-2.5 py-0.5 rounded-full">
                      Storefront Live Banner
                    </span>
                    <span class="text-xs font-bold text-amber-100 flex items-center">
                      <span class="w-2 h-2 rounded-full bg-emerald-300 animate-ping mr-1.5"></span>
                      Real-Time Active Countdown
                    </span>
                  </div>
                  <h3 class="text-2xl font-black tracking-tight mt-1">
                    {{ dealTitle() || 'Deals of the Day' }}
                  </h3>
                  <p class="text-xs text-amber-100">
                    When you start the timer, the countdown runs continuously on the customer homepage for the selected duration.
                  </p>
                </div>

                <!-- Live Timer Clock Display -->
                <div class="bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 self-start md:self-auto space-y-1">
                  <p class="text-[10px] font-bold text-amber-200 uppercase tracking-wider flex items-center">
                    <i class="pi pi-clock mr-1 text-xs"></i>
                    Time Remaining
                  </p>
                  <div class="flex items-center space-x-1.5 font-mono font-black text-lg sm:text-xl select-none">
                    <span class="bg-white/20 px-2.5 py-1 rounded-xl">{{ pad(dealHours()) }}h</span>
                    <span>:</span>
                    <span class="bg-white/20 px-2.5 py-1 rounded-xl">{{ pad(dealMinutes()) }}m</span>
                    <span>:</span>
                    <span class="bg-white/20 px-2.5 py-1 rounded-xl text-amber-300 font-extrabold min-w-[42px] text-center">{{ pad(dealSeconds()) }}s</span>
                  </div>
                  @if (dealEndsAt()) {
                    <p class="text-[10px] text-amber-100 font-sans">
                      Ends At: {{ dealEndsAt() | date:'medium' }}
                    </p>
                  }
                </div>
              </div>
            </div>

            <!-- 2. Deal Configuration & Timer Settings -->
            <div class="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-5">
              <div class="pb-3 border-b border-gray-100">
                <h4 class="font-bold text-base text-gray-900">Configure Timer &amp; Deal Duration</h4>
                <p class="text-xs text-gray-500">Set the duration for which this deal remains active on the homepage storefront.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <!-- Deal Title -->
                <div class="md:col-span-5 space-y-1.5">
                  <label class="text-xs font-bold text-gray-700 block">Deal Section Title</label>
                  <input
                    type="text"
                    [ngModel]="dealTitle()"
                    (ngModelChange)="dealTitle.set($event)"
                    placeholder="e.g. Deals of the Day"
                    class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                  <span class="text-[10px] text-gray-400">Title shown in the deals header on the homepage</span>
                </div>

                <!-- Duration Setting -->
                <div class="md:col-span-7 space-y-2">
                  <label class="text-xs font-bold text-gray-700 block">Deal Duration (Hours &amp; Minutes)</label>
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <span class="text-[11px] font-semibold text-gray-500 mr-1">Quick Presets:</span>
                    @for (hrs of [2, 4, 6, 12, 24, 48]; track hrs) {
                      <button
                        type="button"
                        (click)="setDealDuration(hrs, 0)"
                        class="px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer"
                        [ngClass]="dealDurationHours() === hrs && dealDurationMinutes() === 0
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'"
                      >
                        {{ hrs }}h
                      </button>
                    }
                  </div>

                  <div class="flex items-center space-x-3">
                    <div class="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min="0"
                        max="720"
                        [ngModel]="dealDurationHours()"
                        (ngModelChange)="dealDurationHours.set($event)"
                        class="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-brand-500 text-center"
                      />
                      <span class="text-xs font-bold text-gray-600">Hours</span>
                    </div>

                    <div class="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        [ngModel]="dealDurationMinutes()"
                        (ngModelChange)="dealDurationMinutes.set($event)"
                        class="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-brand-500 text-center"
                      />
                      <span class="text-xs font-bold text-gray-600">Mins</span>
                    </div>

                    <button
                      type="button"
                      (click)="saveDealsConfiguration()"
                      [disabled]="isSavingDeals() || dealProductIds().length === 0"
                      class="ml-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <i [class]="isSavingDeals() ? 'pi pi-spin pi-spinner text-xs' : 'pi pi-bolt text-xs'"></i>
                      <span>Save &amp; Start Deal Timer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Product Selection Section -->
            <div class="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <div class="flex items-center space-x-2">
                    <h4 class="font-bold text-base text-gray-900">Select Deal Products</h4>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      {{ dealProductIds().length }} products selected
                    </span>
                  </div>
                  <p class="text-xs text-gray-500">Pick products to feature in Deals of the Day. You can select single or multiple items.</p>
                </div>

                <div class="flex items-center space-x-2">
                  <button
                    type="button"
                    (click)="selectAllDealProducts()"
                    class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Select All Shown
                  </button>
                  <button
                    type="button"
                    (click)="clearDealProducts()"
                    class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <!-- Filter / Search Row -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="sm:col-span-2 relative">
                  <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  <input
                    type="text"
                    [ngModel]="dealSearchQuery()"
                    (ngModelChange)="dealSearchQuery.set($event)"
                    placeholder="Search product name, brand, SKU..."
                    class="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <select
                    [ngModel]="dealCategoryFilter()"
                    (ngModelChange)="dealCategoryFilter.set($event)"
                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:bg-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="all">All Categories</option>
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.slug">{{ cat.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Product Selection Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
                @for (prod of filteredDealProducts; track prod.id) {
                  <div
                    (click)="toggleDealProduct(prod.id)"
                    class="p-3 rounded-2xl border-2 transition-all cursor-pointer flex space-x-3 items-start relative select-none"
                    [ngClass]="dealProductIds().includes(prod.id)
                      ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'"
                  >
                    <!-- Checkbox -->
                    <div class="pt-0.5">
                      <div
                        class="w-5 h-5 rounded-lg border flex items-center justify-center transition-colors"
                        [ngClass]="dealProductIds().includes(prod.id)
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'border-gray-300 bg-white'"
                      >
                        @if (dealProductIds().includes(prod.id)) {
                          <i class="pi pi-check text-[10px]"></i>
                        }
                      </div>
                    </div>

                    <!-- Image -->
                    <img [src]="prod.thumbnail" [alt]="prod.name" class="w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0" />

                    <!-- Details -->
                    <div class="flex-1 min-w-0">
                      <span class="text-[10px] font-bold text-brand-700 block">{{ prod.brandName }}</span>
                      <h5 class="text-xs font-bold text-gray-900 line-clamp-1 leading-snug">{{ prod.name }}</h5>
                      <div class="flex items-center space-x-1.5 mt-1">
                        <span class="text-xs font-black text-gray-900">₹{{ prod.price }}</span>
                        @if (prod.originalPrice > prod.price) {
                          <span class="text-[10px] text-gray-400 line-through">₹{{ prod.originalPrice }}</span>
                        }
                        @if (prod.discountPercentage > 0) {
                          <span class="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            {{ prod.discountPercentage }}% OFF
                          </span>
                        }
                      </div>
                      <span class="text-[10px] text-gray-400 block mt-0.5">Stock: {{ prod.stock }}</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Bottom CTA Bar -->
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-600">
                  Total <span class="font-bold text-brand-700">{{ dealProductIds().length }}</span> products selected for Deals of the Day
                </span>
                <button
                  type="button"
                  (click)="saveDealsConfiguration()"
                  [disabled]="isSavingDeals() || dealProductIds().length === 0"
                  class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <i [class]="isSavingDeals() ? 'pi pi-spin pi-spinner text-xs' : 'pi pi-check text-xs'"></i>
                  <span>Save Deals &amp; Run Timer</span>
                </button>
              </div>
            </div>
          </div>
        }

        <!-- 4. BANNERS CONFIGURATION TAB -->
        @if (activeTab() === 'banners') {
          <div class="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
              <div>
                <h3 class="font-bold text-base text-gray-900">Storefront Banners Configuration</h3>
                <p class="text-xs text-gray-500">Configure promotional sliders and hero banners displayed on the home page</p>
              </div>

              <button
                (click)="openAddBannerModal()"
                class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <i class="pi pi-plus text-xs"></i>
                <span>Add New Banner</span>
              </button>
            </div>

            <!-- Banners Grid / List -->
            @if (banners().length === 0) {
              <div class="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <i class="pi pi-image text-3xl text-gray-400"></i>
                <h4 class="font-bold text-gray-800 text-sm">No Custom Banners Yet</h4>
                <p class="text-xs text-gray-500 max-w-sm mx-auto">
                  Click "Add New Banner" to configure dynamic promotions for the home page slider.
                </p>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (b of banners(); track b.id) {
                  <div class="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-xs flex flex-col justify-between">
                    <div class="relative h-40 bg-slate-900 overflow-hidden">
                      <img [src]="b.image" [alt]="b.title" class="w-full h-full object-cover opacity-70" />
                      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                      <div class="absolute top-3 right-3 flex items-center space-x-2">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          [ngClass]="b.active ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'">
                          {{ b.active ? 'Active' : 'Draft' }}
                        </span>
                        <span class="text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full">
                          Order: {{ b.order || 0 }}
                        </span>
                      </div>
                      <div class="absolute bottom-3 left-3 right-3 text-white">
                        <h4 class="font-black text-sm drop-shadow-sm">{{ b.title }}</h4>
                        @if (b.subtitle) {
                          <p class="text-[11px] text-gray-300 truncate">{{ b.subtitle }}</p>
                        }
                      </div>
                    </div>

                    <div class="p-3.5 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
                      <span class="text-[11px] text-gray-500 font-mono truncate max-w-[200px]">Link: {{ b.link || '/products' }}</span>
                      <div class="flex items-center space-x-2">
                        <button
                          (click)="handleToggleBannerActive(b)"
                          class="px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer"
                          [ngClass]="b.active ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'"
                        >
                          {{ b.active ? 'Deactivate' : 'Activate' }}
                        </button>
                        <button
                          (click)="openEditBannerModal(b)"
                          class="px-2.5 py-1 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          (click)="handleDeleteBanner(b)"
                          class="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                          title="Delete Banner"
                        >
                          <i class="pi pi-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- 5. COUPONS TAB (CONFIGURABLE CRUD) -->
        @if (activeTab() === 'coupons') {
          <div class="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
              <div>
                <h3 class="font-bold text-base text-gray-900">Store Promotional Coupons</h3>
                <p class="text-xs text-gray-500">Create, configure, and monitor discount vouchers for customers</p>
              </div>

              <button
                (click)="openAddCouponModal()"
                class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <i class="pi pi-plus text-xs"></i>
                <span>Add New Coupon</span>
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th class="py-3">Coupon Code</th>
                    <th>Type</th>
                    <th>Discount</th>
                    <th>Min Order</th>
                    <th>Max Discount</th>
                    <th>Usage Limit</th>
                    <th>Status</th>
                    <th class="text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (c of coupons(); track c.id || c.code) {
                    <tr class="hover:bg-gray-50">
                      <td class="py-3.5 font-mono font-black text-brand-800 text-sm">{{ c.code }}</td>
                      <td class="font-bold text-gray-700">{{ c.type }}</td>
                      <td class="font-extrabold text-gray-900">
                        {{ c.type === 'PERCENTAGE' ? c.value + '%' : '₹' + c.value }}
                      </td>
                      <td class="text-gray-600 font-medium">₹{{ c.minimumOrderAmount }}</td>
                      <td class="text-gray-600 font-medium">{{ c.maximumDiscount ? '₹' + c.maximumDiscount : 'No Limit' }}</td>
                      <td class="text-gray-600 font-medium">{{ c.usageLimit ? c.usageLimit + ' uses' : 'Unlimited' }}</td>
                      <td>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          [ngClass]="c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'">
                          {{ c.active ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="text-right pr-2">
                        <div class="flex items-center justify-end space-x-1.5">
                          <button
                            (click)="handleToggleCouponActive(c)"
                            class="px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer"
                            [ngClass]="c.active ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'"
                          >
                            {{ c.active ? 'Deactivate' : 'Activate' }}
                          </button>
                          <button
                            (click)="openEditCouponModal(c)"
                            class="px-2 py-1 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            (click)="handleDeleteCoupon(c)"
                            class="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                            title="Delete Coupon"
                          >
                            <i class="pi pi-trash text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- 6. CUSTOMERS TAB -->
        @if (activeTab() === 'customers') {
          <div class="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h3 class="font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
              Customer Accounts
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th class="py-3">Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr class="hover:bg-gray-50">
                    <td class="py-3 font-bold text-gray-900">Rahul Sharma</td>
                    <td class="text-gray-600">customer&#64;tezthaila.com</td>
                    <td class="text-gray-600">+91 98765 43211</td>
                    <td><span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">CUSTOMER</span></td>
                    <td><span class="text-emerald-700 font-bold">Active</span></td>
                  </tr>
                  <tr class="hover:bg-gray-50">
                    <td class="py-3 font-bold text-gray-900">Tez Admin</td>
                    <td class="text-gray-600">admin&#64;tezthaila.com</td>
                    <td class="text-gray-600">+91 98765 43210</td>
                    <td><span class="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">ADMIN</span></td>
                    <td><span class="text-emerald-700 font-bold">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      <!-- ADD PRODUCT MODAL (WITH MAX QUANTITY THRESHOLD & IMAGE UPLOAD/CAMERA) -->
      @if (isAddProductModalOpen()) {
        <!-- ADD PRODUCT MODAL -->
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h3 class="font-bold text-gray-900 text-sm">Add New Product to Catalog</h3>
                <p class="text-[11px] text-gray-500">Step 1: Category &rarr; Step 2: Subcategory &rarr; Step 3: Product Details</p>
              </div>
              <button (click)="closeAddProductModal()" class="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                <i class="pi pi-times text-base"></i>
              </button>
            </div>

            <form (ngSubmit)="handleCreateProduct()" class="space-y-4 text-xs">
              <!-- STEP 1 & 2: CATEGORY & SUBCATEGORY SELECTION -->
              <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div class="flex items-center space-x-2 pb-1 border-b border-slate-200/60">
                  <span class="w-5 h-5 rounded-full bg-brand-600 text-white font-black text-[10px] flex items-center justify-center">1</span>
                  <span class="font-bold text-slate-900 text-xs uppercase tracking-wide">Category &amp; Subcategory</span>
                </div>

                <!-- STEP 1: CATEGORY -->
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <label class="font-bold text-gray-700">Category *</label>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="openAddCategoryModal()"
                        class="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                        title="Create a new category"
                      >
                        <i class="pi pi-plus-circle text-[10px]"></i> + Add Category
                      </button>
                      @if (newProd.categoryId) {
                        <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <i class="pi pi-check text-[9px]"></i> Selected
                        </span>
                      }
                    </div>
                  </div>
                  <select
                    [ngModel]="newProd.categoryId"
                    (ngModelChange)="onCategoryChange($event)"
                    name="categoryId"
                    class="w-full px-3 py-2.5 border rounded-xl bg-white text-xs font-medium focus:outline-none focus:border-brand-500 transition-colors"
                    [ngClass]="formErrors['category'] ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'"
                  >
                    <option [ngValue]="null" disabled selected>Select Category ({{ categories().length }} available)</option>
                    @for (c of categories(); track c.id) {
                      <option [ngValue]="c.id">{{ c.name }}</option>
                    }
                  </select>
                  @if (formErrors['category']) {
                    <p class="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <i class="pi pi-exclamation-circle text-[10px]"></i> {{ formErrors['category'] }}
                    </p>
                  }
                </div>

                <!-- STEP 2: SUBCATEGORY -->
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <label class="font-bold text-gray-700">Subcategory {{ availableSubcategories().length > 0 ? '*' : '(Optional)' }}</label>
                    <div class="flex items-center gap-2">
                      @if (newProd.categoryId) {
                        <button
                          type="button"
                          (click)="openAddSubcategoryModal()"
                          class="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                          title="Add a new subcategory to this category"
                        >
                          <i class="pi pi-plus-circle text-[10px]"></i> + Add Subcategory
                        </button>
                      }
                      @if (isLoadingSubcategories()) {
                        <span class="text-[10px] text-brand-600 font-semibold flex items-center gap-1">
                          <i class="pi pi-spin pi-spinner text-[10px]"></i> Loading...
                        </span>
                      } @else if (newProd.subcategoryId) {
                        <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <i class="pi pi-check text-[9px]"></i> Selected
                        </span>
                      }
                    </div>
                  </div>
                  <select
                    [ngModel]="newProd.subcategoryId"
                    (ngModelChange)="onSubcategoryChange($event)"
                    name="subcategoryId"
                    [disabled]="!newProd.categoryId || isLoadingSubcategories()"
                    class="w-full px-3 py-2.5 border rounded-xl bg-white text-xs font-medium focus:outline-none focus:border-brand-500 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    [ngClass]="formErrors['subcategory'] ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'"
                  >
                    <option [ngValue]="null" [disabled]="availableSubcategories().length > 0">
                      {{ !newProd.categoryId ? 'Select Category first' : (availableSubcategories().length === 0 ? 'No subcategories (Unlocked - optional)' : 'Select Subcategory') }}
                    </option>
                    @for (sub of availableSubcategories(); track sub.id) {
                      <option [ngValue]="sub.id">{{ sub.name }}</option>
                    }
                  </select>
                  @if (formErrors['subcategory']) {
                    <p class="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <i class="pi pi-exclamation-circle text-[10px]"></i> {{ formErrors['subcategory'] }}
                    </p>
                  }
                  @if (!newProd.categoryId) {
                    <p class="text-[10px] text-gray-400 mt-1">Please select a Category first to enable Subcategories.</p>
                  } @else if (availableSubcategories().length === 0) {
                    <p class="text-[10px] text-emerald-600 font-medium mt-1">
                      ✓ Category selected. Product details unlocked below (or click "+ Add Subcategory" above).
                    </p>
                  }
                </div>
              </div>

              <!-- STEP 3: PRODUCT DETAILS -->
              @if (!isProductDetailsEnabled) {
                <div class="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-2 bg-gray-50/50">
                  <div class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <i class="pi pi-lock text-sm"></i>
                  </div>
                  <p class="font-bold text-gray-600 text-xs">Product Details Locked</p>
                  <p class="text-[11px] text-gray-400 max-w-xs mx-auto">
                    Select a Category and Subcategory above to unlock product title, pricing, weight and image upload.
                  </p>
                </div>
              } @else {
                <div class="space-y-3.5 pt-1">
                  <div class="flex items-center space-x-2 pb-1 border-b border-gray-100">
                    <span class="w-5 h-5 rounded-full bg-brand-600 text-white font-black text-[10px] flex items-center justify-center">2</span>
                    <span class="font-bold text-gray-900 text-xs uppercase tracking-wide">Product Details</span>
                  </div>

                  <!-- Product Name -->
                  <div>
                    <label class="font-bold text-gray-700 block mb-1">Product Name *</label>
                    <input
                      type="text"
                      [(ngModel)]="newProd.name"
                      name="name"
                      placeholder="e.g. Organic Brown Basmati Rice"
                      class="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-brand-500"
                      [ngClass]="formErrors['name'] ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'"
                    />
                    @if (formErrors['name']) {
                      <p class="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <i class="pi pi-exclamation-circle text-[10px]"></i> {{ formErrors['name'] }}
                      </p>
                    }
                  </div>

                  <!-- Brand -->
                  <div>
                    <label class="font-bold text-gray-700 block mb-1">Brand</label>
                    <input
                      type="text"
                      [(ngModel)]="newProd.brandName"
                      name="brandName"
                      placeholder="e.g. India Gate"
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <!-- Price & MRP Grid with Live Discount -->
                  <div>
                    <div class="grid grid-cols-2 gap-2.5">
                      <div>
                        <label class="font-bold text-gray-700 block mb-1">Selling Price (&pound; / &#8377;) *</label>
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          [(ngModel)]="newProd.price"
                          name="price"
                          placeholder="120"
                          class="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-brand-500"
                          [ngClass]="formErrors['price'] ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'"
                        />
                        @if (formErrors['price']) {
                          <p class="text-[11px] text-rose-600 font-semibold mt-1">
                            {{ formErrors['price'] }}
                          </p>
                        }
                      </div>

                      <div>
                        <label class="font-bold text-gray-700 block mb-1">MRP (&#8377;) *</label>
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          [(ngModel)]="newProd.originalPrice"
                          name="originalPrice"
                          placeholder="150"
                          class="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-brand-500"
                          [ngClass]="formErrors['originalPrice'] ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'"
                        />
                        @if (formErrors['originalPrice']) {
                          <p class="text-[11px] text-rose-600 font-semibold mt-1">
                            {{ formErrors['originalPrice'] }}
                          </p>
                        }
                      </div>
                    </div>

                    <!-- Auto-computed Discount Display -->
                    @if (newProd.price && newProd.originalPrice && !formErrors['price'] && !formErrors['originalPrice']) {
                      <div class="mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-800">
                        <span><strong>MRP:</strong> &#8377;{{ newProd.originalPrice }} &bull; <strong>Selling:</strong> &#8377;{{ newProd.price }}</span>
                        <span class="font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                          {{ calculatedDiscount }}% OFF
                        </span>
                      </div>
                    }
                  </div>

                  <!-- Quantity / Weight Field -->
                  <div>
                    <label class="font-bold text-gray-700 block mb-1">Quantity / Weight *</label>
                    <div class="grid grid-cols-2 gap-2">
                      <div class="relative">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          [(ngModel)]="newProd.quantityValue"
                          name="quantityValue"
                          placeholder="1"
                          class="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-brand-500"
                          [ngClass]="formErrors['quantityValue'] ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'"
                        />
                      </div>
                      <div>
                        <select
                          [(ngModel)]="newProd.quantityUnit"
                          name="quantityUnit"
                          class="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs font-medium focus:outline-none focus:border-brand-500"
                        >
                          @for (u of supportedUnits; track u) {
                            <option [value]="u">{{ u }}</option>
                          }
                        </select>
                      </div>
                    </div>
                    @if (formErrors['quantityValue']) {
                      <p class="text-[11px] text-rose-600 font-semibold mt-1">
                        {{ formErrors['quantityValue'] }}
                      </p>
                    }
                    <p class="text-[10px] text-gray-400 mt-0.5">e.g. 1 kg, 500 g, 1 L, 1 pack, 1 dozen</p>
                  </div>

                  <!-- Stock Quantity & Max Quantity Per Order -->
                  <div class="grid grid-cols-2 gap-2.5">
                    <div>
                      <label class="font-bold text-gray-700 block mb-1">Stock Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        [(ngModel)]="newProd.stock"
                        name="stock"
                        placeholder="50"
                        class="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-brand-500"
                        [ngClass]="formErrors['stock'] ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'"
                      />
                      @if (formErrors['stock']) {
                        <p class="text-[11px] text-rose-600 font-semibold mt-1">
                          {{ formErrors['stock'] }}
                        </p>
                      }
                      <span class="text-[10px] text-gray-400 block mt-0.5">Initial available units</span>
                    </div>

                    <div>
                      <label class="font-bold text-gray-700 block mb-1">Max Qty Per Order *</label>
                      <input
                        type="number"
                        min="1"
                        [(ngModel)]="newProd.maxQuantityPerOrder"
                        name="maxQuantityPerOrder"
                        placeholder="10"
                        class="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-brand-500"
                        [ngClass]="formErrors['maxQuantityPerOrder'] ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'"
                      />
                      @if (formErrors['maxQuantityPerOrder']) {
                        <p class="text-[11px] text-rose-600 font-semibold mt-1">
                          {{ formErrors['maxQuantityPerOrder'] }}
                        </p>
                      }
                      <span class="text-[10px] text-gray-400 block mt-0.5">Limit per customer order</span>
                    </div>
                  </div>

                  @if (newProd.stock && newProd.maxQuantityPerOrder && (+newProd.maxQuantityPerOrder > +newProd.stock)) {
                    <div class="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-1.5">
                      <i class="pi pi-exclamation-triangle text-amber-600 text-xs"></i>
                      <span>Notice: Max quantity per order exceeds current stock ({{ newProd.stock }}).</span>
                    </div>
                  }

                  <!-- Product Image Upload / Camera Picker (Preserved) -->
                  <div>
                    <div class="flex justify-between items-center mb-1.5">
                      <label class="font-bold text-gray-700 flex items-center space-x-1.5">
                        <i class="pi pi-image text-brand-600"></i>
                        <span>Product Image *</span>
                      </label>
                      <button
                        type="button"
                        (click)="useUrlFallback.set(!useUrlFallback())"
                        class="text-[11px] text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                      >
                        {{ useUrlFallback() ? '&larr; Upload / Camera' : 'Use Image URL instead' }}
                      </button>
                    </div>

                    @if (useUrlFallback()) {
                      <div>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          [(ngModel)]="newProd.thumbnail"
                          name="thumbnail"
                          (ngModelChange)="onThumbnailUrlChange($event)"
                          class="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-brand-500"
                          [ngClass]="formErrors['thumbnail'] ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'"
                        />
                      </div>
                    } @else {
                      <div class="space-y-3">
                        <input
                          #fileInput
                          type="file"
                          accept="image/*"
                          class="hidden"
                          (change)="handleFileInputChange($event)"
                        />
                        <input
                          #cameraInput
                          type="file"
                          accept="image/*"
                          capture="environment"
                          class="hidden"
                          (change)="handleFileInputChange($event)"
                        />

                        @if (imagePreview() || newProd.thumbnail) {
                          <div class="relative border-2 border-dashed border-emerald-300 bg-emerald-50/30 rounded-2xl p-3 flex items-center space-x-4">
                            <img
                              [src]="imagePreview() || newProd.thumbnail"
                              alt="Product Preview"
                              class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-emerald-200 shadow-sm flex-shrink-0"
                            />
                            <div class="flex-1 min-w-0 space-y-1">
                              <span class="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <i class="pi pi-check-circle text-emerald-600 text-xs"></i>
                                <span>Image Attached</span>
                              </span>
                              <p class="text-[11px] text-gray-500 truncate">Ready for catalog publication</p>
                              <div class="flex space-x-3 pt-1">
                                <button
                                  type="button"
                                  (click)="fileInput.click()"
                                  class="text-[11px] font-bold text-brand-700 hover:text-brand-800 underline cursor-pointer"
                                >
                                  Browse New
                                </button>
                                <span class="text-gray-300">&bull;</span>
                                <button
                                  type="button"
                                  (click)="startCamera('product')"
                                  class="text-[11px] font-bold text-brand-700 hover:text-brand-800 underline cursor-pointer"
                                >
                                  Snap New
                                </button>
                                <span class="text-gray-300">&bull;</span>
                                <button
                                  type="button"
                                  (click)="removeImage()"
                                  class="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        } @else {
                          <div
                            class="border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center space-y-3 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                            [ngClass]="formErrors['thumbnail'] ? 'border-rose-400 bg-rose-50/10' : 'border-gray-300'"
                          >
                            @if (imageUploadLoading()) {
                              <div class="py-4 flex flex-col items-center justify-center space-y-2 text-brand-600">
                                <i class="pi pi-spin pi-spinner text-2xl"></i>
                                <span class="text-xs font-bold text-gray-700">Uploading product image...</span>
                              </div>
                            } @else {
                              <div class="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                                <i class="pi pi-upload text-base"></i>
                              </div>
                              <div>
                                <p class="text-xs font-bold text-gray-800">Select Product Image *</p>
                                <p class="text-[11px] text-gray-500 mt-0.5">Upload a photo from your device or capture using camera</p>
                              </div>
                              <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
                                <button
                                  type="button"
                                  (click)="fileInput.click()"
                                  class="px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                                >
                                  <i class="pi pi-upload text-brand-600"></i>
                                  <span>Browse Device</span>
                                </button>
                                <button
                                  type="button"
                                  (click)="startCamera('product')"
                                  class="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                                >
                                  <i class="pi pi-camera"></i>
                                  <span>Take Photo</span>
                                </button>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }
                    @if (formErrors['thumbnail']) {
                      <p class="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <i class="pi pi-exclamation-circle text-[10px]"></i> {{ formErrors['thumbnail'] }}
                      </p>
                    }
                  </div>

                  <!-- Product Description -->
                  <div>
                    <label class="font-bold text-gray-700 block mb-1">Product Description</label>
                    <textarea
                      rows="3"
                      [(ngModel)]="newProd.description"
                      name="description"
                      placeholder="Enter complete product description..."
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                    ></textarea>
                  </div>
                </div>
              }

              <!-- Actions -->
              <div class="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  (click)="closeAddProductModal()"
                  class="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="!isProductDetailsEnabled || isSubmittingProduct() || imageUploadLoading()"
                  class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  @if (isSubmittingProduct()) {
                    <i class="pi pi-spin pi-spinner"></i>
                    <span>Publishing Product...</span>
                  } @else if (imageUploadLoading()) {
                    <span>Uploading Image...</span>
                  } @else {
                    <span>Publish Product</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- QUICK ADD CATEGORY MODAL -->
      @if (isAddCategoryModalOpen()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 class="font-bold text-gray-900 text-sm">Add New Category</h3>
              <button (click)="isAddCategoryModalOpen.set(false)" class="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i class="pi pi-times text-base"></i>
              </button>
            </div>
            <form (ngSubmit)="handleCreateCategory()" class="space-y-3 text-xs">
              <div>
                <label class="font-bold text-gray-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  [(ngModel)]="newCategoryName"
                  name="catName"
                  placeholder="e.g. Organic &amp; Gourmet"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label class="font-bold text-gray-700 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  [(ngModel)]="newCategoryDesc"
                  name="catDesc"
                  placeholder="Brief description..."
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
              <div class="flex gap-2 pt-2">
                <button
                  type="button"
                  (click)="isAddCategoryModalOpen.set(false)"
                  class="flex-1 py-2 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="!newCategoryName.trim() || isCreatingCategory()"
                  class="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center"
                >
                  @if (isCreatingCategory()) {
                    <i class="pi pi-spin pi-spinner mr-1"></i>
                  }
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- QUICK ADD SUBCATEGORY MODAL -->
      @if (isAddSubcategoryModalOpen()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 class="font-bold text-gray-900 text-sm">Add Subcategory</h3>
              <button (click)="isAddSubcategoryModalOpen.set(false)" class="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i class="pi pi-times text-base"></i>
              </button>
            </div>
            <form (ngSubmit)="handleCreateSubcategory()" class="space-y-3 text-xs">
              <div>
                <label class="font-bold text-gray-700 block mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  [(ngModel)]="newSubcategoryName"
                  name="subcatName"
                  placeholder="e.g. Cold Pressed Oils"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
              <div class="flex gap-2 pt-2">
                <button
                  type="button"
                  (click)="isAddSubcategoryModalOpen.set(false)"
                  class="flex-1 py-2 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="!newSubcategoryName.trim() || isCreatingSubcategory()"
                  class="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center"
                >
                  @if (isCreatingSubcategory()) {
                    <i class="pi pi-spin pi-spinner mr-1"></i>
                  }
                  <span>Save Subcategory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ADD / EDIT BANNER MODAL -->
      @if (isBannerModalOpen()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 class="font-bold text-gray-900 text-sm">
                {{ editingBannerId() ? 'Edit Store Banner' : 'Create New Store Banner' }}
              </h3>
              <button (click)="isBannerModalOpen.set(false)" class="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i class="pi pi-times text-base"></i>
              </button>
            </div>

            <form (ngSubmit)="handleSaveBanner()" class="space-y-3 text-xs">
              <div>
                <label class="font-bold text-gray-700 block mb-1">Banner Headline / Title</label>
                <input
                  type="text"
                  required
                  [(ngModel)]="bannerFormData.title"
                  name="bannerTitle"
                  placeholder="e.g. Summer Express Farm Specials"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label class="font-bold text-gray-700 block mb-1">Subtitle / Highlight</label>
                <input
                  type="text"
                  [(ngModel)]="bannerFormData.subtitle"
                  name="bannerSubtitle"
                  placeholder="e.g. Up to 40% OFF on fresh vegetables &amp; fruits"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="font-bold text-gray-700 block mb-1">Click Action Link</label>
                  <input
                    type="text"
                    [(ngModel)]="bannerFormData.link"
                    name="bannerLink"
                    placeholder="/products?category=fresh-fruits-vegetables"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label class="font-bold text-gray-700 block mb-1">Display Order</label>
                  <input
                    type="number"
                    [(ngModel)]="bannerFormData.order"
                    name="bannerOrder"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <!-- Banner Image Selection -->
              <div>
                <label class="font-bold text-gray-700 block mb-1">Banner Image</label>
                <input
                  #bannerFileInput
                  type="file"
                  accept="image/*"
                  class="hidden"
                  (change)="handleBannerFileChange($event)"
                />
                <div class="space-y-2">
                  <div class="flex gap-2">
                    <button
                      type="button"
                      (click)="bannerFileInput.click()"
                      class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <i class="pi pi-upload text-xs"></i>
                      <span>Browse Image</span>
                    </button>
                    <button
                      type="button"
                      (click)="startCamera('banner')"
                      class="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <i class="pi pi-camera text-xs"></i>
                      <span>Take Photo</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    placeholder="Or enter image URL: https://..."
                    [(ngModel)]="bannerFormData.image"
                    name="bannerImage"
                    (ngModelChange)="bannerImagePreview.set($event)"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                  @if (bannerImagePreview() || bannerFormData.image) {
                    <div class="h-28 rounded-xl overflow-hidden border border-gray-200 bg-slate-900">
                      <img [src]="bannerImagePreview() || bannerFormData.image" alt="Preview" class="w-full h-full object-cover" />
                    </div>
                  }
                </div>
              </div>

              <div class="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="bannerActive"
                  [(ngModel)]="bannerFormData.active"
                  name="bannerActive"
                  class="rounded accent-brand-600 cursor-pointer"
                />
                <label for="bannerActive" class="font-bold text-gray-800 cursor-pointer">
                  Activate banner immediately on storefront
                </label>
              </div>

              <div class="flex gap-2 pt-2">
                <button
                  type="button"
                  (click)="isBannerModalOpen.set(false)"
                  class="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ADD / EDIT COUPON MODAL -->
      @if (isCouponModalOpen()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 class="font-bold text-gray-900 text-sm">
                {{ editingCouponId() ? 'Edit Store Coupon' : 'Create New Promotional Coupon' }}
              </h3>
              <button (click)="isCouponModalOpen.set(false)" class="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i class="pi pi-times text-base"></i>
              </button>
            </div>

            <form (ngSubmit)="handleSaveCoupon()" class="space-y-3 text-xs">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="font-bold text-gray-700 block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="couponFormData.code"
                    name="couponCode"
                    placeholder="e.g. WELCOME20"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label class="font-bold text-gray-700 block mb-1">Discount Type</label>
                  <select
                    [(ngModel)]="couponFormData.type"
                    name="couponType"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-bold"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED">FIXED AMOUNT (₹)</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="font-bold text-gray-700 block mb-1">
                    {{ couponFormData.type === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Value (₹)' }}
                  </label>
                  <input
                    type="number"
                    required
                    [(ngModel)]="couponFormData.value"
                    name="couponValue"
                    placeholder="e.g. 15"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label class="font-bold text-gray-700 block mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    [(ngModel)]="couponFormData.minimumOrderAmount"
                    name="couponMin"
                    placeholder="e.g. 499"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="font-bold text-gray-700 block mb-1">Max Discount Cap (₹, optional)</label>
                  <input
                    type="number"
                    [(ngModel)]="couponFormData.maximumDiscount"
                    name="couponMax"
                    placeholder="e.g. 200"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label class="font-bold text-gray-700 block mb-1">Usage Limit (optional)</label>
                  <input
                    type="number"
                    [(ngModel)]="couponFormData.usageLimit"
                    name="couponLimit"
                    placeholder="e.g. 100"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label class="font-bold text-gray-700 block mb-1">Description / Terms</label>
                <input
                  type="text"
                  [(ngModel)]="couponFormData.description"
                  name="couponDesc"
                  placeholder="e.g. Get 15% discount up to ₹200 on grocery staples"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div class="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="couponActive"
                  [(ngModel)]="couponFormData.active"
                  name="couponActive"
                  class="rounded accent-brand-600 cursor-pointer"
                />
                <label for="couponActive" class="font-bold text-gray-800 cursor-pointer">
                  Coupon is active and redeemable by users
                </label>
              </div>

              <div class="flex gap-2 pt-2">
                <button
                  type="button"
                  (click)="isCouponModalOpen.set(false)"
                  class="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Live Camera Viewfinder Modal (Reusable for Product & Banner) -->
      @if (isCameraActive()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full text-white space-y-4 shadow-2xl">
            <div class="flex justify-between items-center pb-2 border-b border-slate-800">
              <div class="flex items-center space-x-2">
                <i class="pi pi-camera text-accent-400"></i>
                <h4 class="text-xs font-bold text-white uppercase tracking-wider">Live Camera Capture</h4>
              </div>
              <button
                type="button"
                (click)="stopCamera()"
                class="p-1 text-gray-400 hover:text-white rounded-lg cursor-pointer"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-72 flex items-center justify-center border border-slate-800">
              <video
                #videoElem
                autoplay
                playsinline
                muted
                class="w-full h-full object-cover"
              ></video>
              <div class="absolute inset-4 border border-white/20 rounded-xl pointer-events-none"></div>
            </div>

            <div class="flex items-center space-x-3 pt-1">
              <button
                type="button"
                (click)="stopCamera()"
                class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="capturePhoto()"
                class="flex-1 py-2.5 bg-accent-500 hover:bg-accent-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-accent-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <i class="pi pi-camera"></i>
                <span>Capture &amp; Use</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal (Single Product) -->
      @if (productToDelete()) {
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <i class="pi pi-trash text-2xl"></i>
            </div>
            <div class="text-center space-y-1.5">
              <h3 class="text-base font-bold text-gray-900">Remove Product?</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to permanently remove <strong class="text-gray-900 font-bold">"{{ productToDelete()?.name }}"</strong> from the catalog?
              </p>
            </div>
            <div class="flex space-x-2 pt-2">
              <button
                type="button"
                [disabled]="deleting()"
                (click)="productToDelete.set(null)"
                class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                [disabled]="deleting()"
                (click)="handleDeleteProduct(productToDelete()!)"
                class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center space-x-1 disabled:opacity-50 cursor-pointer"
              >
                @if (deleting()) {
                  <span>Removing...</span>
                } @else {
                  <i class="pi pi-trash text-xs"></i>
                  <span>Yes, Remove</span>
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  @ViewChild('videoElem') videoElem?: ElementRef<HTMLVideoElement>;
  @ViewChild('cameraInput') cameraInput?: ElementRef<HTMLInputElement>;
  @ViewChild('excelFileInput') excelFileInput?: ElementRef<HTMLInputElement>;

  readonly activeTab = signal<string>('dashboard');
  readonly stats = signal<AdminStats | null>(null);
  readonly orders = signal<Order[]>([]);
  readonly products = signal<Product[]>([]);
  readonly coupons = signal<Coupon[]>([]);
  readonly banners = signal<Banner[]>([]);
  readonly loading = signal<boolean>(true);

  // Bulk Product Selection
  readonly selectedProductIds = signal<number[]>([]);

  // Add Product Modal
  readonly isAddProductModalOpen = signal<boolean>(false);
  readonly imageUploadLoading = signal<boolean>(false);
  readonly imagePreview = signal<string>('');
  readonly useUrlFallback = signal<boolean>(false);

  // Live Camera
  readonly isCameraActive = signal<boolean>(false);
  private cameraTarget: 'product' | 'banner' = 'product';
  private cameraStream: MediaStream | null = null;

  // Delete product
  readonly productToDelete = signal<Product | null>(null);
  readonly deleting = signal<boolean>(false);

  // Banners Management
  readonly isBannerModalOpen = signal<boolean>(false);
  readonly editingBannerId = signal<number | null>(null);
  readonly bannerImagePreview = signal<string>('');
  bannerFormData: any = {
    title: '',
    subtitle: '',
    link: '/products',
    image: '',
    active: true,
    order: 0
  };

  // Coupons Management
  readonly isCouponModalOpen = signal<boolean>(false);
  readonly editingCouponId = signal<number | null>(null);
  couponFormData: any = {
    code: '',
    type: 'PERCENTAGE',
    value: 10,
    minimumOrderAmount: 499,
    maximumDiscount: 150,
    usageLimit: null,
    description: '',
    active: true
  };

  readonly categories = signal<Category[]>(INITIAL_CATEGORIES);
  readonly availableSubcategories = signal<Subcategory[]>([]);
  readonly isLoadingSubcategories = signal<boolean>(false);
  readonly isSubmittingProduct = signal<boolean>(false);

  // Quick Category & Subcategory Creation
  readonly isAddCategoryModalOpen = signal<boolean>(false);
  readonly isCreatingCategory = signal<boolean>(false);
  newCategoryName = '';
  newCategoryDesc = '';

  readonly isAddSubcategoryModalOpen = signal<boolean>(false);
  readonly isCreatingSubcategory = signal<boolean>(false);
  newSubcategoryName = '';

  readonly supportedUnits = ['kg', 'g', 'mg', 'L', 'ml', 'piece', 'pack', 'dozen', 'pair', 'box'];

  newProd: {
    name: string;
    categoryId: number | null;
    categorySlug: string;
    subcategoryId: number | null;
    brandName: string;
    price: number | string;
    originalPrice: number | string;
    quantityValue: number | string;
    quantityUnit: string;
    stock: number | string;
    maxQuantityPerOrder: number | string;
    thumbnail: string;
    description: string;
    sku?: string;
    slug?: string;
  } = {
    name: '',
    categoryId: null,
    categorySlug: '',
    subcategoryId: null,
    brandName: '',
    price: '',
    originalPrice: '',
    quantityValue: 1,
    quantityUnit: 'kg',
    stock: 50,
    maxQuantityPerOrder: 10,
    thumbnail: '',
    description: ''
  };

  formErrors: { [key: string]: string } = {};

  get isProductDetailsEnabled(): boolean {
    if (!this.newProd.categoryId) return false;
    return !!this.newProd.subcategoryId || this.availableSubcategories().length === 0;
  }

  get calculatedDiscount(): number {
    const p = Number(this.newProd.price);
    const m = Number(this.newProd.originalPrice || this.newProd.price);
    if (!isNaN(p) && !isNaN(m) && m > p && m > 0) {
      return Math.round(((m - p) / m) * 100);
    }
    return 0;
  }

  get isAllSelected(): boolean {
    return this.products().length > 0 && this.selectedProductIds().length === this.products().length;
  }

  isProductSelected(id: number): boolean {
    return this.selectedProductIds().includes(id);
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedProductIds.set(this.products().map(p => p.id));
    } else {
      this.selectedProductIds.set([]);
    }
  }

  toggleSelectProduct(id: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedProductIds.update(ids => [...ids, id]);
    } else {
      this.selectedProductIds.update(ids => ids.filter(i => i !== id));
    }
  }

  // Deals of the Day Management
  readonly dealProductIds = signal<number[]>([]);
  readonly dealSearchQuery = signal<string>('');
  readonly dealCategoryFilter = signal<string>('all');
  readonly dealTitle = signal<string>('Deals of the Day');
  readonly dealEndsAt = signal<string>('');
  readonly dealDurationHours = signal<number>(12);
  readonly dealDurationMinutes = signal<number>(0);
  readonly isSavingDeals = signal<boolean>(false);
  readonly dealActive = signal<boolean>(true);

  readonly dealHours = signal<number>(0);
  readonly dealMinutes = signal<number>(0);
  readonly dealSeconds = signal<number>(0);
  private dealCountdownTimer: any = null;

  get filteredDealProducts(): Product[] {
    let list = this.products();
    const cat = this.dealCategoryFilter();
    if (cat !== 'all') {
      list = list.filter(p => p.categorySlug === cat || p.categoryId === Number(cat));
    }
    const q = this.dealSearchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.brandName && p.brandName.toLowerCase().includes(q)) || p.sku.toLowerCase().includes(q));
    }
    return list;
  }

  pad(num: number): string {
    return String(num).padStart(2, '0');
  }

  setDealDuration(hours: number, minutes = 0) {
    this.dealDurationHours.set(hours);
    this.dealDurationMinutes.set(minutes);
  }

  toggleDealProduct(productId: number): void {
    this.dealProductIds.update(ids => {
      if (ids.includes(productId)) {
        return ids.filter(id => id !== productId);
      } else {
        return [...ids, productId];
      }
    });
  }

  selectAllDealProducts(): void {
    const currentFilteredIds = this.filteredDealProducts.map(p => p.id);
    this.dealProductIds.update(ids => Array.from(new Set([...ids, ...currentFilteredIds])));
  }

  clearDealProducts(): void {
    this.dealProductIds.set([]);
  }

  updateAdminDealCountdown(): void {
    if (!this.dealEndsAt()) return;
    const endsAtMs = new Date(this.dealEndsAt()).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((endsAtMs - now) / 1000));
    this.dealHours.set(Math.floor(diff / 3600));
    this.dealMinutes.set(Math.floor((diff % 3600) / 60));
    this.dealSeconds.set(diff % 60);
  }

  async saveDealsConfiguration(): Promise<void> {
    if (this.dealProductIds().length === 0) {
      this.toast.error('Please select at least 1 product for Deals of the Day');
      return;
    }
    this.isSavingDeals.set(true);
    try {
      const res = await firstValueFrom(this.api.updateDeals({
        title: this.dealTitle(),
        productIds: this.dealProductIds(),
        durationHours: this.dealDurationHours(),
        durationMinutes: this.dealDurationMinutes(),
        isActive: this.dealActive()
      }));
      if (res.data?.endsAt) {
        this.dealEndsAt.set(res.data.endsAt);
        this.updateAdminDealCountdown();
      }
      this.toast.success(`Deals of the Day updated & timer started for ${this.dealDurationHours()}h ${this.dealDurationMinutes()}m!`);
    } catch (err: any) {
      this.toast.error(err?.message || 'Failed to update deals');
    } finally {
      this.isSavingDeals.set(false);
    }
  }

  async ngOnInit() {
    await this.loadAdminData();
    this.dealCountdownTimer = setInterval(() => {
      this.updateAdminDealCountdown();
    }, 1000);
  }

  ngOnDestroy() {
    this.stopCamera();
    if (this.dealCountdownTimer) {
      clearInterval(this.dealCountdownTimer);
    }
  }

  async loadAdminData() {
    this.loading.set(true);
    try {
      const [statsRes, ordersRes, prodsRes, couponsRes, bannersRes, dealsRes, catsRes] = await Promise.all([
        firstValueFrom(this.api.getAdminStats()),
        firstValueFrom(this.api.getOrders()),
        firstValueFrom(this.api.getProducts({ limit: 100 })),
        firstValueFrom(this.api.getAllCouponsAdmin()).catch(() => ({ data: [] })),
        firstValueFrom(this.api.getAllBannersAdmin()).catch(() => ({ data: [] })),
        firstValueFrom(this.api.getDeals()).catch(() => null),
        firstValueFrom(this.api.getCategories()).catch(() => ({ data: INITIAL_CATEGORIES }))
      ]);
      this.stats.set(statsRes.data || null);
      this.orders.set(ordersRes.data || []);
      this.products.set(prodsRes.data?.products || []);
      if (couponsRes?.data) this.coupons.set(couponsRes.data);
      if (bannersRes?.data) this.banners.set(bannersRes.data);
      if (catsRes?.data && catsRes.data.length > 0) {
        this.categories.set(catsRes.data);
      } else {
        this.categories.set(INITIAL_CATEGORIES);
      }
      if (dealsRes?.data) {
        this.dealTitle.set(dealsRes.data.title || 'Deals of the Day');
        this.dealProductIds.set(dealsRes.data.productIds || []);
        this.dealDurationHours.set(dealsRes.data.durationHours || 12);
        this.dealActive.set(dealsRes.data.isActive ?? true);
        if (dealsRes.data.endsAt) {
          this.dealEndsAt.set(dealsRes.data.endsAt);
          this.updateAdminDealCountdown();
        }
      }
    } catch (err) {
      console.error('Failed fetching admin data', err);
    } finally {
      this.loading.set(false);
    }
  }

  async handleLogout() {
    await this.auth.logout('');
    this.router.navigate(['/admin/login']);
  }

  async handleUpdateStatus(orderId: string, newStatus: string) {
    try {
      await firstValueFrom(this.api.updateOrderStatus(orderId, newStatus));
      this.toast.success(`Order #${orderId} marked as ${newStatus}`);
      await this.loadAdminData();
    } catch (err: any) {
      this.toast.error(err.message || 'Status update failed');
    }
  }

  async handleStockAdjust(productId: number, currentStock: number, delta: number) {
    const nextStock = Math.max(0, currentStock + delta);
    try {
      await firstValueFrom(this.api.updateProductStock(productId, nextStock));
      this.products.set(
        this.products().map(p => p.id === productId ? { ...p, stock: nextStock } : p)
      );
      this.toast.success('Inventory stock updated');
    } catch {
      this.toast.error('Stock update failed');
    }
  }

  async handleDeleteProduct(product: Product) {
    this.deleting.set(true);
    try {
      await firstValueFrom(this.api.deleteProduct(product.id));
      this.products.set(this.products().filter(p => p.id !== product.id));
      this.selectedProductIds.update(ids => ids.filter(i => i !== product.id));
      this.toast.success(`Product "${product.name}" removed successfully!`);
      this.productToDelete.set(null);
      await this.loadAdminData();
    } catch (err: any) {
      this.toast.error(err.message || 'Failed to remove product');
    } finally {
      this.deleting.set(false);
    }
  }

  async handleBulkDelete() {
    const ids = this.selectedProductIds();
    if (ids.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${ids.length} selected products?`)) return;

    this.deleting.set(true);
    try {
      const res = await firstValueFrom(this.api.bulkDeleteProducts(ids));
      this.toast.success(`Successfully deleted ${res.data?.count || ids.length} products!`);
      this.selectedProductIds.set([]);
      await this.loadAdminData();
    } catch (err: any) {
      this.toast.error(err.message || 'Bulk deletion failed');
    } finally {
      this.deleting.set(false);
    }
  }

  async handleDownloadTemplate() {
    try {
      const blob = await firstValueFrom(this.api.downloadProductTemplate());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tezthaila_products_sample.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.toast.success('Sample Excel template downloaded');
    } catch {
      this.toast.error('Failed downloading sample template');
    }
  }

  async handleExcelUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.bulkUploadProducts(file));
      this.toast.success(`🎉 Successfully imported ${res.data?.count} products from Excel!`);
      input.value = '';
      await this.loadAdminData();
    } catch (err: any) {
      this.toast.error(err.error?.message || err.message || 'Excel import failed');
    } finally {
      this.loading.set(false);
    }
  }

  // --- Banners Methods ---
  openAddBannerModal() {
    this.editingBannerId.set(null);
    this.bannerFormData = {
      title: '',
      subtitle: '',
      link: '/products',
      image: '',
      active: true,
      order: this.banners().length
    };
    this.bannerImagePreview.set('');
    this.isBannerModalOpen.set(true);
  }

  openEditBannerModal(banner: Banner) {
    this.editingBannerId.set(banner.id || null);
    this.bannerFormData = {
      title: banner.title,
      subtitle: banner.subtitle || '',
      link: banner.link || '/products',
      image: banner.image,
      active: banner.active !== false,
      order: banner.order || 0
    };
    this.bannerImagePreview.set(banner.image);
    this.isBannerModalOpen.set(true);
  }

  async handleSaveBanner() {
    if (!this.bannerFormData.title || !this.bannerFormData.image) {
      this.toast.error('Banner title and image are required');
      return;
    }
    try {
      const payload = {
        title: this.bannerFormData.title.trim(),
        subtitle: this.bannerFormData.subtitle?.trim() || '',
        link: this.bannerFormData.link?.trim() || '/products',
        image: this.bannerFormData.image,
        active: Boolean(this.bannerFormData.active),
        order: Number(this.bannerFormData.order) || 0
      };

      if (this.editingBannerId()) {
        await firstValueFrom(this.api.updateBanner(this.editingBannerId()!, payload));
        this.toast.success('Banner updated successfully');
      } else {
        await firstValueFrom(this.api.createBanner(payload));
        this.toast.success('Banner created successfully');
      }
      this.isBannerModalOpen.set(false);
      const bRes = await firstValueFrom(this.api.getAllBannersAdmin());
      this.banners.set(bRes.data || []);
    } catch (err: any) {
      this.toast.error(err.error?.message || err.message || 'Failed saving banner');
    }
  }

  async handleDeleteBanner(banner: Banner) {
    if (!banner.id) return;
    if (!confirm(`Are you sure you want to delete banner "${banner.title}"?`)) return;
    try {
      await firstValueFrom(this.api.deleteBanner(banner.id));
      this.toast.success('Banner deleted');
      const bRes = await firstValueFrom(this.api.getAllBannersAdmin());
      this.banners.set(bRes.data || []);
    } catch (err: any) {
      this.toast.error('Failed deleting banner');
    }
  }

  async handleToggleBannerActive(banner: Banner) {
    if (!banner.id) return;
    try {
      await firstValueFrom(this.api.updateBanner(banner.id, { active: !banner.active }));
      this.toast.success(`Banner is now ${!banner.active ? 'active' : 'inactive'}`);
      const bRes = await firstValueFrom(this.api.getAllBannersAdmin());
      this.banners.set(bRes.data || []);
    } catch {
      this.toast.error('Failed toggling banner status');
    }
  }

  async handleBannerFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const res = await firstValueFrom(this.api.uploadImage(file));
      const url = res.data?.url || '';
      this.bannerFormData.image = url;
      this.bannerImagePreview.set(url);
      this.toast.success('Banner image uploaded');
    } catch {
      this.toast.error('Banner image upload failed');
    }
  }

  // --- Coupons Methods ---
  openAddCouponModal() {
    this.editingCouponId.set(null);
    this.couponFormData = {
      code: '',
      type: 'PERCENTAGE',
      value: 10,
      minimumOrderAmount: 499,
      maximumDiscount: 150,
      usageLimit: null,
      description: '',
      active: true
    };
    this.isCouponModalOpen.set(true);
  }

  openEditCouponModal(coupon: Coupon) {
    this.editingCouponId.set(coupon.id || null);
    this.couponFormData = {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscount: coupon.maximumDiscount || null,
      usageLimit: coupon.usageLimit || null,
      description: coupon.description || '',
      active: coupon.active !== false
    };
    this.isCouponModalOpen.set(true);
  }

  async handleSaveCoupon() {
    if (!this.couponFormData.code || !this.couponFormData.value) {
      this.toast.error('Coupon code and discount value are required');
      return;
    }
    try {
      const payload = {
        code: this.couponFormData.code.toUpperCase().trim(),
        type: this.couponFormData.type,
        value: Number(this.couponFormData.value),
        minimumOrderAmount: Number(this.couponFormData.minimumOrderAmount) || 0,
        maximumDiscount: this.couponFormData.maximumDiscount ? Number(this.couponFormData.maximumDiscount) : null,
        usageLimit: this.couponFormData.usageLimit ? Number(this.couponFormData.usageLimit) : null,
        description: this.couponFormData.description || '',
        active: Boolean(this.couponFormData.active)
      };

      if (this.editingCouponId()) {
        await firstValueFrom(this.api.updateCoupon(this.editingCouponId()!, payload));
        this.toast.success(`Coupon ${payload.code} updated successfully`);
      } else {
        await firstValueFrom(this.api.createCoupon(payload));
        this.toast.success(`Coupon ${payload.code} created successfully`);
      }
      this.isCouponModalOpen.set(false);
      const cRes = await firstValueFrom(this.api.getAllCouponsAdmin());
      this.coupons.set(cRes.data || []);
    } catch (err: any) {
      this.toast.error(err.error?.message || err.message || 'Failed saving coupon');
    }
  }

  async handleDeleteCoupon(coupon: Coupon) {
    if (!coupon.id) return;
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return;
    try {
      await firstValueFrom(this.api.deleteCoupon(coupon.id));
      this.toast.success(`Coupon ${coupon.code} deleted`);
      const cRes = await firstValueFrom(this.api.getAllCouponsAdmin());
      this.coupons.set(cRes.data || []);
    } catch (err: any) {
      this.toast.error(err.error?.message || err.message || 'Failed deleting coupon');
    }
  }

  async handleToggleCouponActive(coupon: Coupon) {
    if (!coupon.id) return;
    try {
      await firstValueFrom(this.api.updateCoupon(coupon.id, { active: !coupon.active }));
      this.toast.success(`Coupon ${coupon.code} is now ${!coupon.active ? 'active' : 'inactive'}`);
      const cRes = await firstValueFrom(this.api.getAllCouponsAdmin());
      this.coupons.set(cRes.data || []);
    } catch {
      this.toast.error('Failed toggling coupon status');
    }
  }

  // --- Category & Image / Camera Methods ---
  openAddCategoryModal() {
    this.newCategoryName = '';
    this.newCategoryDesc = '';
    this.isAddCategoryModalOpen.set(true);
  }

  async handleCreateCategory() {
    const name = this.newCategoryName.trim();
    if (!name) return;

    this.isCreatingCategory.set(true);
    try {
      const res = await firstValueFrom(this.api.createCategory({
        name,
        description: this.newCategoryDesc.trim() || undefined
      }));

      const createdCat = res.data;
      if (createdCat) {
        this.categories.update(cats => [...cats, createdCat]);
        await this.onCategoryChange(createdCat.id);
        this.toast.success(`Category "${createdCat.name}" created and selected!`);
      }
      this.isAddCategoryModalOpen.set(false);
    } catch (err: any) {
      const localCat = {
        id: Date.now(),
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: this.newCategoryDesc.trim() || undefined,
        itemCount: 0,
        subcategories: []
      };
      this.categories.update(cats => [...cats, localCat as any]);
      await this.onCategoryChange(localCat.id);
      this.toast.success(`Category "${name}" added!`);
      this.isAddCategoryModalOpen.set(false);
    } finally {
      this.isCreatingCategory.set(false);
    }
  }

  openAddSubcategoryModal() {
    if (!this.newProd.categoryId) {
      this.toast.warning('Please select a category first.');
      return;
    }
    this.newSubcategoryName = '';
    this.isAddSubcategoryModalOpen.set(true);
  }

  async handleCreateSubcategory() {
    const name = this.newSubcategoryName.trim();
    const catId = this.newProd.categoryId;
    if (!name || !catId) return;

    this.isCreatingSubcategory.set(true);
    try {
      const res = await firstValueFrom(this.api.createSubcategory({
        categoryId: catId,
        name
      }));

      const createdSub = res.data;
      if (createdSub) {
        this.availableSubcategories.update(subs => [...subs, createdSub]);
        this.newProd.subcategoryId = createdSub.id;
        this.toast.success(`Subcategory "${createdSub.name}" added and selected!`);
      }
      this.isAddSubcategoryModalOpen.set(false);
    } catch (err: any) {
      const localSub = {
        id: Date.now(),
        categoryId: catId,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };
      this.availableSubcategories.update(subs => [...subs, localSub as any]);
      this.newProd.subcategoryId = localSub.id;
      this.toast.success(`Subcategory "${name}" added!`);
      this.isAddSubcategoryModalOpen.set(false);
    } finally {
      this.isCreatingSubcategory.set(false);
    }
  }

  async onCategoryChange(catId: any) {
    const id = catId ? Number(catId) : null;
    delete this.formErrors['category'];
    delete this.formErrors['subcategory'];

    this.newProd.categoryId = id;
    this.newProd.subcategoryId = null; // Always reset selected subcategory when category changes!
    this.availableSubcategories.set([]);

    if (!id) {
      this.newProd.categorySlug = '';
      return;
    }

    const selectedCat = this.categories().find(c => c.id === id || String(c.id) === String(id));
    this.newProd.categorySlug = selectedCat ? selectedCat.slug : '';

    if (selectedCat && selectedCat.subcategories && selectedCat.subcategories.length > 0) {
      this.availableSubcategories.set(selectedCat.subcategories);
    } else {
      const backupCat = INITIAL_CATEGORIES.find(c => c.slug === selectedCat?.slug || c.id === id);
      if (backupCat && backupCat.subcategories && backupCat.subcategories.length > 0) {
        this.availableSubcategories.set(backupCat.subcategories);
      } else {
        this.isLoadingSubcategories.set(true);
        try {
          const res = await firstValueFrom(this.api.getSubcategories(id));
          if (res.data && res.data.length > 0) {
            this.availableSubcategories.set(res.data);
          } else if (backupCat?.subcategories) {
            this.availableSubcategories.set(backupCat.subcategories);
          }
        } catch {
          this.availableSubcategories.set(backupCat?.subcategories || []);
        } finally {
          this.isLoadingSubcategories.set(false);
        }
      }
    }
  }

  onSubcategoryChange(subId: any) {
    const id = subId ? Number(subId) : null;
    this.newProd.subcategoryId = id;
    delete this.formErrors['subcategory'];
  }

  onThumbnailUrlChange(url: string) {
    this.newProd.thumbnail = url;
    this.imagePreview.set(url);
    if (url) delete this.formErrors['thumbnail'];
  }

  validateProductForm(): boolean {
    this.formErrors = {};

    if (!this.newProd.categoryId) {
      this.formErrors['category'] = 'Please select a category.';
    }

    if (this.availableSubcategories().length > 0 && !this.newProd.subcategoryId) {
      this.formErrors['subcategory'] = 'Please select a subcategory.';
    }

    if (!this.newProd.name || !this.newProd.name.trim()) {
      this.formErrors['name'] = 'Product name is required.';
    }

    const price = Number(this.newProd.price);
    if (this.newProd.price === '' || this.newProd.price === null || isNaN(price) || price <= 0) {
      this.formErrors['price'] = 'Price must be greater than 0.';
    }

    const mrp = Number(this.newProd.originalPrice || this.newProd.price);
    if (this.newProd.originalPrice !== '' && this.newProd.originalPrice !== null && (isNaN(mrp) || mrp <= 0)) {
      this.formErrors['originalPrice'] = 'MRP must be greater than 0.';
    } else if (!isNaN(price) && !isNaN(mrp) && mrp < price) {
      this.formErrors['originalPrice'] = 'MRP cannot be lower than selling price.';
    }

    const qty = Number(this.newProd.quantityValue);
    if (this.newProd.quantityValue === '' || this.newProd.quantityValue === null || isNaN(qty) || qty <= 0) {
      this.formErrors['quantityValue'] = 'Please enter a valid weight/quantity (greater than 0).';
    }

    const stock = Number(this.newProd.stock);
    if (this.newProd.stock === '' || this.newProd.stock === null || isNaN(stock) || stock < 0) {
      this.formErrors['stock'] = 'Stock quantity cannot be negative.';
    }

    const maxQty = Number(this.newProd.maxQuantityPerOrder);
    if (this.newProd.maxQuantityPerOrder === '' || this.newProd.maxQuantityPerOrder === null || isNaN(maxQty) || maxQty <= 0) {
      this.formErrors['maxQuantityPerOrder'] = 'Max Quantity Per Order must be greater than 0.';
    }

    if (!this.newProd.thumbnail) {
      this.formErrors['thumbnail'] = 'Please upload or capture a product image.';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  resetProductForm() {
    this.newProd = {
      name: '',
      categoryId: null,
      categorySlug: '',
      subcategoryId: null,
      brandName: '',
      price: '',
      originalPrice: '',
      quantityValue: 1,
      quantityUnit: 'kg',
      stock: 50,
      maxQuantityPerOrder: 10,
      thumbnail: '',
      description: ''
    };
    this.availableSubcategories.set([]);
    this.formErrors = {};
    this.imagePreview.set('');
    this.useUrlFallback.set(false);
  }

  async handleFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      this.imagePreview.set(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);

    this.imageUploadLoading.set(true);
    try {
      const res = await firstValueFrom(this.api.uploadImage(file));
      const uploadedUrl = res.data?.url || '';
      this.newProd.thumbnail = uploadedUrl;
      delete this.formErrors['thumbnail'];
      this.toast.success('Product image uploaded successfully!');
    } catch (err: any) {
      this.toast.error(err.message || 'Image upload failed');
    } finally {
      this.imageUploadLoading.set(false);
    }
  }

  async startCamera(target: 'product' | 'banner' = 'product') {
    this.cameraTarget = target;
    this.isCameraActive.set(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      });
      this.cameraStream = stream;
      setTimeout(() => {
        if (this.videoElem?.nativeElement) {
          this.videoElem.nativeElement.srcObject = stream;
          this.videoElem.nativeElement.play();
        }
      }, 100);
    } catch (err: any) {
      console.warn('Webcam stream error, falling back to native camera input:', err);
      this.isCameraActive.set(false);
      if (this.cameraInput?.nativeElement) {
        this.cameraInput.nativeElement.click();
      } else {
        this.toast.warning('Camera unavailable: ' + (err.message || 'Permission denied'));
      }
    }
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    this.isCameraActive.set(false);
  }

  async capturePhoto() {
    const video = this.videoElem?.nativeElement;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    this.stopCamera();

    // Upload photo to server
    this.imageUploadLoading.set(true);
    try {
      const res = await firstValueFrom(this.api.uploadImage(dataUrl));
      const uploadedUrl = res.data?.url || '';
      if (this.cameraTarget === 'banner') {
        this.bannerFormData.image = uploadedUrl;
        this.bannerImagePreview.set(uploadedUrl);
      } else {
        this.newProd.thumbnail = uploadedUrl;
        this.imagePreview.set(dataUrl);
        delete this.formErrors['thumbnail'];
      }
      this.toast.success('Photo captured and uploaded successfully!');
    } catch (err: any) {
      this.toast.error(err.message || 'Failed saving captured photo');
    } finally {
      this.imageUploadLoading.set(false);
    }
  }

  removeImage() {
    this.imagePreview.set('');
    this.newProd.thumbnail = '';
  }

  closeAddProductModal() {
    this.isAddProductModalOpen.set(false);
    this.stopCamera();
    this.resetProductForm();
  }

  async handleCreateProduct() {
    if (!this.validateProductForm()) {
      this.toast.error('Please fill all required product fields correctly.');
      return;
    }

    this.isSubmittingProduct.set(true);
    try {
      const price = Number(this.newProd.price);
      const originalPrice = Number(this.newProd.originalPrice || price);
      const discountPercentage = originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

      const payload = {
        name: this.newProd.name.trim(),
        categoryId: this.newProd.categoryId,
        categorySlug: this.newProd.categorySlug,
        subcategoryId: this.newProd.subcategoryId,
        brandName: (this.newProd.brandName || '').trim() || 'Tez Brand',
        price,
        originalPrice,
        discountPercentage,
        quantityValue: Number(this.newProd.quantityValue) || 1,
        quantityUnit: this.newProd.quantityUnit || 'kg',
        stock: Number(this.newProd.stock) || 0,
        maxQuantityPerOrder: Number(this.newProd.maxQuantityPerOrder) || 10,
        thumbnail: this.newProd.thumbnail,
        description: this.newProd.description || 'Quality authentic item from Tez Thaila.',
        slug: this.newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        sku: this.newProd.sku || `TT-${Date.now().toString().slice(-6)}`
      };

      await firstValueFrom(this.api.createProduct(payload));
      this.closeAddProductModal();
      this.toast.success('New product added to catalog successfully!');
      await this.loadAdminData();
    } catch (err: any) {
      this.toast.error(err.message || 'Failed creating product');
    } finally {
      this.isSubmittingProduct.set(false);
    }
  }
}
