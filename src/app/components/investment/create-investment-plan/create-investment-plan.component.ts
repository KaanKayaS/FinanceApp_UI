import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InvestmentPlanService } from '../../../services/investment-plan.service';
import { CreateInvestmentPlanRequest, InvestmentCategory, InvestmentFrequency } from '../../../models/investment-plan';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-investment-plan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './create-investment-plan.component.html',
  styleUrls: ['./create-investment-plan.component.scss']
})
export class CreateInvestmentPlanComponent implements OnInit {
  investmentForm: FormGroup;
  isLoading = false;

  investmentCategories = [
    { value: InvestmentCategory.Vehicle, label: 'Araç', icon: 'directions_car' },
    { value: InvestmentCategory.Education, label: 'Eğitim', icon: 'school' },
    { value: InvestmentCategory.House, label: 'Ev', icon: 'home' },
    { value: InvestmentCategory.Trip, label: 'Seyahat', icon: 'flight' },
    { value: InvestmentCategory.Family, label: 'Aile', icon: 'family_restroom' },
    { value: InvestmentCategory.Investment, label: 'Yatırım', icon: 'trending_up' },
    { value: InvestmentCategory.Technology, label: 'Teknoloji', icon: 'computer' },
    { value: InvestmentCategory.Health, label: 'Sağlık', icon: 'health_and_safety' },
    { value: InvestmentCategory.SpecialDayAccumulation, label: 'Özel Gün Birikimi', icon: 'cake' },
    { value: InvestmentCategory.Other, label: 'Diğer', icon: 'more_horiz' }
  ];

  investmentFrequencies = [
    { value: InvestmentFrequency.Daily, label: 'Günlük', icon: 'today' },
    { value: InvestmentFrequency.Weekly, label: 'Haftalık', icon: 'date_range' },
    { value: InvestmentFrequency.Monthly, label: 'Aylık', icon: 'calendar_view_month' }
  ];

  constructor(
    private fb: FormBuilder,
    private investmentPlanService: InvestmentPlanService,
    private router: Router
  ) {
    this.investmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(25)]],
      description: ['', [Validators.maxLength(60)]],
      targetPrice: ['', [Validators.required, Validators.min(2000), Validators.max(100000000)]],
      targetDate: ['', [Validators.required, this.atLeastOneWeekFromNowValidator]],
      investmentCategory: ['', Validators.required],
      investmentFrequency: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Minimum tarihi 7 gün sonrasına ayarla (backend kuralına uygun)
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    
    const minDate = oneWeekLater.toISOString().split('T')[0];
    const targetDateControl = this.investmentForm.get('targetDate');
    if (targetDateControl) {
      targetDateControl.setValue(minDate);
    }
  }

  // Backend kurallarına uygun custom validator
  atLeastOneWeekFromNowValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    
    // Sadece tarihi karşılaştır (saat bilgisini yok say)
    selectedDate.setHours(0, 0, 0, 0);
    oneWeekFromNow.setHours(0, 0, 0, 0);
    
    return selectedDate >= oneWeekFromNow ? null : { atLeastOneWeek: true };
  }

  onSubmit() {
    if (this.investmentForm.valid) {
      const formValue = this.investmentForm.value;
      console.log('=== Investment Plan Form Submit Debug ===');
      console.log('Form value:', formValue);
      
      // Tarihi ISO format'a çevir
      const targetDate = new Date(formValue.targetDate);
      const isoDate = targetDate.toISOString();
      
      const request: CreateInvestmentPlanRequest = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        targetPrice: Number(formValue.targetPrice),
        targetDate: isoDate,
        investmentCategory: Number(formValue.investmentCategory),
        investmentFrequency: Number(formValue.investmentFrequency)
      };
      
      console.log('Request object:', request);
      console.log('Request JSON:', JSON.stringify(request));
      console.log('========================================');
      
      this.isLoading = true;
      this.investmentPlanService.createInvestmentPlan(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          Swal.fire({
            title: 'Başarılı!',
            text: response || 'Yatırım planı başarıyla oluşturuldu.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            willClose: () => {
              this.router.navigate(['/investment/list']);
            }
          });
        },
        error: (error) => {
          console.error('Investment plan creation error:', error);
          console.error('Error response body:', error.error);
          this.isLoading = false;
          
          let errorMessage = 'Yatırım planı oluşturulurken bir hata oluştu.';
          
          // Backend hata mesajını parse et
          try {
            if (error.error && error.error.Errors && Array.isArray(error.error.Errors)) {
              errorMessage = error.error.Errors.join(', ');
            } else if (error.error && typeof error.error === 'string') {
              const errorObj = JSON.parse(error.error);
              if (errorObj.Errors && Array.isArray(errorObj.Errors)) {
                errorMessage = errorObj.Errors.join(', ');
              } else if (errorObj.errors) {
                const errorMessages = Object.values(errorObj.errors).flat();
                errorMessage = errorMessages.join(', ');
              }
            } else if (error.message) {
              errorMessage = error.message;
            }
          } catch (e) {
            console.log('Error parsing backend response, using default message');
          }
          
          Swal.fire({
            title: 'Hata!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Tamam'
          });
        }
      });
    } else {
      // Form validation errors
      console.log('Form invalid:', this.investmentForm.errors);
      console.log('Form controls status:');
      Object.keys(this.investmentForm.controls).forEach(key => {
        const control = this.investmentForm.get(key);
        console.log(`${key}:`, control?.value, control?.valid, control?.errors);
      });
      
      // Hangi alanların eksik olduğunu ve hangi validation hatalarının olduğunu kontrol et
      const errorMessages = [];
      
      const nameControl = this.investmentForm.get('name');
      if (nameControl?.invalid) {
        if (nameControl.errors?.['required']) {
          errorMessages.push('Plan adı boş olamaz.');
        } else if (nameControl.errors?.['maxlength']) {
          errorMessages.push('Plan adı en fazla 25 karakter olabilir.');
        }
      }
      
      const targetPriceControl = this.investmentForm.get('targetPrice');
      if (targetPriceControl?.invalid) {
        if (targetPriceControl.errors?.['required']) {
          errorMessages.push('Hedef tutar zorunludur.');
        } else if (targetPriceControl.errors?.['min']) {
          errorMessages.push('Hedef tutar 2000\'den büyük olmalıdır.');
        } else if (targetPriceControl.errors?.['max']) {
          errorMessages.push('Hedef tutar 100.000.000\'dan büyük olmamalıdır.');
        }
      }
      
      const targetDateControl = this.investmentForm.get('targetDate');
      if (targetDateControl?.invalid) {
        if (targetDateControl.errors?.['required']) {
          errorMessages.push('Hedef tarih seçiniz.');
        } else if (targetDateControl.errors?.['atLeastOneWeek']) {
          errorMessages.push('Hedef tarih bugünden en az 7 gün sonrası olmalıdır.');
        }
      }
      
      const descriptionControl = this.investmentForm.get('description');
      if (descriptionControl?.invalid) {
        if (descriptionControl.errors?.['maxlength']) {
          errorMessages.push('Açıklama en fazla 60 karakter olabilir.');
        }
      }
      
      if (this.investmentForm.get('investmentCategory')?.invalid) {
        errorMessages.push('Kategori seçiniz.');
      }
      
      if (this.investmentForm.get('investmentFrequency')?.invalid) {
        errorMessages.push('Frekans seçiniz.');
      }
      
      const errorText = errorMessages.length > 0 
        ? errorMessages.join('\n')
        : 'Lütfen tüm zorunlu alanları doldurun.';
      
      Swal.fire({
        title: 'Eksik Bilgi!',
        text: errorText,
        icon: 'warning',
        confirmButtonText: 'Tamam'
      });
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  // Helper metodlar
  getCategoryIcon(category: InvestmentCategory): string {
    const categoryItem = this.investmentCategories.find(c => c.value === category);
    return categoryItem?.icon || 'more_horiz';
  }

  getFrequencyIcon(frequency: InvestmentFrequency): string {
    const frequencyItem = this.investmentFrequencies.find(f => f.value === frequency);
    return frequencyItem?.icon || 'schedule';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  }

  trackByCategoryValue(index: number, category: any): number {
    return category.value;
  }

  trackByFrequencyValue(index: number, frequency: any): number {
    return frequency.value;
  }

  // Tutar maskeleme fonksiyonları
  onTargetPriceInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/[^\d]/g, ''); // Sadece rakamları al
    
    if (value === '') {
      this.investmentForm.patchValue({ targetPrice: '' });
      return;
    }
    
    // Sayısal değeri form'a kaydet
    const numericValue = parseInt(value);
    this.investmentForm.patchValue({ targetPrice: numericValue });
    
    // Binlik ayırıcı ile formatla ve input'a yaz
    input.value = this.formatCurrencyForInput(numericValue);
  }

  formatCurrencyForInput(value: number): string {
    // Türkiye formatında binlik ayırıcı (nokta) kullan
    return value.toLocaleString('tr-TR');
  }

  onTargetPriceFocus(event: any): void {
    const input = event.target;
    // Focus edildiğinde sadece rakamları göster
    if (this.investmentForm.get('targetPrice')?.value) {
      input.value = this.investmentForm.get('targetPrice')?.value.toString();
    }
  }

  onTargetPriceBlur(event: any): void {
    const input = event.target;
    // Blur olduğunda formatlanmış halini göster
    if (this.investmentForm.get('targetPrice')?.value) {
      input.value = this.formatCurrencyForInput(this.investmentForm.get('targetPrice')?.value);
    }
  }
} 