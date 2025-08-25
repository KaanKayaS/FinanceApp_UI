import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CreditCardService } from '../../services/credit-card.service';
import { CreditCard } from '../../models/credit-card';
import Swal from 'sweetalert2';

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
    const card = this.cards.find(c => c.cardId === cardId);
    const cardNumber = card ? this.maskCardNumber(card.cardNo) : 'Bu kartı';
    
    Swal.fire({
      title: 'Emin misiniz?',
      text: `${cardNumber} kartını kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, Kaldır!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.creditCardService.removeCreditCard(cardId).subscribe({
          next: (response) => {
            console.log('API Response:', response);
            Swal.fire({
              title: 'Başarılı!',
              text: response || 'Kart başarıyla kaldırıldı.',
              icon: 'success',
              confirmButtonText: 'Tamam'
            });
            this.loadCards();
          },
          error: (error) => {
            console.error('Error detail:', error);
            const errorMessage = error.error || 'Kart kaldırılırken bir hata oluştu.';
            Swal.fire({
              title: 'Hata!',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'Tamam'
            });
          }
        });
      }
    });
  }

  maskCardNumber(cardNo: string): string {
    if (cardNo.length < 4) return cardNo;
    return '**** **** **** ' + cardNo.slice(-4);
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