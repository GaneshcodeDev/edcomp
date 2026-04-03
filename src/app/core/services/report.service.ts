import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getAttendanceReport(filters: { startDate?: string; endDate?: string; departmentId?: string; status?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.departmentId) params = params.set('departmentId', filters.departmentId);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/attendance`, { params }).pipe(
      map(res => res.data || [])
    );
  }

  getEmployeeReport(filters: { departmentId?: string; status?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.departmentId) params = params.set('departmentId', filters.departmentId);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/employees`, { params }).pipe(
      map(res => res.data || [])
    );
  }

  exportToCSV(data: any[], filename: string): void {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
      csvRows.push(headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
