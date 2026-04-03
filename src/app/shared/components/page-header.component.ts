import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (breadcrumbs && breadcrumbs.length) {
      <nav class="breadcrumb-nav">
        @for (crumb of breadcrumbs; track crumb.label; let last = $last) {
          @if (crumb.route && !last) {
            <a [routerLink]="crumb.route" class="breadcrumb-link">{{ crumb.label }}</a>
          } @else {
            <span class="breadcrumb-current">{{ crumb.label }}</span>
          }
          @if (!last) {
            <i class="bi bi-chevron-right breadcrumb-sep"></i>
          }
        }
      </nav>
    }
    <div class="header-row">
      <div class="header-text">
        <h1 class="header-title">{{ title }}</h1>
        @if (subtitle) {
          <p class="header-subtitle">{{ subtitle }}</p>
        }
      </div>
      @if (actions && actions.length) {
        <div class="header-actions">
          @for (act of actions; track act.action) {
            <button [class]="act.class || 'btn btn-primary'" (click)="actionClick.emit(act.action)">
              @if (act.icon) { <i class="bi" [class]="act.icon"></i> }
              {{ act.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding-bottom: 20px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }
    .breadcrumb-nav {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 8px; font-size: 13px;
    }
    .breadcrumb-link {
      color: var(--primary, #4F46E5); text-decoration: none; font-weight: 500;
      transition: opacity 0.15s;
    }
    .breadcrumb-link:hover { opacity: 0.8; }
    .breadcrumb-sep { font-size: 10px; color: var(--text-secondary, #9ca3af); }
    .breadcrumb-current { color: var(--text-secondary, #6b7280); }
    .header-row {
      display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;
    }
    .header-title {
      font-size: 26px; font-weight: 700; margin: 0;
      color: var(--text-primary, #111827); letter-spacing: -0.3px;
    }
    .header-subtitle {
      font-size: 14px; color: var(--text-secondary, #6b7280);
      margin: 4px 0 0;
    }
    .header-actions { display: flex; gap: 10px; }
    .header-actions .btn {
      display: flex; align-items: center; gap: 6px; font-size: 14px;
      border-radius: 8px; padding: 8px 18px; font-weight: 500;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs?: { label: string; route?: string }[];
  @Input() actions?: { label: string; icon?: string; class?: string; action: string }[];
  @Output() actionClick = new EventEmitter<string>();
}
