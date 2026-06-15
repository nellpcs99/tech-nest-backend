import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  // Ajoute le token Bearer sur chaque requête si disponible
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Sur 401, on tente un refresh automatique (sauf si c'est déjà une requête auth)
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return auth.refreshToken().pipe(
          switchMap(res => {
            // Rejoue la requête originale avec le nouveau token
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access}` }
            });
            return next(retryReq);
          }),
          catchError(refreshErr => {
            // Le refresh a échoué → logout complet
            auth.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};