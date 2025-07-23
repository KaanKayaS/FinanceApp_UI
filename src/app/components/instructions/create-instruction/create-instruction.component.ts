import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

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
    private http: HttpClient,
    private router: Router
  ) {
    this.instructionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      scheduledDate: ['', [Validators.required]],
      description: [''], // İsteğe bağlı
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

      this.http.post('http://localhost:5055/api/Instruction/CreateInstruction', instructionData, {
        responseType: 'text',
        headers: {
          'Content-Type': 'application/json'
        }
      })
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
    
    if (error.status === 500 || error.status === 400 || error.status === 422) {
      try {
        const errorResponse: ErrorResponse = JSON.parse(error.error);
        if (errorResponse.Errors && errorResponse.Errors.length > 0) {
          this.errorMessages = errorResponse.Errors;
          this.errorMessage = 'Aşağıdaki hatalar oluştu:';
        } else {
          this.errorMessage = 'Talimat oluşturulurken bir hata oluştu.';
        }
      } catch (e) {
        this.errorMessage = 'Talimat oluşturulurken bir hata oluştu.';
      }
    } else {
      this.errorMessage = 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.';
    }

    // Hata mesajını 5 saniye sonra temizle
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
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

  private markFormGroupTouched() {
    Object.keys(this.instructionForm.controls).forEach(key => {
      const control = this.instructionForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
} 