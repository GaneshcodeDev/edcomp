import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./features/layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      // Employees
      { path: 'employees/list', loadComponent: () => import('./features/employees/employee-list.component').then(m => m.EmployeeListComponent), canActivate: [roleGuard('super_admin', 'tenant_admin', 'hr_manager')] },
      { path: 'employees/add', loadComponent: () => import('./features/employees/employee-form.component').then(m => m.EmployeeFormComponent), canActivate: [roleGuard('super_admin', 'tenant_admin', 'hr_manager')] },
      { path: 'employees/edit/:id', loadComponent: () => import('./features/employees/employee-form.component').then(m => m.EmployeeFormComponent), canActivate: [roleGuard('super_admin', 'tenant_admin', 'hr_manager')] },

      // Attendance
      { path: 'attendance/daily-monitoring', loadComponent: () => import('./features/attendance/daily-monitoring.component').then(m => m.DailyMonitoringComponent) },
      { path: 'attendance/manual-entry', loadComponent: () => import('./features/attendance/manual-entry.component').then(m => m.ManualEntryComponent), canActivate: [roleGuard('super_admin', 'tenant_admin', 'hr_manager')] },
      { path: 'attendance/punch-logs', loadComponent: () => import('./features/attendance/punch-logs.component').then(m => m.PunchLogsComponent), canActivate: [roleGuard('super_admin', 'tenant_admin', 'hr_manager')] },

      // Shifts & Holidays
      { path: 'shifts/management', loadComponent: () => import('./features/attendance/shift-management.component').then(m => m.ShiftManagementComponent), canActivate: [roleGuard('super_admin', 'tenant_admin', 'hr_manager')] },
      { path: 'shifts/roster', loadComponent: () => import('./features/attendance/shift-roster.component').then(m => m.ShiftRosterComponent), canActivate: [roleGuard('super_admin', 'tenant_admin', 'hr_manager')] },
      { path: 'shifts/holidays', loadComponent: () => import('./features/attendance/holiday-master.component').then(m => m.HolidayMasterComponent), canActivate: [roleGuard('super_admin', 'tenant_admin', 'hr_manager')] },

      // Configuration (Super Admin only)
      { path: 'configuration/tenants', loadComponent: () => import('./features/configuration/tenant-management.component').then(m => m.TenantManagementComponent), canActivate: [roleGuard('super_admin')] },
      { path: 'configuration/roles', loadComponent: () => import('./features/configuration/role-management.component').then(m => m.RoleManagementComponent), canActivate: [roleGuard('super_admin')] },
      { path: 'configuration/menus', loadComponent: () => import('./features/configuration/menu-management.component').then(m => m.MenuManagementComponent), canActivate: [roleGuard('super_admin')] },
      { path: 'configuration/modules', loadComponent: () => import('./features/configuration/module-management.component').then(m => m.ModuleManagementComponent), canActivate: [roleGuard('super_admin')] },
      { path: 'configuration/activity-logs', loadComponent: () => import('./features/configuration/activity-log.component').then(m => m.ActivityLogComponent), canActivate: [roleGuard('super_admin', 'tenant_admin')] },

      // Masters
      { path: 'masters/departments', loadComponent: () => import('./features/masters/department.component').then(m => m.DepartmentComponent), canActivate: [roleGuard('super_admin', 'tenant_admin')] },
      { path: 'masters/designations', loadComponent: () => import('./features/masters/designation.component').then(m => m.DesignationComponent), canActivate: [roleGuard('super_admin', 'tenant_admin')] },

      // Reports
      { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent), canActivate: [roleGuard('super_admin', 'tenant_admin', 'hr_manager')] },

      // Offboarding
      { path: 'offboarding', loadComponent: () => import('./features/offboarding/offboarding.component').then(m => m.OffboardingComponent), canActivate: [roleGuard('super_admin', 'tenant_admin', 'hr_manager')] },

      // Settings
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: 'login' },
];
