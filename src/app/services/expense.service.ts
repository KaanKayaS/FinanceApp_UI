import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    private baseUrl = 'http://localhost:5055/api';

    constructor(private http: HttpClient) { }

    getAllExpenseWithPayment(): Observable<Expense[]> {
        return this.http.get<Expense[]>(`${this.baseUrl}/Expense/GetAllExpenseWithPayment`);
    }
} 