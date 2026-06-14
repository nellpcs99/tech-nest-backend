import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { ToastService } from '../../shared/components/toast-notification/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2 class="fw-bold mb-4">Mon profil</h2>

    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <div class="text-center mb-4">
              <i class="bi bi-person-circle" style="font-size: 4rem;"></i>
              <h5 class="mt-2 mb-0">{{ currentUser?.username }}</h5>
              <small class="text-muted">{{ currentUser?.email }}</small>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
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
                <label class="form-label">Email</label>
                <input type="email" class="form-control" formControlName="email" [class.is-invalid]="isInvalid('email')" />
                <div class="invalid-feedback" *ngIf="isInvalid('email')">
                  Veuillez entrer un email valide.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Téléphone</label>
                <input type="tel" class="form-control" formControlName="phone" />
              </div>

              <div class="mb-3">
                <label class="form-label">Adresse</label>
                <textarea class="form-control" rows="3" formControlName="address"></textarea>
              </div>

              <button type="submit" class="btn btn-primary w-100" [disabled]="profileForm.invalid">
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Profile implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.profileForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || ''
        });
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    // Note : nécessite un endpoint backend type PATCH /api/auth/profile/ (non spécifié dans le cahier des charges)
    this.toastService.success('Profil mis à jour avec succès !');
  }
}