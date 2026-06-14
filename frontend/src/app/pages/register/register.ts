import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from './../../shared/components/toast-notification/toast.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SpinnerComponent],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-7 col-lg-6">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h3 class="text-center mb-4 fw-bold">Créer un compte</h3>

            <app-spinner [show]="(authService.isLoading$ | async) ?? false"></app-spinner>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" *ngIf="!(authService.isLoading$ | async)">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Prénom</label>
                  <input type="text" class="form-control" formControlName="first_name" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nom</label>
                  <input type="text" class="form-control" formControlName="last_name" />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Nom d'utilisateur *</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="username"
                  [class.is-invalid]="isInvalid('username')"
                />
                <div class="invalid-feedback" *ngIf="isInvalid('username')">
                  Le nom d'utilisateur est requis (min. 3 caractères).
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Email *</label>
                <input
                  type="email"
                  class="form-control"
                  formControlName="email"
                  [class.is-invalid]="isInvalid('email')"
                />
                <div class="invalid-feedback" *ngIf="isInvalid('email')">
                  Veuillez entrer un email valide.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Mot de passe *</label>
                <input
                  type="password"
                  class="form-control"
                  formControlName="password"
                  [class.is-invalid]="isInvalid('password')"
                />
                <div class="invalid-feedback" *ngIf="isInvalid('password')">
                  Le mot de passe doit contenir au moins 8 caractères.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  class="form-control"
                  formControlName="confirmPassword"
                  [class.is-invalid]="registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched"
                />
                <div class="invalid-feedback" *ngIf="registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched">
                  Les mots de passe ne correspondent pas.
                </div>
              </div>

              <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

              <button type="submit" class="btn btn-primary w-100" [disabled]="registerForm.invalid">
                S'inscrire
              </button>
            </form>

            <p class="text-center mt-3 mb-0">
              Déjà un compte ?
              <a routerLink="/login">Connectez-vous</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Register {
  registerForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerForm = this.fb.group(
      {
        first_name: [''],
        last_name: [''],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.errorMessage = '';

    const { confirmPassword, ...payload } = this.registerForm.value;

    this.authService.register(payload).subscribe({
      next: () => {
        this.toastService.success('Compte créé avec succès ! Connectez-vous.');
        this.router.navigate(['/login']);
      },
      error: err => {
        this.errorMessage = err.message;
      }
    });
  }
}