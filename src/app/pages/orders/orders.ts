import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../shared/components/toast-notification/toast.service';
import { Spinner } from '../../shared/components/spinner/spinner';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, Spinner],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: data => { this.orders = data; this.loading = false; },
      error: err => { this.toast.error(err); this.loading = false; }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'En attente', paid: 'Payée',
      shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
    };
    return map[status] || status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-pending', paid: 'badge-paid',
      shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled'
    };
    return map[status] || '';
  }
}