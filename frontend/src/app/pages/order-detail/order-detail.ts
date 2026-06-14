import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';
import { ToastService } from '../../shared/components/toast-notification/toast.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  template: `
    <app-spinner [show]="loading"></app-spinner>

    <div *ngIf="!loading && order">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/orders">Mes commandes</a></li>
          <li class="breadcrumb-item active">Commande #{{ order.id }}</li>
        </ol>
      </nav>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold mb-0">Commande #{{ order.id }}</h2>
        <span class="badge fs-6" [ngClass]="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
      </div>

      <div class="row g-4">
        <div class="col-md-8">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title fw-bold mb-3">Articles commandés</h5>
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex align-items-center gap-3" *ngFor="let item of order.items">
                  <img [src]="item.product.image" [alt]="item.product.name" style="width: 60px; height: 60px; object-fit: cover;" class="rounded" />
                  <div class="flex-grow-1">
                    <p class="mb-0 fw-semibold">{{ item.product.name }}</p>
                    <small class="text-muted">{{ item.quantity }} x {{ item.price | number:'1.2-2' }} €</small>
                  </div>
                  <span class="fw-semibold">{{ item.subtotal | number:'1.2-2' }} €</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <h5 class="card-title fw-bold mb-3">Informations</h5>
              <p class="mb-1"><strong>Date :</strong> {{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
              <p class="mb-1"><strong>Adresse de livraison :</strong></p>
              <p class="text-muted">{{ order.shipping_address }}</p>
            </div>
          </div>

          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span>{{ order.total | number:'1.2-2' }} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!loading && !order" class="text-center py-5">
      <i class="bi bi-exclamation-circle fs-1 text-muted"></i>
      <p class="text-muted mt-2">Commande introuvable.</p>
      <a routerLink="/orders" class="btn btn-primary">Retour à mes commandes</a>
    </div>
  `
})
export class OrderDetail implements OnInit {
  order: Order | null = null;
  loading = true;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(+id);
    } else {
      this.loading = false;
    }
  }

  loadOrder(id: number): void {
    this.orderService.getOrderById(id).subscribe({
      next: order => {
        this.order = order;
        this.loading = false;
      },
      error: err => {
        this.order = null;
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