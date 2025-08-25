import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditCardService } from '../../services/credit-card.service';
import { Transaction } from '../../models/transaction';
import { AddBalanceCategory, AddBalanceCategoryLabels } from '../../models/add-balance-category';

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
  AddBalanceCategoryLabels = AddBalanceCategoryLabels;

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

  getTransactionIcon(transaction: Transaction): string {
    // Eğer addBalanceCategory null ise normal harcama
    if (transaction.addBalanceCategory === null) {
      return 'fas fa-shopping-cart';
    }
    
    // Eğer 0 ise kumbaraya para ekleme (geçici olarak)
    if (transaction.addBalanceCategory === 0) {
      return 'fas fa-piggy-bank'; // Kumbara ikonu
    }

    // Kategori ikonları
    switch (transaction.addBalanceCategory) {
      case AddBalanceCategory.Salary:
        return 'fas fa-briefcase';
      case AddBalanceCategory.CashIncome:
        return 'fas fa-money-bill-wave';
      case AddBalanceCategory.AdditionalIncome:
        return 'fas fa-plus-circle';
      case AddBalanceCategory.PrizeIncome:
        return 'fas fa-trophy';
      case AddBalanceCategory.InvestmentIncome:
        return 'fas fa-chart-line';
      case AddBalanceCategory.RentalIncome:
        return 'fas fa-home';
      case AddBalanceCategory.CreditCardMoney:
        return 'fas fa-credit-card';
      case AddBalanceCategory.PiggyBank:
        return 'fas fa-piggy-bank'; // Kumbara ikonu
      case AddBalanceCategory.CrashPigyBank:
        return 'fas fa-piggy-bank'; // Kumbara kırma ikonu (aynı ikon)
      default:
        return 'fas fa-plus';
    }
  }

  getTransactionType(transaction: Transaction): 'income' | 'expense' {
    // Kumbaraya para ekleme expense olarak gösterilsin
    if (transaction.addBalanceCategory === AddBalanceCategory.PiggyBank || transaction.addBalanceCategory === 8) {
      return 'expense';
    }
    
    // Kumbara kırma income olarak gösterilsin (para kartlara iade ediliyor)
    if (transaction.addBalanceCategory === AddBalanceCategory.CrashPigyBank || transaction.addBalanceCategory === 9) {
      return 'income';
    }
    
    // Geçici olarak 0 kategorisini de expense olarak göster (kumbaraya para ekleme için)
    if (transaction.addBalanceCategory === 0) {
      return 'expense';
    }
    
    return transaction.addBalanceCategory !== null ? 'income' : 'expense';
  }

  getCategoryLabel(addBalanceCategory: number | null): string {
    if (addBalanceCategory === null) {
      return 'Harcama';
    }
    if (addBalanceCategory === 0) {
      return 'Kumbaraya Para Ekleme'; // Geçici olarak 0 kategorisini de kumbara olarak göster
    }
    if (addBalanceCategory === AddBalanceCategory.PiggyBank || addBalanceCategory === 8) {
      return 'Kumbaraya Para Ekleme';
    }
    if (addBalanceCategory === AddBalanceCategory.CrashPigyBank || addBalanceCategory === 9) {
      return 'Kumbara Kırma';
    }
    return AddBalanceCategoryLabels[addBalanceCategory as AddBalanceCategory] || 'Bilinmeyen';
  }

  goBack() {
    this.router.navigate(['/cards']);
  }
} 