import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ExpenseService } from '../../../services/expense.service';

interface ErrorResponse {
  StatusCode: number;
  Errors: string[];
}

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AddExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  errorMessages: string[] = [];
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private router: Router
  ) {
    this.expenseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      amount: ['', [Validators.required, Validators.min(0.01), Validators.max(1000000)]]
    });
  }

  ngOnInit() {}

  addExpense() {
    if (this.expenseForm.valid) {
      this.isSubmitting = true;
      this.clearMessages();

      const expenseData = {
        name: this.expenseForm.value.name.trim(),
        amount: parseFloat(this.expenseForm.value.amount)
      };

      console.log('Gönderilen gider verisi:', expenseData);

      this.expenseService.createExpense(expenseData)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          })
        )
        .subscribe({
          next: (response) => {
            console.log('API Response:', response);
            this.successMessage = response;
            this.expenseForm.reset();
            
            // 3 saniye sonra mesajı temizle
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);

            // 2 saniye sonra gider ajandası sayfasına yönlendir
            setTimeout(() => {
              this.router.navigate(['/manual-expenses']);
            }, 2000);
          },
          error: (error) => {
            console.error('Gider eklenirken hata oluştu:', error);
            this.handleError(error);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleError(error: any) {
    this.clearMessages();
    
    console.error('Full error object:', error);
    
    // CORS veya network hatası
    if (error.status === 0) {
      this.errorMessage = 'Sunucuya bağlanılamadı. CORS hatası olabilir veya sunucu çalışmıyor olabilir.';
      this.errorMessages = ['API URL: ' + error.url || 'Bilinmiyor'];
    }
    // Server hatası
    else if (error.status === 500 || error.status === 400 || error.status === 422) {
      try {
        // String olarak gelen hata mesajını kontrol et
        if (typeof error.error === 'string') {
          try {
            const errorResponse: ErrorResponse = JSON.parse(error.error);
            if (errorResponse.Errors && errorResponse.Errors.length > 0) {
              this.errorMessages = errorResponse.Errors;
              this.errorMessage = 'Aşağıdaki hatalar oluştu:';
            } else {
              this.errorMessage = 'Gider eklenirken bir hata oluştu.';
            }
          } catch (parseError) {
            // JSON parse edilemezse raw string'i göster
            this.errorMessage = 'Sunucu hatası: ' + error.error;
          }
        } else if (error.error && error.error.Errors) {
          this.errorMessages = error.error.Errors;
          this.errorMessage = 'Aşağıdaki hatalar oluştu:';
        } else {
          this.errorMessage = `HTTP ${error.status}: ${error.statusText || 'Bilinmeyen hata'}`;
        }
      } catch (e) {
        this.errorMessage = `HTTP ${error.status}: Sunucu hatası`;
      }
    }
    // Diğer HTTP hataları
    else if (error.status) {
      this.errorMessage = `HTTP ${error.status}: ${error.statusText || 'Bilinmeyen hata'}`;
    }
    // Genel hata
    else {
      this.errorMessage = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
    }

    // Hata mesajını 8 saniye sonra temizle
    setTimeout(() => {
      this.clearMessages();
    }, 8000);
  }

  resetForm() {
    this.expenseForm.reset();
    this.clearMessages();
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
    this.errorMessages = [];
  }

  // Para maskelemesi fonksiyonları
  onAmountInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/[^\d]/g, ''); // Sadece rakamları al
    
    if (value === '') {
      this.expenseForm.patchValue({ amount: '' });
      return;
    }
    
    // Sayısal değeri form'a kaydet
    const numericValue = parseInt(value);
    this.expenseForm.patchValue({ amount: numericValue });
    
    // Binlik ayırıcı ile formatla ve input'a yaz
    input.value = this.formatCurrency(numericValue);
  }

  formatCurrency(value: number): string {
    // Türkiye formatında binlik ayırıcı (nokta) kullan
    return value.toLocaleString('tr-TR');
  }

  onAmountFocus(event: any): void {
    const input = event.target;
    // Focus edildiğinde sadece rakamları göster
    if (this.expenseForm.get('amount')?.value) {
      input.value = this.expenseForm.get('amount')?.value.toString();
    }
  }

  onAmountBlur(event: any): void {
    const input = event.target;
    // Blur olduğunda formatlanmış halini göster
    if (this.expenseForm.get('amount')?.value) {
      input.value = this.formatCurrency(this.expenseForm.get('amount')?.value);
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.expenseForm.controls).forEach(key => {
      const control = this.expenseForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
} 