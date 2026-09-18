import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';
import { Address } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    @if (user()) {
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <!-- Profile Header -->
        <div class="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <img
              [src]="user()?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'"
              [alt]="user()?.name"
              class="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm"
            />
            <div>
              <div class="flex items-center space-x-2">
                <h1 class="text-xl font-black text-gray-900">{{ user()?.name }}</h1>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 uppercase">
                  {{ user()?.role }}
                </span>
              </div>
              <p class="text-xs text-gray-500">{{ user()?.email }}</p>
              <p class="text-xs text-gray-600 font-medium mt-0.5">{{ user()?.phone || '+91 98765 43211' }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <button
              (click)="isEditingProfile.set(!isEditingProfile())"
              class="px-3.5 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <i class="pi pi-user-edit text-brand-600"></i>
              <span>Edit Profile</span>
            </button>
            <button
              (click)="authService.logout('/')"
              class="px-3.5 py-2 border border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-bold text-rose-600 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <i class="pi pi-sign-out"></i>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <!-- Edit Profile Form -->
        @if (isEditingProfile()) {
          <div class="bg-white p-6 rounded-3xl border border-brand-200 shadow-sm space-y-4">
            <h3 class="font-bold text-sm text-gray-900">Update Profile Details</h3>
            <form (ngSubmit)="handleUpdateProfile()" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label class="font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  [(ngModel)]="profileName"
                  name="profileName"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label class="font-bold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  [(ngModel)]="profilePhone"
                  name="profilePhone"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>
              <div class="sm:col-span-2 flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  (click)="isEditingProfile.set(false)"
                  class="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Quick Navigation Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            routerLink="/orders"
            class="p-5 bg-white rounded-2xl border border-gray-200/80 hover:border-brand-300 shadow-xs flex items-center space-x-4 transition-colors"
          >
            <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <i class="pi pi-box text-2xl"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Your Orders &amp; Tracking</h4>
              <p class="text-xs text-gray-500">Track shipments, cancel or request returns</p>
            </div>
          </a>

          <a
            routerLink="/wishlist"
            class="p-5 bg-white rounded-2xl border border-gray-200/80 hover:border-brand-300 shadow-xs flex items-center space-x-4 transition-colors"
          >
            <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <i class="pi pi-heart text-2xl"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Saved Wishlist</h4>
              <p class="text-xs text-gray-500">View saved products and price drops</p>
            </div>
          </a>
        </div>

        <!-- SAVED ADDRESSES SECTION -->
        <div class="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div class="flex justify-between items-center pb-3 border-b border-gray-100">
            <div class="flex items-center space-x-2">
              <i class="pi pi-map-marker text-brand-600 text-base"></i>
              <h3 class="text-sm font-bold text-gray-900">Saved Delivery Addresses</h3>
            </div>

            <button
              (click)="isNewAddressModalOpen.set(true)"
              class="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <i class="pi pi-plus text-xs"></i>
              <span>Add Address</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @for (addr of addresses(); track addr.id) {
              <div class="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between space-y-3">
                <div>
                  <div class="flex justify-between items-start mb-1">
                    <span class="text-xs font-bold text-gray-900">{{ addr.fullName }}</span>
                    @if (addr.isDefault) {
                      <span class="text-[10px] font-bold bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    }
                  </div>
                  <p class="text-xs text-gray-600 leading-relaxed">
                    {{ addr.house }}, {{ addr.street }}, {{ addr.area }}, {{ addr.city }}, {{ addr.state }} - {{ addr.pincode }}
                  </p>
                  @if (addr.landmark) {
                    <p class="text-[11px] text-gray-400 mt-0.5">Landmark: {{ addr.landmark }}</p>
                  }
                  <p class="text-xs font-bold text-gray-800 mt-2">Ph: {{ addr.phone }}</p>
                </div>

                <div class="pt-2 border-t border-gray-200/70 flex justify-end">
                  <button
                    (click)="handleDeleteAddress(addr.id)"
                    class="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center cursor-pointer"
                  >
                    <i class="pi pi-trash text-xs mr-1"></i>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- NEW ADDRESS MODAL -->
        @if (isNewAddressModalOpen()) {
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 class="font-bold text-gray-900 text-sm">Add New Address</h3>
                <button (click)="isNewAddressModalOpen.set(false)" class="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i class="pi pi-times text-base"></i>
                </button>
              </div>

              <form (ngSubmit)="handleAddAddress()" class="space-y-3 text-xs">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="font-bold text-gray-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      [(ngModel)]="newAddr.fullName"
                      name="fullName"
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label class="font-bold text-gray-700 block mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      [(ngModel)]="newAddr.phone"
                      name="phone"
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label class="font-bold text-gray-700 block mb-1">House / Flat / Apartment</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="newAddr.house"
                    name="house"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label class="font-bold text-gray-700 block mb-1">Street &amp; Area</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="newAddr.street"
                    name="street"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="font-bold text-gray-700 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      [(ngModel)]="newAddr.city"
                      name="city"
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label class="font-bold text-gray-700 block mb-1">State</label>
                    <input
                      type="text"
                      required
                      [(ngModel)]="newAddr.state"
                      name="state"
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label class="font-bold text-gray-700 block mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      maxlength="6"
                      [(ngModel)]="newAddr.pincode"
                      name="pincode"
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div class="flex gap-2 pt-2">
                  <button
                    type="button"
                    (click)="isNewAddressModalOpen.set(false)"
                    class="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class AccountPageComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;
  readonly addresses = signal<Address[]>([]);
  readonly isEditingProfile = signal<boolean>(false);
  readonly isNewAddressModalOpen = signal<boolean>(false);

  profileName = '';
  profilePhone = '';

  newAddr: Partial<Address> = {
    fullName: '',
    phone: '',
    house: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    landmark: ''
  };

  async ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    const currentUser = this.user();
    if (currentUser) {
      this.profileName = currentUser.name || '';
      this.profilePhone = currentUser.phone || '';
      this.newAddr.fullName = currentUser.name || '';
      this.newAddr.phone = currentUser.phone || '';
    }

    await this.loadAddresses();
  }

  async loadAddresses() {
    try {
      const res = await firstValueFrom(this.api.getAddresses());
      this.addresses.set(res.data || []);
    } catch (err) {
      console.error('Failed loading addresses', err);
    }
  }

  async handleUpdateProfile() {
    try {
      await firstValueFrom(this.api.updateProfile({ name: this.profileName, phone: this.profilePhone }));
      this.authService.updateUser({ name: this.profileName, phone: this.profilePhone });
      this.isEditingProfile.set(false);
      this.toast.success('Profile details updated successfully');
    } catch (err: any) {
      this.toast.error(err.message || 'Update failed');
    }
  }

  async handleAddAddress() {
    try {
      const res = await firstValueFrom(this.api.createAddress(this.newAddr));
      if (res.data) {
        this.addresses.set([...this.addresses(), res.data]);
      }
      this.isNewAddressModalOpen.set(false);
      this.toast.success('New delivery address saved');
    } catch (err: any) {
      this.toast.error(err.message || 'Failed saving address');
    }
  }

  async handleDeleteAddress(id: number) {
    try {
      await firstValueFrom(this.api.deleteAddress(id));
      this.addresses.set(this.addresses().filter(a => a.id !== id));
      this.toast.success('Address deleted');
    } catch (err: any) {
      this.toast.error(err.message || 'Failed deleting address');
    }
  }
}
