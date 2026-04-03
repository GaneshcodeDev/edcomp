import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ConfigurationService } from '../../core/services/configuration.service';
import { ToastService } from '../../core/services/toast.service';
import { AppModule } from '../../core/models';

@Component({
  selector: 'app-module-management',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Module Management" subtitle="Globally enable or disable application modules for the entire platform"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Configuration'},{label:'Modules'}]" />

    <div class="info-banner">
      <i class="bi bi-info-circle"></i>
      <span>Disabling a module here will make it <strong>unavailable across all tenants</strong>. APIs will return "Module Disabled" error.</span>
    </div>

    <div class="modules-grid">
      @for (mod of modules; track mod.id) {
        <div class="module-card" [class.disabled]="!mod.isActive">
          <div class="module-icon-wrap" [class.off]="!mod.isActive">
            <i class="bi" [class]="mod.icon"></i>
          </div>
          <div class="module-info">
            <h4 class="module-name">{{ mod.name }}</h4>
            <p class="module-desc">{{ mod.description }}</p>
            <span class="module-code">{{ mod.code }}</span>
            <span class="module-status" [class.active]="mod.isActive">{{ mod.isActive ? 'Enabled' : 'Disabled' }}</span>
          </div>
          <div class="module-toggle">
            <label class="switch">
              <input type="checkbox" [(ngModel)]="mod.isActive" (ngModelChange)="onToggle(mod)">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .info-banner {
      display:flex; align-items:center; gap:10px; padding:14px 18px;
      background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2);
      border-radius:12px; margin-bottom:20px; font-size:13px; color:#1e40af;
    }
    .info-banner .bi { font-size:18px; flex-shrink:0; }
    .modules-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(360px,1fr)); gap:20px; }
    .module-card {
      display:flex; align-items:center; gap:18px;
      background:var(--bg-card,#fff); border-radius:16px; padding:22px 24px;
      border:1px solid var(--border-color,#e5e7eb); box-shadow:0 1px 3px var(--shadow-color,rgba(0,0,0,0.06));
      transition:all 0.3s;
    }
    .module-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px var(--shadow-color,rgba(0,0,0,0.08)); }
    .module-card.disabled { opacity:0.55; border-color:#fecaca; }
    .module-icon-wrap {
      width:52px; height:52px; border-radius:14px; flex-shrink:0;
      background:rgba(79,70,229,0.1); color:#4F46E5;
      display:flex; align-items:center; justify-content:center; font-size:22px;
      transition:all 0.3s;
    }
    .module-icon-wrap.off { background:rgba(239,68,68,0.08); color:#EF4444; }
    .module-info { flex:1; }
    .module-name { font-size:15px; font-weight:700; margin:0 0 4px; color:var(--text-primary); }
    .module-desc { font-size:13px; color:var(--text-secondary); margin:0 0 6px; line-height:1.4; }
    .module-code { font-size:11px; background:var(--bg-primary,#f3f4f6); padding:2px 8px; border-radius:4px; color:var(--text-secondary); font-weight:600; }
    .module-status { font-size:11px; margin-left:8px; padding:2px 8px; border-radius:4px; font-weight:700; }
    .module-status.active { background:rgba(16,185,129,0.1); color:#059669; }
    .module-status:not(.active) { background:rgba(239,68,68,0.1); color:#dc2626; }
    .switch { position:relative; width:48px; height:26px; display:inline-block; }
    .switch input { opacity:0; width:0; height:0; }
    .slider {
      position:absolute; inset:0; background:#cbd5e1; border-radius:26px; cursor:pointer; transition:background 0.3s;
    }
    .slider::before {
      content:''; position:absolute; width:20px; height:20px; left:3px; bottom:3px;
      background:#fff; border-radius:50%; transition:transform 0.3s;
    }
    .switch input:checked + .slider { background:linear-gradient(135deg,#4F46E5,#7C3AED); }
    .switch input:checked + .slider::before { transform:translateX(22px); }
  `]
})
export class ModuleManagementComponent implements OnInit {
  private configService = inject(ConfigurationService);
  private toast = inject(ToastService);
  modules: AppModule[] = [];

  ngOnInit(): void {
    this.configService.getAppModules().subscribe(modules => this.modules = modules);
  }

  onToggle(mod: AppModule): void {
    this.configService.updateAppModule(mod.id, { isActive: mod.isActive }).subscribe({
      next: () => this.toast.success(`${mod.name} ${mod.isActive ? 'enabled' : 'disabled'} globally`),
      error: () => {
        mod.isActive = !mod.isActive;
        this.toast.error('Failed to update module');
      }
    });
  }
}
