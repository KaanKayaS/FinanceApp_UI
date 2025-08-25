import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreditCardService } from '../../../services/credit-card.service';
import { CreditCard } from '../../../models/credit-card';
import { AddBalanceCategory, AddBalanceCategoryLabels, getAddBalanceCategoryOptions } from '../../../models/add-balance-category';
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
  categoryOptions = getAddBalanceCategoryOptions();
  AddBalanceCategoryLabels = AddBalanceCategoryLabels;

  constructor(
    private creditCardService: CreditCardService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.balanceForm = this.formBuilder.group({
      cardId: ['', Validators.required],
      balance: ['', [Validators.required, Validators.min(1), Validators.max(1000000)]],
      category: [AddBalanceCategory.Salary, Validators.required],
      name: ['', [Validators.minLength(3), Validators.maxLength(30)]]
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
        
        // Eğer tek kart varsa otomatik seçili gelsin
        if (cards.length === 1) {
          this.balanceForm.patchValue({ cardId: cards[0].cardId });
        }
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

    const { cardId, balance, category, name } = this.balanceForm.value;

    console.log('Bakiye yükleme isteği gönderiliyor:', { cardId, balance, category, name });

    this.creditCardService.addBalance(cardId, balance, category, name).subscribe({
      next: (response) => {
        console.log('Bakiye yükleme başarılı:', response);
        this.success = response;
        this.loading = false;
        this.balanceForm.reset();
        this.balanceForm.patchValue({ category: AddBalanceCategory.Salary });
        
        // Kartları yeniden yükle güncel bakiyeleri görmek için
        this.loadCards();
      },
      error: (error) => {
        console.error('Bakiye yükleme hatası:', error);
        
        // Status code'u kaldır, sadece hata mesajını göster
        if (error.error && typeof error.error === 'string') {
          try {
            const parsedError = JSON.parse(error.error);
            if (parsedError.Errors && parsedError.Errors.length > 0) {
              this.error = parsedError.Errors[0];
            } else {
              this.error = error.error;
            }
          } catch (e) {
            // JSON parse edilemezse direkt string olarak kullan
            this.error = error.error;
          }
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

  // Tutar girişi için maskeleme (nokta ve virgül ile)
  onBalanceInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/[^\d]/g, ''); // Sadece rakamları al
    
    if (value === '') {
      this.balanceForm.patchValue({ balance: '' });
      return;
    }
    
    // Sayısal değeri form'a kaydet
    const numericValue = parseInt(value);
    this.balanceForm.patchValue({ balance: numericValue });
    
    // Binlik ayırıcı ile formatla ve input'a yaz
    input.value = this.formatCurrency(numericValue);
  }

  formatCurrency(value: number): string {
    // Türkiye formatında binlik ayırıcı (nokta) kullan
    return value.toLocaleString('tr-TR');
  }

  onBalanceFocus(event: any): void {
    const input = event.target;
    // Focus edildiğinde sadece rakamları göster
    if (this.balanceForm.get('balance')?.value) {
      input.value = this.balanceForm.get('balance')?.value.toString();
    }
  }

  onBalanceBlur(event: any): void {
    const input = event.target;
    // Blur olduğunda formatlanmış halini göster
    if (this.balanceForm.get('balance')?.value) {
      input.value = this.formatCurrency(this.balanceForm.get('balance')?.value);
    }
  }

  // Kart ekleme sayfasına yönlendir
  goToAddCard(): void {
    this.router.navigate(['/cards/add']);
  }
} 