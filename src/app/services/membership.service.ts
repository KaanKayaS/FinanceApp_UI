import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DigitalPlatform } from '../models/digital-platform';
import { CreditCard } from '../models/credit-card';
import { CreateMembershipRequest, UserMembership } from '../models/membership';
import { AuthService } from './auth';

export interface PlanPriceResponse {
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllDigitalPlatforms(): Observable<DigitalPlatform[]> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    return this.http.get<DigitalPlatform[]>(
      `${environment.apiUrl}/DigitalPlatform/GetAllDigitalPlatform`,
      { headers }
    ).pipe(
      tap({
        next: (response) => console.log('Digital platforms loaded:', response),
        error: (error) => console.error('Digital platforms error:', error)
      })
    );
  }

  getAllCreditCardsByUser(): Observable<CreditCard[]> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    return this.http.get<CreditCard[]>(
      `${environment.apiUrl}/CreditCard/GetAllCreditCardByUser`,
      { headers }
    ).pipe(
      tap({
        next: (response) => console.log('Credit cards loaded:', response),
        error: (error) => console.error('Credit cards error:', error)
      })
    );
  }

  createMembership(request: CreateMembershipRequest): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    // Backend direkt request bekliyor, command wrapper yok
    // Değerleri number'a çeviriyoruz
    const backendRequest = {
      digitalPlatformId: Number(request.digitalPlatformId),
      subscriptionType: Number(request.subscriptionType),
      creditCardId: Number(request.creditCardId)
    };

    console.log('=== Service Debug ===');
    console.log('Original request:', request);
    console.log('Backend request:', backendRequest);
    console.log('Backend request JSON:', JSON.stringify(backendRequest));
    console.log('====================');

    return this.http.post(
      `${environment.apiUrl}/Membership/CreateMembership`,
      backendRequest,
      { 
        headers,
        responseType: 'text' // Backend text response döndürdüğü için
      }
    ).pipe(
      tap({
        next: (response) => console.log('Membership created:', response),
        error: (error) => console.error('Membership creation error:', error)
      })
    );
  }

  getSubscriptionPlanPrice(digitalPlatformId: number, planType: number): Observable<PlanPriceResponse> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    return this.http.get<PlanPriceResponse>(
      `${environment.apiUrl}/SubscriptionPlan/GetSubPlanPrice?digitalPlatformId=${digitalPlatformId}&planType=${planType}`,
      { headers }
    ).pipe(
      tap({
        next: (response) => console.log('Plan price loaded:', response),
        error: (error) => console.error('Plan price error:', error)
      })
    );
  }

  getAllMembershipsByUser(): Observable<UserMembership[]> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    return this.http.get<UserMembership[]>(
      `${environment.apiUrl}/Membership/GetAllMembershipsByUser`,
      { headers }
    ).pipe(
      tap({
        next: (response) => console.log('User memberships loaded:', response),
        error: (error) => console.error('User memberships error:', error)
      })
    );
  }

  removeMembership(digitalPlatformId: number): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    return this.http.put(
      `${environment.apiUrl}/Membership/RemoveMembership?id=${digitalPlatformId}`,
      null, // PUT request body yok
      { 
        headers,
        responseType: 'text' // Backend text response döndürdüğü için
      }
    ).pipe(
      tap({
        next: (response) => console.log('Membership removed:', response),
        error: (error) => console.error('Membership removal error:', error)
      })
    );
  }
} 