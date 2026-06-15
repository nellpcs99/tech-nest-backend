import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast-notification/toast.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  loading = true;
  error = '';
  quantity = 1;
  addingToCart = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.productService.getProductBySlug(slug).subscribe({
      next: product => {
        this.product = product;
        this.loading = false;
        this.productService.setLoading(false);
      },
      error: err => {
        this.error = err;
        this.loading = false;
        this.productService.setLoading(false);
      }
    });
  }

  increment(): void {
    if (this.product && this.quantity < this.product.stock) this.quantity++;
  }

  decrement(): void {
    if (this.quantity > 1) this.quantity--;
  }

  onAddToCart(): void {
    if (!this.auth.isLoggedIn$.value) {
      this.toast.warning('Connectez-vous pour ajouter au panier.');
      return;
    }
    if (!this.product) return;
    this.addingToCart = true;
    this.cartService.addToCart(this.product.id, this.quantity).subscribe({
      next: () => {
        this.toast.success(`"${this.product!.name}" ajouté au panier !`);
        this.addingToCart = false;
      },
      error: err => {
        this.toast.error(err);
        this.addingToCart = false;
      }
    });
  }

  getDiscount(): number {
    if (!this.product?.old_price || !this.product?.price) return 0;
    return Math.round((1 - this.product.price / this.product.old_price) * 100);
  }

  getImageUrl(image: string): string {
    if (!image) return 'assets/placeholder.png';
    if (image.startsWith('http')) return image;
    return image;
  }
}