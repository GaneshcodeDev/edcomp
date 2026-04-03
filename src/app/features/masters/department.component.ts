import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { MasterService } from '../../core/services/master.service';
import { TableColumn, Department } from '../../core/models';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [FormsModule, DataTableComponent, PageHeaderComponent, ConfirmDialogComponent],
  template: `
    <app-page-header title="Departments" subtitle="Manage organizational departments"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Masters'},{label:'Departments'}]"
      [actions]="[{label:'Add Department',icon:'bi-plus-lg',action:'add',class:'btn btn-primary'}]"
      (actionClick)="openForm()" />

    <app-data-table [columns]="columns" [data]="tableData" (rowAction)="onRowAction($event)" />

    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)"></div>
      <div class="modal-panel">
        <h4 class="modal-title">{{ editId ? 'Edit' : 'Add' }} Department</h4>
        <div class="mb-3"><label class="form-label fw-semibold">Name *</label><input type="text" class="form-control" [(ngModel)]="form.name"></div>
        <div class="mb-3"><label class="form-label fw-semibold">Code *</label><input type="text" class="form-control" [(ngModel)]="form.code"></div>
        <div class="form-check mb-3"><input type="checkbox" class="form-check-input" [(ngModel)]="form.isActive" id="dActive"><label class="form-check-label" for="dActive">Active</label></div>
        <div class="modal-actions">
          <button class="btn btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="!form.name || !form.code">Save</button>
        </div>
      </div>
    }

    <app-confirm-dialog [visible]="showDelete()" title="Delete Department"
      message="Are you sure?" type="danger" (confirmed)="confirmDelete()" (cancelled)="showDelete.set(false)" />
  `,
  styles: [`
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1050; backdrop-filter:blur(4px); }
    .modal-panel { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:1060; background:var(--bg-card,#fff); border-radius:16px; padding:28px; min-width:400px; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
    .modal-title { font-size:18px; font-weight:700; margin:0 0 20px; }
    .form-control { border-radius:10px; }
    .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
    .btn-primary { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:10px; font-weight:600; }
  `]
})
export class DepartmentComponent implements OnInit {
  private masterService = inject(MasterService);
  showForm = signal(false);
  showDelete = signal(false);
  editId = '';
  deleteId = '';
  form: any = { name: '', code: '', isActive: true };

  columns: TableColumn[] = [
    { key: 'name', label: 'Department', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'activeBadge', label: 'Status', type: 'badge', badgeMap: { Active: 'bg-success', Inactive: 'bg-secondary' } },
    { key: '_', label: 'Actions', type: 'actions', width: '100px' },
  ];
  tableData: any[] = [];

  ngOnInit(): void { this.load(); }
  load(): void {
    this.masterService.getDepartments().subscribe(departments => {
      this.tableData = departments.map(d => ({
        ...d,
        activeBadge: d.isActive ? 'Active' : 'Inactive',
      }));
    });
  }

  openForm(): void { this.editId = ''; this.form = { name: '', code: '', isActive: true }; this.showForm.set(true); }
  onRowAction(e: any): void {
    if (e.action === 'edit') { this.editId = e.row.id; this.form = { name: e.row.name, code: e.row.code, isActive: e.row.isActive }; this.showForm.set(true); }
    else { this.deleteId = e.row.id; this.showDelete.set(true); }
  }
  save(): void {
    const done = () => { this.showForm.set(false); this.load(); };
    if (this.editId) {
      this.masterService.updateDepartment(this.editId, this.form).subscribe(() => done());
    } else {
      this.masterService.createDepartment(this.form).subscribe(() => done());
    }
  }
  confirmDelete(): void {
    this.masterService.deleteDepartment(this.deleteId).subscribe(() => {
      this.showDelete.set(false);
      this.load();
    });
  }
}
