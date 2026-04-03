import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { ConfigurationService } from '../../core/services/configuration.service';
import { MenuItem, UserRole } from '../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.compact]="isCompact()">
      <!-- Logo -->
      <div class="sidebar-logo">
        @if (!isCompact()) {
          <i class="bi bi-calendar-check logo-icon"></i>
          <span class="logo-text">AttendEase</span>
        } @else {
          <i class="bi bi-calendar-check logo-icon-compact"></i>
        }
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        @for (item of visibleMenu(); track item.id) {
          @if (item.children && item.children.length > 0 && !isCompact()) {
            <div class="nav-group">
              <button class="nav-item" [class.active]="isGroupActive(item)" (click)="toggleGroup(item.id)">
                <i class="bi" [class]="item.icon"></i>
                <span class="nav-label">{{ item.label }}</span>
                <i class="bi bi-chevron-down expand-icon" [class.rotated]="expandedGroups().has(item.id)"></i>
              </button>
              @if (expandedGroups().has(item.id)) {
                <div class="nav-children">
                  @for (child of item.children; track child.id) {
                    @if (isChildVisible(child)) {
                      <a class="nav-child" [routerLink]="child.route" routerLinkActive="active">
                        <span class="child-dot"></span>
                        <span>{{ child.label }}</span>
                      </a>
                    }
                  }
                </div>
              }
            </div>
          } @else {
            <a class="nav-item" [routerLink]="item.route || (item.children?.[0]?.route)" routerLinkActive="active"
               [title]="isCompact() ? item.label : ''">
              <i class="bi" [class]="item.icon"></i>
              @if (!isCompact()) { <span class="nav-label">{{ item.label }}</span> }
            </a>
          }
        }
      </nav>

      <!-- Compact Toggle -->
      <div class="sidebar-toggle">
        <button class="toggle-btn" (click)="isCompact.set(!isCompact())">
          <i class="bi" [class.bi-chevron-double-left]="!isCompact()" [class.bi-chevron-double-right]="isCompact()"></i>
        </button>
      </div>

      <!-- User -->
      <div class="sidebar-user">
        @if (!isCompact()) {
          <div class="user-avatar">{{ userInitials() }}</div>
          <div class="user-info">
            <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
            <span class="user-role">{{ formatRole(authService.currentUser()?.role) }}</span>
          </div>
          <button class="logout-btn" (click)="onLogout()" title="Logout">
            <i class="bi bi-box-arrow-left"></i>
          </button>
        } @else {
          <div class="user-avatar compact-avatar" (click)="onLogout()" title="Logout">{{ userInitials() }}</div>
        }
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px; height: 100vh; position: fixed; top: 0; left: 0; z-index: 1000;
      background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
      display: flex; flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden;
    }
    .sidebar.compact { width: 72px; }

    /* Logo */
    .sidebar-logo {
      padding: 20px; display: flex; align-items: center; gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08); min-height: 64px;
    }
    .logo-icon { font-size: 26px; color: #818CF8; }
    .logo-icon-compact { font-size: 24px; color: #818CF8; margin: 0 auto; }
    .logo-text { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.3px; white-space: nowrap; }

    /* Nav */
    .sidebar-nav {
      flex: 1; overflow-y: auto; padding: 12px 8px;
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
    }
    .sidebar-nav::-webkit-scrollbar { width: 4px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; margin: 2px 0; border-radius: 10px;
      color: rgba(255,255,255,0.6); text-decoration: none;
      font-size: 14px; font-weight: 500; cursor: pointer;
      transition: all 0.2s ease; border: none; background: none; width: 100%; text-align: left;
      white-space: nowrap; position: relative;
    }
    .nav-item:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.06); }
    .nav-item.active {
      color: #fff; background: rgba(99,102,241,0.2);
      box-shadow: inset 3px 0 0 0 #818CF8;
    }
    .nav-item .bi { font-size: 18px; min-width: 20px; text-align: center; }
    .expand-icon { margin-left: auto; font-size: 12px; transition: transform 0.2s; }
    .expand-icon.rotated { transform: rotate(180deg); }

    .nav-children { padding: 2px 0 2px 20px; overflow: hidden; animation: slideDown 0.2s ease; }
    .nav-child {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 14px; color: rgba(255,255,255,0.5); text-decoration: none;
      font-size: 13px; border-radius: 8px; transition: all 0.15s;
    }
    .nav-child:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.04); }
    .nav-child.active { color: #818CF8; background: rgba(99,102,241,0.1); }
    .child-dot {
      width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.6;
    }

    /* Toggle */
    .sidebar-toggle { padding: 4px 8px; }
    .toggle-btn {
      width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5);
      cursor: pointer; transition: all 0.2s; font-size: 14px;
    }
    .toggle-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }

    /* User */
    .sidebar-user {
      padding: 16px; display: flex; align-items: center; gap: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .user-avatar {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0;
    }
    .compact-avatar { margin: 0 auto; cursor: pointer; border-radius: 50%; }
    .user-info { flex: 1; overflow: hidden; }
    .user-name {
      display: block; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .user-role { font-size: 11px; color: rgba(255,255,255,0.45); text-transform: capitalize; }
    .logout-btn {
      background: none; border: none; color: rgba(255,255,255,0.4);
      cursor: pointer; padding: 6px; border-radius: 6px; font-size: 16px;
      transition: all 0.15s;
    }
    .logout-btn:hover { color: #EF4444; background: rgba(239,68,68,0.1); }

    @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 300px; } }

    /* Compact overrides */
    .compact .nav-item { justify-content: center; padding: 12px; }
    .compact .sidebar-logo { justify-content: center; padding: 20px 8px; }
    .compact .sidebar-nav { padding: 12px 6px; }
  `]
})
export class SidebarComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private tenantService = inject(TenantService);
  private configService = inject(ConfigurationService);

  isCompact = signal(false);
  expandedGroups = signal<Set<string>>(new Set());
  activeModules = signal<string[]>([]);

  private initialized = false;

  constructor() {
    // Reload modules when tenant changes (skip first run, ngOnInit handles it)
    effect(() => {
      this.tenantService.activeTenant(); // track signal
      if (this.initialized) {
        this.loadActiveModules();
      }
    });
  }

  ngOnInit(): void {
    this.loadActiveModules();
    this.initialized = true;
  }

  private loadActiveModules(): void {
    if (!this.authService.isAuthenticated()) return;
    this.configService.getActiveModules().subscribe({
      next: modules => this.activeModules.set(modules),
      error: () => this.activeModules.set([]),
    });
  }

  // moduleCode maps menu items to modules for visibility filtering
  private menuModuleMap: Record<string, string> = {
    employees: 'employees',
    attendance: 'attendance',
    shifts: 'attendance',
    masters: 'masters',
    reports: 'reports',
    offboarding: 'offboarding',
    // config, dashboard, settings have no module restriction
  };

  private menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard', roles: ['super_admin','tenant_admin','hr_manager','employee'], order: 1, isActive: true },
    { id: 'employees', label: 'Employees', icon: 'bi-people', roles: ['super_admin','tenant_admin','hr_manager'], order: 2, isActive: true, children: [
      { id: 'emp-list', label: 'Employee List', icon: '', route: '/employees/list', roles: ['super_admin','tenant_admin','hr_manager'], order: 1, isActive: true },
      { id: 'emp-add', label: 'Add Employee', icon: '', route: '/employees/add', roles: ['super_admin','tenant_admin','hr_manager'], order: 2, isActive: true },
    ]},
    { id: 'attendance', label: 'Attendance', icon: 'bi-calendar-check', roles: ['super_admin','tenant_admin','hr_manager','employee'], order: 3, isActive: true, children: [
      { id: 'att-daily', label: 'Daily Monitoring', icon: '', route: '/attendance/daily-monitoring', roles: ['super_admin','tenant_admin','hr_manager'], order: 1, isActive: true },
      { id: 'att-manual', label: 'Manual Entry', icon: '', route: '/attendance/manual-entry', roles: ['super_admin','tenant_admin','hr_manager'], order: 2, isActive: true },
      { id: 'att-punch', label: 'Punch Logs', icon: '', route: '/attendance/punch-logs', roles: ['super_admin','tenant_admin','hr_manager'], order: 3, isActive: true },
      { id: 'att-my', label: 'My Attendance', icon: '', route: '/attendance/daily-monitoring', roles: ['employee'], order: 4, isActive: true },
    ]},
    { id: 'shifts', label: 'Shifts & Holidays', icon: 'bi-clock', roles: ['super_admin','tenant_admin','hr_manager'], order: 4, isActive: true, children: [
      { id: 'shift-mgmt', label: 'Shift Management', icon: '', route: '/shifts/management', roles: ['super_admin','tenant_admin','hr_manager'], order: 1, isActive: true },
      { id: 'shift-roster', label: 'Shift Roster', icon: '', route: '/shifts/roster', roles: ['super_admin','tenant_admin','hr_manager'], order: 2, isActive: true },
      { id: 'holidays', label: 'Holiday Master', icon: '', route: '/shifts/holidays', roles: ['super_admin','tenant_admin','hr_manager'], order: 3, isActive: true },
    ]},
    { id: 'config', label: 'Configuration', icon: 'bi-gear', roles: ['super_admin'], order: 5, isActive: true, children: [
      { id: 'cfg-tenant', label: 'Tenant Management', icon: '', route: '/configuration/tenants', roles: ['super_admin'], order: 1, isActive: true },
      { id: 'cfg-roles', label: 'Role Management', icon: '', route: '/configuration/roles', roles: ['super_admin'], order: 2, isActive: true },
      { id: 'cfg-menus', label: 'Menu Management', icon: '', route: '/configuration/menus', roles: ['super_admin'], order: 3, isActive: true },
      { id: 'cfg-modules', label: 'Module Management', icon: '', route: '/configuration/modules', roles: ['super_admin'], order: 4, isActive: true },
      { id: 'cfg-logs', label: 'Activity Logs', icon: '', route: '/configuration/activity-logs', roles: ['super_admin', 'tenant_admin'], order: 5, isActive: true },
    ]},
    { id: 'masters', label: 'Masters', icon: 'bi-database', roles: ['super_admin','tenant_admin'], order: 6, isActive: true, children: [
      { id: 'mst-dept', label: 'Departments', icon: '', route: '/masters/departments', roles: ['super_admin','tenant_admin'], order: 1, isActive: true },
      { id: 'mst-desg', label: 'Designations', icon: '', route: '/masters/designations', roles: ['super_admin','tenant_admin'], order: 2, isActive: true },
    ]},
    { id: 'reports', label: 'Reports', icon: 'bi-file-earmark-bar-graph', route: '/reports', roles: ['super_admin','tenant_admin','hr_manager'], order: 7, isActive: true },
    { id: 'offboarding', label: 'Offboarding', icon: 'bi-box-arrow-right', route: '/offboarding', roles: ['super_admin','tenant_admin','hr_manager'], order: 8, isActive: true },
    { id: 'settings', label: 'Settings', icon: 'bi-palette', route: '/settings', roles: ['super_admin','tenant_admin','hr_manager','employee'], order: 9, isActive: true },
  ];

  visibleMenu = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    const mods = this.activeModules();
    return this.menuItems
      .filter(item => {
        if (!item.roles.includes(user.role)) return false;
        const reqModule = this.menuModuleMap[item.id];
        // If menu has a required module, check if it's active (super_admin sees all)
        if (reqModule && user.role !== 'super_admin' && mods.length > 0 && !mods.includes(reqModule)) return false;
        return true;
      })
      .sort((a, b) => a.order - b.order);
  });

  userInitials = computed(() => {
    const name = this.authService.currentUser()?.fullName || '';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  });

  isChildVisible(child: MenuItem): boolean {
    const user = this.authService.currentUser();
    return !!user && child.roles.includes(user.role);
  }

  isGroupActive(item: MenuItem): boolean {
    return this.expandedGroups().has(item.id);
  }

  toggleGroup(id: string) {
    const s = new Set(this.expandedGroups());
    s.has(id) ? s.delete(id) : s.add(id);
    this.expandedGroups.set(s);
  }

  formatRole(role?: UserRole): string {
    if (!role) return '';
    return role.replace(/_/g, ' ');
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
