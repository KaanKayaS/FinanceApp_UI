import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class AuthLoginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Eğer kullanıcı zaten giriş yapmışsa, home sayfasına yönlendir
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return false;
    }
    // Kullanıcı giriş yapmamışsa login sayfasına erişime izin ver
    return true;
  }
} 