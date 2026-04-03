import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { AttendanceService } from '../../core/services/attendance.service';
import { Shift } from '../../core/models';

@Component({
  selector: 'app-shift-management',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent],
  template: `
    <app-page-header title="Shift Management" subtitle="Configure work shifts and timings"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Shifts & Holidays'},{label:'Shifts'}]"
      [actions]="[{label:'Add Shift',icon:'bi-plus-lg',action:'add',class:'btn btn-primary'}]"
      (actionClick)="openForm()" />

    <div class="shifts-grid">
      @for (shift of shifts; track shift.id) {
        <div class="shift-card" [class.default-shift]="shift.isDefault">
          @if (shift.isDefault) { <span class="default-badge">Default</span> }
          <div class="shift-icon">
            <i class="bi" [class]="getShiftIcon(shift.code)"></i>
          </div>
          <h4 class="shift-name">{{ shift.name }}</h4>
          <span class="shift-code">{{ shift.code }}</span>
          <div class="shift-time">
            <div class="time-block">
              <span class="time-label">Start</span>
              <span class="time-value">{{ shift.startTime }}</span>
            </div>
            <i class="bi bi-arrow-right text-muted"></i>
            <div class="time-block">
              <span class="time-label">End</span>
              <span class="time-value">{{ shift.endTime }}</span>
            </div>
          </div>
          <div class="shift-grace">
            <i class="bi bi-clock-history me-1"></i>{{ shift.graceMinutes }} min grace
          </div>
          <div class="shift-actions">
            <button class="btn btn-sm btn-outline-primary" (click)="editShift(shift)"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" (click)="deleteTarget=shift.id; showDelete.set(true)"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      }
    </div>

    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)"></div>
      <div class="modal-panel">
        <h4 class="modal-title">{{ editId ? 'Edit' : 'Add' }} Shift</h4>
        <div class="mb-3">
          <label class="form-label fw-semibold">Name *</label>
          <input type="text" class="form-control" [(ngModel)]="form.name" placeholder="e.g. Morning Shift">
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Code *</label>
          <input type="text" class="form-control" [(ngModel)]="form.code" placeholder="e.g. MRN">
        </div>
        <div class="row mb-3">
          <div class="col-6">
            <label class="form-label fw-semibold">Start Time *</label>
            <input type="time" class="form-control" [(ngModel)]="form.startTime">
          </div>
          <div class="col-6">
            <label class="form-label fw-semibold">End Time *</label>
            <input type="time" class="form-control" [(ngModel)]="form.endTime">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Grace Minutes</label>
          <input type="number" class="form-control" [(ngModel)]="form.graceMinutes" min="0">
        </div>
        <div class="form-check mb-3">
          <input type="checkbox" class="form-check-input" [(ngModel)]="form.isDefault" id="isDefault">
          <label class="form-check-label" for="isDefault">Set as default shift</label>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="!form.name || !form.code">Save</button>
        </div>
      </div>
    }

    <app-confirm-dialog [visible]="showDelete()" title="Delete Shift"
      message="Are you sure you want to delete this shift?" type="danger"
      (confirmed)="confirmDelete()" (cancelled)="showDelete.set(false)" />
  `,
  styles: [`
    .shifts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .shift-card {
      background: var(--bg-card, #fff); border-radius: 16px; padding: 24px; text-align: center;
      border: 1px solid var(--border-color, #e5e7eb); position: relative;
      box-shadow: 0 1px 3px var(--shadow-color, rgba(0,0,0,0.06));
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .shift-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px var(--shadow-color, rgba(0,0,0,0.1)); }
    .default-shift { border-color: #4F46E5; }
    .default-badge {
      position: absolute; top: 12px; right: 12px; font-size: 11px; font-weight: 700;
      background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #fff;
      padding: 3px 10px; border-radius: 20px;
    }
    .shift-icon {
      width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 12px;
      background: rgba(79,70,229,0.1); color: #4F46E5;
      display: flex; align-items: center; justify-content: center; font-size: 24px;
    }
    .shift-name { font-size: 18px; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }
    .shift-code { font-size: 12px; color: var(--text-secondary); font-weight: 600; letter-spacing: 1px; }
    .shift-time {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      margin: 16px 0; padding: 12px; background: var(--bg-primary, #f9fafb); border-radius: 10px;
    }
    .time-block { text-align: center; }
    .time-label { display: block; font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; }
    .time-value { display: block; font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .shift-grace { font-size: 13px; color: var(--text-secondary); margin-bottom: 14px; }
    .shift-actions { display: flex; justify-content: center; gap: 8px; }
    .shift-actions .btn { border-radius: 8px; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1050; backdrop-filter: blur(4px); }
    .modal-panel {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 1060;
      background: var(--bg-card, #fff); border-radius: 16px; padding: 28px; min-width: 440px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: scaleIn 0.2s ease;
    }
    @keyframes scaleIn { from { opacity: 0; transform: translate(-50%,-50%) scale(0.95); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
    .modal-title { font-size: 18px; font-weight: 700; margin: 0 0 20px; }
    .form-control { border-radius: 10px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .btn-primary { background: linear-gradient(135deg, #4F46E5, #7C3AED); border: none; border-radius: 10px; font-weight: 600; }
  `]
})
export class ShiftManagementComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  shifts: Shift[] = [];
  showForm = signal(false);
  showDelete = signal(false);
  editId = '';
  deleteTarget = '';
  form: any = { name: '', code: '', startTime: '09:00', endTime: '18:00', graceMinutes: 15, isDefault: false };

  ngOnInit(): void { this.load(); }
  load(): void { this.attendanceService.getShifts().subscribe(shifts => this.shifts = shifts); }

  getShiftIcon(code: string): string {
    const map: Record<string, string> = { GEN: 'bi-sun', MRN: 'bi-sunrise', AFT: 'bi-sunset', NGT: 'bi-moon-stars' };
    return map[code] || 'bi-clock';
  }

  openForm(): void { this.editId = ''; this.form = { name: '', code: '', startTime: '09:00', endTime: '18:00', graceMinutes: 15, isDefault: false }; this.showForm.set(true); }

  editShift(s: Shift): void {
    this.editId = s.id;
    this.form = { name: s.name, code: s.code, startTime: s.startTime, endTime: s.endTime, graceMinutes: s.graceMinutes, isDefault: s.isDefault };
    this.showForm.set(true);
  }

  save(): void {
    const done = () => { this.showForm.set(false); this.load(); };
    if (this.editId) {
      this.attendanceService.updateShift(this.editId, this.form).subscribe(() => done());
    } else {
      this.attendanceService.createShift(this.form).subscribe(() => done());
    }
  }

  confirmDelete(): void {
    this.attendanceService.deleteShift(this.deleteTarget).subscribe(() => {
      this.showDelete.set(false);
      this.load();
    });
  }
}
