import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Department, Designation } from '../models';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> { data: T; }
interface PaginatedResponse<T> { data: T[]; total: number; }

@Injectable({ providedIn: 'root' })
export class MasterService {
  private http = inject(HttpClient);

  // --- Departments ---

  getDepartments(): Observable<Department[]> {
    return this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/departments`).pipe(
      map(res => (res.data || []).map((d: any) => this.mapDepartment(d)))
    );
  }

  createDepartment(dept: Partial<Department>): Observable<Department> {
    const payload = { name: dept.name, code: dept.code, is_active: dept.isActive ?? true };
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/departments`, payload).pipe(
      map(res => this.mapDepartment(res.data))
    );
  }

  updateDepartment(id: string, dept: Partial<Department>): Observable<Department> {
    const payload = { name: dept.name, code: dept.code, is_active: dept.isActive };
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/departments/${id}`, payload).pipe(
      map(res => this.mapDepartment(res.data))
    );
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/departments/${id}`);
  }

  // --- Designations ---

  getDesignations(): Observable<Designation[]> {
    return this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/designations`).pipe(
      map(res => (res.data || []).map((d: any) => this.mapDesignation(d)))
    );
  }

  createDesignation(desg: Partial<Designation>): Observable<Designation> {
    const payload = { name: desg.name, code: desg.code, level: desg.level ?? 1, is_active: desg.isActive ?? true };
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/designations`, payload).pipe(
      map(res => this.mapDesignation(res.data))
    );
  }

  updateDesignation(id: string, desg: Partial<Designation>): Observable<Designation> {
    const payload = { name: desg.name, code: desg.code, level: desg.level, is_active: desg.isActive };
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/designations/${id}`, payload).pipe(
      map(res => this.mapDesignation(res.data))
    );
  }

  deleteDesignation(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/designations/${id}`);
  }

  // --- Mappers ---

  private mapDepartment(d: any): Department {
    return {
      id: d.id,
      tenantId: d.tenant_id || d.tenantId,
      name: d.name,
      code: d.code,
      isActive: d.is_active ?? d.isActive,
    };
  }

  private mapDesignation(d: any): Designation {
    return {
      id: d.id,
      tenantId: d.tenant_id || d.tenantId,
      name: d.name,
      code: d.code,
      level: d.level,
      isActive: d.is_active ?? d.isActive,
    };
  }
}
