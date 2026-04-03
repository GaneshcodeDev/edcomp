import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataTableComponent } from '../../shared/components/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { AttendanceService } from '../../core/services/attendance.service';
import { EmployeeService } from '../../core/services/employee.service';
import { MasterService } from '../../core/services/master.service';
import { TableColumn } from '../../core/models';

@Component({
  selector: 'app-daily-monitoring',
  standalone: true,
  imports: [DataTableComponent, PageHeaderComponent, FormsModule],
  template: `
    <app-page-header
      title="Daily Attendance Monitoring"
      subtitle="Track attendance for any date"
      [breadcrumbs]="[{label: 'Home', route: '/dashboard'}, {label: 'Attendance'}, {label: 'Daily Monitoring'}]"
    />

    <div class="controls-row">
      <div class="date-picker">
        <label class="form-label fw-semibold">Select Date</label>
        <input type="date" class="form-control" [(ngModel)]="selectedDate" (ngModelChange)="loadData()" style="max-width:220px;border-radius:10px;">
      </div>
      <div class="summary-pills">
        <span class="pill pill-success"><i class="bi bi-check-circle me-1"></i>Present: {{ summary.present }}</span>
        <span class="pill pill-danger"><i class="bi bi-x-circle me-1"></i>Absent: {{ summary.absent }}</span>
        <span class="pill pill-warning"><i class="bi bi-clock me-1"></i>Late: {{ summary.late }}</span>
        <span class="pill pill-info"><i class="bi bi-calendar-x me-1"></i>Leave: {{ summary.leave }}</span>
      </div>
    </div>

    <app-data-table [columns]="columns" [data]="tableData" [pageSize]="12" />
  `,
  styles: [`
    .controls-row {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 20px; flex-wrap: wrap; gap: 16px;
    }
    .summary-pills { display: flex; gap: 10px; flex-wrap: wrap; }
    .pill {
      padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
      display: flex; align-items: center;
    }
    .pill-success { background: rgba(16,185,129,0.1); color: #059669; }
    .pill-danger { background: rgba(239,68,68,0.1); color: #DC2626; }
    .pill-warning { background: rgba(245,158,11,0.1); color: #D97706; }
    .pill-info { background: rgba(6,182,212,0.1); color: #0891B2; }
  `]
})
export class DailyMonitoringComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);
  private masterService = inject(MasterService);

  selectedDate = new Date().toISOString().split('T')[0];
  summary = { present: 0, absent: 0, late: 0, leave: 0 };
  columns: TableColumn[] = [
    { key: 'name', label: 'Employee', type: 'avatar', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'checkIn', label: 'Check In', sortable: true },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'workHours', label: 'Hours', sortable: true },
    { key: 'status', label: 'Status', type: 'badge', sortable: true, badgeMap: {
      present: 'bg-success', absent: 'bg-danger', late: 'bg-warning text-dark',
      half_day: 'bg-info', leave: 'bg-primary', holiday: 'bg-secondary', weekend: 'bg-secondary'
    }},
    { key: 'source', label: 'Source', type: 'badge', badgeMap: { biometric: 'bg-primary', manual: 'bg-secondary', system: 'bg-dark' }},
  ];
  tableData: any[] = [];

  private allEmployees: any[] = [];
  private departments: any[] = [];

  ngOnInit(): void {
    // Load employees and departments once, then load attendance for the date
    forkJoin({
      employees: this.employeeService.getAll({ pageSize: 1000 }),
      departments: this.masterService.getDepartments()
    }).subscribe(({ employees, departments }) => {
      this.allEmployees = employees.data.filter(e => e.status === 'active');
      this.departments = departments;
      this.loadData();
    });
  }

  loadData(): void {
    // Clear old data immediately
    this.tableData = [];
    this.summary = { present: 0, absent: 0, late: 0, leave: 0 };

    this.attendanceService.getByDate(this.selectedDate).subscribe(records => {
      const deptMap = new Map(this.departments.map(d => [d.id, d.name]));

      this.tableData = this.allEmployees.map(emp => {
        const rec = records.find(r => r.employeeId === emp.id);
        return {
          name: `${emp.firstName} ${emp.lastName}`,
          code: emp.employeeCode,
          department: deptMap.get(emp.departmentId) || emp.departmentName || emp.departmentId,
          checkIn: rec?.checkIn || '-',
          checkOut: rec?.checkOut || '-',
          workHours: rec?.workHours || 0,
          status: rec?.status || 'absent',
          source: rec?.source || '-',
          remarks: rec?.remarks || '',
        };
      });

      this.summary = {
        present: this.tableData.filter(r => r.status === 'present').length,
        absent: this.tableData.filter(r => r.status === 'absent').length,
        late: this.tableData.filter(r => r.status === 'late').length,
        leave: this.tableData.filter(r => r.status === 'leave' || r.status === 'half_day').length,
      };
    });
  }
}
