import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { EmployeeService } from '../../core/services/employee.service';
import { MasterService } from '../../core/services/master.service';
import { AttendanceService } from '../../core/services/attendance.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent],
  template: `
    <app-page-header
      [title]="isEdit ? 'Edit Employee' : 'Add Employee'"
      [breadcrumbs]="[{label: 'Home', route: '/dashboard'}, {label: 'Employees', route: '/employees/list'}, {label: isEdit ? 'Edit' : 'Add'}]"
    />

    @if (successMsg) {
      <div class="alert alert-success alert-dismissible fade show" style="border-radius:10px;font-size:14px;">
        <i class="bi bi-check-circle me-2"></i>{{ successMsg }}
        <button type="button" class="btn-close" (click)="successMsg=''"></button>
      </div>
    }

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="emp-form">
      <!-- Personal Information -->
      <div class="form-section">
        <h4 class="section-title"><i class="bi bi-person me-2"></i>Personal Information</h4>
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label">First Name *</label>
            <input type="text" class="form-control" formControlName="firstName" placeholder="Enter first name">
            @if (f('firstName')?.invalid && f('firstName')?.touched) { <small class="text-danger">Required</small> }
          </div>
          <div class="form-field">
            <label class="form-label">Last Name *</label>
            <input type="text" class="form-control" formControlName="lastName" placeholder="Enter last name">
            @if (f('lastName')?.invalid && f('lastName')?.touched) { <small class="text-danger">Required</small> }
          </div>
          <div class="form-field">
            <label class="form-label">Email *</label>
            <input type="email" class="form-control" formControlName="email" placeholder="email@company.com">
            @if (f('email')?.invalid && f('email')?.touched) { <small class="text-danger">Valid email required</small> }
          </div>
          <div class="form-field">
            <label class="form-label">Phone *</label>
            <input type="text" class="form-control" formControlName="phone" placeholder="555-0100">
          </div>
          <div class="form-field">
            <label class="form-label">Date of Birth</label>
            <input type="date" class="form-control" formControlName="dateOfBirth">
          </div>
          <div class="form-field">
            <label class="form-label">Gender</label>
            <select class="form-select" formControlName="gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Employment Details -->
      <div class="form-section">
        <h4 class="section-title"><i class="bi bi-briefcase me-2"></i>Employment Details</h4>
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label">Employee Code *</label>
            <input type="text" class="form-control" formControlName="employeeCode" placeholder="Auto-generated">
          </div>
          <div class="form-field">
            <label class="form-label">Department *</label>
            <select class="form-select" formControlName="departmentId">
              <option value="">Select Department</option>
              @for (d of departments; track d.id) { <option [value]="d.id">{{ d.name }}</option> }
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Designation *</label>
            <select class="form-select" formControlName="designationId">
              <option value="">Select Designation</option>
              @for (d of designations; track d.id) { <option [value]="d.id">{{ d.name }}</option> }
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Date of Joining *</label>
            <input type="date" class="form-control" formControlName="dateOfJoining">
          </div>
          <div class="form-field">
            <label class="form-label">Shift</label>
            <select class="form-select" formControlName="shiftId">
              <option value="">Default Shift</option>
              @for (s of shifts; track s.id) { <option [value]="s.id">{{ s.name }} ({{ s.startTime }} - {{ s.endTime }})</option> }
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Status</label>
            <select class="form-select" formControlName="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Address -->
      <div class="form-section">
        <h4 class="section-title"><i class="bi bi-geo-alt me-2"></i>Address</h4>
        <div class="form-grid">
          <div class="form-field full-width">
            <label class="form-label">Address</label>
            <input type="text" class="form-control" formControlName="address" placeholder="Street address">
          </div>
          <div class="form-field">
            <label class="form-label">City</label>
            <input type="text" class="form-control" formControlName="city" placeholder="City">
          </div>
          <div class="form-field">
            <label class="form-label">State</label>
            <input type="text" class="form-control" formControlName="state" placeholder="State">
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" class="btn btn-outline-secondary btn-lg" (click)="onCancel()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-lg" [disabled]="form.invalid">
          <i class="bi bi-check-lg me-1"></i>{{ isEdit ? 'Update' : 'Create' }} Employee
        </button>
      </div>
    </form>
  `,
  styles: [`
    .emp-form { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .form-section {
      background: var(--bg-card, #fff); border-radius: 14px; padding: 24px;
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 1px 3px var(--shadow-color, rgba(0,0,0,0.06));
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 16px; font-weight: 700; color: var(--text-primary, #111827);
      margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color, #e5e7eb);
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-field { display: flex; flex-direction: column; }
    .form-field.full-width { grid-column: 1 / -1; }
    .form-label { font-size: 13px; font-weight: 600; color: var(--text-primary, #374151); margin-bottom: 6px; }
    .form-control, .form-select {
      border-radius: 10px; padding: 10px 14px; font-size: 14px;
      border: 1.5px solid var(--border-color, #d1d5db); transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-control:focus, .form-select:focus {
      border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
    }
    .form-actions {
      display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px;
    }
    .form-actions .btn { border-radius: 10px; padding: 10px 28px; font-weight: 600; }
    .btn-primary { background: linear-gradient(135deg, #4F46E5, #7C3AED); border: none; }
    .btn-primary:hover { box-shadow: 0 4px 15px rgba(79,70,229,0.35); }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private masterService = inject(MasterService);
  private attendanceService = inject(AttendanceService);

  isEdit = false;
  editId = '';
  successMsg = '';
  departments: any[] = [];
  designations: any[] = [];
  shifts: any[] = [];

  form: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    dateOfBirth: [''],
    gender: ['male'],
    employeeCode: ['', Validators.required],
    departmentId: ['', Validators.required],
    designationId: ['', Validators.required],
    dateOfJoining: ['', Validators.required],
    shiftId: [''],
    status: ['active'],
    address: [''],
    city: [''],
    state: [''],
  });

  f(name: string) { return this.form.get(name); }

  ngOnInit(): void {
    forkJoin({
      departments: this.masterService.getDepartments(),
      designations: this.masterService.getDesignations(),
      shifts: this.attendanceService.getShifts()
    }).subscribe(({ departments, designations, shifts }) => {
      this.departments = departments;
      this.designations = designations;
      this.shifts = shifts;

      const id = this.route.snapshot.params['id'];
      if (id) {
        this.isEdit = true;
        this.editId = id;
        this.employeeService.getById(id).subscribe(emp => {
          if (emp) {
            this.form.patchValue({
              employeeCode: emp.employeeCode,
              firstName: emp.firstName,
              lastName: emp.lastName,
              email: emp.email,
              phone: emp.phone,
              dateOfBirth: emp.dateOfBirth,
              gender: emp.gender,
              dateOfJoining: emp.dateOfJoining,
              address: emp.address,
              city: emp.city,
              state: emp.state,
              departmentId: emp.departmentId,
              designationId: emp.designationId,
              shiftId: emp.shiftId,
              status: emp.status,
            });
          }
        });
      } else {
        this.employeeService.getCount().subscribe(count => {
          this.form.patchValue({ employeeCode: 'EMP' + String(count + 1).padStart(4, '0') });
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const obs$ = this.isEdit
      ? this.employeeService.update(this.editId, val)
      : this.employeeService.create(val);

    obs$.subscribe({
      next: () => {
        this.successMsg = this.isEdit ? 'Employee updated successfully!' : 'Employee created successfully!';
        setTimeout(() => this.router.navigate(['/employees']), 1200);
      },
      error: (err: any) => {
        this.successMsg = err.error?.message || 'An error occurred';
      }
    });
  }

  onCancel(): void { this.router.navigate(['/employees/list']); }
}
