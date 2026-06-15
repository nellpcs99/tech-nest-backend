import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast-notification/toast.service';
import { Product, ProductFilters } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCard],
  templateUrl: './shop.html',
  styleUrl: './shop.css'
})
export class Shop implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';

  searchQuery = '';
  selectedCategory = '';
  selectedOrdering = '';
  showFeatured = false;
  showNewArrivals = false;
  showBestSellers = false;

  private searchSubject = new Subject<string>();
  private subs: Subscription[] = [];

  readonly orderingOptions = [
    { value: '',            label: 'Par défaut' },
    { value: 'price',       label: 'Prix croissant' },
    { value: '-price',      label: 'Prix décroissant' },
    { value: 'name',        label: 'Nom A-Z' },
    { value: '-name',       label: 'Nom Z-A' },
    { value: '-created_at', label: 'Plus récents' },
  ];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private auth: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 1. Charger les catégories une seule fois
    this.categoryService.getCategories().subscribe({
      next: cats => this.categories = cats,
      error: () => {}
    });

    // 2. Lire les queryParams UNE SEULE FOIS au démarrage avec take(1)
    // ✅ Sans take(1), chaque frappe qui met à jour l'URL redéclenche subscribe → clignotement
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      this.searchQuery      = params['search'] || '';
      this.selectedCategory = params['category'] || '';
      this.showNewArrivals  = params['is_new_arrival'] === 'true';
      this.showBestSellers  = params['is_best_seller'] === 'true';
      this.loadProducts();
    });

    // 3. Debounce sur la recherche — attend 400ms sans frappe avant de recharger
    this.subs.push(
      this.searchSubject.pipe(
        debounceTime(400),
        distinctUntilChanged()
      ).subscribe(() => this.loadProducts())
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  loadProducts(): void {
    // Skeleton uniquement au premier chargement
    if (this.products.length === 0) {
      this.loading = true;
    }
    this.error = '';

    const filters: ProductFilters = {};
    if (this.searchQuery)      filters.search         = this.searchQuery;
    if (this.selectedCategory) filters.category       = this.selectedCategory;
    if (this.selectedOrdering) filters.ordering       = this.selectedOrdering;
    if (this.showFeatured)     filters.is_featured    = true;
    if (this.showNewArrivals)  filters.is_new_arrival = true;
    if (this.showBestSellers)  filters.is_best_seller = true;

    this.productService.getProducts(filters).subscribe({
      next: data => {
        this.products = data;
        this.loading  = false;
      },
      error: err => {
        this.error   = err;
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadProducts();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  resetFilters(): void {
    this.searchQuery      = '';
    this.selectedCategory = '';
    this.selectedOrdering = '';
    this.showFeatured     = false;
    this.showNewArrivals  = false;
    this.showBestSellers  = false;
    this.loadProducts();
  }

  onAddToCart(product: Product): void {
    if (!this.auth.isLoggedIn$.value) {
      this.toast.warning('Connectez-vous pour ajouter au panier.');
      return;
    }
    this.cartService.addToCart(product.id).subscribe({
      next: () => this.toast.success(`"${product.name}" ajouté au panier !`),
      error: err => this.toast.error(err)
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchQuery || this.selectedCategory || this.selectedOrdering
      || this.showFeatured || this.showNewArrivals || this.showBestSellers
    );
  }
}