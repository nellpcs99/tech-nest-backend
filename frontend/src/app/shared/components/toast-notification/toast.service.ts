import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts$ = new BehaviorSubject<Toast[]>([]);

  private add(message: string, type: ToastType, duration = 3500): void {
    const id = ++this.counter;
    const toast: Toast = { id, message, type };
    this.toasts$.next([...this.toasts$.value, toast]);
    setTimeout(() => this.remove(id), duration);
  }

  success(message: string): void { this.add(message, 'success'); }
  error(message: string): void   { this.add(message, 'error', 5000); }
  warning(message: string): void { this.add(message, 'warning'); }
  info(message: string): void    { this.add(message, 'info'); }

  remove(id: number): void {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }
}