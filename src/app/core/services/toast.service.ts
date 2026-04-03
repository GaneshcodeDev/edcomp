import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  success(message: string, duration = 3000): void {
    this.add(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.add(message, 'error', duration);
  }

  warning(message: string, duration = 4000): void {
    this.add(message, 'warning', duration);
  }

  info(message: string, duration = 3000): void {
    this.add(message, 'info', duration);
  }

  remove(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(message: string, type: Toast['type'], duration: number): void {
    const id = ++this.nextId;
    this.toasts.update(list => [...list, { id, message, type, duration }]);
    setTimeout(() => this.remove(id), duration);
  }
}
