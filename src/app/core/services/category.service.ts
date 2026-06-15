import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API = environment.apiUrl;

  isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    this.isLoading$.next(true);
    return this.http
      .get<PaginatedResponse<Category>>(`${this.API}/categories/`)
      .pipe(
        tap(() => this.isLoading$.next(false)),
        map(res => res.results),          // ← extrait le tableau depuis {count, results}
        catchError(err => {
          this.isLoading$.next(false);
          return throwError(() => this.extractError(err));
        })
      );
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    this.isLoading$.next(true);
    return this.http.get<Category>(`${this.API}/categories/${slug}/`).pipe(
      tap(() => this.isLoading$.next(false)),
      catchError(err => {
        this.isLoading$.next(false);
        return throwError(() => this.extractError(err));
      })
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