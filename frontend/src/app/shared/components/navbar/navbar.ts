import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  menuOpen = false;
  searchOpen = false;
  searchQuery = '';
  scrolled = false;

  constructor(
    public auth: AuthService,
    public cart: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 10;
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void  { this.menuOpen = false; }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) this.searchQuery = '';
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/shop'], { queryParams: { search: this.searchQuery.trim() } });
      this.searchOpen = false;
      this.searchQuery = '';
      this.menuOpen = false;
    }
  }

  logout(): void {
    this.auth.logout();
    this.cart.resetCart();
    this.menuOpen = false;
  }
}