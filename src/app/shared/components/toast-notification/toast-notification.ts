import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.html',
  styleUrl: './toast-notification.css'
})
export class ToastNotification {
  constructor(public toastService: ToastService) {}

  getIcon(type: Toast['type']): string {
    const icons: Record<Toast['type'], string> = {
      success: 'bi-check-circle-fill',
      error:   'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info:    'bi-info-circle-fill'
    };
    return icons[type];
  }

  trackById(_: number, toast: Toast): number {
    return toast.id;
  }
}