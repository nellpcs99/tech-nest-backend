import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast-notification/toast.service';

function passwordMatch(control: AbstractControl) {
  const p = control.get('password');
  const c = control.get('confirm_password');
  if (p && c && p.value !== c.value) {
    c.setErrors({ mismatch: true });
  } else {
    if (c?.errors?.['mismatch']) c.setErrors(null);
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  form!: FormGroup;
  loading = false;
  showPassword = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute  // ✅ pour lire l'email depuis le footer
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validators: passwordMatch });
  }

  ngOnInit(): void {
    // ✅ Pré-remplir l'email si il vient du footer newsletter
    const emailFromQuery = this.route.snapshot.queryParams['email'];
    if (emailFromQuery) {
      this.form.patchValue({ email: emailFromQuery });
    }
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const { confirm_password, ...payload } = this.form.value;
    this.auth.register(payload).subscribe({
      next: () => {
        this.toast.success('Compte créé ! Connectez-vous.');
        this.router.navigate(['/login']);
      },
      error: err => {
        this.toast.error(err);
        this.loading = false;
      }
    });
  }
}