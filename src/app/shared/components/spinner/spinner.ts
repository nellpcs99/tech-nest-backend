import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { combineLatest, map, Observable } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css'
})
export class Spinner {
  isLoading$!: Observable<boolean>;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {
    this.isLoading$ = combineLatest([
      this.productService.isLoading$,
      this.cartService.isLoading$,
      this.orderService.isLoading$,
      this.authService.isLoading$,
      this.categoryService.isLoading$,
    ]).pipe(map(states => states.some(Boolean)));
  }
}