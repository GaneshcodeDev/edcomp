import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { OffboardingRecord, OffboardingCheckItem } from '../models';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> { data: T; }
interface PaginatedResponse<T> { data: T[]; total: number; }

@Injectable({ providedIn: 'root' })
export class OffboardingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/offboarding`;

  getAll(): Observable<OffboardingRecord[]> {
    return this.http.get<PaginatedResponse<any>>(this.apiUrl).pipe(
      map(res => (res.data || []).map((o: any) => this.mapRecord(o)))
    );
  }

  getById(id: string): Observable<OffboardingRecord> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.mapRecord(res.data))
    );
  }

  create(record: { employeeId: string; lastWorkingDate: string; reason: string; checklist?: { task: string; assignee: string }[] }): Observable<OffboardingRecord> {
    const payload = {
      employee_id: record.employeeId,
      last_working_date: record.lastWorkingDate,
      reason: record.reason,
      checklist: record.checklist || [
        { task: 'IT Asset Return', assignee: 'IT Admin' },
        { task: 'Access & Credentials Revocation', assignee: 'IT Admin' },
        { task: 'Knowledge Transfer', assignee: 'Team Lead' },
        { task: 'Exit Interview', assignee: 'HR Manager' },
        { task: 'Final Settlement', assignee: 'Finance' },
      ],
    };
    return this.http.post<ApiResponse<any>>(this.apiUrl, payload).pipe(
      map(res => this.mapRecord(res.data))
    );
  }

  update(id: string, data: Partial<OffboardingRecord>): Observable<OffboardingRecord> {
    const payload: any = {};
    if (data.status) payload.status = data.status;
    if (data.lastWorkingDate) payload.last_working_date = data.lastWorkingDate;
    if (data.reason) payload.reason = data.reason;
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => this.mapRecord(res.data))
    );
  }

  updateChecklist(offboardingId: string, checklistItemId: string, data: { isCompleted: boolean }): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${offboardingId}/checklist/${checklistItemId}`, {
      is_completed: data.isCompleted,
    });
  }

  private mapRecord(o: any): OffboardingRecord {
    return {
      id: o.id,
      tenantId: o.tenant_id || o.tenantId,
      employeeId: o.employee_id || o.employeeId,
      initiatedDate: o.initiated_date || o.initiatedDate,
      lastWorkingDate: o.last_working_date || o.lastWorkingDate,
      reason: o.reason,
      status: o.status,
      checklist: (o.checklist || []).map((c: any) => this.mapCheckItem(c)),
    };
  }

  private mapCheckItem(c: any): OffboardingCheckItem {
    return {
      id: c.id,
      task: c.task,
      isCompleted: c.is_completed ?? c.isCompleted,
      completedDate: c.completed_date || c.completedDate,
      assignee: c.assignee,
    };
  }
}
