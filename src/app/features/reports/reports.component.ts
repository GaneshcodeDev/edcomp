import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ReportService } from '../../core/services/report.service';
import { MasterService } from '../../core/services/master.service';
import { TableColumn } from '../../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Reports" subtitle="Generate and export attendance & employee reports"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Reports'}]" />

    <!-- Tabs -->
    <div class="report-tabs">
      <button class="tab-btn" [class.active]="activeTab === 'attendance'" (click)="activeTab='attendance'; generate()">
        <i class="bi bi-calendar-check me-1"></i>Attendance Report
      </button>
      <button class="tab-btn" [class.active]="activeTab === 'employee'" (click)="activeTab='employee'; generate()">
        <i class="bi bi-people me-1"></i>Employee Report
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-row">
        @if (activeTab === 'attendance') {
          <div class="filter-group">
            <label class="form-label">From Date</label>
            <input type="date" class="form-control" [(ngModel)]="filters.startDate">
          </div>
          <div class="filter-group">
            <label class="form-label">To Date</label>
            <input type="date" class="form-control" [(ngModel)]="filters.endDate">
          </div>
        }
        <div class="filter-group">
          <label class="form-label">Department</label>
          <select class="form-select" [(ngModel)]="filters.departmentId">
            <option value="">All</option>
            @for (d of departments; track d.id) { <option [value]="d.id">{{ d.name }}</option> }
          </select>
        </div>
        @if (activeTab === 'attendance') {
          <div class="filter-group">
            <label class="form-label">Status</label>
            <select class="form-select" [(ngModel)]="filters.status">
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="leave">Leave</option>
            </select>
          </div>
        }
        @if (activeTab === 'employee') {
          <div class="filter-group">
            <label class="form-label">Status</label>
            <select class="form-select" [(ngModel)]="filters.status">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="offboarded">Offboarded</option>
            </select>
          </div>
        }
        <div class="filter-actions">
          <button class="btn btn-primary" (click)="generate()"><i class="bi bi-play-fill me-1"></i>Generate</button>
          <button class="btn btn-outline-success" (click)="exportCSV()" [disabled]="tableData.length === 0"><i class="bi bi-download me-1"></i>Export CSV</button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="results-info">
      <span class="badge bg-light text-dark">{{ tableData.length }} records found</span>
    </div>
    <app-data-table [columns]="columns" [data]="tableData" [pageSize]="15" />
  `,
  styles: [`
    .report-tabs { display:flex; gap:8px; margin-bottom:20px; }
    .tab-btn {
      padding:10px 22px; border-radius:10px; font-size:14px; font-weight:600;
      border:1.5px solid var(--border-color,#d1d5db); background:var(--bg-card,#fff);
      color:var(--text-secondary); cursor:pointer; transition:all 0.2s;
    }
    .tab-btn.active { background:linear-gradient(135deg,#4F46E5,#7C3AED); color:#fff; border-color:transparent; }
    .filters-card {
      background:var(--bg-card,#fff); border-radius:14px; padding:20px 24px;
      border:1px solid var(--border-color,#e5e7eb); margin-bottom:16px;
      box-shadow:0 1px 3px var(--shadow-color,rgba(0,0,0,0.06));
    }
    .filters-row { display:flex; gap:14px; align-items:flex-end; flex-wrap:wrap; }
    .filter-group { display:flex; flex-direction:column; min-width:160px; }
    .filter-group .form-label { font-size:12px; font-weight:600; margin-bottom:4px; color:var(--text-secondary); }
    .form-control, .form-select { border-radius:10px; font-size:13px; }
    .filter-actions { display:flex; gap:8px; margin-left:auto; }
    .btn-primary { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:10px; font-weight:600; }
    .results-info { margin-bottom:12px; }
  `]
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private masterService = inject(MasterService);

  activeTab: 'attendance' | 'employee' = 'attendance';
  departments: any[] = [];
  filters: any = {
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    departmentId: '', status: ''
  };

  attendanceCols: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'employeeCode', label: 'Code', sortable: true },
    { key: 'employeeName', label: 'Employee', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'status', label: 'Status', type: 'badge', sortable: true, badgeMap: { present:'bg-success', absent:'bg-danger', late:'bg-warning text-dark', leave:'bg-primary', half_day:'bg-info' } },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'workHours', label: 'Hours', sortable: true },
  ];

  employeeCols: TableColumn[] = [
    { key: 'employeeCode', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', type: 'avatar', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'designation', label: 'Designation', sortable: true },
    { key: 'dateOfJoining', label: 'Joined', type: 'date', sortable: true },
    { key: 'status', label: 'Status', type: 'badge', badgeMap: { active:'bg-success', inactive:'bg-warning text-dark', offboarded:'bg-danger' } },
  ];

  columns: TableColumn[] = this.attendanceCols;
  tableData: any[] = [];

  ngOnInit(): void {
    this.masterService.getDepartments().subscribe(depts => {
      this.departments = depts;
      this.generate();
    });
  }

  generate(): void {
    if (this.activeTab === 'attendance') {
      this.columns = this.attendanceCols;
      this.reportService.getAttendanceReport(this.filters).subscribe(data => {
        this.tableData = data;
      });
    } else {
      this.columns = this.employeeCols;
      this.reportService.getEmployeeReport(this.filters).subscribe(data => {
        this.tableData = data;
      });
    }
  }

  exportCSV(): void {
    this.reportService.exportToCSV(this.tableData, `${this.activeTab}-report`);
  }
}
