import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InvestmentPlanService } from '../../../services/investment-plan.service';
import { CreditCardService } from '../../../services/credit-card.service';
import { InvestmentPlan, InvestmentCategory, InvestmentFrequency } from '../../../models/investment-plan';
import { CreditCard } from '../../../models/credit-card';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-investment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './investment-list.component.html',
  styleUrls: ['./investment-list.component.scss']
})
export class InvestmentListComponent implements OnInit {
  investmentPlans: InvestmentPlan[] = [];
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
    private investmentPlanService: InvestmentPlanService,
    private creditCardService: CreditCardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInvestmentPlans();
  }

  loadInvestmentPlans() {
    this.isLoading = true;
    this.investmentPlanService.getAllInvestmentPlanByUser().subscribe({
      next: (plans) => {
        this.investmentPlans = plans || [];
        this.isLoading = false;
        console.log('Investment plans loaded:', this.investmentPlans);
      },
      error: (error) => {
        console.error('Investment plans loading error:', error);
        this.isLoading = false;
        Swal.fire({
          title: 'Hata!',
          text: 'Yatırım planları yüklenirken bir hata oluştu.',
          icon: 'error',
          confirmButtonText: 'Tamam'
        });
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  createNewPlan() {
    this.router.navigate(['/investment/create']);
  }

  // Helper metodlar
  getCategoryIcon(category: InvestmentCategory): string {
    const categoryItem = this.investmentCategories.find(c => c.value === category);
    return categoryItem?.icon || 'more_horiz';
  }

  getCategoryLabel(category: InvestmentCategory): string {
    const categoryItem = this.investmentCategories.find(c => c.value === category);
    return categoryItem?.label || 'Diğer';
  }

  getFrequencyLabel(frequency: InvestmentFrequency): string {
    const frequencyItem = this.investmentFrequencies.find(f => f.value === frequency);
    return frequencyItem?.label || 'Bilinmiyor';
  }

  calculateProgress(plan: InvestmentPlan): number {
    if (plan.targetPrice <= 0) return 0;
    const progress = (plan.currentAmount / plan.targetPrice) * 100;
    return Math.min(progress, 100); // Maximum %100
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  addMoney(plan: InvestmentPlan) {
    // Önce kullanıcının kartlarını getir
    this.creditCardService.getAllCreditCards().subscribe({
      next: (cards: CreditCard[]) => {
        if (cards.length === 0) {
          Swal.fire({
            title: 'Kart Bulunamadı',
            text: 'Para eklemek için önce bir kredi kartı eklemeniz gerekiyor.',
            icon: 'warning',
            confirmButtonText: 'Tamam'
          });
          return;
        }

        // Kart seçimi için HTML oluştur (bakiye bilgisi ile)
        const cardOptions = cards.map(card => 
          `<option value="${card.cardId}" data-balance="${card.balance}">${card.nameOnCard} - ${card.cardNo.substring(card.cardNo.length - 4)} (Bakiye: ₺${card.balance.toLocaleString('tr-TR', {minimumFractionDigits: 2})})</option>`
        ).join('');

        Swal.fire({
          title: `${plan.name} Planına Para Ekle`,
          html: `
            <div style="margin-bottom: 20px;">
              <label for="cardSelect" style="display: block; margin-bottom: 5px; font-weight: bold;">Kart Seçin:</label>
              <select id="cardSelect" class="swal2-select" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                ${cardOptions}
              </select>
            </div>
            <div>
              <label for="amountInput" style="display: block; margin-bottom: 5px; font-weight: bold;">Miktar (₺):</label>
              <input id="amountInput" type="text" class="swal2-input" placeholder="Miktar girin">
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Para Ekle',
          cancelButtonText: 'İptal',
          didOpen: () => {
            // Tutar input'una maskeleme özelliği ekle
            const amountInput = document.getElementById('amountInput') as HTMLInputElement;
            
            // Global değeri başlat
            (window as any).addMoneyRawAmount = 0;
            
            amountInput.addEventListener('input', (event: any) => {
              const input = event.target;
              let value = input.value.replace(/[^\d]/g, ''); // Sadece rakamları al
              
              if (value === '') {
                (window as any).addMoneyRawAmount = 0;
                input.value = '';
                return;
              }
              
              const rawAmount = parseInt(value);
              (window as any).addMoneyRawAmount = rawAmount; // Global değeri güncelle
              input.value = rawAmount.toLocaleString('tr-TR');
            });
            
            amountInput.addEventListener('focus', () => {
              // Focus edildiğinde sadece rakamları göster
              const currentRawAmount = (window as any).addMoneyRawAmount || 0;
              if (currentRawAmount > 0) {
                amountInput.value = currentRawAmount.toString();
              }
            });
            
            amountInput.addEventListener('blur', () => {
              // Blur olduğunda formatlanmış halini göster
              const currentRawAmount = (window as any).addMoneyRawAmount || 0;
              if (currentRawAmount > 0) {
                amountInput.value = currentRawAmount.toLocaleString('tr-TR');
              }
            });
          },
          preConfirm: () => {
            const cardSelect = document.getElementById('cardSelect') as HTMLSelectElement;
            const amountInput = document.getElementById('amountInput') as HTMLInputElement;
            
            const selectedCardId = parseInt(cardSelect.value);
            // Global değeri kullan
            const amount = (window as any).addMoneyRawAmount || 0;

            if (!selectedCardId) {
              Swal.showValidationMessage('Lütfen bir kart seçin');
              return false;
            }

            if (!amount || amount <= 0) {
              Swal.showValidationMessage('Lütfen geçerli bir miktar girin');
              return false;
            }

            // 100.000.000 TL limit kontrolü
            if (amount > 100000000) {
              Swal.showValidationMessage('Maksimum 100.000.000 ₺ ekleyebilirsiniz');
              return false;
            }

            // Seçilen kartın bakiyesini kontrol et
            const selectedCard = cards.find(c => c.cardId === selectedCardId);
            if (selectedCard && selectedCard.balance < amount) {
              Swal.showValidationMessage(`Yetersiz bakiye! Mevcut bakiye: ₺${selectedCard.balance.toLocaleString('tr-TR', {minimumFractionDigits: 2})}`);
              return false;
            }

            return { cardId: selectedCardId, amount: amount };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            const { cardId, amount } = result.value;
            
            // Loading göster
            Swal.fire({
              title: 'Para Ekleniyor...',
              text: 'Lütfen bekleyin',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });

            // API çağrısı yap
            this.investmentPlanService.addBalanceToPlan(amount, cardId, plan.id).subscribe({
              next: (response) => {
                console.log('Add balance response:', response);
                this.showSuccessAndRefresh(amount);
              },
              error: (error) => {
                console.error('Add balance error:', error);
                
                // Error mesajını parse et
                let errorMessage = 'Para eklenirken bir hata oluştu.';
                
                if (error.status === 500) {
                  // Backend'ten gelen exception mesajını bul
                  if (error.error && typeof error.error === 'string') {
                    // "Kart bakiyeniz yetersiz" backend'ten geliyor
                    if (error.error.includes('Kart bakiyeniz yetersiz') || error.error.includes('yetersiz')) {
                      errorMessage = 'Kart bakiyeniz yetersiz. Lütfen farklı bir kart seçin veya kartınıza bakiye ekleyin.';
                    } else {
                      errorMessage = error.error;
                    }
                  } else if (error.message) {
                    errorMessage = error.message;
                  }
                } else if (error.status === 400) {
                  errorMessage = 'Geçersiz işlem. Lütfen bilgilerinizi kontrol edin.';
                } else if (error.status === 401) {
                  errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
                } else if (error.status === 0) {
                  errorMessage = 'Sunucuya bağlanamıyor. İnternet bağlantınızı kontrol edin.';
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
      },
      error: (error) => {
        console.error('Credit cards loading error:', error);
        Swal.fire({
          title: 'Hata!',
          text: 'Kartlarınız yüklenirken bir hata oluştu.',
          icon: 'error',
          confirmButtonText: 'Tamam'
        });
      }
    });
  }

  cancelPlan(plan: InvestmentPlan) {
    Swal.fire({
      title: 'Planı İptal Et',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <p style="margin-bottom: 12px; font-weight: 600; color: #374151;">${plan.name} planını iptal etmek istediğinizden emin misiniz?</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-top: 12px;">
            <p style="margin: 0; font-size: 14px; color: #dc2626;">
              <strong>⚠️ Dikkat:</strong> Bu işlem geri alınamaz. Plan iptal edildiğinde:
            </p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #dc2626;">
              <li>Plan tamamen silinecek</li>
              <li>İçindeki para (${this.formatPrice(plan.currentAmount)}) kartlarınıza iade edilecek</li>
              <li>Tüm ilerleme kaybolacak</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Planı İptal Et',
      cancelButtonText: 'Hayır, Vazgeç',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Loading göster
        Swal.fire({
          title: 'Plan İptal Ediliyor...',
          text: 'Para kartlarınıza iade ediliyor, lütfen bekleyin',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // API çağrısı yap
        this.investmentPlanService.removeInvestmentPlan(plan.id).subscribe({
          next: (response) => {
            console.log('Plan removed response:', response);
            this.showRemoveSuccessAndRefresh(plan);
          },
          error: (error) => {
            console.error('Remove plan error:', error);
            
            // Error mesajını parse et
            let errorMessage = 'Plan iptal edilirken bir hata oluştu.';
            
            if (error.status === 500) {
              if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.message) {
                errorMessage = error.message;
              }
            } else if (error.status === 400) {
              errorMessage = 'Geçersiz işlem. Bu plan zaten iptal edilmiş olabilir.';
            } else if (error.status === 401) {
              errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
            } else if (error.status === 404) {
              errorMessage = 'Plan bulunamadı. Zaten silinmiş olabilir.';
            } else if (error.status === 0) {
              errorMessage = 'Sunucuya bağlanamıyor. İnternet bağlantınızı kontrol edin.';
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

  getDaysLeftColor(daysLeft: number): string {
    if (daysLeft <= 7) return 'danger';
    if (daysLeft <= 30) return 'warning';
    return 'success';
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'danger';
  }

  trackByPlanName(index: number, plan: InvestmentPlan): string {
    return plan.name;
  }

  private showSuccessAndRefresh(amount: number) {
    Swal.fire({
      title: 'Başarılı!',
      text: `${amount.toLocaleString('tr-TR')} ₺ başarıyla plana eklendi.`,
      icon: 'success',
      confirmButtonText: 'Tamam'
    }).then(() => {
      // Planları yeniden yükle
      this.loadInvestmentPlans();
    });
  }

  refundPlan(plan: InvestmentPlan) {
    Swal.fire({
      title: 'Para İade Al',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <p style="margin-bottom: 12px; font-weight: 600; color: #374151;">${plan.name} planından paranızı iade almak istediğinizden emin misiniz?</p>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-top: 12px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>💰 İade Edilecek Tutar:</strong> ${this.formatPrice(plan.currentAmount)}
            </p>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-top: 12px;">
            <p style="margin: 0; font-size: 14px; color: #dc2626;">
              <strong>⚠️ Dikkat:</strong> Bu işlem geri alınamaz. Para iade alındığında:
            </p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #dc2626;">
              <li>Plan tamamen silinecek</li>
              <li>Tüm para kartlarınıza iade edilecek</li>
              <li>Plan geçmişi kaybolacak</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Evet, Para İade Al',
      cancelButtonText: 'Hayır, Vazgeç',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Loading göster
        Swal.fire({
          title: 'Para İade Ediliyor...',
          text: 'Paranız kartlarınıza iade ediliyor, lütfen bekleyin',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Aynı endpoint'i kullan (cancelPlan ile aynı)
        this.investmentPlanService.removeInvestmentPlan(plan.id).subscribe({
          next: (response) => {
            console.log('Plan refunded response:', response);
            this.showRefundSuccessAndRefresh(plan);
          },
          error: (error) => {
            console.error('Refund plan error:', error);
            
            // Error mesajını parse et
            let errorMessage = 'Para iade edilirken bir hata oluştu.';
            
            if (error.status === 500) {
              if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.message) {
                errorMessage = error.message;
              }
            } else if (error.status === 400) {
              errorMessage = 'Geçersiz işlem. Bu plan zaten silinmiş olabilir.';
            } else if (error.status === 401) {
              errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
            } else if (error.status === 404) {
              errorMessage = 'Plan bulunamadı. Zaten silinmiş olabilir.';
            } else if (error.status === 0) {
              errorMessage = 'Sunucuya bağlanamıyor. İnternet bağlantınızı kontrol edin.';
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

  private showRemoveSuccessAndRefresh(plan: InvestmentPlan) {
    Swal.fire({
      title: 'Başarılı!',
      text: `${this.formatPrice(plan.currentAmount)} ₺ başarıyla kartlarınıza iade edildi. Plan başarıyla iptal edildi.`,
      icon: 'success',
      confirmButtonText: 'Tamam'
    }).then(() => {
      // Planları yeniden yükle
      this.loadInvestmentPlans();
    });
  }

  private showRefundSuccessAndRefresh(plan: InvestmentPlan) {
    Swal.fire({
      title: 'Para İade Alındı!',
      text: `${this.formatPrice(plan.currentAmount)} ₺ başarıyla kartlarınıza iade edildi. Plan başarıyla silindi.`,
      icon: 'success',
      confirmButtonText: 'Tamam'
    }).then(() => {
      // Planları yeniden yükle
      this.loadInvestmentPlans();
    });
  }
} 