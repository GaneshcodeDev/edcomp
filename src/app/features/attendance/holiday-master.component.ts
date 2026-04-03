import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { AttendanceService } from '../../core/services/attendance.service';
import { TableColumn, Holiday } from '../../core/models';

@Component({
  selector: 'app-holiday-master',
  standalone: true,
  imports: [DataTableComponent, PageHeaderComponent, ConfirmDialogComponent, FormsModule],
  template: `
    <app-page-header title="Holiday Master" subtitle="Manage organizational holidays"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Shifts & Holidays'},{label:'Holidays'}]"
      [actions]="[{label:'Add Holiday',icon:'bi-plus-lg',action:'add',class:'btn btn-primary'}]"
      (actionClick)="showForm.set(true); resetForm()" />

    <app-data-table [columns]="columns" [data]="tableData" (rowAction)="onRowAction($event)" />

    <!-- Form Modal -->
    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)"></div>
      <div class="modal-panel">
        <h4 class="modal-title">{{ editId ? 'Edit' : 'Add' }} Holiday</h4>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label fw-semibold">Name *</label>
            <input type="text" class="form-control" [(ngModel)]="formData.name" placeholder="Holiday name">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Date *</label>
            <input type="date" class="form-control" [(ngModel)]="formData.date">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Type</label>
            <select class="form-select" [(ngModel)]="formData.type">
              <option value="national">National</option>
              <option value="regional">Regional</option>
              <option value="company">Company</option>
            </select>
          </div>
          <div class="form-check mb-3">
            <input type="checkbox" class="form-check-input" [(ngModel)]="formData.isOptional" id="optional">
            <label class="form-check-label" for="optional">Optional Holiday</label>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="!formData.name || !formData.date">Save</button>
        </div>
      </div>
    }

    <app-confirm-dialog [visible]="showDelete()" title="Delete Holiday"
      message="Are you sure you want to delete this holiday?" type="danger"
      (confirmed)="confirmDelete()" (cancelled)="showDelete.set(false)" />
  `,
  styles: [`
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1050; backdrop-filter:blur(4px); }
    .modal-panel {
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:1060;
      background:var(--bg-card,#fff); border-radius:16px; padding:28px; min-width:420px;
      box-shadow:0 20px 60px rgba(0,0,0,0.2); animation:scaleIn 0.2s ease;
    }
    @keyframes scaleIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.95); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
    .modal-title { font-size:18px; font-weight:700; margin:0 0 20px; color:var(--text-primary); }
    .modal-body .form-control, .modal-body .form-select { border-radius:10px; }
    .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
    .btn-primary { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:10px; font-weight:600; }
    .btn-outline-secondary { border-radius:10px; font-weight:600; }
  `]
})
export class HolidayMasterComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  showForm = signal(false);
  showDelete = signal(false);
  editId = '';
  deleteId = '';
  formData: any = { name: '', date: '', type: 'national', isOptional: false };

  columns: TableColumn[] = [
    { key: 'name', label: 'Holiday', sortable: true },
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', badgeMap: { national: 'bg-primary', regional: 'bg-info', company: 'bg-success' } },
    { key: 'optional', label: 'Optional', type: 'badge', badgeMap: { Yes: 'bg-warning text-dark', No: 'bg-secondary' } },
    { key: '_', label: 'Actions', type: 'actions', width: '100px' },
  ];
  tableData: any[] = [];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.attendanceService.getHolidays().subscribe(holidays => {
      this.tableData = holidays.map(h => ({
        ...h, optional: h.isOptional ? 'Yes' : 'No'
      }));
    });
  }

  resetForm(): void {
    this.editId = '';
    this.formData = { name: '', date: '', type: 'national', isOptional: false };
  }

  onRowAction(e: any): void {
    if (e.action === 'edit') {
      this.editId = e.row.id;
      this.formData = { name: e.row.name, date: e.row.date, type: e.row.type, isOptional: e.row.isOptional };
      this.showForm.set(true);
    } else if (e.action === 'delete') {
      this.deleteId = e.row.id;
      this.showDelete.set(true);
    }
  }

  save(): void {
    const done = () => { this.showForm.set(false); this.load(); };
    if (this.editId) {
      this.attendanceService.updateHoliday(this.editId, this.formData).subscribe(() => done());
    } else {
      this.attendanceService.createHoliday(this.formData).subscribe(() => done());
    }
  }

  confirmDelete(): void {
    this.attendanceService.deleteHoliday(this.deleteId).subscribe(() => {
      this.showDelete.set(false);
      this.load();
    });
  }
}
