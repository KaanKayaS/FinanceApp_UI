import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CreditCardService } from '../../services/credit-card.service';
import { CreditCard } from '../../models/credit-card';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './cards.html',
  styleUrls: ['./cards.scss']
})
export class CardsComponent implements OnInit {
  cards: CreditCard[] = [];
  currentCardIndex = 0;

  constructor(
    private creditCardService: CreditCardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCards();
  }

  loadCards() {
    this.creditCardService.getAllCreditCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        if (this.currentCardIndex >= this.cards.length && this.cards.length > 0) {
          this.currentCardIndex = this.cards.length - 1;
        }
      },
      error: (error) => {
        console.error('Error loading cards:', error);
        alert('Kartlar yüklenirken bir hata oluştu.');
      }
    });
  }

  nextCard() {
    if (this.currentCardIndex < this.cards.length - 1) {
      this.currentCardIndex++;
    }
  }

  previousCard() {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
    }
  }

  removeCard(cardId: number) {
    if (confirm('Bu kartı kaldırmak istediğinizden emin misiniz?')) {
      this.creditCardService.removeCreditCard(cardId).subscribe({
        next: (response) => {
          console.log('API Response:', response);
          alert(response || 'Kart başarıyla kaldırıldı.');
          this.loadCards();
        },
        error: (error) => {
          console.error('Error detail:', error);
          if (error.error) {
            alert(error.error);
          } else {
            alert('Kart kaldırılırken bir hata oluştu.');
          }
        }
      });
    }
  }

  viewTransactions(cardId: number) {
    this.router.navigate(['/transactions'], { 
      queryParams: { id: cardId }
    });
  }

  addBalance() {
    this.router.navigate(['/cards/add-balance']);
  }
} 