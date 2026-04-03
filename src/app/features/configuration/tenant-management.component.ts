import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { TenantService } from '../../core/services/tenant.service';
import { ConfigurationService } from '../../core/services/configuration.service';
import { ToastService } from '../../core/services/toast.service';
import { Tenant, AppModule } from '../../core/models';

@Component({
  selector: 'app-tenant-management',
  standalone: true,
  imports: [FormsModule, DatePipe, PageHeaderComponent, ConfirmDialogComponent],
  template: `
    <app-page-header title="Tenant Management" subtitle="Manage organizations and their module access"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Configuration'},{label:'Tenants'}]"
      [actions]="[{label:'Add Tenant',icon:'bi-plus-lg',action:'add',class:'btn btn-primary'}]"
      (actionClick)="openForm()" />

    <div class="tenants-grid">
      @for (t of tenants; track t.id) {
        <div class="tenant-card" [class.inactive]="!t.isActive">
          <div class="tenant-header">
            <div class="tenant-logo">{{ t.name[0] }}</div>
            <div class="tenant-info">
              <h4 class="tenant-name">{{ t.name }}</h4>
              <span class="tenant-code">{{ t.code }}</span>
            </div>
            <span class="status-dot" [class.active]="t.isActive" [title]="t.isActive ? 'Active' : 'Inactive'"></span>
          </div>
          <div class="tenant-details">
            <div class="detail-row"><i class="bi bi-globe me-2"></i>{{ t.domain }}</div>
            <div class="detail-row"><i class="bi bi-people me-2"></i>Max {{ t.config.maxEmployees }} employees</div>
            <div class="detail-row"><i class="bi bi-calendar me-2"></i>Since {{ t.createdAt | date:'mediumDate' }}</div>
          </div>

          <!-- Module tags -->
          <div class="tenant-modules">
            @if (t.config.enabledModules.length === 0) {
              <span class="module-tag none">No modules assigned</span>
            } @else {
              @for (m of t.config.enabledModules; track m) {
                <span class="module-tag">{{ m }}</span>
              }
            }
          </div>

          <div class="tenant-actions">
            <button class="btn btn-sm btn-outline-primary" (click)="editTenant(t)"><i class="bi bi-pencil me-1"></i>Edit</button>
            <button class="btn btn-sm btn-outline-info" (click)="openModules(t)"><i class="bi bi-puzzle me-1"></i>Modules</button>
            <button class="btn btn-sm btn-outline-danger" (click)="deleteId=t.id; showDelete.set(true)"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      }
    </div>

    <!-- Edit/Create Tenant Modal -->
    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)"></div>
      <div class="modal-panel">
        <h4 class="modal-title">{{ editId ? 'Edit' : 'Add' }} Tenant</h4>
        <div class="mb-3"><label class="form-label fw-semibold">Name *</label><input type="text" class="form-control" [(ngModel)]="form.name"></div>
        <div class="mb-3"><label class="form-label fw-semibold">Code *</label><input type="text" class="form-control" [(ngModel)]="form.code" [disabled]="!!editId"></div>
        <div class="mb-3"><label class="form-label fw-semibold">Domain *</label><input type="text" class="form-control" [(ngModel)]="form.domain"></div>
        <div class="mb-3"><label class="form-label fw-semibold">Max Employees</label><input type="number" class="form-control" [(ngModel)]="form.maxEmployees"></div>
        <div class="form-check mb-3"><input type="checkbox" class="form-check-input" [(ngModel)]="form.isActive" id="tActive"><label class="form-check-label" for="tActive">Active</label></div>
        <div class="modal-actions">
          <button class="btn btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="!form.name || !form.code">Save</button>
        </div>
      </div>
    }

    <!-- Module Assignment Modal -->
    @if (showModulePanel()) {
      <div class="modal-backdrop" (click)="showModulePanel.set(false)"></div>
      <div class="modal-panel module-panel">
        <h4 class="modal-title"><i class="bi bi-puzzle me-2"></i>Modules for {{ moduleTenantName }}</h4>
        <p class="modal-subtitle">Select which modules this tenant can access. Only globally enabled modules can be assigned.</p>

        <div class="module-list">
          @for (m of tenantModules; track m.code) {
            <label class="module-check-row" [class.globally-disabled]="!m.globallyEnabled">
              <div class="module-check-info">
                <i class="bi" [class]="m.icon" [class.text-muted]="!m.globallyEnabled"></i>
                <div>
                  <span class="module-check-name">{{ m.name }}</span>
                  <span class="module-check-desc">{{ m.description }}</span>
                </div>
              </div>
              <div class="module-check-right">
                @if (!m.globallyEnabled) {
                  <span class="badge-off">Globally Disabled</span>
                } @else {
                  <input type="checkbox" class="form-check-input" [(ngModel)]="m.enabledForTenant">
                }
              </div>
            </label>
          }
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline-secondary" (click)="showModulePanel.set(false)">Cancel</button>
          <button class="btn btn-primary" (click)="saveModules()">
            <i class="bi bi-check-lg me-1"></i>Save Modules
          </button>
        </div>
      </div>
    }

    <app-confirm-dialog [visible]="showDelete()" title="Delete Tenant"
      message="This will deactivate the tenant. Are you sure?" type="danger"
      (confirmed)="confirmDelete()" (cancelled)="showDelete.set(false)" />
  `,
  styles: [`
    .tenants-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(360px,1fr)); gap:20px; }
    .tenant-card {
      background:var(--bg-card,#fff); border-radius:16px; padding:24px;
      border:1px solid var(--border-color,#e5e7eb); box-shadow:0 1px 3px var(--shadow-color,rgba(0,0,0,0.06));
      transition:transform 0.2s, box-shadow 0.2s;
    }
    .tenant-card:hover { transform:translateY(-3px); box-shadow:0 8px 25px var(--shadow-color,rgba(0,0,0,0.1)); }
    .tenant-card.inactive { opacity:0.6; border-color:#fecaca; }
    .tenant-header { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
    .tenant-logo {
      width:48px; height:48px; border-radius:14px;
      background:linear-gradient(135deg,#4F46E5,#7C3AED); color:#fff;
      display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800;
    }
    .tenant-info { flex:1; }
    .tenant-name { font-size:17px; font-weight:700; margin:0; color:var(--text-primary); }
    .tenant-code { font-size:12px; color:var(--text-secondary); font-weight:600; letter-spacing:1px; }
    .status-dot { width:10px; height:10px; border-radius:50%; background:#EF4444; }
    .status-dot.active { background:#10B981; box-shadow:0 0 8px rgba(16,185,129,0.5); }
    .tenant-details { margin-bottom:14px; }
    .detail-row { font-size:13px; color:var(--text-secondary); padding:4px 0; }
    .tenant-modules { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px; }
    .module-tag { font-size:11px; padding:3px 10px; border-radius:6px; background:rgba(79,70,229,0.08); color:#4F46E5; font-weight:600; text-transform:capitalize; }
    .module-tag.none { background:rgba(239,68,68,0.08); color:#dc2626; }
    .tenant-actions { display:flex; gap:8px; }
    .tenant-actions .btn { border-radius:8px; font-size:13px; }

    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1050; backdrop-filter:blur(4px); }
    .modal-panel {
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:1060;
      background:var(--bg-card,#fff); border-radius:16px; padding:28px; min-width:440px; max-width:560px; width:90%;
      box-shadow:0 20px 60px rgba(0,0,0,0.2); max-height:80vh; overflow-y:auto;
    }
    .module-panel { min-width:500px; }
    .modal-title { font-size:18px; font-weight:700; margin:0 0 6px; }
    .modal-subtitle { font-size:13px; color:var(--text-secondary); margin:0 0 18px; line-height:1.5; }
    .form-control { border-radius:10px; }
    .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
    .btn-primary { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:10px; font-weight:600; }

    /* Module check rows */
    .module-list { display:flex; flex-direction:column; gap:8px; }
    .module-check-row {
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      padding:12px 16px; border-radius:12px; cursor:pointer;
      border:1px solid var(--border-color,#e5e7eb); transition:all 0.2s;
    }
    .module-check-row:hover { background:rgba(79,70,229,0.03); border-color:#c7d2fe; }
    .module-check-row.globally-disabled { opacity:0.5; cursor:not-allowed; background:rgba(239,68,68,0.03); border-color:#fecaca; }
    .module-check-info { display:flex; align-items:center; gap:12px; }
    .module-check-info .bi { font-size:20px; color:#4F46E5; }
    .module-check-name { display:block; font-size:14px; font-weight:600; color:var(--text-primary); }
    .module-check-desc { display:block; font-size:12px; color:var(--text-secondary); }
    .module-check-right { display:flex; align-items:center; }
    .badge-off { font-size:10px; padding:3px 8px; border-radius:6px; background:rgba(239,68,68,0.1); color:#dc2626; font-weight:700; white-space:nowrap; }
    .form-check-input { width:20px; height:20px; cursor:pointer; }
    .form-check-input:checked { background-color:#4F46E5; border-color:#4F46E5; }
  `]
})
export class TenantManagementComponent implements OnInit {
  private tenantService = inject(TenantService);
  private configService = inject(ConfigurationService);
  private toast = inject(ToastService);

  tenants: Tenant[] = [];
  showForm = signal(false);
  showDelete = signal(false);
  showModulePanel = signal(false);
  editId = '';
  deleteId = '';
  form: any = { name: '', code: '', domain: '', maxEmployees: 100, isActive: true };

  // Module assignment
  moduleTenantId = '';
  moduleTenantName = '';
  tenantModules: any[] = [];

  ngOnInit(): void {
    this.loadTenants();
  }

  private loadTenants(): void {
    this.tenantService.loadTenants().subscribe(() => {
      this.tenants = this.tenantService.tenants();
    });
  }

  openForm(): void {
    this.editId = '';
    this.form = { name: '', code: '', domain: '', maxEmployees: 100, isActive: true };
    this.showForm.set(true);
  }

  editTenant(t: Tenant): void {
    this.editId = t.id;
    this.form = { name: t.name, code: t.code, domain: t.domain, maxEmployees: t.config.maxEmployees, isActive: t.isActive };
    this.showForm.set(true);
  }

  save(): void {
    const existing = this.tenants.find(t => t.id === this.editId);
    const tenantData: Partial<Tenant> = {
      name: this.form.name,
      code: this.form.code,
      domain: this.form.domain,
      isActive: this.form.isActive,
      config: {
        maxEmployees: this.form.maxEmployees,
        enabledModules: existing?.config?.enabledModules || [],
        theme: existing?.config?.theme || { mode: 'light', primaryColor: '#4F46E5', accentColor: '#7C3AED', fontFamily: 'Inter', sidebarStyle: 'default' },
      }
    };

    const done = (msg: string) => {
      this.showForm.set(false);
      this.toast.success(msg);
      this.loadTenants();
    };

    if (this.editId) {
      this.tenantService.update(this.editId, tenantData).subscribe({
        next: () => done('Tenant updated'),
        error: (err: any) => this.toast.error(err.error?.message || 'Failed to update'),
      });
    } else {
      this.tenantService.create(tenantData).subscribe({
        next: () => done('Tenant created'),
        error: (err: any) => this.toast.error(err.error?.message || 'Failed to create'),
      });
    }
  }

  // --- Module Assignment ---

  openModules(t: Tenant): void {
    this.moduleTenantId = t.id;
    this.moduleTenantName = t.name;
    this.configService.getTenantModules(t.id).subscribe({
      next: modules => {
        this.tenantModules = modules;
        this.showModulePanel.set(true);
      },
      error: () => this.toast.error('Failed to load modules'),
    });
  }

  saveModules(): void {
    const enabled = this.tenantModules
      .filter(m => m.enabledForTenant && m.globallyEnabled)
      .map(m => m.code);

    this.configService.updateTenantModules(this.moduleTenantId, enabled).subscribe({
      next: () => {
        this.showModulePanel.set(false);
        this.toast.success(`Modules updated for ${this.moduleTenantName}`);
        this.loadTenants();
      },
      error: () => this.toast.error('Failed to update modules'),
    });
  }

  confirmDelete(): void {
    this.tenantService.delete(this.deleteId).subscribe({
      next: () => {
        this.showDelete.set(false);
        this.toast.success('Tenant deactivated');
        this.loadTenants();
      },
      error: () => this.toast.error('Failed to delete tenant'),
    });
  }
}
