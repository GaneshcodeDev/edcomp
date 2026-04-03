import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ConfigurationService } from '../../core/services/configuration.service';
import { MenuItem, UserRole } from '../../core/models';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Menu Management" subtitle="Configure navigation menu structure"
      [breadcrumbs]="[{label:'Home',route:'/dashboard'},{label:'Configuration'},{label:'Menus'}]" />

    <div class="menu-card">
      <div class="menu-tree">
        @for (item of menuItems; track item.id) {
          <div class="tree-item">
            <div class="tree-row" [class.active]="selectedId() === item.id" (click)="selectItem(item)">
              <div class="tree-left">
                <i class="bi" [class]="item.icon || 'bi-circle'"></i>
                <span class="tree-label">{{ item.label }}</span>
                @if (item.route) { <span class="tree-route">{{ item.route }}</span> }
              </div>
              <div class="tree-right">
                <span class="badge bg-light text-dark me-1" style="font-size:10px;">Order: {{ item.order }}</span>
                <span class="badge" [class]="item.isActive ? 'bg-success' : 'bg-secondary'" style="font-size:10px;">{{ item.isActive ? 'Active' : 'Inactive' }}</span>
                <button class="btn btn-sm btn-link p-0 ms-2" (click)="moveUp(item, $event)" title="Move up"><i class="bi bi-arrow-up"></i></button>
                <button class="btn btn-sm btn-link p-0" (click)="moveDown(item, $event)" title="Move down"><i class="bi bi-arrow-down"></i></button>
              </div>
            </div>
            @if (item.children && item.children.length) {
              <div class="tree-children">
                @for (child of item.children; track child.id) {
                  <div class="tree-row child-row" [class.active]="selectedId() === child.id" (click)="selectItem(child)">
                    <div class="tree-left">
                      <span class="child-connector"></span>
                      <span class="tree-label">{{ child.label }}</span>
                      @if (child.route) { <span class="tree-route">{{ child.route }}</span> }
                    </div>
                    <div class="tree-right">
                      <span class="badge" [class]="child.isActive ? 'bg-success' : 'bg-secondary'" style="font-size:10px;">{{ child.isActive ? 'Active' : 'Inactive' }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      @if (selectedItem()) {
        <div class="edit-panel">
          <h5 class="edit-title">Edit Menu Item</h5>
          <div class="mb-3"><label class="form-label fw-semibold">Label</label><input type="text" class="form-control" [(ngModel)]="selectedItem()!.label"></div>
          <div class="mb-3"><label class="form-label fw-semibold">Icon (bi- class)</label><input type="text" class="form-control" [(ngModel)]="selectedItem()!.icon"></div>
          <div class="mb-3"><label class="form-label fw-semibold">Route</label><input type="text" class="form-control" [(ngModel)]="selectedItem()!.route"></div>
          <div class="mb-3"><label class="form-label fw-semibold">Order</label><input type="number" class="form-control" [(ngModel)]="selectedItem()!.order"></div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Roles</label>
            <div class="roles-list">
              @for (r of allRoles; track r) {
                <label class="role-check"><input type="checkbox" [checked]="hasRole(r)" (change)="toggleRole(r)"><span>{{ r }}</span></label>
              }
            </div>
          </div>
          <div class="form-check mb-3"><input type="checkbox" class="form-check-input" [(ngModel)]="selectedItem()!.isActive" id="mActive"><label class="form-check-label" for="mActive">Active</label></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .menu-card {
      display:grid; grid-template-columns:1fr 360px; gap:0;
      background:var(--bg-card,#fff); border-radius:14px; border:1px solid var(--border-color,#e5e7eb);
      box-shadow:0 1px 3px var(--shadow-color,rgba(0,0,0,0.06)); overflow:hidden; min-height:500px;
    }
    .menu-tree { padding:20px; border-right:1px solid var(--border-color,#e5e7eb); }
    .tree-item { margin-bottom:4px; }
    .tree-row {
      display:flex; justify-content:space-between; align-items:center; padding:10px 14px; border-radius:10px;
      cursor:pointer; transition:background 0.15s; font-size:14px;
    }
    .tree-row:hover { background:var(--bg-primary,#f9fafb); }
    .tree-row.active { background:rgba(79,70,229,0.08); }
    .tree-left { display:flex; align-items:center; gap:10px; }
    .tree-left .bi { font-size:16px; color:var(--primary,#4F46E5); }
    .tree-label { font-weight:600; color:var(--text-primary); }
    .tree-route { font-size:11px; color:var(--text-secondary); background:var(--bg-primary,#f3f4f6); padding:2px 6px; border-radius:4px; }
    .tree-right { display:flex; align-items:center; gap:4px; }
    .tree-children { padding-left:24px; }
    .child-row { padding:8px 14px; }
    .child-connector { width:12px; height:1px; background:var(--border-color,#d1d5db); display:inline-block; }
    .edit-panel { padding:24px; background:var(--bg-primary,#f9fafb); }
    .edit-title { font-size:16px; font-weight:700; margin:0 0 20px; color:var(--text-primary); }
    .form-control { border-radius:10px; }
    .roles-list { display:flex; flex-direction:column; gap:6px; }
    .role-check { display:flex; align-items:center; gap:8px; font-size:13px; padding:4px 0; cursor:pointer; }
    @media (max-width:768px) { .menu-card { grid-template-columns:1fr; } }
  `]
})
export class MenuManagementComponent implements OnInit {
  private configService = inject(ConfigurationService);
  menuItems: MenuItem[] = [];
  selectedId = signal('');
  selectedItem = signal<MenuItem | null>(null);
  allRoles: UserRole[] = ['super_admin', 'tenant_admin', 'hr_manager', 'employee'];

  ngOnInit(): void {
    this.configService.getMenuItems().subscribe(items => this.menuItems = items);
  }

  selectItem(item: MenuItem): void { this.selectedId.set(item.id); this.selectedItem.set(item); }

  hasRole(r: UserRole): boolean {
    const item = this.selectedItem();
    return !!item && item.roles.includes(r);
  }

  toggleRole(r: UserRole): void {
    const item = this.selectedItem();
    if (!item) return;
    const idx = item.roles.indexOf(r);
    if (idx >= 0) item.roles.splice(idx, 1); else item.roles.push(r);
  }

  saveItem(item: MenuItem): void {
    this.configService.updateMenuItem(item.id, item).subscribe();
  }

  moveUp(item: MenuItem, e: Event): void {
    e.stopPropagation();
    const idx = this.menuItems.indexOf(item);
    if (idx > 0) {
      [this.menuItems[idx - 1], this.menuItems[idx]] = [this.menuItems[idx], this.menuItems[idx - 1]];
      this.saveItem(item);
    }
  }
  moveDown(item: MenuItem, e: Event): void {
    e.stopPropagation();
    const idx = this.menuItems.indexOf(item);
    if (idx < this.menuItems.length - 1) {
      [this.menuItems[idx], this.menuItems[idx + 1]] = [this.menuItems[idx + 1], this.menuItems[idx]];
      this.saveItem(item);
    }
  }
}
