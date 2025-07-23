import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

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
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    this.loadManualExpenses();
  }

  loadManualExpenses() {
    this.http.get<ManualExpense[]>('http://localhost:5055/api/Expense/GetAllExpense')
      .subscribe({
        next: (data) => {
          this.expenses = data;
        },
        error: (error) => {
          console.error('Manuel giderler yüklenirken hata oluştu:', error);
          this.errorMessage = 'Giderler yüklenirken bir hata oluştu.';
          setTimeout(() => this.errorMessage = '', 3000);
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

      const apiUrl = `http://localhost:5055/api/Expense/UpdateExpens?id=${id}&amount=${amount}&name=${encodeURIComponent(name)}`;
      console.log('API URL:', apiUrl);

      this.http.put(apiUrl, null, { 
        responseType: 'text',
        headers: {
          'Content-Type': 'application/json'
        }
      })
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
            console.error('Error details:', error.error);
            console.error('Status:', error.status);
            this.errorMessage = 'Gider güncellenirken bir hata oluştu. Detaylar için console\'u kontrol edin.';
            setTimeout(() => this.errorMessage = '', 5000);
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
    if(confirm('Bu gideri silmek istediğinizden emin misiniz?')) {
      this.http.delete(`http://localhost:5055/api/Expense/RemoveExpens?id=${id}`, { responseType: 'text' })
        .subscribe({
          next: (response) => {
            this.successMessage = response;
            setTimeout(() => this.successMessage = '', 3000);
            
            setTimeout(() => {
              this.loadManualExpenses();
            }, 100);
          },
          error: (error) => {
            console.error('Gider silinirken hata oluştu:', error);
            this.errorMessage = 'Gider silinirken bir hata oluştu.';
            setTimeout(() => this.errorMessage = '', 3000);
          }
        });
    }
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
} 