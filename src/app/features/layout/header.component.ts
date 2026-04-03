import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="top-header">
      <!-- Left: Hamburger -->
      <div class="header-left">
        <button class="hamburger-btn" (click)="toggleSidebar.emit()">
          <i class="bi bi-list"></i>
        </button>

        <!-- Tenant Selector (super_admin only) -->
        @if (authService.hasRole(['super_admin'])) {
          <div class="tenant-selector">
            <select class="form-select" [value]="tenantService.activeTenant()?.id || ''" (change)="onTenantChange($event)">
              @for (t of tenantService.tenants(); track t.id) {
                <option [value]="t.id">{{ t.name }}</option>
              }
            </select>
          </div>
        }
      </div>

      <!-- Right -->
      <div class="header-right">
        <!-- Theme Toggle -->
        <button class="icon-btn" (click)="themeService.toggleMode()" [title]="themeService.currentTheme().mode === 'light' ? 'Dark mode' : 'Light mode'">
          @if (themeService.currentTheme().mode === 'light') {
            <i class="bi bi-moon"></i>
          } @else {
            <i class="bi bi-sun"></i>
          }
        </button>

        <!-- Notifications -->
        <button class="icon-btn notification-btn">
          <i class="bi bi-bell"></i>
          <span class="notif-badge">3</span>
        </button>

        <!-- User Dropdown -->
        <div class="user-dropdown">
          <button class="user-btn" (click)="showDropdown.set(!showDropdown())">
            <div class="header-avatar">{{ userInitials() }}</div>
            <span class="user-name-text">{{ authService.currentUser()?.fullName }}</span>
            <i class="bi bi-chevron-down" style="font-size: 11px;"></i>
          </button>
          @if (showDropdown()) {
            <div class="dropdown-menu-custom show">
              <div class="dropdown-header-info">
                <strong>{{ authService.currentUser()?.fullName }}</strong>
                <span>{{ authService.currentUser()?.email }}</span>
              </div>
              <hr class="dropdown-divider" />
              <button class="dropdown-item-custom" (click)="onLogout()">
                <i class="bi bi-box-arrow-left"></i> Sign Out
              </button>
            </div>
          }
        </div>
      </div>
    </header>

    <!-- Backdrop for dropdown -->
    @if (showDropdown()) {
      <div class="dropdown-backdrop" (click)="showDropdown.set(false)"></div>
    }
  `,
  styles: [`
    .top-header {
      height: 64px; position: sticky; top: 0; z-index: 900;
      background: var(--bg-secondary, #fff);
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px;
      box-shadow: 0 1px 3px var(--shadow-color, rgba(0,0,0,0.04));
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .hamburger-btn {
      width: 38px; height: 38px; border-radius: 10px;
      border: 1px solid var(--border-color, #e5e7eb);
      background: var(--bg-card, #fff); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; color: var(--text-primary, #374151);
      transition: all 0.15s;
    }
    .hamburger-btn:hover { background: var(--bg-primary, #f3f4f6); }
    .tenant-selector .form-select {
      border-radius: 8px; font-size: 13px; font-weight: 500;
      border: 1px solid var(--border-color, #e5e7eb);
      padding: 6px 32px 6px 12px; min-width: 180px;
      color: var(--text-primary, #374151);
    }
    .header-right { display: flex; align-items: center; gap: 8px; }
    .icon-btn {
      width: 38px; height: 38px; border-radius: 10px;
      border: none; background: transparent; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: var(--text-secondary, #6b7280);
      transition: all 0.15s; position: relative;
    }
    .icon-btn:hover { background: var(--bg-primary, #f3f4f6); color: var(--text-primary, #374151); }
    .notification-btn { position: relative; }
    .notif-badge {
      position: absolute; top: 4px; right: 4px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #EF4444; color: #fff; font-size: 10px;
      display: flex; align-items: center; justify-content: center; font-weight: 700;
      border: 2px solid var(--bg-secondary, #fff);
    }
    .user-dropdown { position: relative; }
    .user-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 12px; border-radius: 10px; border: none;
      background: transparent; cursor: pointer; transition: all 0.15s;
      color: var(--text-primary, #374151);
    }
    .user-btn:hover { background: var(--bg-primary, #f3f4f6); }
    .header-avatar {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
    }
    .user-name-text { font-size: 13px; font-weight: 600; }
    .dropdown-menu-custom {
      position: absolute; right: 0; top: calc(100% + 8px);
      background: var(--bg-card, #fff); border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      min-width: 220px; padding: 8px; z-index: 1001;
      animation: fadeDown 0.15s ease;
    }
    .dropdown-header-info {
      padding: 10px 12px; display: flex; flex-direction: column;
    }
    .dropdown-header-info strong { font-size: 14px; color: var(--text-primary, #111827); }
    .dropdown-header-info span { font-size: 12px; color: var(--text-secondary, #6b7280); }
    .dropdown-divider { margin: 4px 0; border-color: var(--border-color, #e5e7eb); }
    .dropdown-item-custom {
      display: flex; align-items: center; gap: 8px; width: 100%;
      padding: 10px 12px; border: none; background: none; border-radius: 8px;
      font-size: 13px; color: var(--text-primary, #374151); cursor: pointer;
      transition: background 0.15s;
    }
    .dropdown-item-custom:hover { background: rgba(239,68,68,0.06); color: #EF4444; }
    .dropdown-backdrop { position: fixed; inset: 0; z-index: 899; }
    @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class HeaderComponent {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  tenantService = inject(TenantService);
  themeService = inject(ThemeService);
  private toast = inject(ToastService);
  private router = inject(Router);

  showDropdown = signal(false);

  userInitials(): string {
    const name = this.authService.currentUser()?.fullName || '';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  onTenantChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.tenantService.setActiveTenant(id);
    const tenant = this.tenantService.activeTenant();
    this.toast.info(`Switched to ${tenant?.name || id}`);
    // Force reload current page with new tenant data
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(currentUrl);
    });
  }

  onLogout() {
    this.showDropdown.set(false);
    this.toast.success('Logged out successfully');
    this.authService.logout();
  }
}
