import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-page">
      <!-- LEFT SIDE: Brand -->
      <div class="login-brand">
        <!-- Floating shapes -->
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>

        <div class="brand-content">
          <div class="brand-logo">
            <i class="bi bi-calendar-check"></i>
          </div>
          <h1 class="brand-name">AttendEase</h1>
          <p class="brand-tagline">Enterprise Attendance Management System</p>

          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Multi-tenant Architecture</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Real-time Analytics</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Smart Automation</span>
            </div>
          </div>

          <div class="brand-version">v2.0</div>
        </div>
      </div>

      <!-- RIGHT SIDE: Form -->
      <div class="login-form-side">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">Welcome Back</h2>
            <p class="form-subtitle">Sign in to your account</p>
          </div>

          @if (errorMessage()) {
            <div class="error-alert">
              <i class="bi bi-exclamation-circle"></i>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Username -->
            <div class="input-group-custom">
              <label class="input-label">Username</label>
              <div class="input-wrapper" [class.input-error]="isFieldInvalid('username')">
                <i class="bi bi-person input-icon"></i>
                <input type="text" formControlName="username" placeholder="Enter your username" class="input-field" />
              </div>
              @if (isFieldInvalid('username')) {
                <span class="field-error">Username is required</span>
              }
            </div>

            <!-- Password -->
            <div class="input-group-custom">
              <label class="input-label">Password</label>
              <div class="input-wrapper" [class.input-error]="isFieldInvalid('password')">
                <i class="bi bi-lock input-icon"></i>
                <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Enter your password" class="input-field" />
                <button type="button" class="toggle-pass" (click)="showPassword.set(!showPassword())">
                  <i class="bi" [class.bi-eye]="!showPassword()" [class.bi-eye-slash]="showPassword()"></i>
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <span class="field-error">Password must be at least 4 characters</span>
              }
            </div>

            <!-- Remember me -->
            <div class="remember-row">
              <label class="check-label">
                <input type="checkbox" formControlName="remember" class="form-check-input" />
                <span>Remember me</span>
              </label>
            </div>

            <!-- Submit -->
            <button type="submit" class="submit-btn" [disabled]="isSubmitting()">
              @if (isSubmitting()) {
                <span class="spinner-border spinner-border-sm"></span>
                <span>Signing in...</span>
              } @else {
                <span>Sign In</span>
                <i class="bi bi-arrow-right"></i>
              }
            </button>
          </form>

          <!-- Demo credentials -->
          <div class="demo-section">
            <p class="demo-title">Demo Credentials</p>
            <div class="demo-cards">
              <div class="demo-card" (click)="fillCredentials('superadmin')">
                <span class="demo-role">Super Admin</span>
                <span class="demo-cred">superadmin / admin123</span>
              </div>
              <div class="demo-card" (click)="fillCredentials('tenantadmin')">
                <span class="demo-role">Tenant Admin</span>
                <span class="demo-cred">tenantadmin / admin123</span>
              </div>
              <div class="demo-card" (click)="fillCredentials('hrmanager')">
                <span class="demo-role">HR Manager</span>
                <span class="demo-cred">hrmanager / admin123</span>
              </div>
              <div class="demo-card" (click)="fillCredentials('employee')">
                <span class="demo-role">Employee</span>
                <span class="demo-cred">employee / admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex; min-height: 100vh; width: 100%;
      font-family: var(--font-family, 'Inter', system-ui, sans-serif);
    }

    /* LEFT BRAND */
    .login-brand {
      width: 60%; position: relative; overflow: hidden;
      background: linear-gradient(135deg, #312E81 0%, #4F46E5 30%, #7C3AED 60%, #2563EB 100%);
      display: flex; align-items: center; justify-content: center;
    }
    .brand-content { position: relative; z-index: 2; text-align: center; padding: 40px; }
    .brand-logo {
      width: 80px; height: 80px; border-radius: 24px;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 36px; color: #fff; margin-bottom: 24px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .brand-name {
      font-size: 48px; font-weight: 800; color: #fff;
      letter-spacing: -1.5px; margin: 0 0 8px;
    }
    .brand-tagline {
      font-size: 18px; color: rgba(255,255,255,0.7);
      margin: 0 0 48px; font-weight: 300;
    }
    .brand-features { display: flex; flex-direction: column; gap: 14px; align-items: center; }
    .feature-item {
      display: flex; align-items: center; gap: 12px;
      color: rgba(255,255,255,0.8); font-size: 15px; font-weight: 500;
    }
    .feature-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #34D399; box-shadow: 0 0 10px rgba(52,211,153,0.5);
    }
    .brand-version {
      margin-top: 48px; padding: 6px 16px; border-radius: 20px;
      background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5);
      font-size: 12px; display: inline-block; font-weight: 500;
      border: 1px solid rgba(255,255,255,0.1);
    }

    /* Floating shapes */
    .shape {
      position: absolute; border-radius: 50%; opacity: 0.08;
      background: #fff; animation: float 20s infinite ease-in-out;
    }
    .shape-1 { width: 300px; height: 300px; top: -50px; right: -80px; animation-delay: 0s; }
    .shape-2 { width: 200px; height: 200px; bottom: 10%; left: -60px; animation-delay: -5s; }
    .shape-3 { width: 120px; height: 120px; top: 40%; right: 15%; animation-delay: -10s; border-radius: 24px; transform: rotate(45deg); }
    .shape-4 { width: 80px; height: 80px; bottom: 20%; right: 30%; animation-delay: -7s; }
    .shape-5 { width: 160px; height: 160px; top: 15%; left: 20%; animation-delay: -3s; border-radius: 30px; }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(15px, -20px) rotate(5deg); }
      50% { transform: translate(-10px, 15px) rotate(-3deg); }
      75% { transform: translate(20px, 10px) rotate(4deg); }
    }

    /* RIGHT FORM */
    .login-form-side {
      width: 40%; display: flex; align-items: center; justify-content: center;
      background: var(--bg-card, #fff); padding: 40px;
    }
    .form-container { width: 100%; max-width: 400px; animation: fadeInUp 0.6s ease; }
    .form-header { margin-bottom: 32px; }
    .form-title {
      font-size: 30px; font-weight: 800; color: var(--text-primary, #111827);
      margin: 0 0 6px; letter-spacing: -0.5px;
    }
    .form-subtitle { font-size: 15px; color: var(--text-secondary, #6b7280); margin: 0; }

    /* Error alert */
    .error-alert {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border-radius: 10px; margin-bottom: 20px;
      background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626;
      font-size: 13px; font-weight: 500;
      animation: shakeX 0.4s ease;
    }

    /* Input groups */
    .input-group-custom { margin-bottom: 20px; }
    .input-label {
      display: block; font-size: 13px; font-weight: 600;
      color: var(--text-primary, #374151); margin-bottom: 6px;
    }
    .input-wrapper {
      display: flex; align-items: center; position: relative;
      border: 1.5px solid var(--border-color, #D1D5DB); border-radius: 12px;
      background: var(--bg-primary, #F9FAFB); transition: all 0.2s;
      overflow: hidden;
    }
    .input-wrapper:focus-within {
      border-color: #4F46E5;
      box-shadow: 0 0 0 4px rgba(79,70,229,0.08);
      background: #fff;
    }
    .input-wrapper.input-error {
      border-color: #EF4444;
      box-shadow: 0 0 0 4px rgba(239,68,68,0.06);
    }
    .input-icon {
      padding-left: 14px; color: var(--text-secondary, #9CA3AF); font-size: 17px;
    }
    .input-field {
      flex: 1; border: none; background: none; padding: 13px 14px;
      font-size: 14px; color: var(--text-primary, #111827); outline: none;
      font-family: inherit;
    }
    .input-field::placeholder { color: #9CA3AF; }
    .toggle-pass {
      background: none; border: none; cursor: pointer;
      padding: 0 14px; color: var(--text-secondary, #9CA3AF);
      transition: color 0.15s; font-size: 16px;
    }
    .toggle-pass:hover { color: var(--text-primary, #374151); }
    .field-error { font-size: 12px; color: #EF4444; margin-top: 4px; display: block; }

    /* Remember me */
    .remember-row { margin-bottom: 24px; }
    .check-label {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--text-secondary, #6b7280); cursor: pointer;
    }

    /* Submit button */
    .submit-btn {
      width: 100%; padding: 14px 24px; border: none; border-radius: 12px;
      background: linear-gradient(135deg, #4F46E5, #7C3AED);
      color: #fff; font-size: 15px; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(79,70,229,0.35);
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(79,70,229,0.45);
    }
    .submit-btn:active:not(:disabled) { transform: translateY(0); }
    .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

    /* Demo section */
    .demo-section {
      margin-top: 32px; padding-top: 24px;
      border-top: 1px solid var(--border-color, #E5E7EB);
    }
    .demo-title {
      font-size: 12px; text-transform: uppercase; letter-spacing: 1px;
      color: var(--text-secondary, #9CA3AF); margin: 0 0 12px; font-weight: 600;
    }
    .demo-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .demo-card {
      padding: 10px 12px; border-radius: 10px; cursor: pointer;
      border: 1px solid var(--border-color, #E5E7EB);
      background: var(--bg-primary, #F9FAFB); transition: all 0.2s;
    }
    .demo-card:hover {
      border-color: #4F46E5; background: rgba(79,70,229,0.03);
      transform: translateY(-1px);
    }
    .demo-role { display: block; font-size: 12px; font-weight: 700; color: var(--text-primary, #374151); }
    .demo-cred { display: block; font-size: 11px; color: var(--text-secondary, #9CA3AF); margin-top: 2px; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shakeX {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      50% { transform: translateX(8px); }
      75% { transform: translateX(-4px); }
    }

    /* Responsive */
    @media (max-width: 900px) {
      .login-page { flex-direction: column; }
      .login-brand { width: 100%; min-height: 300px; }
      .login-form-side { width: 100%; padding: 32px 24px; }
      .brand-name { font-size: 36px; }
      .brand-tagline { font-size: 15px; margin-bottom: 24px; }
      .brand-features { display: none; }
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    remember: [false]
  });

  showPassword = signal(false);
  errorMessage = signal('');
  isSubmitting = signal(false);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  fillCredentials(username: string): void {
    this.loginForm.patchValue({ username, password: 'admin123' });
    this.errorMessage.set('');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (user) => {
        this.toast.success(`Welcome back, ${user.fullName}!`);
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.errorMessage.set(err.error?.message || 'Invalid username or password');
        this.isSubmitting.set(false);
      },
    });
  }
}
