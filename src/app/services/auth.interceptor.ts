import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  // Auth ile ilgili istekleri bypass et
  if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
    return next(request);
  }

  const currentUser = authService.getCurrentUser();
  
  if (currentUser && currentUser.token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`
      }
    });
  }

  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // 401 hatası durumunda kullanıcıyı login sayfasına yönlendir
        if (currentUser?.email) {
          authService.cikisYap(currentUser.email).subscribe();
        }
      }
      return throwError(() => error);
    })
  );
}; 