import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthTokens, LoginPayload, RegisterPayload, UpdateProfilePayload } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;

  isLoading$ = new BehaviorSubject<boolean>(false);
  currentUser$ = new BehaviorSubject<User | null>(null);
  isLoggedIn$ = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private http: HttpClient, private router: Router) {
    if (this.hasValidToken()) {
      this.fetchMe().subscribe();
    }
  }

  // ── Tokens ────────────────────────────────────────────────
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    this.isLoggedIn$.next(true);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isLoggedIn$.next(false);
    this.currentUser$.next(null);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // ── Auth actions ──────────────────────────────────────────
  login(payload: LoginPayload): Observable<AuthTokens> {
    this.isLoading$.next(true);
    return this.http.post<AuthTokens>(`${this.API}/auth/login/`, payload).pipe(
      tap(tokens => {
        this.setTokens(tokens);
        this.fetchMe().subscribe();
      }),
      catchError(err => throwError(() => this.extractError(err))),
      tap({ complete: () => this.isLoading$.next(false), error: () => this.isLoading$.next(false) })
    );
  }

  register(payload: RegisterPayload): Observable<any> {
    this.isLoading$.next(true);
    return this.http.post(`${this.API}/auth/register/`, payload).pipe(
      catchError(err => throwError(() => this.extractError(err))),
      tap({ complete: () => this.isLoading$.next(false), error: () => this.isLoading$.next(false) })
    );
  }

  logout(): void {
    const refresh = this.getRefreshToken();
    if (refresh) {
      this.http.post(`${this.API}/auth/logout/`, { refresh }).subscribe();
    }
    this.clearTokens();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = this.getRefreshToken();
    return this.http.post<{ access: string }>(`${this.API}/auth/refresh/`, { refresh }).pipe(
      tap(res => localStorage.setItem('access_token', res.access)),
      catchError(err => {
        this.clearTokens();
        this.router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  }

  fetchMe(): Observable<User> {
    return this.http.get<User>(`${this.API}/auth/me/`).pipe(
      tap(user => this.currentUser$.next(user)),
      catchError(err => throwError(() => this.extractError(err)))
    );
  }

  updateProfile(payload: UpdateProfilePayload): Observable<User> {
    this.isLoading$.next(true);
    return this.http.put<User>(`${this.API}/auth/profile/`, payload).pipe(
      tap(user => this.currentUser$.next(user)),
      catchError(err => throwError(() => this.extractError(err))),
      tap({ complete: () => this.isLoading$.next(false), error: () => this.isLoading$.next(false) })
    );
  }

  // ── Helpers ───────────────────────────────────────────────
  isStaff(): boolean {
    return this.currentUser$.value?.is_staff ?? false;
  }

  private extractError(err: any): string {
    if (err?.error) {
      const e = err.error;
      if (typeof e === 'string') return e;
      const messages = Object.values(e).flat();
      return (messages[0] as string) || 'Une erreur est survenue.';
    }
    return 'Erreur réseau. Vérifiez votre connexion.';
  }
}