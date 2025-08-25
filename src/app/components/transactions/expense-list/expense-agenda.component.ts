import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ExpenseService } from '../../../services/expense.service';
import Swal from 'sweetalert2';

// ManualExpense interface'ini service'ten import edebiliriz ama şimdilik burada tanımlayalım
interface ManualExpense {
  id: number;
  name: string;
  amount: number;
  paidDate: string;
}

@Component({
  selector: 'app-expense-agenda',
  templateUrl: './expense-agenda.component.html',
  styleUrls: ['./expense-agenda.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ExpenseAgendaComponent implements OnInit {
  expenses: ManualExpense[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  showEditModal: boolean = false;
  editForm: FormGroup;
  currentEditingExpense: ManualExpense | null = null;
  isUpdating: boolean = false;

  constructor(
    private expenseService: ExpenseService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(25)]],
      amount: ['', [Validators.required, Validators.min(0.01), Validators.max(1000000)]]
    });
  }

  ngOnInit() {
    this.loadManualExpenses();
  }

  loadManualExpenses() {
    this.expenseService.getAllExpense()
      .subscribe({
        next: (data) => {
          this.expenses = data;
        },
        error: (error) => {
          console.error('Manuel giderler yüklenirken hata oluştu:', error);
          this.handleError(error, 'Giderler yüklenirken bir hata oluştu.');
        }
      });
  }

  openEditModal(expense: ManualExpense) {
    this.currentEditingExpense = expense;
    this.editForm.patchValue({
      name: expense.name,
      amount: expense.amount
    });
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.currentEditingExpense = null;
    this.editForm.reset();
    this.isUpdating = false;
  }

  updateExpense() {
    console.log('Form valid:', this.editForm.valid);
    console.log('Form values:', this.editForm.value);
    console.log('Current editing expense:', this.currentEditingExpense);
    console.log('Form errors:', this.editForm.errors);
    
    if (this.editForm.valid && this.currentEditingExpense) {
      this.isUpdating = true;
      
      const id = this.currentEditingExpense.id;
      const name = this.editForm.value.name;
      const amount = this.editForm.value.amount;

      console.log('Gönderilen parametreler:', { id, name, amount });

      this.expenseService.updateExpense(id, name, amount)
        .pipe(
          finalize(() => {
            this.isUpdating = false;
          })
        )
        .subscribe({
          next: (response) => {
            console.log('API Response:', response);
            this.successMessage = response;
            setTimeout(() => this.successMessage = '', 3000);
            this.closeEditModal();
            this.loadManualExpenses();
          },
          error: (error) => {
            console.error('Gider güncellenirken hata oluştu:', error);
            this.handleError(error, 'Gider güncellenirken bir hata oluştu.');
          }
        });
    } else {
      console.log('Form invalid veya editing expense yok');
      if (!this.editForm.valid) {
        console.log('Form hataları:', this.editForm.errors);
        Object.keys(this.editForm.controls).forEach(key => {
          const control = this.editForm.get(key);
          if (control && control.errors) {
            console.log(`${key} field errors:`, control.errors);
          }
        });
      }
    }
  }

  deleteExpense(id: number) {
    const expense = this.expenses.find(e => e.id === id);
    const expenseName = expense ? expense.name : 'Bu gideri';
    
    Swal.fire({
      title: 'Emin misiniz?',
      text: `"${expenseName}" giderini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.expenseService.deleteExpense(id)
          .subscribe({
            next: (response) => {
              Swal.fire({
                title: 'Başarılı!',
                text: response || 'Gider başarıyla silindi.',
                icon: 'success',
                confirmButtonText: 'Tamam'
              });
              
              setTimeout(() => {
                this.loadManualExpenses();
              }, 100);
            },
            error: (error) => {
              console.error('Gider silinirken hata oluştu:', error);
              
              let errorMessage = 'Gider silinirken bir hata oluştu.';
              if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
              }
              
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

  private handleError(error: any, defaultMessage: string) {
    console.error('Full error object:', error);
    
    // CORS veya network hatası
    if (error.status === 0) {
      this.errorMessage = 'Sunucuya bağlanılamadı. CORS hatası olabilir veya sunucu çalışmıyor olabilir.';
    }
    // Server hatası
    else if (error.status === 500 || error.status === 400 || error.status === 422) {
      if (typeof error.error === 'string') {
        this.errorMessage = 'Sunucu hatası: ' + error.error;
      } else {
        this.errorMessage = `HTTP ${error.status}: ${error.statusText || 'Bilinmeyen hata'}`;
      }
    }
    // Diğer HTTP hataları
    else if (error.status) {
      this.errorMessage = `HTTP ${error.status}: ${error.statusText || 'Bilinmeyen hata'}`;
    }
    // Genel hata
    else {
      this.errorMessage = defaultMessage;
    }

    // Hata mesajını 5 saniye sonra temizle
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Para maskelemesi fonksiyonları
  onAmountInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/[^\d]/g, ''); // Sadece rakamları al
    
    if (value === '') {
      this.editForm.patchValue({ amount: '' });
      return;
    }
    
    // Sayısal değeri form'a kaydet
    const numericValue = parseInt(value);
    this.editForm.patchValue({ amount: numericValue });
    
    // Binlik ayırıcı ile formatla ve input'a yaz
    input.value = this.formatCurrencyInput(numericValue);
  }

  formatCurrencyInput(value: number): string {
    // Türkiye formatında binlik ayırıcı (nokta) kullan
    return value.toLocaleString('tr-TR');
  }

  onAmountFocus(event: any): void {
    const input = event.target;
    // Focus edildiğinde sadece rakamları göster
    if (this.editForm.get('amount')?.value) {
      input.value = this.editForm.get('amount')?.value.toString();
    }
  }

  onAmountBlur(event: any): void {
    const input = event.target;
    // Blur olduğunda formatlanmış halini göster
    if (this.editForm.get('amount')?.value) {
      input.value = this.formatCurrencyInput(this.editForm.get('amount')?.value);
    }
  }
} 