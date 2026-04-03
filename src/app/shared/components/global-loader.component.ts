import { Component, inject } from '@angular/core';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  template: `
    @if (loaderService.isLoading()) {
      <div class="loader-overlay">
        <div class="loader-content">
          <div class="loader-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <p class="loader-text">Loading...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .loader-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(255,255,255,0.45); backdrop-filter: blur(2px);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

    .loader-content {
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      background: white; padding: 32px 48px; border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(79,70,229,0.08);
    }

    .loader-spinner {
      width: 48px; height: 48px; position: relative;
    }

    .spinner-ring {
      position: absolute; inset: 0;
      border: 3px solid transparent;
      border-radius: 50%;
    }
    .spinner-ring:nth-child(1) {
      border-top-color: #4F46E5;
      animation: spin 1s linear infinite;
    }
    .spinner-ring:nth-child(2) {
      inset: 4px;
      border-right-color: #7C3AED;
      animation: spin 1.5s linear infinite reverse;
    }
    .spinner-ring:nth-child(3) {
      inset: 8px;
      border-bottom-color: #06B6D4;
      animation: spin 2s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg) } }

    .loader-text {
      margin: 0; font-size: 13px; font-weight: 600;
      color: #6b7280; letter-spacing: 0.5px;
    }
  `]
})
export class GlobalLoaderComponent {
  loaderService = inject(LoaderService);
}
