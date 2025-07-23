import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreditCardService } from '../../../services/credit-card.service';
import { CreditCard } from '../../../models/credit-card';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-add-balance',
  templateUrl: './add-balance.html',
  styleUrls: ['./add-balance.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DecimalPipe
  ]
})
export class AddBalanceComponent implements OnInit {
  cards: CreditCard[] = [];
  balanceForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private creditCardService: CreditCardService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.balanceForm = this.formBuilder.group({
      cardId: ['', Validators.required],
      balance: ['', [Validators.required, Validators.min(1), Validators.max(100000)]]
    });
  }

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.loading = true;
    this.error = null;
    
    this.creditCardService.getAllCreditCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        this.loading = false;
      },
      error: (error) => {
        console.error('Kartlar yüklenirken hata:', error);
        this.error = 'Kartlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.balanceForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const { cardId, balance } = this.balanceForm.value;

    console.log('Bakiye yükleme isteği gönderiliyor:', { cardId, balance });

    this.creditCardService.addBalance(cardId, balance).subscribe({
      next: (response) => {
        console.log('Bakiye yükleme başarılı:', response);
        // Response'dan sadece message kısmını al
        this.success = response.message;
        this.loading = false;
        this.balanceForm.reset();
        
        // Kartları yeniden yükle güncel bakiyeleri görmek için
        this.loadCards();
      },
      error: (error) => {
        console.error('Bakiye yükleme hatası:', error);
        if (error.error) {
          this.error = error.error;
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'Bakiye yüklenirken bir hata oluştu. Lütfen tekrar deneyin.';
        }
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cards']);
  }

  formatCardNumber(cardNo: string): string {
    return cardNo.replace(/(\d{4})/g, '$1 ').trim();
  }
} 