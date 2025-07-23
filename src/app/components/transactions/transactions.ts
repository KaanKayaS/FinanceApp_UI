import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditCardService } from '../../services/credit-card.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.scss']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditCardService: CreditCardService
  ) {}

  ngOnInit() {
    const cardId = this.route.snapshot.queryParams['id'];
    if (cardId) {
      this.loadTransactions(+cardId);
    }
  }

  loadTransactions(cardId: number) {
    this.loading = true;
    this.creditCardService.getCardTransactions(cardId).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.error = 'İşlem geçmişi yüklenirken bir hata oluştu.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/cards']);
  }
} 