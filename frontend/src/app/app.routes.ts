import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'TechNest – Top Tech Gear',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'shop',
    title: 'Boutique – TechNest',
    loadComponent: () => import('./pages/shop/shop').then(m => m.Shop)
  },
  {
    path: 'shop/:slug',
    title: 'Produit – TechNest',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail)
  },
  {
    path: 'login',
    title: 'Connexion – TechNest',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    title: 'Inscription – TechNest',
    loadComponent: () => import('./pages/register/register').then(m => m.Register)
  },
  {
    path: 'cart',
    title: 'Mon Panier – TechNest',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/cart/cart').then(m => m.Cart)
  },
  {
    path: 'checkout',
    title: 'Commande – TechNest',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout)
  },
  {
    path: 'orders',
    title: 'Mes Commandes – TechNest',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/orders/orders').then(m => m.Orders)
  },
  {
    path: 'orders/:id',
    title: 'Détail Commande – TechNest',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/order-detail/order-detail').then(m => m.OrderDetail)
  },
  {
    path: 'profile',
    title: 'Mon Profil – TechNest',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile)
  },
  {
    path: '**',
    redirectTo: ''
  }
];