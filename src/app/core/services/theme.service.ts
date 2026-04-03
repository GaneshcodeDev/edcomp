import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ThemeConfig } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private http = inject(HttpClient);

  currentTheme = signal<ThemeConfig>({
    mode: 'light',
    primaryColor: '#4F46E5',
    accentColor: '#7C3AED',
    fontFamily: 'Inter',
    sidebarStyle: 'gradient'
  });

  loadTheme(): void {
    this.http.get<{ data: any }>(`${environment.apiUrl}/settings/theme`).subscribe({
      next: res => {
        if (res.data) {
          this.currentTheme.set(res.data);
          document.documentElement.setAttribute('data-theme', res.data.mode);
        }
      },
      error: () => {}
    });
  }

  saveTheme(theme: ThemeConfig): void {
    this.currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme.mode);
    this.http.put(`${environment.apiUrl}/settings/theme`, theme).subscribe({ error: () => {} });
  }

  setMode(mode: 'light' | 'dark'): void {
    this.currentTheme.update(t => {
      const updated = { ...t, mode };
      this.saveTheme(updated);
      return updated;
    });
  }

  toggleMode(): void {
    const current = this.currentTheme().mode;
    this.setMode(current === 'light' ? 'dark' : 'light');
  }
}
