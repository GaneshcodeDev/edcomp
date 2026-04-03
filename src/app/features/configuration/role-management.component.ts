import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ConfigurationService } from '../../core/services/configuration.service';
import { TableColumn, Role } from '../../core/models';

const ALL_PERMISSIONS = [
  'employee.read', 'employee.write', 'attendance.read', 'attendance.write',
  'config.manage', 'reports.view', 'reports.export', 'masters.manage', 'offboarding.manage'
];

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [FormsModule, DataTableComponent, PageHeaderComponent, ConfirmDialogComponent],
  template: `
    <app-page-header title="Role Management" subtitle="Configure roles and permissions"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Configuration'},{label:'Roles'}]"
      [actions]="[{label:'Add Role',icon:'bi-plus-lg',action:'add',class:'btn btn-primary'}]"
      (actionClick)="openForm()" />

    <app-data-table [columns]="columns" [data]="tableData" (rowAction)="onRowAction($event)" />

    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)"></div>
      <div class="modal-panel">
        <h4 class="modal-title">{{ editId ? 'Edit' : 'Add' }} Role</h4>
        <div class="mb-3"><label class="form-label fw-semibold">Name *</label><input type="text" class="form-control" [(ngModel)]="form.name"></div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Code *</label>
          <select class="form-select" [(ngModel)]="form.code" style="border-radius:10px;">
            <option value="super_admin">Super Admin</option>
            <option value="tenant_admin">Tenant Admin</option>
            <option value="hr_manager">HR Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Permissions</label>
          <div class="permissions-grid">
            @for (p of allPermissions; track p) {
              <label class="perm-check">
                <input type="checkbox" [checked]="form.permissions.includes(p)" (change)="togglePerm(p)">
                <span>{{ p }}</span>
              </label>
            }
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
          <button class="btn btn-primary" (click)="save()">Save</button>
        </div>
      </div>
    }

    <app-confirm-dialog [visible]="showDelete()" title="Delete Role"
      message="Are you sure?" type="danger" (confirmed)="confirmDelete()" (cancelled)="showDelete.set(false)" />
  `,
  styles: [`
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1050; backdrop-filter:blur(4px); }
    .modal-panel { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:1060; background:var(--bg-card,#fff); border-radius:16px; padding:28px; min-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.2); max-height:80vh; overflow-y:auto; }
    .modal-title { font-size:18px; font-weight:700; margin:0 0 20px; }
    .form-control, .form-select { border-radius:10px; }
    .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
    .btn-primary { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:10px; font-weight:600; }
    .permissions-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .perm-check { display:flex; align-items:center; gap:8px; font-size:13px; padding:6px 10px; border-radius:8px; background:var(--bg-primary,#f9fafb); cursor:pointer; }
    .perm-check input { margin:0; }
  `]
})
export class RoleManagementComponent implements OnInit {
  private configService = inject(ConfigurationService);
  roles: Role[] = [];
  allPermissions = ALL_PERMISSIONS;
  showForm = signal(false);
  showDelete = signal(false);
  editId = '';
  deleteId = '';
  form: any = { name: '', code: 'employee', permissions: [] as string[] };

  columns: TableColumn[] = [
    { key: 'name', label: 'Role Name', sortable: true },
    { key: 'code', label: 'Code', type: 'badge', badgeMap: { super_admin: 'bg-danger', tenant_admin: 'bg-primary', hr_manager: 'bg-info', employee: 'bg-secondary' } },
    { key: 'permCount', label: 'Permissions' },
    { key: 'systemBadge', label: 'System', type: 'badge', badgeMap: { Yes: 'bg-warning text-dark', No: 'bg-light text-dark' } },
    { key: '_', label: 'Actions', type: 'actions', width: '100px' },
  ];
  tableData: any[] = [];

  ngOnInit(): void { this.load(); }
  load(): void {
    this.configService.getRoles().subscribe(roles => {
      this.roles = roles;
      this.tableData = roles.map(r => ({ ...r, permCount: `${r.permissions.length} permissions`, systemBadge: r.isSystem ? 'Yes' : 'No' }));
    });
  }

  openForm(): void { this.editId = ''; this.form = { name: '', code: 'employee', permissions: [] }; this.showForm.set(true); }

  onRowAction(e: any): void {
    if (e.action === 'edit') {
      this.editId = e.row.id;
      this.form = { name: e.row.name, code: e.row.code, permissions: [...e.row.permissions] };
      this.showForm.set(true);
    } else { this.deleteId = e.row.id; this.showDelete.set(true); }
  }

  togglePerm(p: string): void {
    const idx = this.form.permissions.indexOf(p);
    if (idx >= 0) this.form.permissions.splice(idx, 1);
    else this.form.permissions.push(p);
  }

  save(): void {
    const done = () => { this.showForm.set(false); this.load(); };
    if (this.editId) {
      this.configService.updateRole(this.editId, this.form).subscribe(() => done());
    } else {
      this.configService.createRole(this.form).subscribe(() => done());
    }
  }
  confirmDelete(): void {
    this.configService.deleteRole(this.deleteId).subscribe(() => {
      this.showDelete.set(false);
      this.load();
    });
  }
}
