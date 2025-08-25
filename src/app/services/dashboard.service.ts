import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense';
import { DailyProfitLoss } from '../models/daily-profit-loss';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private baseUrl = 'https://api.finstats.net/api';

    constructor(private http: HttpClient) { }

    getLast3Expenses(): Observable<Expense[]> {
        return this.http.get<Expense[]>(`${this.baseUrl}/Expense/GetLast3Expense`);
    }

    getLastMonthExpenseTotal(): Observable<number> {
        return this.http.get<number>(`${this.baseUrl}/Expense/GetLastMonthExpenseTotalAmount`);
    }

    getMembershipCount(): Observable<number> {
        return this.http.get<number>(`${this.baseUrl}/Membership/GetMembershipCount`);
    }

    getDailyProfitLoss(): Observable<DailyProfitLoss[]> {
        return this.http.get<DailyProfitLoss[]>(`${this.baseUrl}/Expense/GetDailyNetProfit`);
    }
} 