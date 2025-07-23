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
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss']
})
export class AddCardComponent {
  cardForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showError = false;

  constructor(
    private fb: FormBuilder,
    private creditCardService: CreditCardService,
    private router: Router
  ) {
    this.cardForm = this.fb.group({
      cardNo: ['', [
        Validators.required,
        Validators.pattern(/^\d{16}$/)
      ]],
      validDate: ['', [
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
      ]],
      cvv: ['', [
        Validators.required,
        Validators.pattern(/^\d{3}$/)
      ]],
      nameOnCard: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
      ]]
    });

    // Form değişikliklerini dinle
    this.cardForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
        this.showError = false;
      }
    });
  }

  onSubmit() {
    if (this.cardForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.showError = false;

      const formValue = {
        ...this.cardForm.value,
        cardNo: this.cardForm.value.cardNo.replace(/\s/g, '')
      };

      this.creditCardService.createCreditCard(formValue).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response && typeof response === 'string' && response.toLowerCase().includes('error')) {
            this.errorMessage = response;
            this.showError = true;
          } else {
            this.router.navigate(['/cards']);
          }
        },
        error: (error: string) => {
          this.isLoading = false;
          this.errorMessage = error;
          this.showError = true;
        }
      });
    } else {
      this.markFormGroupTouched(this.cardForm);
    }
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/\D/g, '');
    if (value.length > 0) {
      value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
    }
    event.target.value = value;
    
    // Form kontrolünü güncelle
    this.cardForm.patchValue({ cardNo: value.replace(/\s/g, '') }, { emitEvent: false });
  }

  formatValidDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      const month = value.substring(0, 2);
      const year = value.substring(2);
      
      // Ay değerini kontrol et (01-12)
      if (parseInt(month) > 12) {
        value = '12' + year;
      } else if (parseInt(month) < 1) {
        value = '01' + year;
      }
      
      value = month + (value.length > 2 ? '/' + year : '');
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
        if (errors['pattern']) return 'İsim sadece harf içerebilir';
        break;
    }
    return '';
  }
} 