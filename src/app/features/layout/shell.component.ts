import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { TenantService } from '../../core/services/tenant.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-shell" [class.sidebar-collapsed]="sidebarCollapsed">
      <app-sidebar [class.collapsed]="sidebarCollapsed" />
      <div class="main-wrapper">
        <app-header [sidebarCollapsed]="sidebarCollapsed" (toggleSidebar)="sidebarCollapsed = !sidebarCollapsed" />
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; min-height: 100vh; }
    .main-wrapper {
      flex: 1; margin-left: 260px;
      transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .sidebar-collapsed .main-wrapper { margin-left: 72px; }
    .main-content {
      padding: 24px; min-height: calc(100vh - 64px);
      background: var(--bg-primary, #f9fafb);
    }

    /* Responsive */
    @media (max-width: 992px) {
      .main-wrapper { margin-left: 0 !important; }
      app-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        z-index: 1100;
      }
      .app-shell:not(.sidebar-collapsed) app-sidebar { transform: translateX(0); }
      .sidebar-collapsed app-sidebar { transform: translateX(-100%); }
    }
  `]
})
export class ShellComponent implements OnInit {
  private tenantService = inject(TenantService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  sidebarCollapsed = false;

  ngOnInit(): void {
    // Load tenants for super_admin (dropdown); set active tenant for all roles
    if (this.authService.hasRole(['super_admin'])) {
      this.tenantService.loadTenants().subscribe();
    } else {
      // Non-super-admin: set their own tenant as active
      const user = this.authService.currentUser();
      if (user?.tenantId) {
        localStorage.setItem('active_tenant_id', user.tenantId);
      }
    }
    this.themeService.loadTheme();
  }
}
