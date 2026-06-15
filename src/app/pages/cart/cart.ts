import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../shared/components/toast-notification/toast.service';
import { Spinner } from '../../shared/components/spinner/spinner';
import { Cart as CartModel } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, Spinner],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cart: CartModel | null = null;
  loading = true;

  constructor(
    public cartService: CartService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cartService.loadCart().subscribe({
      next: (data: CartModel) => { this.cart = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateItem(itemId, quantity).subscribe({
      next: (data: CartModel) => { this.cart = data; },
      error: (err: string) => this.toast.error(err)
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({
      next: (data: CartModel) => { this.cart = data; this.toast.success('Article retiré du panier.'); },
      error: (err: string) => this.toast.error(err)
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => { this.cart = null; this.toast.success('Panier vidé.'); },
      error: (err: string) => this.toast.error(err)
    });
  }
}