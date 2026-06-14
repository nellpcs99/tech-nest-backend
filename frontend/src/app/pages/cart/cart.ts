import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Cart as CartModel } from '../../core/models/cart.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';
import { ToastService } from './../../shared/components/toast-notification/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  template: `
    <h2 class="fw-bold mb-4">Mon panier</h2>

    <app-spinner [show]="loading"></app-spinner>

    <div *ngIf="!loading">
      <div *ngIf="cart && cart.items.length > 0; else emptyCart">
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix unitaire</th>
                <th style="width: 150px;">Quantité</th>
                <th>Sous-total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of cart.items">
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <img [src]="item.product.image" [alt]="item.product.name" style="width: 60px; height: 60px; object-fit: cover;" class="rounded" />
                    <div>
                      <p class="mb-0 fw-semibold">{{ item.product.name }}</p>
                      <small class="text-muted">{{ item.product.brand }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ item.product.price | number:'1.2-2' }} €</td>
                <td>
                  <div class="input-group input-group-sm">
                    <button class="btn btn-outline-secondary" (click)="updateQuantity(item, item.quantity - 1)" [disabled]="item.quantity <= 1">
                      <i class="bi bi-dash"></i>
                    </button>
                    <input type="number" class="form-control text-center" [value]="item.quantity" readonly />
                    <button class="btn btn-outline-secondary" (click)="updateQuantity(item, item.quantity + 1)" [disabled]="item.quantity >= item.product.stock">
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </td>
                <td class="fw-semibold">{{ item.subtotal | number:'1.2-2' }} €</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" (click)="removeItem(item.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="row justify-content-end mt-4">
          <div class="col-md-4">
            <div class="card shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <span>Articles ({{ cart.total_items }})</span>
                  <span>{{ cart.total | number:'1.2-2' }} €</span>
                </div>
                <hr />
                <div class="d-flex justify-content-between fw-bold fs-5 mb-3">
                  <span>Total</span>
                  <span>{{ cart.total | number:'1.2-2' }} €</span>
                </div>
                <a routerLink="/checkout" class="btn btn-primary w-100 mb-2">Passer la commande</a>
                <button class="btn btn-outline-danger w-100" (click)="clearCart()">Vider le panier</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyCart>
        <div class="text-center py-5">
          <i class="bi bi-cart-x fs-1 text-muted"></i>
          <p class="text-muted mt-2 mb-3">Votre panier est vide.</p>
          <a routerLink="/shop" class="btn btn-primary">Continuer mes achats</a>
        </div>
      </ng-template>
    </div>
  `
})
export class Cart implements OnInit {
  cart: CartModel | null = null;
  loading = true;

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: cart => {
        this.cart = cart;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.toastService.error(err.message);
      }
    });
  }

  updateQuantity(item: any, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > item.product.stock) return;
    this.cartService.updateCartItem(item.id, newQuantity).subscribe({
      next: () => this.loadCart(),
      error: err => this.toastService.error(err.message)
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        this.toastService.success('Article retiré du panier.');
        this.loadCart();
      },
      error: err => this.toastService.error(err.message)
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.toastService.success('Panier vidé.');
        this.loadCart();
      },
      error: err => this.toastService.error(err.message)
    });
  }
}