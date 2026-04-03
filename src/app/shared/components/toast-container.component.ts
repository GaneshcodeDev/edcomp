import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type" (click)="toastService.remove(toast.id)">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <i class="bi bi-check-circle-fill"></i> }
              @case ('error') { <i class="bi bi-x-circle-fill"></i> }
              @case ('warning') { <i class="bi bi-exclamation-triangle-fill"></i> }
              @case ('info') { <i class="bi bi-info-circle-fill"></i> }
            }
          </div>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.remove(toast.id)">
            <i class="bi bi-x"></i>
          </button>
          <div class="toast-progress" [style.animation-duration]="toast.duration + 'ms'"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      display: flex; flex-direction: column; gap: 10px;
      max-width: 420px; width: 100%;
    }

    .toast-item {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; border-radius: 14px;
      background: white; color: #1f2937;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
      animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer; position: relative; overflow: hidden;
      font-size: 14px; font-weight: 500;
      transition: transform 0.2s, opacity 0.2s;
    }
    .toast-item:hover { transform: translateX(-4px); }

    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .toast-icon { font-size: 20px; flex-shrink: 0; }
    .toast-message { flex: 1; line-height: 1.4; }

    .toast-close {
      background: none; border: none; padding: 2px 4px;
      color: #9ca3af; cursor: pointer; font-size: 18px;
      flex-shrink: 0; transition: color 0.2s;
    }
    .toast-close:hover { color: #374151; }

    .toast-progress {
      position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
      border-radius: 0 0 14px 14px;
      animation: progress linear forwards;
    }
    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Type variants */
    .toast-success .toast-icon { color: #10B981; }
    .toast-success .toast-progress { background: #10B981; }
    .toast-success { border-left: 4px solid #10B981; }

    .toast-error .toast-icon { color: #EF4444; }
    .toast-error .toast-progress { background: #EF4444; }
    .toast-error { border-left: 4px solid #EF4444; }

    .toast-warning .toast-icon { color: #F59E0B; }
    .toast-warning .toast-progress { background: #F59E0B; }
    .toast-warning { border-left: 4px solid #F59E0B; }

    .toast-info .toast-icon { color: #3B82F6; }
    .toast-info .toast-progress { background: #3B82F6; }
    .toast-info { border-left: 4px solid #3B82F6; }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
