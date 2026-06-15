import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../shared/components/toast-notification/toast.service';
import { Spinner } from '../../shared/components/spinner/spinner';
import { Cart } from '../../core/models/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Spinner],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  form!: FormGroup;
  cart: Cart | null = null;
  loading = true;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      shipping_address: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.cartService.loadCart().subscribe({
      next: (data: Cart) => { this.cart = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    this.orderService.createOrder(this.form.value).subscribe({
      next: order => {
        this.toast.success('Commande passée avec succès !');
        this.cartService.resetCart();
        this.router.navigate(['/orders', order.id]);
      },
      error: (err: string) => {
        this.toast.error(err);
        this.submitting = false;
      }
    });
  }
}