import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderPayload } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API = environment.apiUrl;

  isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    this.isLoading$.next(true);
    return this.http.get<Order[]>(`${this.API}/orders/`).pipe(
      tap(() => this.isLoading$.next(false)),
      catchError(err => {
        this.isLoading$.next(false);
        return throwError(() => this.extractError(err));
      })
    );
  }

  getOrderById(id: number): Observable<Order> {
    this.isLoading$.next(true);
    return this.http.get<Order>(`${this.API}/orders/${id}/`).pipe(
      tap(() => this.isLoading$.next(false)),
      catchError(err => {
        this.isLoading$.next(false);
        return throwError(() => this.extractError(err));
      })
    );
  }

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    this.isLoading$.next(true);
    return this.http.post<Order>(`${this.API}/orders/`, payload).pipe(
      tap(() => this.isLoading$.next(false)),
      catchError(err => {
        this.isLoading$.next(false);
        return throwError(() => this.extractError(err));
      })
    );
  }

  private extractError(err: any): string {
    if (err?.error) {
      const e = err.error;
      if (typeof e === 'string') return e;
      const messages = Object.values(e).flat();
      return (messages[0] as string) || 'Erreur commande.';
    }
    return 'Erreur réseau. Vérifiez votre connexion.';
  }
}