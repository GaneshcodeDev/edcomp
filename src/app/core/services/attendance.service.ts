import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AttendanceRecord, DashboardStats, ChartData, Holiday, Shift, ShiftRoster, PunchLog } from '../models';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> { data: T; }
interface PaginatedResponse<T> { data: T[]; total: number; }

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/attendance`;

  // --- Attendance Records ---

  getByDate(date: string): Observable<AttendanceRecord[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ApiResponse<any[]>>(this.apiUrl, { params }).pipe(
      map(res => (res.data || []).map((a: any) => this.mapAttendance(a)))
    );
  }

  getByEmployee(employeeId: string, startDate?: string, endDate?: string): Observable<AttendanceRecord[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/employee/${employeeId}`, { params }).pipe(
      map(res => (res.data || []).map((a: any) => this.mapAttendance(a)))
    );
  }

  getDashboardStats(date?: string): Observable<DashboardStats> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/dashboard-stats`, { params }).pipe(
      map(res => ({
        totalEmployees: res.data.totalEmployees,
        presentToday: res.data.presentToday,
        absentToday: res.data.absentToday,
        lateToday: res.data.lateToday,
        onLeave: res.data.onLeave,
        attendanceRate: res.data.attendanceRate,
        trends: res.data.trends || { employees: 0, present: 0, absent: 0, late: 0 },
        quickStats: res.data.quickStats || { avgWorkHours: 0, onTimeRate: 0, upcomingHolidays: 0, pendingOffboarding: 0 },
      }))
    );
  }

  getWeeklyTrend(): Observable<ChartData> {
    return this.http.get<ApiResponse<ChartData>>(`${this.apiUrl}/weekly-trend`).pipe(
      map(res => res.data)
    );
  }

  getDepartmentWise(): Observable<ChartData> {
    return this.http.get<ApiResponse<ChartData>>(`${this.apiUrl}/department-wise`).pipe(
      map(res => res.data)
    );
  }

  getMonthlyData(): Observable<ChartData> {
    return this.http.get<ApiResponse<ChartData>>(`${this.apiUrl}/monthly`).pipe(
      map(res => res.data)
    );
  }

  markAttendance(record: Partial<AttendanceRecord>): Observable<AttendanceRecord> {
    const payload = {
      employee_id: record.employeeId,
      date: record.date,
      status: record.status,
      check_in: record.checkIn,
      check_out: record.checkOut,
      shift_id: record.shiftId,
      remarks: record.remarks,
      source: record.source || 'manual',
    };
    return this.http.post<ApiResponse<any>>(this.apiUrl, payload).pipe(
      map(res => this.mapAttendance(res.data))
    );
  }

  bulkMark(records: Partial<AttendanceRecord>[]): Observable<any> {
    const payload = records.map(r => ({
      employee_id: r.employeeId,
      date: r.date,
      status: r.status,
      check_in: r.checkIn,
      check_out: r.checkOut,
      remarks: r.remarks,
      source: r.source || 'manual',
    }));
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/bulk`, { records: payload });
  }

  // --- Holidays ---

  getHolidays(): Observable<Holiday[]> {
    return this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/holidays`).pipe(
      map(res => (res.data || []).map((h: any) => this.mapHoliday(h)))
    );
  }

  createHoliday(holiday: Partial<Holiday>): Observable<Holiday> {
    const payload = { name: holiday.name, date: holiday.date, type: holiday.type, is_optional: holiday.isOptional };
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/holidays`, payload).pipe(
      map(res => this.mapHoliday(res.data))
    );
  }

  updateHoliday(id: string, holiday: Partial<Holiday>): Observable<Holiday> {
    const payload = { name: holiday.name, date: holiday.date, type: holiday.type, is_optional: holiday.isOptional };
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/holidays/${id}`, payload).pipe(
      map(res => this.mapHoliday(res.data))
    );
  }

  deleteHoliday(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/holidays/${id}`);
  }

  // --- Shifts ---

  getShifts(): Observable<Shift[]> {
    return this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/shifts`).pipe(
      map(res => (res.data || []).map((s: any) => this.mapShift(s)))
    );
  }

  createShift(shift: Partial<Shift>): Observable<Shift> {
    const payload = { name: shift.name, code: shift.code, start_time: shift.startTime, end_time: shift.endTime, grace_minutes: shift.graceMinutes, is_default: shift.isDefault };
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/shifts`, payload).pipe(
      map(res => this.mapShift(res.data))
    );
  }

  updateShift(id: string, shift: Partial<Shift>): Observable<Shift> {
    const payload = { name: shift.name, code: shift.code, start_time: shift.startTime, end_time: shift.endTime, grace_minutes: shift.graceMinutes, is_default: shift.isDefault };
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/shifts/${id}`, payload).pipe(
      map(res => this.mapShift(res.data))
    );
  }

  deleteShift(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/shifts/${id}`);
  }

  // --- Shift Roster ---

  getShiftRoster(date?: string, startDate?: string, endDate?: string): Observable<ShiftRoster[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/shift-roster`, { params }).pipe(
      map(res => (res.data || []).map((sr: any) => this.mapShiftRoster(sr)))
    );
  }

  assignShiftRoster(roster: Partial<ShiftRoster>): Observable<ShiftRoster> {
    const payload = { employee_id: roster.employeeId, shift_id: roster.shiftId, date: roster.date, is_override: roster.isOverride };
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/shift-roster`, payload).pipe(
      map(res => this.mapShiftRoster(res.data))
    );
  }

  bulkAssignRoster(assignments: Partial<ShiftRoster>[]): Observable<any> {
    const payload = assignments.map(r => ({
      employee_id: r.employeeId, shift_id: r.shiftId, date: r.date, is_override: r.isOverride,
    }));
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/shift-roster/bulk`, { assignments: payload });
  }

  // --- Punch Logs ---

  getPunchLogs(date?: string, employeeId?: string, source?: string): Observable<PunchLog[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (employeeId) params = params.set('employeeId', employeeId);
    if (source) params = params.set('source', source);
    return this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/punch-logs`, { params }).pipe(
      map(res => (res.data || []).map((pl: any) => this.mapPunchLog(pl)))
    );
  }

  // --- Mappers ---

  private mapAttendance(a: any): AttendanceRecord {
    return {
      id: a.id,
      tenantId: a.tenant_id || a.tenantId,
      employeeId: a.employee_id || a.employeeId,
      date: a.date,
      status: a.status,
      checkIn: a.check_in || a.checkIn,
      checkOut: a.check_out || a.checkOut,
      shiftId: a.shift_id || a.shiftId,
      workHours: a.work_hours ?? a.workHours,
      overtime: a.overtime,
      remarks: a.remarks,
      source: a.source,
    } as AttendanceRecord;
  }

  private mapHoliday(h: any): Holiday {
    return {
      id: h.id,
      tenantId: h.tenant_id || h.tenantId,
      name: h.name,
      date: h.date,
      type: h.type,
      isOptional: h.is_optional ?? h.isOptional,
    };
  }

  private mapShift(s: any): Shift {
    return {
      id: s.id,
      tenantId: s.tenant_id || s.tenantId,
      name: s.name,
      code: s.code,
      startTime: s.start_time || s.startTime,
      endTime: s.end_time || s.endTime,
      graceMinutes: s.grace_minutes ?? s.graceMinutes,
      isDefault: s.is_default ?? s.isDefault,
    };
  }

  private mapShiftRoster(sr: any): ShiftRoster {
    return {
      id: sr.id,
      tenantId: sr.tenant_id || sr.tenantId,
      employeeId: sr.employee_id || sr.employeeId,
      shiftId: sr.shift_id || sr.shiftId,
      date: sr.date,
      isOverride: sr.is_override ?? sr.isOverride,
    };
  }

  private mapPunchLog(pl: any): PunchLog {
    return {
      id: pl.id,
      tenantId: pl.tenant_id || pl.tenantId,
      employeeId: pl.employee_id || pl.employeeId,
      timestamp: pl.timestamp,
      type: pl.type,
      source: pl.source,
      deviceId: pl.device_id || pl.deviceId,
      location: pl.location,
    };
  }
}
