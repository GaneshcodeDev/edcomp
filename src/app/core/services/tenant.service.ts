import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Tenant } from '../models';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> { data: T; }
interface PaginatedResponse<T> { data: T[]; total: number; page: number; pageSize: number; totalPages: number; }

@Injectable({ providedIn: 'root' })
export class TenantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tenants`;

  tenants = signal<Tenant[]>([]);
  activeTenant = signal<Tenant | null>(null);

  loadTenants(): Observable<Tenant[]> {
    return this.http.get<PaginatedResponse<any>>(this.apiUrl).pipe(
      map(res => (res.data || []).map((t: any) => this.mapTenant(t))),
      tap(tenants => {
        this.tenants.set(tenants);
        // Auto-set active tenant from localStorage if not already set
        if (!this.activeTenant() && tenants.length) {
          const storedId = localStorage.getItem('active_tenant_id');
          const match = tenants.find(t => t.id === storedId);
          this.activeTenant.set(match || tenants[0]);
        }
      })
    );
  }

  getById(id: string): Observable<Tenant> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.mapTenant(res.data))
    );
  }

  create(tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, this.toApiPayload(tenant)).pipe(
      map(res => this.mapTenant(res.data)),
      tap(() => this.loadTenants().subscribe())
    );
  }

  update(id: string, tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, this.toApiPayload(tenant)).pipe(
      map(res => this.mapTenant(res.data)),
      tap(() => this.loadTenants().subscribe())
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadTenants().subscribe())
    );
  }

  setActiveTenant(id: string): void {
    const tenant = this.tenants().find(t => t.id === id);
    if (tenant) {
      this.activeTenant.set(tenant);
      localStorage.setItem('active_tenant_id', id);
    }
  }

  private mapTenant(t: any): Tenant {
    return {
      id: t.id,
      name: t.name,
      code: t.code,
      domain: t.domain,
      isActive: t.is_active ?? t.isActive,
      logo: t.logo,
      config: t.config || { theme: { mode: 'light', primaryColor: '#4F46E5', accentColor: '#7C3AED', fontFamily: 'Inter', sidebarStyle: 'default' }, enabledModules: [], maxEmployees: 100 },
      createdAt: t.created_at || t.createdAt,
    };
  }

  private toApiPayload(t: Partial<Tenant>): any {
    return {
      name: t.name,
      code: t.code,
      domain: t.domain,
      is_active: t.isActive,
      logo: t.logo,
      config: t.config,
    };
  }
}
