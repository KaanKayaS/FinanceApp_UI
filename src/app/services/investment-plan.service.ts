import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateInvestmentPlanRequest, InvestmentPlan } from '../models/investment-plan';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class InvestmentPlanService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  createInvestmentPlan(request: CreateInvestmentPlanRequest): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    const backendRequest = {
      name: request.name,
      description: request.description || '',
      targetPrice: Number(request.targetPrice),
      targetDate: request.targetDate,
      investmentCategory: Number(request.investmentCategory),
      investmentFrequency: Number(request.investmentFrequency)
    };

    console.log('=== Investment Plan Service Debug ===');
    console.log('Original request:', request);
    console.log('Backend request:', backendRequest);
    console.log('Backend request JSON:', JSON.stringify(backendRequest));
    console.log('====================================');

    return this.http.post(
      `${environment.apiUrl}/InvestmentPlan/CreateInvestmentPlan`,
      backendRequest,
      { 
        headers,
        responseType: 'text' // Backend text response döndürdüğü için
      }
    ).pipe(
      tap({
        next: (response) => console.log('Investment plan created:', response),
        error: (error) => console.error('Investment plan creation error:', error)
      })
    );
  }

  getAllInvestmentPlanByUser(): Observable<InvestmentPlan[]> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    return this.http.get<InvestmentPlan[]>(
      `${environment.apiUrl}/InvestmentPlan/GetAllInvestmentPlanByUser`,
      { headers }
    ).pipe(
      tap({
        next: (response) => console.log('User investment plans loaded:', response),
        error: (error) => console.error('User investment plans error:', error)
      })
    );
  }

  addBalanceToPlan(price: number, cardId: number, investmentPlanId: number): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    const request = {
      price: price,
      cardId: cardId,
      investmentPlanId: investmentPlanId
    };

    console.log('=== Add Balance Debug ===');
    console.log('Request:', request);
    console.log('Headers:', headers);
    console.log('========================');

    return this.http.put(
      `${environment.apiUrl}/InvestmentPlan/AddBalancePlan`,
      request,
      { 
        headers,
        responseType: 'text' // Backend text response döndürdüğü için
      }
    ).pipe(
      tap({
        next: (response) => console.log('✅ Balance added successfully:', response),
        error: (error) => console.error('❌ Add balance error:', error)
      })
    );
  }

  removeInvestmentPlan(investmentPlanId: number): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    console.log('=== Remove Plan Debug ===');
    console.log('Plan ID:', investmentPlanId);
    console.log('Headers:', headers);
    console.log('========================');

    return this.http.delete(
      `${environment.apiUrl}/InvestmentPlan/RemovePlan`,
      { 
        headers,
        params: { id: investmentPlanId.toString() },
        responseType: 'text'
      }
    ).pipe(
      tap({
        next: (response) => console.log('✅ Investment plan removed successfully:', response),
        error: (error) => console.error('❌ Remove plan error:', error)
      })
    );
  }
} 