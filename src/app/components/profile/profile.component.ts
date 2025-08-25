import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';

interface UserInfo {
  fullName: string;
  email: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ValidationError {
  field: string;
  message: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userInfo: UserInfo = {
    fullName: '',
    email: ''
  };

  passwordData: PasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  showSamePasswordError: boolean = false;
  
  // Validation error handling
  validationErrors: ValidationError[] = [];
  generalError: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  loadUserInfo() {
    this.isLoading = true;
    this.http.get<UserInfo>(`${environment.apiUrl}/Users/GetUserInfoById`).subscribe({
      next: (data) => {
        this.userInfo = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility(field: 'currentPassword' | 'newPassword' | 'confirmNewPassword') {
    if (field === 'currentPassword') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  checkPasswordMatch() {
    if (this.passwordData.currentPassword && this.passwordData.newPassword) {
      this.showSamePasswordError = this.passwordData.currentPassword === this.passwordData.newPassword;
    } else {
      this.showSamePasswordError = false;
    }
  }

  clearErrors() {
    this.validationErrors = [];
    this.generalError = '';
  }

  getFieldError(fieldName: string): string {
    const error = this.validationErrors.find(err => err.field === fieldName);
    return error ? error.message : '';
  }

  changePassword() {
    // Clear previous errors
    this.clearErrors();

    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmNewPassword) {
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmNewPassword) {
      alert('Yeni şifreler eşleşmiyor!');
      return;
    }

    if (this.passwordData.currentPassword === this.passwordData.newPassword) {
      alert('Yeni şifreniz mevcut şifrenizle aynı olamaz!');
      return;
    }

    this.isLoading = true;
    this.http.post(`${environment.apiUrl}/Auth/ChangePassword`, this.passwordData, { responseType: 'text' }).subscribe({
      next: (response) => {
        alert('Şifreniz başarıyla güncellendi! Yeni şifrenizle tekrar giriş yapmanız gerekiyor.');
        
        // Kullanıcıyı çıkış yap ve login sayfasına yönlendir
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.email) {
          this.authService.cikisYap(currentUser.email).subscribe({
            next: () => {
              // Login sayfasına yönlendir
              this.router.navigate(['/login']);
            },
            error: (error) => {
              console.error('Çıkış yaparken hata:', error);
              // Hata olsa bile login sayfasına yönlendir
              this.router.navigate(['/login']);
            }
          });
        } else {
          // Kullanıcı bilgisi yoksa direkt login sayfasına yönlendir
          this.router.navigate(['/login']);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Şifre değiştirme hatası:', error);
        this.isLoading = false;
        
        // Handle different types of errors
        if (error.status === 400) {
          // Bad Request - Validation errors
          if (error.error && typeof error.error === 'object') {
            // Handle structured validation errors
            if (error.error.errors) {
              // ASP.NET Core validation errors format
              Object.keys(error.error.errors).forEach(key => {
                const messages = error.error.errors[key];
                if (Array.isArray(messages)) {
                  messages.forEach((message: string) => {
                    this.validationErrors.push({
                      field: key,
                      message: message
                    });
                  });
                }
              });
            } else if (error.error.message) {
              // Single error message
              this.generalError = error.error.message;
            }
          } else if (typeof error.error === 'string') {
            // Plain text error
            this.generalError = error.error;
          }
        } else if (error.status === 401) {
          this.generalError = 'Mevcut şifreniz yanlış. Lütfen tekrar deneyin.';
        } else if (error.status === 500) {
          this.generalError = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        } else {
          this.generalError = 'Şifre değiştirme işlemi başarısız oldu. Lütfen tekrar deneyin.';
        }
      }
    });
  }
} 