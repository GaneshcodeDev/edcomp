import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Settings & Customization" subtitle="Personalize your workspace appearance"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Settings'}]" />

    <div class="settings-grid">
      <!-- Theme Mode -->
      <div class="setting-card">
        <h4 class="setting-title"><i class="bi bi-circle-half me-2"></i>Theme Mode</h4>
        <div class="theme-modes">
          <div class="mode-card" [class.selected]="theme().mode === 'light'" (click)="themeService.setMode('light')">
            <div class="mode-preview light-preview">
              <div class="preview-sidebar"></div>
              <div class="preview-content"><div class="preview-bar"></div><div class="preview-cards"><div class="preview-card"></div><div class="preview-card"></div></div></div>
            </div>
            <span class="mode-label">Light</span>
          </div>
          <div class="mode-card" [class.selected]="theme().mode === 'dark'" (click)="themeService.setMode('dark')">
            <div class="mode-preview dark-preview">
              <div class="preview-sidebar"></div>
              <div class="preview-content"><div class="preview-bar"></div><div class="preview-cards"><div class="preview-card"></div><div class="preview-card"></div></div></div>
            </div>
            <span class="mode-label">Dark</span>
          </div>
        </div>
      </div>

      <!-- Primary Color -->
      <div class="setting-card">
        <h4 class="setting-title"><i class="bi bi-palette me-2"></i>Primary Color</h4>
        <div class="color-swatches">
          @for (c of primaryColors; track c.value) {
            <button class="swatch" [style.background]="c.value" [class.selected]="theme().primaryColor === c.value"
              (click)="setPrimaryColor(c.value)" [title]="c.name">
              @if (theme().primaryColor === c.value) { <i class="bi bi-check"></i> }
            </button>
          }
        </div>
      </div>

      <!-- Accent Color -->
      <div class="setting-card">
        <h4 class="setting-title"><i class="bi bi-droplet me-2"></i>Accent Color</h4>
        <div class="color-swatches">
          @for (c of accentColors; track c.value) {
            <button class="swatch" [style.background]="c.value" [class.selected]="theme().accentColor === c.value"
              (click)="setAccentColor(c.value)" [title]="c.name">
              @if (theme().accentColor === c.value) { <i class="bi bi-check"></i> }
            </button>
          }
        </div>
      </div>

      <!-- Font Family -->
      <div class="setting-card">
        <h4 class="setting-title"><i class="bi bi-fonts me-2"></i>Font Family</h4>
        <div class="font-options">
          @for (f of fonts; track f) {
            <button class="font-btn" [class.selected]="theme().fontFamily === f"
              [style.font-family]="f" (click)="setFont(f)">
              {{ f }}
            </button>
          }
        </div>
      </div>

      <!-- Sidebar Style -->
      <div class="setting-card">
        <h4 class="setting-title"><i class="bi bi-layout-sidebar me-2"></i>Sidebar Style</h4>
        <div class="sidebar-options">
          @for (s of sidebarStyles; track s.value) {
            <div class="sidebar-opt" [class.selected]="theme().sidebarStyle === s.value"
              (click)="setSidebarStyle(s.value)">
              <div class="sidebar-mini" [class]="'mini-' + s.value"></div>
              <span>{{ s.label }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Preview -->
      <div class="setting-card preview-card">
        <h4 class="setting-title"><i class="bi bi-eye me-2"></i>Preview</h4>
        <div class="preview-section">
          <div class="preview-btn-row">
            <button class="btn btn-sm" [style.background]="theme().primaryColor" style="color:#fff;border:none;border-radius:8px;padding:6px 16px;">Primary Button</button>
            <button class="btn btn-sm" [style.background]="theme().accentColor" style="color:#fff;border:none;border-radius:8px;padding:6px 16px;">Accent Button</button>
            <button class="btn btn-sm btn-outline-secondary" style="border-radius:8px;padding:6px 16px;">Secondary</button>
          </div>
          <div class="preview-text" [style.font-family]="theme().fontFamily">
            <p style="font-size:18px;font-weight:700;margin:12px 0 4px;">Heading Text</p>
            <p style="font-size:14px;color:#6b7280;margin:0;">This is how body text will look with {{ theme().fontFamily }} font.</p>
          </div>
          <div class="preview-badges">
            <span class="badge" [style.background]="theme().primaryColor" style="margin-right:4px;">Primary</span>
            <span class="badge" [style.background]="theme().accentColor">Accent</span>
            <span class="badge bg-success" style="margin-left:4px;">Success</span>
            <span class="badge bg-danger" style="margin-left:4px;">Danger</span>
          </div>
        </div>
        <button class="btn btn-outline-secondary btn-sm mt-3" style="border-radius:8px;" (click)="resetDefaults()">
          <i class="bi bi-arrow-counterclockwise me-1"></i>Reset to Defaults
        </button>
      </div>
    </div>
  `,
  styles: [`
    .settings-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .setting-card {
      background:var(--bg-card,#fff); border-radius:16px; padding:24px;
      border:1px solid var(--border-color,#e5e7eb); box-shadow:0 1px 3px var(--shadow-color,rgba(0,0,0,0.06));
    }
    .setting-title { font-size:15px; font-weight:700; margin:0 0 16px; color:var(--text-primary); }
    .theme-modes { display:flex; gap:16px; }
    .mode-card {
      flex:1; cursor:pointer; border:2px solid var(--border-color,#e5e7eb); border-radius:12px; padding:12px; text-align:center;
      transition:border-color 0.2s, transform 0.2s;
    }
    .mode-card:hover { transform:translateY(-2px); }
    .mode-card.selected { border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,0.15); }
    .mode-preview { display:flex; border-radius:8px; overflow:hidden; height:80px; margin-bottom:8px; }
    .light-preview { background:#f8fafc; }
    .light-preview .preview-sidebar { width:25%; background:#1e293b; }
    .light-preview .preview-content { flex:1; padding:8px; }
    .light-preview .preview-bar { height:10px; background:#e2e8f0; border-radius:4px; margin-bottom:8px; }
    .light-preview .preview-cards { display:flex; gap:4px; }
    .light-preview .preview-card { flex:1; height:36px; background:#fff; border-radius:4px; border:1px solid #e2e8f0; }
    .dark-preview { background:#0f172a; }
    .dark-preview .preview-sidebar { width:25%; background:#0b1120; }
    .dark-preview .preview-content { flex:1; padding:8px; }
    .dark-preview .preview-bar { height:10px; background:#1e293b; border-radius:4px; margin-bottom:8px; }
    .dark-preview .preview-cards { display:flex; gap:4px; }
    .dark-preview .preview-card { flex:1; height:36px; background:#1e293b; border-radius:4px; }
    .mode-label { font-size:13px; font-weight:600; color:var(--text-primary); }
    .color-swatches { display:flex; gap:10px; flex-wrap:wrap; }
    .swatch {
      width:44px; height:44px; border-radius:12px; border:3px solid transparent; cursor:pointer;
      display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px;
      transition:transform 0.2s, border-color 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.15);
    }
    .swatch:hover { transform:scale(1.1); }
    .swatch.selected { border-color:var(--text-primary,#111); transform:scale(1.1); }
    .font-options { display:flex; flex-wrap:wrap; gap:8px; }
    .font-btn {
      padding:8px 16px; border-radius:10px; border:1.5px solid var(--border-color,#d1d5db);
      background:var(--bg-primary,#f9fafb); color:var(--text-primary); cursor:pointer;
      font-size:14px; font-weight:500; transition:all 0.2s;
    }
    .font-btn:hover { border-color:#4F46E5; }
    .font-btn.selected { background:linear-gradient(135deg,#4F46E5,#7C3AED); color:#fff; border-color:transparent; }
    .sidebar-options { display:flex; gap:12px; }
    .sidebar-opt {
      text-align:center; cursor:pointer; padding:10px 16px; border-radius:10px;
      border:1.5px solid var(--border-color,#d1d5db); transition:all 0.2s;
    }
    .sidebar-opt:hover { border-color:#4F46E5; }
    .sidebar-opt.selected { border-color:#4F46E5; background:rgba(79,70,229,0.05); }
    .sidebar-opt span { display:block; font-size:12px; font-weight:600; margin-top:6px; color:var(--text-primary); }
    .sidebar-mini { width:50px; height:40px; border-radius:6px; margin:0 auto; }
    .mini-default { background:linear-gradient(90deg,#1e293b 30%,#f8fafc 30%); }
    .mini-compact { background:linear-gradient(90deg,#1e293b 15%,#f8fafc 15%); }
    .mini-gradient { background:linear-gradient(135deg,#0f172a,#312e81 30%,#f8fafc 30%); }
    .preview-card { grid-column:1 / -1; }
    .preview-section { background:var(--bg-primary,#f9fafb); border-radius:12px; padding:18px; }
    .preview-btn-row { display:flex; gap:8px; flex-wrap:wrap; }
    .preview-badges { margin-top:12px; }
    @media (max-width:768px) { .settings-grid { grid-template-columns:1fr; } }
  `]
})
export class SettingsComponent implements OnInit {
  themeService = inject(ThemeService);
  theme = this.themeService.currentTheme;

  ngOnInit(): void {
    this.themeService.loadTheme();
  }

  primaryColors = [
    { name: 'Indigo', value: '#4F46E5' }, { name: 'Blue', value: '#2563EB' },
    { name: 'Emerald', value: '#059669' }, { name: 'Rose', value: '#E11D48' },
    { name: 'Amber', value: '#D97706' }, { name: 'Slate', value: '#475569' },
  ];

  accentColors = [
    { name: 'Purple', value: '#7C3AED' }, { name: 'Pink', value: '#EC4899' },
    { name: 'Cyan', value: '#06B6D4' }, { name: 'Lime', value: '#65A30D' },
  ];

  fonts = ['Inter', 'Roboto', 'Poppins', 'Open Sans', 'Nunito'];

  sidebarStyles = [
    { value: 'default' as const, label: 'Default' },
    { value: 'compact' as const, label: 'Compact' },
    { value: 'gradient' as const, label: 'Gradient' },
  ];

  setPrimaryColor(color: string): void {
    this.themeService.currentTheme.update(t => ({ ...t, primaryColor: color }));
  }

  setAccentColor(color: string): void {
    this.themeService.currentTheme.update(t => ({ ...t, accentColor: color }));
  }

  setFont(font: string): void {
    this.themeService.currentTheme.update(t => ({ ...t, fontFamily: font }));
  }

  setSidebarStyle(style: string): void {
    this.themeService.currentTheme.update(t => ({ ...t, sidebarStyle: style as any }));
  }

  resetDefaults(): void {
    this.themeService.currentTheme.set({
      mode: 'light', primaryColor: '#4F46E5', accentColor: '#7C3AED', fontFamily: 'Inter', sidebarStyle: 'gradient'
    });
    this.themeService.setMode('light');
  }
}
