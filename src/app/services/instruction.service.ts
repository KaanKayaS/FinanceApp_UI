import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Instruction } from '../models/instruction';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class InstructionService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllInstructions(): Observable<Instruction[]> {
    const currentUser = this.authService.currentUserValue;
    console.log('Current user token:', currentUser?.token);

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    console.log('Making request to:', `${environment.apiUrl}/Instruction/GetAllInstruction`);
    console.log('With headers:', headers);

    return this.http.get<Instruction[]>(
      `${environment.apiUrl}/Instruction/GetAllInstruction`,
      { headers }
    ).pipe(
      tap({
        next: (response) => console.log('API Response:', response),
        error: (error) => console.error('API Error:', error)
      })
    );
  }

  markAsPaid(instructionId: number): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    const requestBody = { id: instructionId };

    return this.http.put(
      `${environment.apiUrl}/Instruction/SetPaidTrueInstruction`,
      requestBody,
      { 
        headers,
        responseType: 'text' // Backend text response döndürdüğü için
      }
    );
  }

  removeInstruction(instructionId: number): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    return this.http.delete(
      `${environment.apiUrl}/Instruction/RemoveInstruction?id=${instructionId}`,
      { 
        headers,
        responseType: 'text' // Backend text response döndürdüğü için
      }
    );
  }

  updateInstruction(instruction: Partial<Instruction>): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${currentUser?.token}`
    );

    return this.http.put(
      `${environment.apiUrl}/Instruction/UpdateInstruction`,
      instruction,
      { 
        headers,
        responseType: 'text' // Backend text response döndürdüğü için
      }
    );
  }
} 