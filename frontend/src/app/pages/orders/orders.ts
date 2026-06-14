import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';
import { ToastService } from '../../shared/components/toast-notification/toast.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  template: `
    <h2 class="fw-bold mb-4">Mes commandes</h2>

    <app-spinner [show]="loading"></app-spinner>

    <div *ngIf="!loading">
      <div *ngIf="orders.length > 0; else noOrders" class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>N° commande</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td class="fw-semibold">#{{ order.id }}</td>
              <td>{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <span class="badge" [ngClass]="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
              </td>
              <td>{{ order.total | number:'1.2-2' }} €</td>
              <td>
                <a [routerLink]="['/orders', order.id]" class="btn btn-sm btn-outline-primary">
                  Voir détails
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #noOrders>
        <div class="text-center py-5">
          <i class="bi bi-receipt fs-1 text-muted"></i>
          <p class="text-muted mt-2 mb-3">Vous n'avez encore passé aucune commande.</p>
          <a routerLink="/shop" class="btn btn-primary">Découvrir la boutique</a>
        </div>
      </ng-template>
    </div>
  `
})
export class Orders implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.toastService.error(err.message);
      }
    });
  }

  statusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      pending: 'En attente',
      paid: 'Payée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  }

  statusClass(status: Order['status']): string {
    const classes: Record<Order['status'], string> = {
      pending: 'bg-warning text-dark',
      paid: 'bg-info text-dark',
      shipped: 'bg-primary',
      delivered: 'bg-success',
      cancelled: 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }
}