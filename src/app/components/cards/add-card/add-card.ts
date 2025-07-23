import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreditCardService } from '../../../services/credit-card.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-card.html',
  styleUrls: ['./add-card.scss']
})
export class AddCardComponent {
  cardForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private creditCardService: CreditCardService,
    private router: Router
  ) {
    this.cardForm = this.fb.group({
      cardNo: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      validDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/([0-9]{2})$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3}$')]],
      nameOnCard: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit() {
    if (this.cardForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Format the card number to remove any spaces
      const formValue = {
        ...this.cardForm.value,
        cardNo: this.cardForm.value.cardNo.replace(/\s/g, '')
      };

      this.creditCardService.createCreditCard(formValue).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/cards']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = error.error || 'Kart eklenirken bir hata oluştu.';
        }
      });
    } else {
      this.markFormGroupTouched(this.cardForm);
    }
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 0) {
      value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
    }
    event.target.value = value;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.cardForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    
    switch (controlName) {
      case 'cardNo':
        if (errors['required']) return 'Kart numarası gereklidir';
        if (errors['pattern']) return 'Geçerli bir kart numarası giriniz (16 haneli)';
        break;
      case 'validDate':
        if (errors['required']) return 'Son kullanma tarihi gereklidir';
        if (errors['pattern']) return 'Geçerli bir tarih giriniz (AA/YY)';
        break;
      case 'cvv':
        if (errors['required']) return 'CVV gereklidir';
        if (errors['pattern']) return 'Geçerli bir CVV giriniz (3 haneli)';
        break;
      case 'nameOnCard':
        if (errors['required']) return 'Kart üzerindeki isim gereklidir';
        if (errors['minlength']) return 'İsim en az 3 karakter olmalıdır';
        break;
    }
    return '';
  }
} 