import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ConfigurationService } from '../../core/services/configuration.service';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [FormsModule, DatePipe, PageHeaderComponent],
  template: `
    <app-page-header title="Activity Logs" subtitle="Complete audit trail of all system actions"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Configuration'},{label:'Activity Logs'}]" />

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <label class="form-label">Search</label>
          <input type="text" class="form-control" placeholder="Search description, user, entity..."
            [(ngModel)]="filters.search" (keyup.enter)="load()">
        </div>
        <div class="filter-group">
          <label class="form-label">Module</label>
          <select class="form-select" [(ngModel)]="filters.module" (ngModelChange)="load()">
            <option value="">All Modules</option>
            <option value="auth">Auth</option>
            <option value="employees">Employees</option>
            <option value="attendance">Attendance</option>
            <option value="masters">Masters</option>
            <option value="configuration">Configuration</option>
            <option value="offboarding">Offboarding</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">Action</label>
          <select class="form-select" [(ngModel)]="filters.action" (ngModelChange)="load()">
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="login_failed">Login Failed</option>
            <option value="toggle">Toggle</option>
            <option value="assign">Assign</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="bulk_create">Bulk Create</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">From</label>
          <input type="date" class="form-control" [(ngModel)]="filters.startDate" (ngModelChange)="load()">
        </div>
        <div class="filter-group">
          <label class="form-label">To</label>
          <input type="date" class="form-control" [(ngModel)]="filters.endDate" (ngModelChange)="load()">
        </div>
        <div class="filter-actions">
          <button class="btn btn-primary btn-sm" (click)="load()"><i class="bi bi-search me-1"></i>Search</button>
          <button class="btn btn-outline-secondary btn-sm" (click)="resetFilters()"><i class="bi bi-x-lg me-1"></i>Clear</button>
        </div>
      </div>
    </div>

    <!-- Results count -->
    <div class="results-bar">
      <span class="badge bg-light text-dark">{{ total }} logs found</span>
      <span class="text-muted" style="font-size:12px">Page {{ page }} of {{ totalPages }}</span>
    </div>

    <!-- Log entries -->
    <div class="log-list">
      @for (log of logs; track log.id) {
        <div class="log-entry" (click)="toggleExpand(log.id)">
          <div class="log-left">
            <div class="log-action-icon" [class]="'action-' + log.action">
              <i class="bi" [class]="actionIcon(log.action)"></i>
            </div>
            <div class="log-content">
              <p class="log-description">{{ log.description }}</p>
              <div class="log-meta">
                @if (log.user_name) { <span class="log-user"><i class="bi bi-person me-1"></i>{{ log.user_name }}</span> }
                <span class="log-module"><i class="bi bi-puzzle me-1"></i>{{ log.module }}</span>
                <span class="log-time"><i class="bi bi-clock me-1"></i>{{ log.created_at | date:'medium' }}</span>
                @if (log.ip_address) {
                  <span class="log-ip"><i class="bi bi-geo me-1"></i>{{ log.ip_address }}</span>
                }
              </div>
            </div>
          </div>
          <div class="log-right">
            <span class="action-badge" [class]="'badge-' + log.action">{{ log.action }}</span>
            <i class="bi bi-chevron-down expand-chevron" [class.rotated]="expandedId() === log.id"></i>
          </div>
        </div>

        <!-- Expanded detail -->
        @if (expandedId() === log.id && (log.previous_values || log.new_values)) {
          <div class="log-detail">
            @if (log.previous_values) {
              <div class="detail-section">
                <h6 class="detail-title"><i class="bi bi-arrow-left-circle me-1"></i>Previous Values</h6>
                <pre class="detail-json">{{ formatJson(log.previous_values) }}</pre>
              </div>
            }
            @if (log.new_values) {
              <div class="detail-section">
                <h6 class="detail-title"><i class="bi bi-arrow-right-circle me-1"></i>New Values</h6>
                <pre class="detail-json">{{ formatJson(log.new_values) }}</pre>
              </div>
            }
          </div>
        }
      }

      @if (logs.length === 0) {
        <div class="empty-state">
          <i class="bi bi-journal-text"></i>
          <p>No activity logs found</p>
        </div>
      }
    </div>

    <!-- Pagination -->
    @if (totalPages > 1) {
      <div class="pagination-bar">
        <button class="btn btn-outline-primary btn-sm" [disabled]="page <= 1" (click)="page = page - 1; load()">
          <i class="bi bi-chevron-left"></i> Previous
        </button>
        <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
        <button class="btn btn-outline-primary btn-sm" [disabled]="page >= totalPages" (click)="page = page + 1; load()">
          Next <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    }
  `,
  styles: [`
    .filters-card {
      background:var(--bg-card,#fff); border-radius:14px; padding:18px 22px;
      border:1px solid var(--border-color,#e5e7eb); margin-bottom:16px;
      box-shadow:0 1px 3px var(--shadow-color,rgba(0,0,0,0.06));
    }
    .filters-row { display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; }
    .filter-group { display:flex; flex-direction:column; min-width:140px; }
    .filter-group .form-label { font-size:11px; font-weight:600; margin-bottom:3px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; }
    .form-control, .form-select { border-radius:8px; font-size:13px; padding:6px 10px; }
    .filter-actions { display:flex; gap:6px; margin-left:auto; }
    .btn-primary { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:8px; font-weight:600; }
    .results-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }

    .log-list { display:flex; flex-direction:column; gap:4px; }
    .log-entry {
      display:flex; justify-content:space-between; align-items:center; gap:14px;
      padding:14px 18px; background:var(--bg-card,#fff); border-radius:12px;
      border:1px solid var(--border-color,#e5e7eb); cursor:pointer;
      transition:all 0.15s;
    }
    .log-entry:hover { border-color:#c7d2fe; box-shadow:0 2px 8px rgba(79,70,229,0.06); }
    .log-left { display:flex; align-items:center; gap:14px; flex:1; min-width:0; }
    .log-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }

    .log-action-icon {
      width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center;
      font-size:16px; flex-shrink:0;
    }
    .action-create { background:rgba(16,185,129,0.1); color:#059669; }
    .action-update { background:rgba(59,130,246,0.1); color:#2563eb; }
    .action-delete { background:rgba(239,68,68,0.1); color:#dc2626; }
    .action-login { background:rgba(79,70,229,0.1); color:#4F46E5; }
    .action-logout { background:rgba(107,114,128,0.1); color:#6b7280; }
    .action-login_failed { background:rgba(239,68,68,0.15); color:#dc2626; }
    .action-toggle { background:rgba(245,158,11,0.1); color:#d97706; }
    .action-assign { background:rgba(6,182,212,0.1); color:#0891b2; }
    .action-approve { background:rgba(16,185,129,0.1); color:#059669; }
    .action-reject { background:rgba(239,68,68,0.1); color:#dc2626; }
    .action-bulk_create { background:rgba(139,92,246,0.1); color:#7c3aed; }
    .action-process { background:rgba(14,165,233,0.1); color:#0284c7; }
    .action-regularize { background:rgba(245,158,11,0.1); color:#d97706; }
    .action-export { background:rgba(107,114,128,0.1); color:#6b7280; }

    .log-content { flex:1; min-width:0; }
    .log-description { font-size:14px; font-weight:500; color:var(--text-primary); margin:0 0 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .log-meta { display:flex; gap:14px; flex-wrap:wrap; }
    .log-meta span { font-size:11px; color:var(--text-secondary); display:flex; align-items:center; }
    .log-user { font-weight:600; color:var(--text-primary) !important; }

    .action-badge {
      font-size:10px; padding:3px 8px; border-radius:6px; font-weight:700;
      text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;
    }
    .badge-create { background:rgba(16,185,129,0.1); color:#059669; }
    .badge-update { background:rgba(59,130,246,0.1); color:#2563eb; }
    .badge-delete { background:rgba(239,68,68,0.1); color:#dc2626; }
    .badge-login { background:rgba(79,70,229,0.1); color:#4F46E5; }
    .badge-logout { background:rgba(107,114,128,0.1); color:#6b7280; }
    .badge-login_failed { background:rgba(239,68,68,0.15); color:#dc2626; }
    .badge-toggle { background:rgba(245,158,11,0.1); color:#d97706; }
    .badge-assign { background:rgba(6,182,212,0.1); color:#0891b2; }
    .badge-approve { background:rgba(16,185,129,0.1); color:#059669; }
    .badge-reject { background:rgba(239,68,68,0.1); color:#dc2626; }
    .badge-bulk_create { background:rgba(139,92,246,0.1); color:#7c3aed; }
    .badge-process { background:rgba(14,165,233,0.1); color:#0284c7; }
    .badge-regularize { background:rgba(245,158,11,0.1); color:#d97706; }
    .badge-export { background:rgba(107,114,128,0.1); color:#6b7280; }

    .expand-chevron { font-size:12px; color:var(--text-secondary); transition:transform 0.2s; }
    .expand-chevron.rotated { transform:rotate(180deg); }

    .log-detail {
      display:grid; grid-template-columns:1fr 1fr; gap:12px;
      padding:14px 18px; margin:-4px 0 4px; background:var(--bg-primary,#f9fafb);
      border:1px solid var(--border-color,#e5e7eb); border-top:none;
      border-radius:0 0 12px 12px; animation:slideDown 0.2s ease;
    }
    .detail-title { font-size:12px; font-weight:700; color:var(--text-secondary); margin:0 0 6px; text-transform:uppercase; letter-spacing:0.5px; }
    .detail-json {
      font-size:12px; background:var(--bg-card,#fff); padding:10px 12px; border-radius:8px;
      border:1px solid var(--border-color,#e5e7eb); white-space:pre-wrap; word-break:break-all;
      margin:0; color:var(--text-primary); font-family:'Fira Code',monospace; max-height:200px; overflow-y:auto;
    }

    .empty-state {
      text-align:center; padding:60px 20px; color:var(--text-secondary);
    }
    .empty-state .bi { font-size:48px; margin-bottom:12px; opacity:0.3; display:block; }

    .pagination-bar {
      display:flex; justify-content:center; align-items:center; gap:16px; margin-top:20px; padding:12px;
    }
    .page-info { font-size:13px; color:var(--text-secondary); font-weight:600; }

    @keyframes slideDown { from { opacity:0; max-height:0; } to { opacity:1; max-height:500px; } }
    @media (max-width:768px) {
      .filters-row { flex-direction:column; }
      .filter-group { min-width:100%; }
      .log-detail { grid-template-columns:1fr; }
    }
  `]
})
export class ActivityLogComponent implements OnInit {
  private configService = inject(ConfigurationService);

  logs: any[] = [];
  total = 0;
  page = 1;
  pageSize = 25;
  totalPages = 0;
  expandedId = signal('');
  filters: any = { search: '', module: '', action: '', startDate: '', endDate: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.configService.getActivityLogs({
      page: this.page,
      pageSize: this.pageSize,
      ...this.filters,
    }).subscribe(res => {
      this.logs = res.data;
      this.total = res.total;
      this.totalPages = res.totalPages;
    });
  }

  resetFilters(): void {
    this.filters = { search: '', module: '', action: '', startDate: '', endDate: '' };
    this.page = 1;
    this.load();
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? '' : id);
  }

  actionIcon(action: string): string {
    const icons: Record<string, string> = {
      create: 'bi-plus-circle', update: 'bi-pencil', delete: 'bi-trash',
      login: 'bi-box-arrow-in-right', logout: 'bi-box-arrow-left', login_failed: 'bi-shield-exclamation',
      toggle: 'bi-toggle-on', assign: 'bi-link-45deg', approve: 'bi-check-circle',
      reject: 'bi-x-circle', bulk_create: 'bi-layers', process: 'bi-gear',
      regularize: 'bi-arrow-repeat', export: 'bi-download',
    };
    return icons[action] || 'bi-activity';
  }

  formatJson(str: string): string {
    try { return JSON.stringify(JSON.parse(str), null, 2); } catch { return str; }
  }
}
