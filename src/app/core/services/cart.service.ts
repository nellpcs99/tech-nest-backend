import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly API = environment.apiUrl;

  isLoading$ = new BehaviorSubject<boolean>(false);
  cart$ = new BehaviorSubject<Cart | null>(null);

  // Badge panier en temps réel
  itemCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  loadCart(): Observable<Cart> {
    this.isLoading$.next(true);
    return this.http.get<Cart>(`${this.API}/cart/`).pipe(
      tap(cart => {
        this.cart$.next(cart);
        this.itemCount$.next(cart.total_items);
        this.isLoading$.next(false);
      }),
      catchError(err => {
        this.isLoading$.next(false);
        return throwError(() => this.extractError(err));
      })
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<Cart> {
    this.isLoading$.next(true);
    return this.http.post<Cart>(`${this.API}/cart/add/`, { product_id: productId, quantity }).pipe(
      tap(cart => {
        this.cart$.next(cart);
        this.itemCount$.next(cart.total_items);
        this.isLoading$.next(false);
      }),
      catchError(err => {
        this.isLoading$.next(false);
        return throwError(() => this.extractError(err));
      })
    );
  }

  updateItem(itemId: number, quantity: number): Observable<Cart> {
    this.isLoading$.next(true);
    return this.http.put<Cart>(`${this.API}/cart/update/${itemId}/`, { quantity }).pipe(
      tap(cart => {
        this.cart$.next(cart);
        this.itemCount$.next(cart.total_items);
        this.isLoading$.next(false);
      }),
      catchError(err => {
        this.isLoading$.next(false);
        return throwError(() => this.extractError(err));
      })
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    this.isLoading$.next(true);
    return this.http.delete<Cart>(`${this.API}/cart/remove/${itemId}/`).pipe(
      tap(cart => {
        this.cart$.next(cart);
        this.itemCount$.next(cart.total_items);
        this.isLoading$.next(false);
      }),
      catchError(err => {
        this.isLoading$.next(false);
        return throwError(() => this.extractError(err));
      })
    );
  }

  clearCart(): Observable<any> {
    this.isLoading$.next(true);
    return this.http.delete(`${this.API}/cart/clear/`).pipe(
      tap(() => {
        this.cart$.next(null);
        this.itemCount$.next(0);
        this.isLoading$.next(false);
      }),
      catchError(err => {
        this.isLoading$.next(false);
        return throwError(() => this.extractError(err));
      })
    );
  }

  resetCart(): void {
    this.cart$.next(null);
    this.itemCount$.next(0);
  }

  private extractError(err: any): string {
    if (err?.error) {
      const e = err.error;
      if (typeof e === 'string') return e;
      const messages = Object.values(e).flat();
      return (messages[0] as string) || 'Erreur panier.';
    }
    return 'Erreur réseau. Vérifiez votre connexion.';
  }
}