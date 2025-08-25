import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { InstructionService } from '../../../services/instruction.service';

interface CreateInstructionRequest {
  title: string;
  amount: number;
  scheduledDate: string;
  description?: string;
  monthlyInstruction: boolean;
  instructionTime: number;
}

interface ErrorResponse {
  StatusCode: number;
  Errors: string[];
}

@Component({
  selector: 'app-create-instruction',
  templateUrl: './create-instruction.component.html',
  styleUrls: ['./create-instruction.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateInstructionComponent implements OnInit {
  instructionForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  errorMessages: string[] = [];
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private instructionService: InstructionService,
    private router: Router
  ) {
    this.instructionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      amount: ['', [Validators.required, Validators.min(0.01), Validators.max(1000000)]],
      scheduledDate: ['', [Validators.required, this.futureDateValidator]],
      description: ['', [Validators.minLength(4), Validators.maxLength(50)]], // İsteğe bağlı ama doldurulursa 4-50 karakter
      monthlyInstruction: [false], // Aylık talimat checkbox'ı
      instructionTime: [1, [Validators.min(1), Validators.max(12)]] // Talimat sayısı, maksimum 12 ay
    });
  }

  ngOnInit() {
    // Minimum tarih olarak bugünü ayarla
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM formatı
    this.instructionForm.get('scheduledDate')?.setValue(formattedDate);
  }

  // Aylık talimat checkbox'ı işaretli mi kontrol eden getter
  get isMonthlyInstructionChecked(): boolean {
    return this.instructionForm.get('monthlyInstruction')?.value || false;
  }

  createInstruction() {
    if (this.instructionForm.valid) {
      this.isSubmitting = true;
      this.clearMessages();

      const instructionData: CreateInstructionRequest = {
        title: this.instructionForm.value.title.trim(),
        amount: parseFloat(this.instructionForm.value.amount),
        scheduledDate: this.instructionForm.value.scheduledDate,
        description: this.instructionForm.value.description?.trim() || '',
        monthlyInstruction: this.instructionForm.value.monthlyInstruction || false,
        instructionTime: this.instructionForm.value.monthlyInstruction ? 
          parseInt(this.instructionForm.value.instructionTime) : 0
      };

      console.log('Gönderilen talimat verisi:', instructionData);

      this.instructionService.createInstruction(instructionData)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          })
        )
        .subscribe({
          next: (response) => {
            console.log('API Response:', response);
            this.successMessage = response;
            this.instructionForm.reset();
            
            // Minimum tarih olarak bugünü tekrar ayarla
            const today = new Date();
            const formattedDate = today.toISOString().slice(0, 16);
            this.instructionForm.get('scheduledDate')?.setValue(formattedDate);
            
            // 3 saniye sonra mesajı temizle
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);

            // 2 saniye sonra talimatlarım sayfasına yönlendir
            setTimeout(() => {
              this.router.navigate(['/instructions/list']);
            }, 2000);
          },
          error: (error) => {
            console.error('Talimat oluşturulurken hata oluştu:', error);
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
              this.errorMessage = 'Talimat oluşturulurken bir hata oluştu.';
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
    this.instructionForm.reset();
    this.clearMessages();
    
    // Minimum tarih olarak bugünü tekrar ayarla
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 16);
    this.instructionForm.get('scheduledDate')?.setValue(formattedDate);
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
    this.errorMessages = [];
  }

  // Gelecek tarih validator'ı
  futureDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcı
    selectedDate.setHours(0, 0, 0, 0); // Seçilen tarihin başlangıcı
    
    return selectedDate > today ? null : { futureDate: true };
  }

  // Para maskelemesi fonksiyonları
  onAmountInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/[^\d]/g, ''); // Sadece rakamları al
    
    if (value === '') {
      this.instructionForm.patchValue({ amount: '' });
      return;
    }
    
    // Sayısal değeri form'a kaydet
    const numericValue = parseInt(value);
    this.instructionForm.patchValue({ amount: numericValue });
    
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
    if (this.instructionForm.get('amount')?.value) {
      input.value = this.instructionForm.get('amount')?.value.toString();
    }
  }

  onAmountBlur(event: any): void {
    const input = event.target;
    // Blur olduğunda formatlanmış halini göster
    if (this.instructionForm.get('amount')?.value) {
      input.value = this.formatCurrency(this.instructionForm.get('amount')?.value);
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.instructionForm.controls).forEach(key => {
      const control = this.instructionForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
} 