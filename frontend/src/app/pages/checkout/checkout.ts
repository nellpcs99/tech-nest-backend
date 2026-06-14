import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { Cart as CartModel } from '../../core/models/cart.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';
import { ToastService } from '../../shared/components/toast-notification/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, SpinnerComponent],
  template: `
    <h2 class="fw-bold mb-4">Passer la commande</h2>

    <app-spinner [show]="loading"></app-spinner>

    <div *ngIf="!loading">
      <div *ngIf="cart && cart.items.length > 0; else emptyCart" class="row g-4">
        <!-- Shipping form -->
        <div class="col-md-7">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title fw-bold mb-3">Adresse de livraison</h5>

              <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Adresse complète *</label>
                  <textarea
                    class="form-control"
                    rows="4"
                    formControlName="shipping_address"
                    placeholder="Rue, ville, code postal, pays..."
                    [class.is-invalid]="isInvalid('shipping_address')"
                  ></textarea>
                  <div class="invalid-feedback" *ngIf="isInvalid('shipping_address')">
                    L'adresse de livraison est requise (min. 10 caractères).
                  </div>
                </div>

                <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

                <button type="submit" class="btn btn-primary w-100" [disabled]="checkoutForm.invalid || submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  Confirmer la commande
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Order summary -->
        <div class="col-md-5">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title fw-bold mb-3">Résumé de la commande</h5>

              <ul class="list-group list-group-flush mb-3">
                <li class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let item of cart.items">
                  <div>
                    <span class="fw-semibold">{{ item.product.name }}</span>
                    <br />
                    <small class="text-muted">{{ item.quantity }} x {{ item.product.price | number:'1.2-2' }} €</small>
                  </div>
                  <span class="fw-semibold">{{ item.subtotal | number:'1.2-2' }} €</span>
                </li>
              </ul>

              <div class="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span>{{ cart.total | number:'1.2-2' }} €</span>
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
export class Checkout implements OnInit {
  cart: CartModel | null = null;
  loading = true;
  submitting = false;
  errorMessage = '';
  checkoutForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.checkoutForm = this.fb.group({
      shipping_address: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
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

  isInvalid(controlName: string): boolean {
    const control = this.checkoutForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) return;
    this.submitting = true;
    this.errorMessage = '';

    const shippingAddress = this.checkoutForm.value.shipping_address;

    this.orderService.createOrder(shippingAddress).subscribe({
      next: order => {
        this.submitting = false;
        this.toastService.success('Commande passée avec succès !');
        this.router.navigate(['/orders', order.id]);
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = err.message;
      }
    });
  }
}