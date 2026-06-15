import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { Spinner } from './shared/components/spinner/spinner';
import { ToastNotification } from './shared/components/toast-notification/toast-notification';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, Spinner, ToastNotification],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private cart: CartService
  ) {}

  ngOnInit(): void {
    // Charger le panier si l'utilisateur est connecté
    if (this.auth.getAccessToken()) {
      this.cart.loadCart().subscribe();
    }
  }
}