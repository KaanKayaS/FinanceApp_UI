import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../services/expense.service';
import { Expense } from '../../../models/expense';

@Component({
    selector: 'app-payment-history',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-history.component.html',
    styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
    expenses: Expense[] = [];

    constructor(private expenseService: ExpenseService) { }

    ngOnInit() {
        this.loadExpenses();
    }

    loadExpenses() {
        this.expenseService.getAllExpenseWithPayment().subscribe({
            next: (data) => {
                this.expenses = data;
            },
            error: (error) => {
                console.error('Error fetching expenses:', error);
            }
        });
    }
} 