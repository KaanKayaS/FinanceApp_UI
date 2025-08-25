import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AuthInterceptor } from './services/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';

// Türkçe locale'i kaydet
registerLocaleData(localeTr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideAnimations(), // Material Select animasyonları için gerekli
    importProvidersFrom(FullCalendarModule),
    { provide: LOCALE_ID, useValue: 'tr-TR' }
  ]
};
