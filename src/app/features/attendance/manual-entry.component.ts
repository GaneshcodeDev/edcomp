import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { AttendanceService } from '../../core/services/attendance.service';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-manual-entry',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, PageHeaderComponent],
  template: `
    <app-page-header
      title="Manual Attendance Entry"
      subtitle="Record attendance manually for employees"
      [breadcrumbs]="[{label: 'Home', route: '/dashboard'}, {label: 'Attendance'}, {label: 'Manual Entry'}]"
    />

    @if (successMsg()) {
      <div class="alert alert-success" style="border-radius:10px;font-size:14px;">
        <i class="bi bi-check-circle me-2"></i>{{ successMsg() }}
      </div>
    }

    <div class="mode-toggle">
      <button class="toggle-btn" [class.active]="mode === 'single'" (click)="mode='single'">
        <i class="bi bi-person me-1"></i>Single Entry
      </button>
      <button class="toggle-btn" [class.active]="mode === 'bulk'" (click)="mode='bulk'">
        <i class="bi bi-people me-1"></i>Bulk Entry
      </button>
    </div>

    @if (mode === 'single') {
      <div class="entry-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-field">
              <label class="form-label fw-semibold">Date *</label>
              <input type="date" class="form-control" formControlName="date">
            </div>
            <div class="form-field">
              <label class="form-label fw-semibold">Employee *</label>
              <select class="form-select" formControlName="employeeId">
                <option value="">Select Employee</option>
                @for (e of employees; track e.id) {
                  <option [value]="e.id">{{ e.employeeCode }} - {{ e.firstName }} {{ e.lastName }}</option>
                }
              </select>
            </div>
            <div class="form-field">
              <label class="form-label fw-semibold">Status *</label>
              <select class="form-select" formControlName="status">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
                <option value="leave">Leave</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label fw-semibold">Check In</label>
              <input type="time" class="form-control" formControlName="checkIn">
            </div>
            <div class="form-field">
              <label class="form-label fw-semibold">Check Out</label>
              <input type="time" class="form-control" formControlName="checkOut">
            </div>
            <div class="form-field">
              <label class="form-label fw-semibold">Remarks</label>
              <input type="text" class="form-control" formControlName="remarks" placeholder="Optional remarks">
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
              <i class="bi bi-check-lg me-1"></i>Save Attendance
            </button>
          </div>
        </form>
      </div>
    }

    @if (mode === 'bulk') {
      <div class="entry-card">
        <div class="bulk-header">
          <div class="form-field" style="max-width:220px;">
            <label class="form-label fw-semibold">Date</label>
            <input type="date" class="form-control" [(ngModel)]="bulkDate" (ngModelChange)="loadBulkData()">
          </div>
          <button class="btn btn-primary" (click)="saveBulk()"><i class="bi bi-save me-1"></i>Save All</button>
        </div>
        <div class="table-responsive mt-3">
          <table class="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Code</th>
                <th style="width:150px">Status</th>
                <th style="width:130px">Check In</th>
                <th style="width:130px">Check Out</th>
              </tr>
            </thead>
            <tbody>
              @for (row of bulkData; track row.employeeId) {
                <tr>
                  <td>{{ row.name }}</td>
                  <td>{{ row.code }}</td>
                  <td>
                    <select class="form-select form-select-sm" [(ngModel)]="row.status" style="border-radius:8px;">
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="half_day">Half Day</option>
                      <option value="leave">Leave</option>
                    </select>
                  </td>
                  <td><input type="time" class="form-control form-control-sm" [(ngModel)]="row.checkIn" style="border-radius:8px;"></td>
                  <td><input type="time" class="form-control form-control-sm" [(ngModel)]="row.checkOut" style="border-radius:8px;"></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
  styles: [`
    .mode-toggle { display: flex; gap: 8px; margin-bottom: 20px; }
    .toggle-btn {
      padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
      border: 1.5px solid var(--border-color, #d1d5db); background: var(--bg-card, #fff);
      color: var(--text-secondary, #6b7280); cursor: pointer; transition: all 0.2s;
    }
    .toggle-btn.active {
      background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #fff; border-color: transparent;
    }
    .entry-card {
      background: var(--bg-card, #fff); border-radius: 14px; padding: 24px;
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 1px 3px var(--shadow-color, rgba(0,0,0,0.06));
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .form-field { display: flex; flex-direction: column; }
    .form-label { font-size: 13px; margin-bottom: 6px; }
    .form-control, .form-select { border-radius: 10px; border: 1.5px solid var(--border-color, #d1d5db); }
    .form-control:focus, .form-select:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 20px; }
    .btn-primary { background: linear-gradient(135deg, #4F46E5, #7C3AED); border: none; border-radius: 10px; padding: 10px 24px; font-weight: 600; }
    .bulk-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .table thead th { background: var(--bg-primary, #f9fafb); font-size: 13px; font-weight: 600; color: var(--text-secondary); }
    .table tbody td { vertical-align: middle; font-size: 14px; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class ManualEntryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);

  mode: 'single' | 'bulk' = 'single';
  employees: any[] = [];
  successMsg = signal('');

  form: FormGroup = this.fb.group({
    date: [new Date().toISOString().split('T')[0], Validators.required],
    employeeId: ['', Validators.required],
    status: ['present', Validators.required],
    checkIn: ['09:00'],
    checkOut: ['18:00'],
    remarks: [''],
  });

  bulkDate = new Date().toISOString().split('T')[0];
  bulkData: any[] = [];

  ngOnInit(): void {
    this.employeeService.getAll({ pageSize: 1000 }).subscribe(res => {
      this.employees = res.data.filter(e => e.status === 'active');
      this.loadBulkData();
    });
  }

  loadBulkData(): void {
    this.bulkData = [];
    this.attendanceService.getByDate(this.bulkDate).subscribe(records => {
      this.bulkData = this.employees.map(e => {
        const rec = records.find(r => r.employeeId === e.id);
        return {
          employeeId: e.id, name: `${e.firstName} ${e.lastName}`, code: e.employeeCode,
          status: rec?.status || 'present', checkIn: rec?.checkIn || '09:00', checkOut: rec?.checkOut || '18:00',
        };
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    this.attendanceService.markAttendance({ ...val, source: 'manual' }).subscribe(() => {
      this.successMsg.set('Attendance recorded successfully!');
      setTimeout(() => this.successMsg.set(''), 3000);
    });
  }

  saveBulk(): void {
    const requests = this.bulkData.map(row =>
      this.attendanceService.markAttendance({
        employeeId: row.employeeId, date: this.bulkDate,
        status: row.status, checkIn: row.checkIn, checkOut: row.checkOut, source: 'manual',
      })
    );
    forkJoin(requests).subscribe(() => {
      this.successMsg.set('Bulk attendance saved successfully!');
      setTimeout(() => this.successMsg.set(''), 3000);
    });
  }
}
