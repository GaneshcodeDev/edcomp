import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Role, AppModule, MenuItem } from '../models';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> { data: T; }
interface PaginatedResponse<T> { data: T[]; total: number; }

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private http = inject(HttpClient);

  // --- Roles ---

  getRoles(): Observable<Role[]> {
    return this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/roles`).pipe(
      map(res => (res.data || []).map((r: any) => this.mapRole(r)))
    );
  }

  createRole(role: Partial<Role>): Observable<Role> {
    const payload = { name: role.name, code: role.code, permissions: role.permissions, is_system: false };
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/roles`, payload).pipe(
      map(res => this.mapRole(res.data))
    );
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    const payload = { name: role.name, permissions: role.permissions };
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/roles/${id}`, payload).pipe(
      map(res => this.mapRole(res.data))
    );
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/roles/${id}`);
  }

  // --- App Modules ---

  getAppModules(): Observable<AppModule[]> {
    return this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/app-modules`).pipe(
      map(res => (res.data || []).map((m: any) => this.mapModule(m)))
    );
  }

  updateAppModule(id: string, mod: Partial<AppModule>): Observable<AppModule> {
    const payload = { name: mod.name, is_active: mod.isActive, icon: mod.icon, description: mod.description };
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/app-modules/${id}`, payload).pipe(
      map(res => this.mapModule(res.data))
    );
  }

  // --- Menu Items ---

  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/menus`).pipe(
      map(res => (res.data || []).map((m: any) => this.mapMenuItem(m)))
    );
  }

  updateMenuItem(id: string, item: Partial<MenuItem>): Observable<MenuItem> {
    const payload = { label: item.label, icon: item.icon, route: item.route, roles: item.roles, sort_order: item.order, is_active: item.isActive };
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/menus/${id}`, payload).pipe(
      map(res => this.mapMenuItem(res.data))
    );
  }

  // --- Active Modules (for sidebar) ---

  getActiveModules(): Observable<string[]> {
    return this.http.get<any>(`${environment.apiUrl}/settings/active-modules`).pipe(
      map(res => res.data || [])
    );
  }

  // --- Tenant Modules ---

  getTenantModules(tenantId: string): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/tenants/${tenantId}/modules`).pipe(
      map(res => res.data || [])
    );
  }

  updateTenantModules(tenantId: string, enabledModules: string[]): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/tenants/${tenantId}/modules`, { enabledModules });
  }

  // --- Activity Logs ---

  getActivityLogs(params?: { page?: number; pageSize?: number; module?: string; action?: string; startDate?: string; endDate?: string; search?: string }): Observable<{ data: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params?.module) httpParams = httpParams.set('module', params.module);
    if (params?.action) httpParams = httpParams.set('action', params.action);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<any>(`${environment.apiUrl}/activity-logs`, { params: httpParams });
  }

  getEntityLogs(entityType: string, entityId: string): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/activity-logs/${entityType}/${entityId}`).pipe(
      map(res => res.data || [])
    );
  }

  // --- Mappers ---

  private mapRole(r: any): Role {
    return {
      id: r.id,
      tenantId: r.tenant_id || r.tenantId,
      name: r.name,
      code: r.code,
      permissions: r.permissions || [],
      isSystem: r.is_system ?? r.isSystem,
    };
  }

  private mapModule(m: any): AppModule {
    return {
      id: m.id,
      name: m.name,
      code: m.code,
      description: m.description,
      isActive: m.is_active ?? m.isActive,
      icon: m.icon,
    };
  }

  private mapMenuItem(m: any): MenuItem {
    return {
      id: m.id,
      label: m.label,
      icon: m.icon,
      route: m.route,
      children: (m.children || []).map((c: any) => this.mapMenuItem(c)),
      roles: m.roles || [],
      moduleId: m.module_id || m.moduleId,
      order: m.sort_order ?? m.order,
      isActive: m.is_active ?? m.isActive,
    };
  }
}
