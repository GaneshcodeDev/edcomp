import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (visible) {
      <div class="dialog-backdrop" (click)="onCancel()" [@fadeIn]>
        <div class="dialog-modal" (click)="$event.stopPropagation()">
          <div class="dialog-icon-wrap" [class]="'icon-' + type">
            @switch (type) {
              @case ('danger') { <i class="bi bi-exclamation-triangle"></i> }
              @case ('warning') { <i class="bi bi-exclamation-circle"></i> }
              @case ('info') { <i class="bi bi-info-circle"></i> }
            }
          </div>
          <h4 class="dialog-title">{{ title }}</h4>
          <p class="dialog-message">{{ message }}</p>
          <div class="dialog-actions">
            <button class="btn btn-outline-secondary btn-cancel" (click)="onCancel()">{{ cancelText }}</button>
            <button class="btn" [class]="confirmBtnClass" (click)="onConfirm()">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
      z-index: 10000; animation: fadeIn 0.2s ease;
    }
    .dialog-modal {
      background: var(--bg-card, #fff); border-radius: 16px;
      padding: 32px; max-width: 420px; width: 90%;
      text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: slideUp 0.25s ease;
    }
    .dialog-icon-wrap {
      width: 60px; height: 60px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; margin: 0 auto 16px;
    }
    .icon-danger { background: rgba(239,68,68,0.1); color: #EF4444; }
    .icon-warning { background: rgba(245,158,11,0.1); color: #F59E0B; }
    .icon-info { background: rgba(6,182,212,0.1); color: #06B6D4; }
    .dialog-title {
      font-size: 18px; font-weight: 700;
      color: var(--text-primary, #111827); margin: 0 0 8px;
    }
    .dialog-message {
      font-size: 14px; color: var(--text-secondary, #6b7280);
      margin: 0 0 24px; line-height: 1.5;
    }
    .dialog-actions { display: flex; gap: 12px; justify-content: center; }
    .dialog-actions .btn {
      padding: 10px 24px; border-radius: 10px; font-weight: 500; font-size: 14px;
      min-width: 110px;
    }
    .btn-cancel { border-color: var(--border-color, #d1d5db); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
  `]
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() type: 'danger' | 'warning' | 'info' = 'warning';
  @Input() visible = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get confirmBtnClass(): string {
    switch (this.type) {
      case 'danger': return 'btn-danger';
      case 'warning': return 'btn-warning';
      case 'info': return 'btn-info';
    }
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
