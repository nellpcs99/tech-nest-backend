import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    title: 'TechNest — Top Tech Gear'
  },
  {
    path: 'shop',
    loadComponent: () => import('./pages/shop/shop').then(m => m.Shop),
    title: 'Boutique — TechNest'
  },
  {
    path: 'shop/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
    title: 'Produit — TechNest'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    title: 'Connexion — TechNest'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
    title: 'Inscription — TechNest'
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then(m => m.Cart),
    canActivate: [AuthGuard],
    title: 'Mon panier — TechNest'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout),
    canActivate: [AuthGuard],
    title: 'Commande — TechNest'
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders').then(m => m.Orders),
    canActivate: [AuthGuard],
    title: 'Mes commandes — TechNest'
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./pages/order-detail/order-detail').then(m => m.OrderDetail),
    canActivate: [AuthGuard],
    title: 'Détail commande — TechNest'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
    canActivate: [AuthGuard],
    title: 'Mon profil — TechNest'
  },
  {
    path: '**',
    redirectTo: ''
  }
];