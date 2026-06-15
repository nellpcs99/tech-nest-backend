import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast-notification/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  form!: FormGroup;
  loading = false;
  showPassword = false;
  private returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.form.controls; }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.toast.success('Connexion réussie !');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: err => {
        this.toast.error(err);
        this.loading = false;
      }
    });
  }
}