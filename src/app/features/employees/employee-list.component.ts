import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataTableComponent } from '../../shared/components/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { EmployeeService } from '../../core/services/employee.service';
import { MasterService } from '../../core/services/master.service';
import { TableColumn } from '../../core/models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [DataTableComponent, PageHeaderComponent, ConfirmDialogComponent, FormsModule],
  template: `
    <app-page-header
      title="Employees"
      subtitle="Manage your organization's workforce"
      [breadcrumbs]="[{label: 'Home', route: '/dashboard'}, {label: 'Employees'}]"
      [actions]="[{label: 'Add Employee', icon: 'bi-plus-lg', action: 'add', class: 'btn btn-primary'}]"
      (actionClick)="onAction($event)"
    />

    <!-- Filters -->
    <div class="filters-row">
      <div class="filter-group">
        <select class="form-select filter-select" [(ngModel)]="filterDept" (ngModelChange)="applyFilters()">
          <option value="">All Departments</option>
          @for (d of departments; track d.id) {
            <option [value]="d.id">{{ d.name }}</option>
          }
        </select>
      </div>
      <div class="filter-group">
        <select class="form-select filter-select" [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="offboarded">Offboarded</option>
        </select>
      </div>
      <div class="filter-info">
        <span class="badge bg-light text-dark">{{ tableData.length }} employees</span>
      </div>
    </div>

    <app-data-table
      [columns]="columns"
      [data]="tableData"
      [pageSize]="10"
      (rowAction)="onRowAction($event)"
    />

    <app-confirm-dialog
      [visible]="showDeleteDialog()"
      title="Delete Employee"
      message="Are you sure you want to delete this employee? This action cannot be undone."
      type="danger"
      confirmText="Delete"
      (confirmed)="confirmDelete()"
      (cancelled)="showDeleteDialog.set(false)"
    />
  `,
  styles: [`
    .filters-row {
      display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;
    }
    .filter-select {
      border-radius: 8px; font-size: 13px; padding: 8px 14px; min-width: 180px;
      border: 1px solid var(--border-color, #e5e7eb);
    }
    .filter-info { margin-left: auto; }
  `]
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private masterService = inject(MasterService);
  private router = inject(Router);

  departments: any[] = [];
  designations: any[] = [];
  filterDept = '';
  filterStatus = '';
  showDeleteDialog = signal(false);
  private deleteTarget: any = null;

  columns: TableColumn[] = [
    { key: 'name', label: 'Employee', type: 'avatar', sortable: true },
    { key: 'employeeCode', label: 'Code', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'designation', label: 'Designation', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'dateOfJoining', label: 'Joined', type: 'date', sortable: true },
    { key: 'status', label: 'Status', type: 'badge', sortable: true, badgeMap: { active: 'bg-success', inactive: 'bg-warning text-dark', offboarded: 'bg-danger' } },
    { key: '_actions', label: 'Actions', type: 'actions', width: '100px' },
  ];
  tableData: any[] = [];

  ngOnInit(): void {
    forkJoin({
      departments: this.masterService.getDepartments(),
      designations: this.masterService.getDesignations()
    }).subscribe(({ departments, designations }) => {
      this.departments = departments;
      this.designations = designations;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const deptMap = new Map(this.departments.map(d => [d.id, d.name]));
    const desgMap = new Map(this.designations.map(d => [d.id, d.name]));
    this.employeeService.search('', {
      departmentId: this.filterDept || undefined,
      status: this.filterStatus || undefined,
    }).subscribe(({ data }) => {
      this.tableData = data.map(e => ({
        ...e,
        name: `${e.firstName} ${e.lastName}`,
        department: deptMap.get(e.departmentId) || e.departmentName || e.departmentId,
        designation: desgMap.get(e.designationId) || e.designationName || e.designationId,
      }));
    });
  }

  onAction(action: string): void {
    if (action === 'add') this.router.navigate(['/employees/add']);
  }

  onRowAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/employees/edit', event.row.id]);
    } else if (event.action === 'delete') {
      this.deleteTarget = event.row;
      this.showDeleteDialog.set(true);
    }
  }

  confirmDelete(): void {
    if (this.deleteTarget) {
      this.employeeService.delete(this.deleteTarget.id).subscribe(() => this.applyFilters());
    }
    this.showDeleteDialog.set(false);
    this.deleteTarget = null;
  }
}
