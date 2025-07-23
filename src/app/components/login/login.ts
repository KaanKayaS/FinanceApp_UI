import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    this.authService.login(
      this.loginForm.value.email,
      this.loginForm.value.password
    ).subscribe({
      next: (response) => {
        this.router.navigate(['/home']).then(() => {
          this.loading = false;
        });
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        console.log('Login error:', error);
        console.log('Error details:', error.error);
        
        if (error.status === 401) {
          this.errorMessage = 'Kullanıcı adı veya şifre hatalı';
        } else if (error.status === 500) {
          if (error.error?.Errors && Array.isArray(error.error.Errors) && error.error.Errors.length > 0) {
            this.errorMessage = error.error.Errors[0].replace('Hata mesajı : ', '');
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
          }
        } else {
          this.errorMessage = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
        }

        this.loginForm.get('password')?.reset();
      }
    });
  }
}
