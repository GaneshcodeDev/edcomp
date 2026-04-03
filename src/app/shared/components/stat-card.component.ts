import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="stat-card" [class]="'stat-card-' + color">
      <div class="stat-body">
        <div class="stat-icon-wrap" [class]="'icon-' + color">
          <i class="bi" [class]="icon"></i>
        </div>
        <div class="stat-info">
          <p class="stat-title">{{ title }}</p>
          <h3 class="stat-value">{{ value }}</h3>
        </div>
      </div>
      @if (trend !== undefined) {
        <div class="stat-trend" [class.positive]="trend >= 0" [class.negative]="trend < 0">
          <i class="bi" [class.bi-arrow-up-right]="trend >= 0" [class.bi-arrow-down-right]="trend < 0"></i>
          <span>{{ trend >= 0 ? '+' : '' }}{{ trend }}%</span>
          <span class="trend-label">vs last week</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--bg-card, #fff);
      border-radius: 14px;
      padding: 22px 24px;
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: 0 1px 3px var(--shadow-color, rgba(0,0,0,0.06));
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 3px;
      border-radius: 14px 14px 0 0;
    }
    .stat-card-primary::before { background: linear-gradient(90deg, #4F46E5, #6366F1); }
    .stat-card-success::before { background: linear-gradient(90deg, #10B981, #34D399); }
    .stat-card-warning::before { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
    .stat-card-danger::before { background: linear-gradient(90deg, #EF4444, #F87171); }
    .stat-card-info::before { background: linear-gradient(90deg, #06B6D4, #22D3EE); }
    .stat-card-accent::before { background: linear-gradient(90deg, #7C3AED, #A78BFA); }
    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px var(--shadow-color, rgba(0,0,0,0.1));
    }
    .stat-body { display: flex; align-items: center; gap: 16px; }
    .stat-icon-wrap {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; font-size: 22px;
    }
    .icon-primary { background: rgba(79,70,229,0.1); color: #4F46E5; }
    .icon-success { background: rgba(16,185,129,0.1); color: #10B981; }
    .icon-warning { background: rgba(245,158,11,0.1); color: #F59E0B; }
    .icon-danger { background: rgba(239,68,68,0.1); color: #EF4444; }
    .icon-info { background: rgba(6,182,212,0.1); color: #06B6D4; }
    .icon-accent { background: rgba(124,58,237,0.1); color: #7C3AED; }
    .stat-info { flex: 1; }
    .stat-title {
      margin: 0; font-size: 13px; font-weight: 500;
      color: var(--text-secondary, #6b7280); text-transform: uppercase; letter-spacing: 0.5px;
    }
    .stat-value {
      margin: 4px 0 0; font-size: 28px; font-weight: 700;
      color: var(--text-primary, #111827); letter-spacing: -0.5px;
    }
    .stat-trend {
      display: flex; align-items: center; gap: 4px;
      margin-top: 14px; padding-top: 14px;
      border-top: 1px solid var(--border-color, #f3f4f6); font-size: 13px; font-weight: 500;
    }
    .stat-trend.positive { color: #10B981; }
    .stat-trend.negative { color: #EF4444; }
    .trend-label { color: var(--text-secondary, #9ca3af); font-weight: 400; margin-left: 4px; }
  `]
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() icon = 'bi-bar-chart';
  @Input() trend?: number;
  @Input() color: string = 'primary';
}
