import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });

    // Form değişikliklerini dinle
    this.registerForm.valueChanges.subscribe(() => {
      // Sadece form geçerli olduğunda hata mesajını temizle
      if (this.registerForm.valid && this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  passwordMatchValidator(control: any): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    const registerData = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword
    };

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(registerData).subscribe({
      next: (response: string) => {
        console.log('Kayıt başarılı:', response);
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;

        try {
          // Eğer error.error string ve JSON formatındaysa parse et
          if (typeof error.error === 'string') {
            const parsedError = JSON.parse(error.error);

            if (parsedError.Errors && Array.isArray(parsedError.Errors) && parsedError.Errors.length > 0) {
              this.errorMessage = parsedError.Errors[0].replace('Hata mesajı : ', '');
            } else if (parsedError.message) {
              this.errorMessage = parsedError.message;
            } else {
              this.errorMessage = 'Kayıt işlemi sırasında bir hata oluştu.';
            }
          } else if (error.error?.Errors && Array.isArray(error.error.Errors)) {
            // Zaten obje ise direkt kullan
            this.errorMessage = error.error.Errors[0].replace('Hata mesajı : ', '');
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Kayıt işlemi sırasında bir hata oluştu.';
          }
        } catch (parseError) {
          // Parse edemezsek error.error doğrudan mesaj olarak kullan
          this.errorMessage = error.error;
        }

        this.cdr.detectChanges();
      }
    });
  }
}
