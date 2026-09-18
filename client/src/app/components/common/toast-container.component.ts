import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4">
      @for (t of toastService.toasts(); track t.id) {
        <div
          class="pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 transform translate-y-0"
          [ngClass]="{
            'bg-rose-900 text-rose-100 border-rose-700': t.type === 'error',
            'bg-sky-900 text-sky-100 border-sky-700': t.type === 'info',
            'bg-amber-900 text-amber-100 border-amber-700': t.type === 'warning',
            'bg-emerald-950 text-emerald-100 border-emerald-800': t.type === 'success'
          }"
        >
          <div class="flex items-center space-x-2.5">
            @if (t.type === 'error') {
              <i class="pi pi-exclamation-circle text-rose-400 text-lg flex-shrink-0"></i>
            } @else if (t.type === 'info') {
              <i class="pi pi-info-circle text-sky-400 text-lg flex-shrink-0"></i>
            } @else if (t.type === 'warning') {
              <i class="pi pi-exclamation-triangle text-amber-400 text-lg flex-shrink-0"></i>
            } @else {
              <i class="pi pi-check-circle text-emerald-400 text-lg flex-shrink-0"></i>
            }
            <span class="leading-snug">{{ t.message }}</span>
          </div>
          <button
            (click)="toastService.remove(t.id)"
            class="ml-3 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
