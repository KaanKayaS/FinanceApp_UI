import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

interface CreateExpenseRequest {
  name: string;
  amount: number;
}

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
    private http: HttpClient,
    private router: Router
  ) {
    this.expenseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {}

  addExpense() {
    if (this.expenseForm.valid) {
      this.isSubmitting = true;
      this.clearMessages();

      const expenseData: CreateExpenseRequest = {
        name: this.expenseForm.value.name.trim(),
        amount: parseFloat(this.expenseForm.value.amount)
      };

      console.log('Gönderilen gider verisi:', expenseData);

      this.http.post('http://localhost:5055/api/Expense/CreateExpense', expenseData, {
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
    
    if (error.status === 500 || error.status === 400 || error.status === 422) {
      try {
        const errorResponse: ErrorResponse = JSON.parse(error.error);
        if (errorResponse.Errors && errorResponse.Errors.length > 0) {
          this.errorMessages = errorResponse.Errors;
          this.errorMessage = 'Aşağıdaki hatalar oluştu:';
        } else {
          this.errorMessage = 'Gider eklenirken bir hata oluştu.';
        }
      } catch (e) {
        this.errorMessage = 'Gider eklenirken bir hata oluştu.';
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
    this.expenseForm.reset();
    this.clearMessages();
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
    this.errorMessages = [];
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