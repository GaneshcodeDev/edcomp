import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, UserRole } from '../models';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken: string;
  user: any;
  expiresAt: string;
}

interface MeResponse {
  success: boolean;
  message: string;
  user: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try { this.currentUser.set(JSON.parse(stored)); } catch {}
    }
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      map(res => {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('refresh_token', res.refreshToken);

        const u = res.user;
        const fullUser: User = {
          id: u.id,
          username: u.username,
          password: '',
          email: u.email,
          fullName: u.full_name || u.fullName,
          role: u.role,
          tenantId: u.tenant_id || u.tenantId,
          isActive: u.is_active ?? u.isActive,
          avatar: u.avatar,
        };

        this.currentUser.set(fullUser);
        localStorage.setItem('currentUser', JSON.stringify(fullUser));
        localStorage.setItem('active_tenant_id', fullUser.tenantId);
        return fullUser;
      })
    );
  }

  logout(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    }
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('active_tenant_id');
  }

  getMe(): Observable<any> {
    return this.http.get<MeResponse>(`${this.apiUrl}/auth/me`).pipe(map(res => res.user));
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<{ success: boolean; token: string }>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      map(res => {
        localStorage.setItem('auth_token', res.token);
        return res.token;
      })
    );
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return !!user && roles.includes(user.role);
  }
}
