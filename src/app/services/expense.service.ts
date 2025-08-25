import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense';
import { environment } from '../../environments/environment';

interface CreateExpenseRequest {
  name: string;
  amount: number;
}

interface ManualExpense {
  id: number;
  name: string;
  amount: number;
  paidDate: string;
}

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAllExpenseWithPayment(): Observable<Expense[]> {
        return this.http.get<Expense[]>(`${this.baseUrl}/Expense/GetAllExpenseWithPayment`);
    }

    getAllExpense(): Observable<ManualExpense[]> {
        return this.http.get<ManualExpense[]>(`${this.baseUrl}/Expense/GetAllExpense`);
    }

    createExpense(expenseData: CreateExpenseRequest): Observable<string> {
        return this.http.post(`${this.baseUrl}/Expense/CreateExpense`, expenseData, {
            responseType: 'text',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    updateExpense(id: number, name: string, amount: number): Observable<string> {
        const apiUrl = `${this.baseUrl}/Expense/UpdateExpens?id=${id}&amount=${amount}&name=${encodeURIComponent(name)}`;
        return this.http.put(apiUrl, null, { 
            responseType: 'text',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    deleteExpense(id: number): Observable<string> {
        return this.http.delete(`${this.baseUrl}/Expense/RemoveExpens?id=${id}`, { 
            responseType: 'text' 
        });
    }
} 