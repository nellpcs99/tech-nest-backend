import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();
  email = '';
  emailError = '';

  constructor(private router: Router) {}

  onNewsletter(): void {
    this.emailError = '';

    // Validation basique
    if (!this.email.trim()) {
      this.emailError = 'Veuillez entrer votre adresse email.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Adresse email invalide.';
      return;
    }

    // ✅ Rediriger vers /register avec l'email pré-rempli en queryParam
    this.router.navigate(['/register'], {
      queryParams: { email: this.email }
    });

    this.email = '';
  }
}