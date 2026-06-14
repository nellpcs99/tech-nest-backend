import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductFilters } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API = environment.apiUrl;

  isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  getProducts(filters?: ProductFilters): Observable<Product[]> {
    this.isLoading$.next(true);
    let params = new HttpParams();

    if (filters) {
      if (filters.category)       params = params.set('category', filters.category);
      if (filters.search)         params = params.set('search', filters.search);
      if (filters.ordering)       params = params.set('ordering', filters.ordering);
      if (filters.is_featured)    params = params.set('is_featured', 'true');
      if (filters.is_new_arrival) params = params.set('is_new_arrival', 'true');
      if (filters.is_best_seller) params = params.set('is_best_seller', 'true');
    }

    return this.http.get<Product[]>(`${this.API}/products/`, { params }).pipe(
      catchError(err => throwError(() => this.extractError(err))),
      // finalize ne marche pas toujours avec tap + error, on utilise tap
    );
  }

  getProductBySlug(slug: string): Observable<Product> {
    this.isLoading$.next(true);
    return this.http.get<Product>(`${this.API}/products/${slug}/`).pipe(
      catchError(err => throwError(() => this.extractError(err)))
    );
  }

  getFeatured(): Observable<Product[]> {
    return this.getProducts({ is_featured: true });
  }

  getNewArrivals(): Observable<Product[]> {
    return this.getProducts({ is_new_arrival: true });
  }

  getBestSellers(): Observable<Product[]> {
    return this.getProducts({ is_best_seller: true });
  }

  setLoading(val: boolean): void {
    this.isLoading$.next(val);
  }

  private extractError(err: any): string {
    if (err?.error) {
      const e = err.error;
      if (typeof e === 'string') return e;
      const messages = Object.values(e).flat();
      return (messages[0] as string) || 'Erreur lors du chargement des produits.';
    }
    return 'Erreur réseau. Vérifiez votre connexion.';
  }
}