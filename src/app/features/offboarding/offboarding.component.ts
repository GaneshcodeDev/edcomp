import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { EmployeeService } from '../../core/services/employee.service';
import { OffboardingService } from '../../core/services/offboarding.service';
import { OffboardingRecord } from '../../core/models';

@Component({
  selector: 'app-offboarding',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent],
  template: `
    <app-page-header title="Offboarding" subtitle="Manage employee exit workflow"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Offboarding'}]"
      [actions]="[{label:'Initiate Offboarding',icon:'bi-plus-lg',action:'add',class:'btn btn-primary'}]"
      (actionClick)="showForm.set(true)" />

    <!-- Offboarding Cards -->
    <div class="ob-grid">
      @for (ob of records; track ob.id) {
        <div class="ob-card">
          <div class="ob-header">
            <div class="ob-emp-info">
              <div class="ob-avatar">{{ getEmpInitials(ob.employeeId) }}</div>
              <div>
                <h4 class="ob-emp-name">{{ getEmpName(ob.employeeId) }}</h4>
                <span class="ob-emp-code">{{ getEmpCode(ob.employeeId) }}</span>
              </div>
            </div>
            <span class="ob-status" [class]="'status-' + ob.status">{{ ob.status.replace('_',' ') }}</span>
          </div>
          <div class="ob-details">
            <div class="ob-detail"><i class="bi bi-calendar-event me-2"></i>Initiated: {{ ob.initiatedDate }}</div>
            <div class="ob-detail"><i class="bi bi-calendar-x me-2"></i>Last Day: {{ ob.lastWorkingDate }}</div>
            <div class="ob-detail"><i class="bi bi-chat-text me-2"></i>{{ ob.reason }}</div>
          </div>
          <!-- Progress -->
          <div class="ob-progress">
            <div class="progress-bar-wrap">
              <div class="progress-fill" [style.width.%]="getProgress(ob)"></div>
            </div>
            <span class="progress-text">{{ getCompletedCount(ob) }}/{{ ob.checklist.length }} tasks</span>
          </div>
          <!-- Checklist -->
          <div class="ob-checklist" [class.expanded]="expandedId() === ob.id">
            <button class="checklist-toggle" (click)="expandedId.set(expandedId() === ob.id ? '' : ob.id)">
              <i class="bi" [class]="expandedId() === ob.id ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              {{ expandedId() === ob.id ? 'Hide' : 'Show' }} Checklist
            </button>
            @if (expandedId() === ob.id) {
              <div class="checklist-items">
                @for (item of ob.checklist; track item.id) {
                  <label class="check-item" [class.completed]="item.isCompleted">
                    <input type="checkbox" [(ngModel)]="item.isCompleted" (ngModelChange)="onChecklistToggle(ob, item)" class="form-check-input">
                    <div class="check-info">
                      <span class="check-task">{{ item.task }}</span>
                      <span class="check-assignee">{{ item.assignee }}</span>
                    </div>
                    @if (item.completedDate) { <span class="check-date">{{ item.completedDate }}</span> }
                  </label>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Initiate Modal -->
    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)"></div>
      <div class="modal-panel">
        <h4 class="modal-title">Initiate Offboarding</h4>
        <div class="mb-3">
          <label class="form-label fw-semibold">Employee *</label>
          <select class="form-select" [(ngModel)]="newOb.employeeId" style="border-radius:10px;">
            <option value="">Select Employee</option>
            @for (e of employees; track e.id) { <option [value]="e.id">{{ e.firstName }} {{ e.lastName }}</option> }
          </select>
        </div>
        <div class="mb-3"><label class="form-label fw-semibold">Last Working Date *</label><input type="date" class="form-control" [(ngModel)]="newOb.lastWorkingDate" style="border-radius:10px;"></div>
        <div class="mb-3"><label class="form-label fw-semibold">Reason *</label><textarea class="form-control" [(ngModel)]="newOb.reason" rows="2" style="border-radius:10px;"></textarea></div>
        <div class="modal-actions">
          <button class="btn btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
          <button class="btn btn-primary" (click)="initiate()" [disabled]="!newOb.employeeId || !newOb.lastWorkingDate">Initiate</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .ob-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(380px,1fr)); gap:20px; }
    .ob-card {
      background:var(--bg-card,#fff); border-radius:16px; padding:22px;
      border:1px solid var(--border-color,#e5e7eb); box-shadow:0 1px 3px var(--shadow-color,rgba(0,0,0,0.06));
    }
    .ob-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
    .ob-emp-info { display:flex; align-items:center; gap:12px; }
    .ob-avatar {
      width:42px; height:42px; border-radius:12px;
      background:linear-gradient(135deg,#4F46E5,#7C3AED); color:#fff;
      display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700;
    }
    .ob-emp-name { font-size:15px; font-weight:700; margin:0; color:var(--text-primary); }
    .ob-emp-code { font-size:11px; color:var(--text-secondary); }
    .ob-status {
      font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; text-transform:capitalize;
    }
    .status-initiated { background:rgba(6,182,212,0.1); color:#0891B2; }
    .status-in_progress { background:rgba(245,158,11,0.1); color:#D97706; }
    .status-completed { background:rgba(16,185,129,0.1); color:#059669; }
    .status-cancelled { background:rgba(239,68,68,0.1); color:#DC2626; }
    .ob-details { margin-bottom:14px; }
    .ob-detail { font-size:13px; color:var(--text-secondary); padding:3px 0; }
    .ob-progress { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
    .progress-bar-wrap { flex:1; height:6px; background:var(--border-color,#e5e7eb); border-radius:6px; overflow:hidden; }
    .progress-fill { height:100%; background:linear-gradient(90deg,#4F46E5,#10B981); border-radius:6px; transition:width 0.5s; }
    .progress-text { font-size:12px; color:var(--text-secondary); font-weight:600; white-space:nowrap; }
    .checklist-toggle {
      background:none; border:none; color:var(--primary,#4F46E5); font-size:13px; font-weight:600;
      cursor:pointer; padding:4px 0; display:flex; align-items:center; gap:4px;
    }
    .checklist-items { margin-top:10px; display:flex; flex-direction:column; gap:6px; }
    .check-item {
      display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px;
      background:var(--bg-primary,#f9fafb); cursor:pointer; transition:background 0.15s;
    }
    .check-item.completed { opacity:0.6; }
    .check-item.completed .check-task { text-decoration:line-through; }
    .check-info { flex:1; }
    .check-task { display:block; font-size:13px; font-weight:500; color:var(--text-primary); }
    .check-assignee { display:block; font-size:11px; color:var(--text-secondary); }
    .check-date { font-size:11px; color:var(--text-secondary); }
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1050; backdrop-filter:blur(4px); }
    .modal-panel { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:1060; background:var(--bg-card,#fff); border-radius:16px; padding:28px; min-width:440px; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
    .modal-title { font-size:18px; font-weight:700; margin:0 0 20px; }
    .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
    .btn-primary { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:10px; font-weight:600; }
  `]
})
export class OffboardingComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private offboardingService = inject(OffboardingService);
  records: OffboardingRecord[] = [];
  employees: any[] = [];
  showForm = signal(false);
  expandedId = signal('');
  newOb: any = { employeeId: '', lastWorkingDate: '', reason: '' };

  private empMap = new Map<string, any>();

  ngOnInit(): void {
    forkJoin({
      records: this.offboardingService.getAll(),
      employees: this.employeeService.getAll()
    }).subscribe(({ records, employees }) => {
      this.records = records;
      this.employees = employees.data.filter(e => e.status === 'active');
      for (const e of employees.data) {
        this.empMap.set(e.id, e);
      }
    });
  }

  getEmpName(id: string): string { const e = this.empMap.get(id); return e ? `${e.firstName} ${e.lastName}` : id; }
  getEmpCode(id: string): string { return this.empMap.get(id)?.employeeCode || ''; }
  getEmpInitials(id: string): string { const e = this.empMap.get(id); return e ? `${e.firstName[0]}${e.lastName[0]}` : '?'; }
  getProgress(ob: OffboardingRecord): number { return ob.checklist.length ? (ob.checklist.filter(c => c.isCompleted).length / ob.checklist.length) * 100 : 0; }
  getCompletedCount(ob: OffboardingRecord): number { return ob.checklist.filter(c => c.isCompleted).length; }

  initiate(): void {
    this.offboardingService.create({
      employeeId: this.newOb.employeeId,
      lastWorkingDate: this.newOb.lastWorkingDate,
      reason: this.newOb.reason,
    }).subscribe(record => {
      this.records.unshift(record);
      this.showForm.set(false);
      this.newOb = { employeeId: '', lastWorkingDate: '', reason: '' };
      // Remove from active employees list
      this.employees = this.employees.filter(e => e.id !== record.employeeId);
    });
  }

  onChecklistToggle(ob: OffboardingRecord, item: any): void {
    this.offboardingService.updateChecklist(ob.id, item.id, { isCompleted: item.isCompleted }).subscribe();
  }
}
