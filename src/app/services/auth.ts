import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { AiChatService } from './ai-chat.service';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  token?: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private aiChatService: AiChatService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  isAuthenticated(): boolean {
    const currentUser = this.currentUserValue;
    return !!currentUser && !!currentUser.token;
  }

  private getUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('currentUser');
      console.log('Storage\'dan alınan kullanıcı:', user);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    const user = this.currentUserValue;
    console.log('Mevcut kullanıcı:', user);
    return user;
  }

  login(email: string, password: string): Observable<User> {
    console.log('Login isteği gönderiliyor:', { email });
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => console.log('Login API yanıtı:', response)),
        map(response => {
          console.log('Login yanıtı işleniyor:', response);
          
          // API yanıtını kontrol et
          if (!response || (!response.accessToken && !response.token)) {
            throw new Error('Invalid API response structure');
          }

          // API yanıtından token'ları al
          const accessToken = response.accessToken || response.token;
          const refreshToken = response.refreshToken;
          
          const userWithDetails: User = {
            id: response.id || '',
            email: email,
            username: response.username || email.split('@')[0],
            token: accessToken,
            refreshToken: refreshToken
          };
          
          console.log('Oluşturulan kullanıcı detayları:', userWithDetails);
          
                     if (isPlatformBrowser(this.platformId)) {
             localStorage.setItem('currentUser', JSON.stringify(userWithDetails));
             console.log('Kullanıcı localStorage\'a kaydedildi');
             // AI chat service'inin haberdar olması için storage event tetikle
             window.dispatchEvent(new StorageEvent('storage', {
               key: 'currentUser',
               newValue: JSON.stringify(userWithDetails),
               oldValue: null
             }));
           }
           this.currentUserSubject.next(userWithDetails);
          return userWithDetails;
        }),
        catchError(error => {
          console.error('Login hatası:', error);
          if (error.error) {
            console.error('API hata yanıtı:', error.error);
          }
          // LocalStorage'ı ve current user'ı temizle
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('currentUser');
          }
          this.currentUserSubject.next(null);
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<User> {
    const currentUser = this.currentUserValue;
    if (!currentUser || !currentUser.token || !currentUser.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<TokenResponse>(`${environment.apiUrl}/Auth/RefreshToken`, {
      accessToken: currentUser.token,
      refreshToken: currentUser.refreshToken
    }).pipe(
      map(response => {
        const updatedUser = {
          ...currentUser,
          token: response.accessToken,
          refreshToken: response.refreshToken
        };

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
        this.currentUserSubject.next(updatedUser);
        return updatedUser;
      }),
      catchError(error => {
        console.error('Token yenileme hatası:', error);
        this.cikisYap(currentUser.email).subscribe();
        return throwError(() => error);
      })
    );
  }

  register(registerData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/Register`, registerData,{ responseType: 'text' });
  }

  cikisYap(email: string): Observable<any> {
    console.log('Çıkış yapılacak email:', email);
    return this.http.post(`${environment.apiUrl}/Auth/Revoke`, { email }).pipe(
      tap({
        next: () => {
          console.log('Çıkış başarılı');
          
          // AI chat bağlantısını temizle
          this.aiChatService.disconnect();
          
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('currentUser');
            // AI chat service'inin haberdar olması için storage event tetikle
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'currentUser',
              newValue: null,
              oldValue: localStorage.getItem('currentUser')
            }));
          }
          this.currentUserSubject.next(null);
        },
        error: (hata) => {
          console.error('Çıkış hatası:', hata);
          
          // AI chat bağlantısını temizle
          this.aiChatService.disconnect();
          
          // Hata durumunda da temizleyelim
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('currentUser');
            // AI chat service'inin haberdar olması için storage event tetikle
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'currentUser',
              newValue: null,
              oldValue: localStorage.getItem('currentUser')
            }));
          }
          this.currentUserSubject.next(null);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/ForgotPassword`, { email }, { responseType: 'text' });
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/ResetPassword`, {
      email,
      token,
      newPassword
    }, { responseType: 'text' });
  }
}
