import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { AttendanceService } from '../../core/services/attendance.service';
import { EmployeeService } from '../../core/services/employee.service';
import { Shift, Employee } from '../../core/models';

@Component({
  selector: 'app-shift-roster',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Shift Roster Planning" subtitle="Assign shifts to employees across the week"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Shifts & Holidays'},{label:'Roster'}]" />

    <div class="roster-controls">
      <div class="week-nav">
        <button class="btn btn-outline-secondary btn-sm" (click)="prevWeek()"><i class="bi bi-chevron-left"></i></button>
        <span class="week-label">{{ weekLabel }}</span>
        <button class="btn btn-outline-secondary btn-sm" (click)="nextWeek()"><i class="bi bi-chevron-right"></i></button>
      </div>
      <div class="shift-legend">
        @for (s of shifts; track s.id) {
          <span class="legend-item">
            <span class="legend-dot" [style.background]="shiftColor(s.code)"></span>
            {{ s.name }}
          </span>
        }
      </div>
    </div>

    <div class="roster-card">
      <div class="table-responsive">
        <table class="table roster-table">
          <thead>
            <tr>
              <th class="emp-col">Employee</th>
              @for (d of weekDates; track d.dateStr) {
                <th class="date-col" [class.today]="d.dateStr === today">
                  <span class="date-day-name">{{ d.dayName }}</span>
                  <span class="date-num">{{ d.dayNum }}</span>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (emp of employees; track emp.id) {
              <tr>
                <td class="emp-cell">
                  <div class="emp-info">
                    <div class="emp-avatar">{{ emp.firstName[0] }}{{ emp.lastName[0] }}</div>
                    <div>
                      <span class="emp-name">{{ emp.firstName }} {{ emp.lastName }}</span>
                      <span class="emp-code">{{ emp.employeeCode }}</span>
                    </div>
                  </div>
                </td>
                @for (d of weekDates; track d.dateStr) {
                  <td class="shift-cell" [class.today]="d.dateStr === today">
                    <select class="shift-select" [style.background]="shiftColor(getAssignedShiftCode(emp.id, d.dateStr))"
                      [value]="getAssignedShift(emp.id, d.dateStr)"
                      (change)="assignShift(emp.id, d.dateStr, $event)">
                      <option value="">-</option>
                      @for (s of shifts; track s.id) {
                        <option [value]="s.id">{{ s.code }}</option>
                      }
                    </select>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .roster-controls { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
    .week-nav { display:flex; align-items:center; gap:12px; }
    .week-nav .btn { border-radius:8px; width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center; }
    .week-label { font-size:16px; font-weight:700; color:var(--text-primary); min-width:200px; text-align:center; }
    .shift-legend { display:flex; gap:16px; flex-wrap:wrap; }
    .legend-item { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-secondary); font-weight:500; }
    .legend-dot { width:10px; height:10px; border-radius:3px; }
    .roster-card {
      background:var(--bg-card,#fff); border-radius:14px; border:1px solid var(--border-color,#e5e7eb);
      box-shadow:0 1px 3px var(--shadow-color,rgba(0,0,0,0.06)); overflow:hidden;
    }
    .roster-table { margin:0; }
    .roster-table thead th {
      background:var(--bg-primary,#f9fafb); text-align:center; padding:12px 8px;
      border-bottom:2px solid var(--border-color,#e5e7eb); font-size:12px;
      color:var(--text-secondary); text-transform:uppercase; vertical-align:middle;
    }
    .emp-col { text-align:left !important; min-width:200px; }
    .date-col { min-width:80px; }
    .date-col.today { background:rgba(79,70,229,0.05); }
    .date-day-name { display:block; font-weight:700; font-size:11px; }
    .date-num { display:block; font-size:16px; font-weight:700; color:var(--text-primary); }
    .emp-cell { padding:10px 14px !important; }
    .emp-info { display:flex; align-items:center; gap:10px; }
    .emp-avatar {
      width:34px; height:34px; border-radius:8px;
      background:linear-gradient(135deg,#4F46E5,#7C3AED); color:#fff;
      display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;
    }
    .emp-name { display:block; font-size:13px; font-weight:600; color:var(--text-primary); }
    .emp-code { display:block; font-size:11px; color:var(--text-secondary); }
    .shift-cell { text-align:center; padding:8px !important; vertical-align:middle; }
    .shift-cell.today { background:rgba(79,70,229,0.03); }
    .shift-select {
      width:60px; height:32px; border:1px solid var(--border-color,#e5e7eb); border-radius:6px;
      text-align:center; font-size:12px; font-weight:700; color:#fff; cursor:pointer;
      appearance:none; padding:0 4px;
    }
    .shift-select option { color:#333; background:#fff; }
  `]
})
export class ShiftRosterComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);

  employees: Employee[] = [];
  shifts: Shift[] = [];
  weekDates: { dateStr: string; dayName: string; dayNum: number }[] = [];
  weekLabel = '';
  today = new Date().toISOString().split('T')[0];
  private weekStart = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d; })();
  private rosterMap = new Map<string, string>(); // `${empId}_${date}` -> shiftId

  ngOnInit(): void {
    forkJoin({
      employees: this.employeeService.getAll({ pageSize: 1000 }),
      shifts: this.attendanceService.getShifts()
    }).subscribe(({ employees, shifts }) => {
      this.employees = employees.data.filter(e => e.status === 'active').slice(0, 12);
      this.shifts = shifts;
      this.buildWeek();
      this.loadRoster();
    });
  }

  buildWeek(): void {
    this.weekDates = [];
    const d = new Date(this.weekStart);
    for (let i = 0; i < 7; i++) {
      this.weekDates.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate()
      });
      d.setDate(d.getDate() + 1);
    }
    const end = new Date(this.weekStart);
    end.setDate(end.getDate() + 6);
    this.weekLabel = `${this.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  loadRoster(): void {
    this.rosterMap.clear();
    const startDate = this.weekDates[0].dateStr;
    const endDate = this.weekDates[this.weekDates.length - 1].dateStr;
    this.attendanceService.getShiftRoster(undefined, startDate, endDate).subscribe(roster => {
      for (const r of roster) {
        this.rosterMap.set(`${r.employeeId}_${r.date}`, r.shiftId);
      }
      // Fill defaults from employee.shiftId
      for (const emp of this.employees) {
        for (const d of this.weekDates) {
          const key = `${emp.id}_${d.dateStr}`;
          if (!this.rosterMap.has(key) && emp.shiftId) {
            this.rosterMap.set(key, emp.shiftId);
          }
        }
      }
    });
  }

  getAssignedShift(empId: string, date: string): string {
    return this.rosterMap.get(`${empId}_${date}`) || '';
  }

  getAssignedShiftCode(empId: string, date: string): string {
    const sid = this.getAssignedShift(empId, date);
    return this.shifts.find(s => s.id === sid)?.code || '';
  }

  shiftColor(code: string): string {
    const map: Record<string, string> = { GEN: '#4F46E5', MRN: '#10B981', AFT: '#F59E0B', NGT: '#7C3AED' };
    return map[code] || '#cbd5e1';
  }

  assignShift(empId: string, date: string, event: Event): void {
    const shiftId = (event.target as HTMLSelectElement).value;
    if (shiftId) {
      this.attendanceService.assignShiftRoster({ employeeId: empId, shiftId, date, isOverride: true }).subscribe(() => {
        this.rosterMap.set(`${empId}_${date}`, shiftId);
      });
    }
  }

  prevWeek(): void { this.weekStart.setDate(this.weekStart.getDate() - 7); this.buildWeek(); this.loadRoster(); }
  nextWeek(): void { this.weekStart.setDate(this.weekStart.getDate() + 7); this.buildWeek(); this.loadRoster(); }
}
