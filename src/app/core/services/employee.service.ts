import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Employee } from '../models';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> { data: T; }
interface PaginatedResponse<T> { data: T[]; total: number; page: number; pageSize: number; totalPages: number; }

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/employees`;

  getAll(filters?: { page?: number; pageSize?: number; search?: string; departmentId?: string; status?: string }): Observable<{ data: Employee[]; total: number; page: number; pageSize: number; totalPages: number }> {
    let params = new HttpParams();
    if (filters?.page) params = params.set('page', filters.page);
    if (filters?.pageSize) params = params.set('pageSize', filters.pageSize);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.departmentId) params = params.set('departmentId', filters.departmentId);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<PaginatedResponse<any>>(this.apiUrl, { params }).pipe(
      map(res => ({
        data: (res.data || []).map((e: any) => this.mapEmployee(e)),
        total: res.total,
        page: res.page,
        pageSize: res.pageSize,
        totalPages: res.totalPages,
      }))
    );
  }

  getById(id: string): Observable<Employee> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.mapEmployee(res.data))
    );
  }

  create(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, this.toApiPayload(employee)).pipe(
      map(res => this.mapEmployee(res.data))
    );
  }

  update(id: string, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, this.toApiPayload(employee)).pipe(
      map(res => this.mapEmployee(res.data))
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCount(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/count`).pipe(
      map(res => res.count)
    );
  }

  search(query: string, filters?: { departmentId?: string; status?: string }): Observable<{ data: Employee[]; total: number }> {
    return this.getAll({ search: query || undefined, departmentId: filters?.departmentId, status: filters?.status, pageSize: 1000 }).pipe(
      map(res => ({ data: res.data, total: res.total }))
    );
  }

  private mapEmployee(e: any): Employee {
    return {
      id: e.id,
      tenantId: e.tenant_id || e.tenantId,
      employeeCode: e.employee_code || e.employeeCode,
      firstName: e.first_name || e.firstName,
      lastName: e.last_name || e.lastName,
      email: e.email,
      phone: e.phone,
      departmentId: e.department_id || e.departmentId,
      designationId: e.designation_id || e.designationId,
      plantId: e.plant_id || e.plantId,
      dateOfJoining: e.date_of_joining || e.dateOfJoining,
      dateOfBirth: e.date_of_birth || e.dateOfBirth,
      gender: e.gender,
      address: e.address,
      city: e.city,
      state: e.state,
      status: e.status,
      shiftId: e.shift_id || e.shiftId,
      avatar: e.avatar,
      departmentName: e.department?.name,
      designationName: e.designation?.name,
    };
  }

  private toApiPayload(e: Partial<Employee>): any {
    return {
      employee_code: e.employeeCode,
      first_name: e.firstName,
      last_name: e.lastName,
      email: e.email,
      phone: e.phone,
      department_id: e.departmentId,
      designation_id: e.designationId,
      plant_id: e.plantId,
      date_of_joining: e.dateOfJoining,
      date_of_birth: e.dateOfBirth,
      gender: e.gender,
      address: e.address,
      city: e.city,
      state: e.state,
      status: e.status,
      shift_id: e.shiftId,
    };
  }
}
