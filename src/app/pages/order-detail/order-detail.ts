import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../shared/components/toast-notification/toast.service';
import { Spinner } from '../../shared/components/spinner/spinner';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, Spinner],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetail implements OnInit {
  order: Order | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(id).subscribe({
      next: (data: Order) => { this.order = data; this.loading = false; },
      error: (err: string) => { this.toast.error(err); this.loading = false; }
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

  getSteps(): { label: string; done: boolean }[] {
    const order = ['pending', 'paid', 'shipped', 'delivered'];
    const idx = order.indexOf(this.order?.status || '');
    return [
      { label: 'Commande reçue', done: idx >= 0 },
      { label: 'Paiement confirmé', done: idx >= 1 },
      { label: 'Expédiée', done: idx >= 2 },
      { label: 'Livrée', done: idx >= 3 }
    ];
  }
}