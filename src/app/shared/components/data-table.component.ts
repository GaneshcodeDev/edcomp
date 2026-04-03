import { Component, Input, Output, EventEmitter, signal, computed, SimpleChanges, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableColumn } from '../../core/models';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="table-card">
      <!-- Search -->
      @if (searchable) {
        <div class="table-toolbar">
          <div class="search-box">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              class="form-control"
              placeholder="Search..."
              [ngModel]="searchTerm()"
              (ngModelChange)="onSearch($event)"
            />
          </div>
          <div class="toolbar-info">
            <span class="text-muted">{{ filteredData().length }} record(s)</span>
          </div>
        </div>
      }

      <!-- Table -->
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              @if (selectable) {
                <th class="check-col">
                  <input type="checkbox" class="form-check-input" [checked]="allSelected()" (change)="toggleAll()" />
                </th>
              }
              @for (col of columns; track col.key) {
                <th [style.width]="col.width || 'auto'" [class.sortable]="col.sortable" (click)="col.sortable ? toggleSort(col.key) : null">
                  {{ col.label }}
                  @if (col.sortable) {
                    <i class="bi sort-icon" [class.bi-chevron-up]="sortKey() === col.key && sortDir() === 'asc'" [class.bi-chevron-down]="sortKey() === col.key && sortDir() === 'desc'" [class.bi-chevron-expand]="sortKey() !== col.key"></i>
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              @for (i of skeletonRows; track i) {
                <tr class="skeleton-row">
                  @if (selectable) { <td><div class="skeleton skeleton-check"></div></td> }
                  @for (col of columns; track col.key) {
                    <td><div class="skeleton skeleton-text"></div></td>
                  }
                </tr>
              }
            } @else if (paginatedData().length === 0) {
              <tr>
                <td [attr.colspan]="columns.length + (selectable ? 1 : 0)" class="empty-state">
                  <div class="empty-container">
                    <i class="bi bi-inbox empty-icon"></i>
                    <p class="empty-title">No data found</p>
                    <p class="empty-sub">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (row of paginatedData(); track $index) {
                <tr [class.selected]="isSelected(row)" class="data-row">
                  @if (selectable) {
                    <td class="check-col">
                      <input type="checkbox" class="form-check-input" [checked]="isSelected(row)" (change)="toggleRow(row)" />
                    </td>
                  }
                  @for (col of columns; track col.key) {
                    <td>
                      @switch (col.type) {
                        @case ('badge') {
                          <span class="badge" [class]="col.badgeMap?.[row[col.key]] || 'bg-secondary'">{{ row[col.key] }}</span>
                        }
                        @case ('date') {
                          {{ formatDate(row[col.key]) }}
                        }
                        @case ('avatar') {
                          <div class="avatar-cell">
                            <div class="avatar-circle">{{ getInitials(row[col.key]) }}</div>
                            <span>{{ row[col.key] }}</span>
                          </div>
                        }
                        @case ('actions') {
                          <div class="action-btns">
                            <button class="btn btn-sm btn-outline-primary action-btn" (click)="rowAction.emit({action: 'edit', row})">
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger action-btn" (click)="rowAction.emit({action: 'delete', row})">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        }
                        @default {
                          {{ row[col.key] }}
                        }
                      }
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (paginated && !loading && filteredData().length > 0) {
        <div class="table-footer">
          <div class="showing-info">
            Showing {{ startIndex() + 1 }} to {{ endIndex() }} of {{ filteredData().length }} entries
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" [class.disabled]="currentPage() === 1">
                <button class="page-link" (click)="goToPage(currentPage() - 1)"><i class="bi bi-chevron-left"></i></button>
              </li>
              @for (p of pageNumbers(); track p) {
                <li class="page-item" [class.active]="p === currentPage()">
                  <button class="page-link" (click)="goToPage(p)">{{ p }}</button>
                </li>
              }
              <li class="page-item" [class.disabled]="currentPage() === totalPages()">
                <button class="page-link" (click)="goToPage(currentPage() + 1)"><i class="bi bi-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      }
    </div>
  `,
  styles: [`
    .table-card {
      background: var(--bg-card, #fff);
      border-radius: 12px;
      box-shadow: 0 1px 3px var(--shadow-color, rgba(0,0,0,0.08));
      border: 1px solid var(--border-color, #e5e7eb);
      overflow: hidden;
    }
    .table-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid var(--border-color, #e5e7eb);
    }
    .search-box { position: relative; width: 300px; }
    .search-icon {
      position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
      color: var(--text-secondary, #6b7280); font-size: 14px;
    }
    .search-box .form-control {
      padding-left: 36px; border-radius: 8px; border: 1px solid var(--border-color, #e5e7eb);
      background: var(--bg-primary, #f9fafb); font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .search-box .form-control:focus {
      border-color: var(--primary, #4F46E5); box-shadow: 0 0 0 3px rgba(var(--primary-rgb, 79,70,229), 0.1);
    }
    .table { margin-bottom: 0; }
    .table thead th {
      background: var(--bg-primary, #f9fafb); border-bottom: 2px solid var(--border-color, #e5e7eb);
      color: var(--text-secondary, #6b7280); font-weight: 600; font-size: 13px;
      text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 16px;
      white-space: nowrap; user-select: none;
    }
    th.sortable { cursor: pointer; }
    th.sortable:hover { color: var(--primary, #4F46E5); }
    .sort-icon { font-size: 11px; margin-left: 4px; opacity: 0.5; }
    th.sortable .bi-chevron-up, th.sortable .bi-chevron-down { opacity: 1; color: var(--primary, #4F46E5); }
    .table tbody td {
      padding: 12px 16px; vertical-align: middle; border-bottom: 1px solid var(--border-color, #e5e7eb);
      color: var(--text-primary, #1f2937); font-size: 14px;
    }
    .data-row { transition: background 0.15s; }
    .data-row:hover { background: rgba(var(--primary-rgb, 79,70,229), 0.03); }
    .data-row.selected { background: rgba(var(--primary-rgb, 79,70,229), 0.06); }
    .check-col { width: 40px; }
    .badge { font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 6px; }
    .avatar-cell { display: flex; align-items: center; gap: 10px; }
    .avatar-circle {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary, #4F46E5), var(--accent, #7C3AED));
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
    }
    .action-btns { display: flex; gap: 6px; }
    .action-btn { border-radius: 6px; padding: 4px 8px; font-size: 13px; }
    .empty-state { text-align: center; padding: 48px 16px !important; }
    .empty-container { color: var(--text-secondary, #9ca3af); }
    .empty-icon { font-size: 48px; opacity: 0.3; display: block; margin-bottom: 12px; }
    .empty-title { font-size: 16px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary, #6b7280); }
    .empty-sub { font-size: 13px; }

    /* Skeleton */
    .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
    .skeleton-text { height: 16px; width: 80%; }
    .skeleton-check { height: 16px; width: 16px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .table-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 20px; border-top: 1px solid var(--border-color, #e5e7eb);
    }
    .showing-info { font-size: 13px; color: var(--text-secondary, #6b7280); }
    .pagination .page-link {
      border-radius: 6px; margin: 0 2px; font-size: 13px; border: 1px solid var(--border-color, #e5e7eb);
      color: var(--text-primary, #374151); padding: 6px 12px; transition: all 0.15s;
    }
    .pagination .page-item.active .page-link {
      background: var(--primary, #4F46E5); border-color: var(--primary, #4F46E5); color: #fff;
    }
    .pagination .page-link:hover { background: rgba(var(--primary-rgb, 79,70,229), 0.08); }
    .table-responsive { overflow-x: auto; }
  `]
})
export class DataTableComponent implements OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() searchable = true;
  @Input() paginated = true;
  @Input() pageSize = 10;
  @Input() selectable = false;
  @Input() loading = false;

  @Output() rowAction = new EventEmitter<{ action: string; row: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();

  searchTerm = signal('');
  sortKey = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  selectedRows = signal<Set<any>>(new Set());
  skeletonRows = [1, 2, 3, 4, 5];

  // Track @Input data as a signal so computed() reacts to changes
  private dataSignal = signal<any[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSignal.set(this.data || []);
      this.currentPage.set(1);
    }
  }

  filteredData = computed(() => {
    let result = [...this.dataSignal()];
    const term = this.searchTerm().toLowerCase();
    if (term) {
      const textCols = this.columns.filter(c => !c.type || c.type === 'text' || c.type === 'avatar').map(c => c.key);
      result = result.filter(row => textCols.some(k => String(row[k] ?? '').toLowerCase().includes(term)));
    }
    const sk = this.sortKey();
    if (sk) {
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const va = a[sk] ?? '', vb = b[sk] ?? '';
        return va > vb ? dir : va < vb ? -dir : 0;
      });
    }
    return result;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredData().length / this.pageSize)));
  startIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  endIndex = computed(() => Math.min(this.startIndex() + this.pageSize, this.filteredData().length));
  paginatedData = computed(() => {
    if (!this.paginated) return this.filteredData();
    return this.filteredData().slice(this.startIndex(), this.endIndex());
  });
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });
  allSelected = computed(() => {
    const pd = this.paginatedData();
    return pd.length > 0 && pd.every(r => this.selectedRows().has(r));
  });

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  toggleSort(key: string) {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  toggleAll() {
    const s = new Set(this.selectedRows());
    if (this.allSelected()) {
      this.paginatedData().forEach(r => s.delete(r));
    } else {
      this.paginatedData().forEach(r => s.add(r));
    }
    this.selectedRows.set(s);
    this.selectionChange.emit([...s]);
  }

  toggleRow(row: any) {
    const s = new Set(this.selectedRows());
    s.has(row) ? s.delete(row) : s.add(row);
    this.selectedRows.set(s);
    this.selectionChange.emit([...s]);
  }

  isSelected(row: any): boolean { return this.selectedRows().has(row); }

  formatDate(val: string): string {
    if (!val) return '';
    try { return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return val; }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
}
