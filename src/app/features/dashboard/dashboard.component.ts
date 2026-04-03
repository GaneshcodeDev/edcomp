import { forkJoin } from 'rxjs';
import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { DataTableComponent } from '../../shared/components/data-table.component';
import { AttendanceService } from '../../core/services/attendance.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { DashboardStats, ChartData, TableColumn } from '../../core/models';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, StatCardComponent, DataTableComponent],
  template: `
    <div class="dashboard">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <h1 class="welcome-title">{{ greeting }}, {{ userName }}!</h1>
          <p class="welcome-sub">Attendance overview for {{ selectedDateFormatted }}</p>
        </div>
        <div class="welcome-right">
          <!-- Date Filter Buttons -->
          <div class="date-filters">
            <button class="date-btn" [class.active]="activeFilter === 'today'" (click)="setFilter('today')">Today</button>
            <button class="date-btn" [class.active]="activeFilter === 'yesterday'" (click)="setFilter('yesterday')">Yesterday</button>
            <button class="date-btn" [class.active]="activeFilter === 'custom'" (click)="setFilter('custom')">
              <i class="bi bi-calendar3 me-1"></i>Pick Date
            </button>
          </div>
          @if (activeFilter === 'custom') {
            <input type="date" class="form-control date-input" [(ngModel)]="customDate" (ngModelChange)="onCustomDateChange()">
          }
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <app-stat-card title="Total Employees" [value]="stats.totalEmployees" icon="bi-people" color="primary" />
        <app-stat-card title="Present" [value]="stats.presentToday" icon="bi-check-circle" color="success" [trend]="stats.trends.present" />
        <app-stat-card title="Absent" [value]="stats.absentToday" icon="bi-x-circle" color="danger" [trend]="stats.trends.absent" />
        <app-stat-card title="Late" [value]="stats.lateToday" icon="bi-clock-history" color="warning" [trend]="stats.trends.late" />
        <app-stat-card title="On Leave" [value]="stats.onLeave" icon="bi-calendar-x" color="info" />
        <div class="rate-card">
          <div class="rate-ring">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(79,70,229,0.1)" stroke-width="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#4F46E5" stroke-width="8"
                stroke-dasharray="264" [attr.stroke-dashoffset]="264 - (264 * stats.attendanceRate / 100)"
                stroke-linecap="round" transform="rotate(-90 50 50)"/>
            </svg>
            <div class="rate-value">{{ stats.attendanceRate }}%</div>
          </div>
          <p class="rate-label">Attendance Rate</p>
        </div>
      </div>

      <!-- Charts Row 1 -->
      <div class="charts-row">
        <div class="chart-card chart-large">
          <div class="chart-header">
            <h3 class="chart-title">Weekly Attendance Trend</h3>
            <span class="chart-badge">Last 7 days</span>
          </div>
          <div class="chart-body">
            <canvas #weeklyChart></canvas>
          </div>
        </div>
        <div class="chart-card chart-small">
          <div class="chart-header">
            <h3 class="chart-title">Department Distribution</h3>
          </div>
          <div class="chart-body chart-body-doughnut">
            <canvas #deptChart></canvas>
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="charts-row">
        <div class="chart-card chart-large">
          <div class="chart-header">
            <h3 class="chart-title">Monthly Attendance Overview</h3>
            <span class="chart-badge">{{ monthlyChartLabel }}</span>
          </div>
          <div class="chart-body">
            <canvas #monthlyChart></canvas>
          </div>
        </div>
        <div class="chart-card chart-small">
          <div class="chart-header">
            <h3 class="chart-title">Quick Stats</h3>
          </div>
          <div class="quick-stats">
            <div class="qs-item">
              <div class="qs-icon" style="background:rgba(79,70,229,0.1);color:#4F46E5"><i class="bi bi-clock"></i></div>
              <div><span class="qs-val">{{ stats.quickStats.avgWorkHours }}h</span><span class="qs-label">Avg Work Hours</span></div>
            </div>
            <div class="qs-item">
              <div class="qs-icon" style="background:rgba(16,185,129,0.1);color:#10B981"><i class="bi bi-arrow-up-right"></i></div>
              <div><span class="qs-val">{{ stats.quickStats.onTimeRate }}%</span><span class="qs-label">On-time Rate</span></div>
            </div>
            <div class="qs-item">
              <div class="qs-icon" style="background:rgba(245,158,11,0.1);color:#F59E0B"><i class="bi bi-calendar-event"></i></div>
              <div><span class="qs-val">{{ stats.quickStats.upcomingHolidays }}</span><span class="qs-label">Upcoming Holidays</span></div>
            </div>
            <div class="qs-item">
              <div class="qs-icon" style="background:rgba(239,68,68,0.1);color:#EF4444"><i class="bi bi-person-dash"></i></div>
              <div><span class="qs-val">{{ stats.quickStats.pendingOffboarding }}</span><span class="qs-label">Pending Offboarding</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="table-section">
        <div class="section-header">
          <h3 class="section-title">{{ selectedDateLabel }} Attendance</h3>
        </div>
        <app-data-table [columns]="tableColumns" [data]="tableData" [pageSize]="8" />
      </div>
    </div>
  `,
  styles: [`
    .dashboard { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .welcome-banner {
      display: flex; justify-content: space-between; align-items: center;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2563EB 100%);
      border-radius: 16px; padding: 28px 32px; margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(79,70,229,0.3);
    }
    .welcome-title { color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 4px; }
    .welcome-sub { color: rgba(255,255,255,0.7); margin: 0; font-size: 14px; }
    .welcome-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }

    .date-filters { display: flex; gap: 6px; }
    .date-btn {
      padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.25);
      background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8);
      font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      backdrop-filter: blur(4px); display: flex; align-items: center;
    }
    .date-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
    .date-btn.active { background: rgba(255,255,255,0.95); color: #4F46E5; border-color: transparent; }
    .date-input {
      border-radius: 10px; font-size: 13px; padding: 6px 12px; max-width: 180px;
      border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9); color: #1f2937;
    }

    .stats-grid {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 24px;
    }
    .rate-card {
      background: var(--bg-card, #fff); border-radius: 14px; padding: 18px;
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 1px 3px var(--shadow-color, rgba(0,0,0,0.06));
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .rate-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px var(--shadow-color, rgba(0,0,0,0.1)); }
    .rate-ring { width: 80px; height: 80px; position: relative; }
    .rate-ring svg { width: 100%; height: 100%; }
    .rate-ring circle:last-child { transition: stroke-dashoffset 1s ease; }
    .rate-value {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 800; color: var(--text-primary, #111827);
    }
    .rate-label { margin: 8px 0 0; font-size: 12px; color: var(--text-secondary, #6b7280); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }

    .charts-row { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; margin-bottom: 20px; }
    .chart-card {
      background: var(--bg-card, #fff); border-radius: 14px;
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 1px 3px var(--shadow-color, rgba(0,0,0,0.06));
      overflow: hidden;
    }
    .chart-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 22px 0;
    }
    .chart-title { font-size: 16px; font-weight: 700; color: var(--text-primary, #111827); margin: 0; }
    .chart-badge {
      font-size: 11px; background: rgba(79,70,229,0.08); color: #4F46E5;
      padding: 4px 10px; border-radius: 20px; font-weight: 600;
    }
    .chart-body { padding: 16px 22px 22px; height: 260px; }
    .chart-body-doughnut { height: 280px; display: flex; align-items: center; justify-content: center; }

    .quick-stats { padding: 16px 22px; display: flex; flex-direction: column; gap: 14px; }
    .qs-item { display: flex; align-items: center; gap: 14px; }
    .qs-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .qs-val { display: block; font-size: 18px; font-weight: 700; color: var(--text-primary, #111827); }
    .qs-label { display: block; font-size: 12px; color: var(--text-secondary, #6b7280); }

    .table-section { margin-top: 4px; }
    .section-header { margin-bottom: 16px; }
    .section-title { font-size: 18px; font-weight: 700; color: var(--text-primary, #111827); margin: 0; }

    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(3, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .welcome-banner { flex-direction: column; gap: 16px; text-align: center; }
      .welcome-right { align-items: center; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('weeklyChart') weeklyCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('deptChart') deptCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyChart') monthlyCanvas!: ElementRef<HTMLCanvasElement>;

  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private tenantService = inject(TenantService);

  private charts: Chart[] = [];
  private initialized = false;

  userName = '';
  greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  })();

  // Date filter
  activeFilter: 'today' | 'yesterday' | 'custom' = 'today';
  selectedDate = new Date().toISOString().split('T')[0];
  customDate = new Date().toISOString().split('T')[0];
  selectedDateFormatted = '';
  selectedDateLabel = "Today's";
  monthlyChartLabel = '';

  stats: DashboardStats = {
    totalEmployees: 0, presentToday: 0, absentToday: 0, lateToday: 0, onLeave: 0, attendanceRate: 0,
    trends: { employees: 0, present: 0, absent: 0, late: 0 },
    quickStats: { avgWorkHours: 0, onTimeRate: 0, upcomingHolidays: 0, pendingOffboarding: 0 },
  };

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Employee', type: 'avatar', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'workHours', label: 'Hours', sortable: true },
    { key: 'status', label: 'Status', type: 'badge', sortable: true, badgeMap: { present: 'bg-success', absent: 'bg-danger', late: 'bg-warning text-dark', half_day: 'bg-info', leave: 'bg-primary', holiday: 'bg-secondary', weekend: 'bg-secondary' } },
  ];
  tableData: any[] = [];

  constructor() {
    effect(() => {
      const tenant = this.tenantService.activeTenant();
      if (this.initialized && tenant) {
        this.reloadDashboard();
      }
    });
  }

  ngOnInit(): void {
    this.userName = this.authService.currentUser()?.fullName?.split(' ')[0] || 'User';
    this.updateDateLabels();
    this.loadStats();
    this.buildTableData();
    this.initialized = true;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createAllCharts());
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  // --- Date Filter ---

  setFilter(filter: 'today' | 'yesterday' | 'custom'): void {
    this.activeFilter = filter;
    if (filter === 'today') {
      this.selectedDate = new Date().toISOString().split('T')[0];
    } else if (filter === 'yesterday') {
      const d = new Date(); d.setDate(d.getDate() - 1);
      this.selectedDate = d.toISOString().split('T')[0];
    }
    // custom: wait for date input
    if (filter !== 'custom') {
      this.updateDateLabels();
      this.reloadData();
    }
  }

  onCustomDateChange(): void {
    if (this.customDate) {
      this.selectedDate = this.customDate;
      this.updateDateLabels();
      this.reloadData();
    }
  }

  private updateDateLabels(): void {
    const d = new Date(this.selectedDate + 'T00:00:00');
    this.selectedDateFormatted = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = (() => { const y = new Date(); y.setDate(y.getDate() - 1); return y.toISOString().split('T')[0]; })();

    if (this.selectedDate === today) {
      this.selectedDateLabel = "Today's";
    } else if (this.selectedDate === yesterday) {
      this.selectedDateLabel = "Yesterday's";
    } else {
      this.selectedDateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Monthly chart label
    const now = new Date();
    const prev = new Date(now); prev.setDate(prev.getDate() - 7);
    const fmt = (dt: Date) => dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    this.monthlyChartLabel = prev.getMonth() === now.getMonth() ? fmt(now) : `${prev.toLocaleDateString('en-US', { month: 'short' })} - ${fmt(now)}`;
  }

  // --- Data Loading ---

  private reloadData(): void {
    // Clear old data immediately
    this.tableData = [];
    this.stats = {
      totalEmployees: 0, presentToday: 0, absentToday: 0, lateToday: 0, onLeave: 0, attendanceRate: 0,
      trends: { employees: 0, present: 0, absent: 0, late: 0 },
      quickStats: { avgWorkHours: 0, onTimeRate: 0, upcomingHolidays: 0, pendingOffboarding: 0 },
    };
    this.loadStats();
    this.buildTableData();
  }

  private reloadDashboard(): void {
    this.reloadData();
    this.destroyCharts();
    setTimeout(() => this.createAllCharts());
  }

  private loadStats(): void {
    this.attendanceService.getDashboardStats(this.selectedDate).subscribe(stats => this.stats = stats);
  }

  private buildTableData(): void {
    forkJoin({
      employees: this.employeeService.getAll({ pageSize: 100 }),
      records: this.attendanceService.getByDate(this.selectedDate)
    }).subscribe(({ employees, records }) => {
      this.tableData = employees.data.filter(e => e.status === 'active').slice(0, 20).map(emp => {
        const rec = records.find(r => r.employeeId === emp.id);
        return {
          name: `${emp.firstName} ${emp.lastName}`,
          code: emp.employeeCode,
          department: emp.departmentName || emp.departmentId,
          checkIn: rec?.checkIn || '-',
          checkOut: rec?.checkOut || '-',
          workHours: rec?.workHours || 0,
          status: rec?.status || 'absent',
        };
      });
    });
  }

  // --- Charts ---

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private createAllCharts(): void {
    this.createWeeklyChart();
    this.createDeptChart();
    this.createMonthlyChart();
  }

  private createWeeklyChart(): void {
    this.attendanceService.getWeeklyTrend().subscribe(data => {
      const chart = new Chart(this.weeklyCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: data.datasets.map(ds => ({
            ...ds, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
            backgroundColor: ds.borderColor ? ds.borderColor + '15' : undefined,
            fill: true, tension: 0.4,
          }))
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12 } } } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { size: 11 } } }
          },
          interaction: { intersect: false, mode: 'index' },
        }
      });
      this.charts.push(chart);
    });
  }

  private createDeptChart(): void {
    this.attendanceService.getDepartmentWise().subscribe(data => {
      const chart = new Chart(this.deptCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [{ data: data.datasets[0].data, backgroundColor: data.datasets[0].backgroundColor as string[], borderWidth: 0 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: '65%',
          plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14, font: { size: 11 } } } }
        }
      });
      this.charts.push(chart);
    });
  }

  private createMonthlyChart(): void {
    this.attendanceService.getMonthlyData().subscribe(data => {
      const chart = new Chart(this.monthlyCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: data.datasets.map(ds => ({ ...ds, borderRadius: 6, barPercentage: 0.7 }))
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12 } } } },
          scales: {
            y: { beginAtZero: true, stacked: false, grid: { color: 'rgba(0,0,0,0.04)' } },
            x: { grid: { display: false } }
          }
        }
      });
      this.charts.push(chart);
    });
  }
}
