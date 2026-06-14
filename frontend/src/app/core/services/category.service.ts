import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API = environment.apiUrl;

  isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    this.isLoading$.next(true);
    return this.http.get<Category[]>(`${this.API}/categories/`).pipe(
      catchError(err => throwError(() => this.extractError(err)))
    );
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    this.isLoading$.next(true);
    return this.http.get<Category>(`${this.API}/categories/${slug}/`).pipe(
      catchError(err => throwError(() => this.extractError(err)))
    );
  }

  setLoading(val: boolean): void {
    this.isLoading$.next(val);
  }

  private extractError(err: any): string {
    if (err?.error) {
      const e = err.error;
      if (typeof e === 'string') return e;
      const messages = Object.values(e).flat();
      return (messages[0] as string) || 'Erreur lors du chargement des catégories.';
    }
    return 'Erreur réseau. Vérifiez votre connexion.';
  }
}