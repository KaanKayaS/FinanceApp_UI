import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreditCard } from '../models/credit-card';
import { Transaction } from '../models/transaction';
import { environment } from '../../environments/environment';

interface ApiErrorResponse {
  StatusCode: number;
  Errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CreditCardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllCreditCards(): Observable<CreditCard[]> {
    return this.http.get<CreditCard[]>(`${this.baseUrl}/CreditCard/GetAllCreditCardByUser`);
  }

  getCardTransactions(cardId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/CreditCard/GetAllAccountTransactions`, {
      params: { id: cardId.toString() }
    });
  }

  removeCreditCard(cardId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/CreditCard/RemoveCreditCard`, {
      params: { id: cardId.toString() },
      responseType: 'text'
    });
  }

  addBalance(cardId: number, balance: number, addBalanceCategory: number, name?: string): Observable<string> {
    let url = `${this.baseUrl}/CreditCard/AddBalance?id=${cardId}&balance=${balance}&addbalanceCategory=${addBalanceCategory}`;
    if (name && name.trim()) {
      url += `&name=${encodeURIComponent(name)}`;
    }
    return this.http.put(url, null, { responseType: 'text' });
  }

  createCreditCard(cardData: {
    cardNo: string;
    validDate: string;
    cvv: string;
    nameOnCard: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/CreditCard/CreateCreditCard`, cardData, { responseType: 'text' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error && typeof error.error === 'string') {
            try {
              const parsedError = JSON.parse(error.error) as ApiErrorResponse;
              if (parsedError.Errors?.length > 0) {
                // "Hata mesajı : " kısmını kaldırıyoruz
                const errorMessage = parsedError.Errors[0].replace('Hata mesajı : ', '');
                return throwError(() => errorMessage);
              }
            } catch (e) {
              // JSON parse hatası durumunda orijinal mesajı kullan
              return throwError(() => error.error);
            }
          }
          return throwError(() => 'Bir hata oluştu');
        })
      );
  }
} 