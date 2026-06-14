import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../shared/components/toast-notification/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  featured: Product[] = [];
  newArrivals: Product[] = [];
  bestSellers: Product[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toast: ToastService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.productService.getFeatured().subscribe({
      next: data => { this.featured = data.slice(0, 8); this.loading = false; this.productService.setLoading(false); },
      error: () => { this.loading = false; this.productService.setLoading(false); }
    });

    this.productService.getNewArrivals().subscribe({
      next: data => { this.newArrivals = data.slice(0, 4); this.productService.setLoading(false); },
      error: () => this.productService.setLoading(false)
    });

    this.productService.getBestSellers().subscribe({
      next: data => { this.bestSellers = data.slice(0, 4); this.productService.setLoading(false); },
      error: () => this.productService.setLoading(false)
    });
  }

  onAddToCart(product: Product): void {
    if (!(this.auth.isLoggedIn$.value)) {
      this.toast.warning('Connectez-vous pour ajouter au panier.');
      return;
    }
    this.cartService.addToCart(product.id).subscribe({
      next: () => this.toast.success(`"${product.name}" ajouté au panier !`),
      error: (err) => this.toast.error(err)
    });
  }
}