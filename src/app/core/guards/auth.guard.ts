import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getAccessToken()) {
    return true;
  }

  // Redirige vers /login avec l'URL d'origine pour revenir après connexion
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};