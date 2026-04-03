import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataTableComponent } from '../../shared/components/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { AttendanceService } from '../../core/services/attendance.service';
import { EmployeeService } from '../../core/services/employee.service';
import { TableColumn } from '../../core/models';

@Component({
  selector: 'app-punch-logs',
  standalone: true,
  imports: [DataTableComponent, PageHeaderComponent, FormsModule],
  template: `
    <app-page-header title="Punch Logs" subtitle="View biometric and manual punch records"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Attendance'},{label:'Punch Logs'}]" />

    <div class="filters-row">
      <div class="filter-group">
        <label class="form-label fw-semibold">Date</label>
        <input type="date" class="form-control" [(ngModel)]="filterDate" (ngModelChange)="load()" style="border-radius:10px;max-width:200px;">
      </div>
      <div class="filter-group">
        <label class="form-label fw-semibold">Employee</label>
        <select class="form-select" [(ngModel)]="filterEmployee" (ngModelChange)="load()" style="border-radius:10px;min-width:200px;">
          <option value="">All Employees</option>
          @for (e of employees; track e.id) { <option [value]="e.id">{{ e.firstName }} {{ e.lastName }}</option> }
        </select>
      </div>
      <div class="filter-group">
        <label class="form-label fw-semibold">Source</label>
        <select class="form-select" [(ngModel)]="filterSource" (ngModelChange)="load()" style="border-radius:10px;min-width:160px;">
          <option value="">All Sources</option>
          <option value="biometric">Biometric</option>
          <option value="manual">Manual</option>
          <option value="mobile">Mobile</option>
        </select>
      </div>
    </div>

    <app-data-table [columns]="columns" [data]="tableData" [pageSize]="15" />
  `,
  styles: [`
    .filters-row { display:flex; gap:16px; margin-bottom:20px; flex-wrap:wrap; align-items:flex-end; }
    .filter-group { display:flex; flex-direction:column; }
    .form-label { font-size:12px; margin-bottom:4px; }
  `]
})
export class PunchLogsComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);

  employees: any[] = [];
  filterDate = new Date().toISOString().split('T')[0];
  filterEmployee = '';
  filterSource = '';

  columns: TableColumn[] = [
    { key: 'time', label: 'Time', sortable: true },
    { key: 'employeeName', label: 'Employee', type: 'avatar', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', badgeMap: { in: 'bg-success', out: 'bg-danger' } },
    { key: 'source', label: 'Source', type: 'badge', badgeMap: { biometric: 'bg-primary', manual: 'bg-secondary', mobile: 'bg-info' } },
    { key: 'deviceId', label: 'Device' },
    { key: 'location', label: 'Location' },
  ];
  tableData: any[] = [];

  ngOnInit(): void {
    this.employeeService.getAll({ pageSize: 1000 }).subscribe(res => {
      this.employees = res.data.filter(e => e.status === 'active');
      this.load();
    });
  }

  load(): void {
    // Clear old data immediately
    this.tableData = [];

    const empMap = new Map(this.employees.map(e => [e.id, `${e.firstName} ${e.lastName}`]));
    this.attendanceService.getPunchLogs(this.filterDate, this.filterEmployee || undefined, this.filterSource || undefined).subscribe(logs => {
      this.tableData = logs.map(l => ({
        time: new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        employeeName: empMap.get(l.employeeId) || l.employeeId,
        type: l.type,
        source: l.source,
        deviceId: l.deviceId || '-',
        location: l.location || '-',
        timestamp: l.timestamp,
      }));
    });
  }
}
