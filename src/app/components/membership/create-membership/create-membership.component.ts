import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MembershipService, PlanPriceResponse } from '../../../services/membership.service';
import { DigitalPlatform } from '../../../models/digital-platform';
import { CreditCard } from '../../../models/credit-card';
import { CreateMembershipRequest, SubscriptionType } from '../../../models/membership';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-membership',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './create-membership.component.html',
  styleUrls: ['./create-membership.component.scss']
})
export class CreateMembershipComponent implements OnInit {
  membershipForm: FormGroup;
  digitalPlatforms: DigitalPlatform[] = [];
  creditCards: CreditCard[] = [];
  filteredPlatforms: DigitalPlatform[] = [];
  isLoading = false;
  searchTerm = '';
  planPrice: number | null = null;
  isLoadingPrice = false;
  isPlatformDropdownOpen = false;

  subscriptionTypes = [
    { value: SubscriptionType.Monthly, label: 'Aylık', icon: 'calendar_today' },
    { value: SubscriptionType.SixMonthly, label: '6 Aylık', icon: 'date_range' },
    { value: SubscriptionType.Yearly, label: 'Yıllık', icon: 'calendar_view_year' }
  ];

  constructor(
    private fb: FormBuilder,
    private membershipService: MembershipService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.membershipForm = this.fb.group({
      digitalPlatformId: ['', Validators.required],
      subscriptionType: ['', Validators.required],
      creditCardId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupFormValueChanges();
  }

  setupFormValueChanges() {
    // Platform ID veya subscription type değiştiğinde fiyatı güncelle
    this.membershipForm.get('digitalPlatformId')?.valueChanges.subscribe(() => {
      this.updatePlanPrice();
    });

    this.membershipForm.get('subscriptionType')?.valueChanges.subscribe(() => {
      this.updatePlanPrice();
    });
  }

  updatePlanPrice() {
    const platformId = this.membershipForm.get('digitalPlatformId')?.value;
    const subscriptionType = this.membershipForm.get('subscriptionType')?.value;

    if (platformId && subscriptionType) {
      this.isLoadingPrice = true;
      this.planPrice = null;

      this.membershipService.getSubscriptionPlanPrice(Number(platformId), Number(subscriptionType))
        .subscribe({
          next: (response: PlanPriceResponse) => {
            this.planPrice = response.price;
            this.isLoadingPrice = false;
          },
          error: (error) => {
            console.error('Plan price error:', error);
            this.planPrice = null;
            this.isLoadingPrice = false;
          }
        });
    } else {
      this.planPrice = null;
      this.isLoadingPrice = false;
    }
  }

  loadData() {
    this.isLoading = true;
    
    // Digital platforms ve credit cards'ı paralel yükle
    forkJoin([
      this.membershipService.getAllDigitalPlatforms(),
      this.membershipService.getAllCreditCardsByUser()
    ]).subscribe({
      next: ([platforms, cards]) => {
        this.digitalPlatforms = platforms || [];
        console.log('Loaded digital platforms:', this.digitalPlatforms);
        this.digitalPlatforms.forEach(platform => {
          console.log(`Platform: ${platform.name}, ImagePath: ${platform.imagePath}`);
        });
        this.filteredPlatforms = [...this.digitalPlatforms];
        this.creditCards = cards || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Data loading error:', error);
        this.isLoading = false;
        Swal.fire({
          title: 'Hata!',
          text: 'Veriler yüklenirken bir hata oluştu.',
          icon: 'error',
          confirmButtonText: 'Tamam'
        });
      }
    });
  }

  filterPlatforms() {
    if (!this.searchTerm.trim()) {
      this.filteredPlatforms = [...this.digitalPlatforms];
    } else {
      this.filteredPlatforms = this.digitalPlatforms.filter(platform =>
        platform.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  getPlatformImage(platform: DigitalPlatform): string {
    if (platform.imagePath) {
      // Path'i normalize et
      let cleanPath = platform.imagePath.trim();
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }

      // Multiple URL patterns to try
      const possibleUrls = [
        `http://localhost:5055/${cleanPath}`,                    // Current
        `http://localhost:5055/api/files/${cleanPath}`,          // API endpoint
        `http://localhost:5055/api/${cleanPath}`,                // API with path
        `http://localhost:5055/wwwroot/${cleanPath}`,            // wwwroot
        `http://localhost:5055/uploads/${cleanPath}`,            // uploads folder
      ];

      console.log('Platform:', platform.name, 'Trying URLs:', possibleUrls);
      
      // For now return the first one, we'll implement fallback later
      return possibleUrls[0];
    }
    console.log('Platform:', platform.name, 'No image path, using default');
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMTYgMjJDMTkuMzEzNyAyMiAyMiAxOS4zMTM3IDIyIDE2QzIyIDEyLjY4NjMgMTkuMzEzNyAxMCAxNiAxMEMxMi42ODYzIDEwIDEwIDEyLjY4NjMgMTAgMTZDMTAgMTkuMzEzNyAxMi42ODYzIDIyIDE2IDIyWiIgZmlsbD0iIzZDNzU3RCIvPgo8L3N2Zz4K'; // SVG placeholder
  }

  maskCardNumber(cardNo: string): string {
    if (cardNo.length < 4) return cardNo;
    return '**** **** **** ' + cardNo.slice(-4);
  }

  onSubmit() {
    if (this.membershipForm.valid) {
      const formValue = this.membershipForm.value;
      console.log('=== Form Submit Debug ===');
      console.log('Form value:', formValue);
      console.log('digitalPlatformId type:', typeof formValue.digitalPlatformId);
      console.log('subscriptionType type:', typeof formValue.subscriptionType);
      console.log('creditCardId type:', typeof formValue.creditCardId);
      
      const request: CreateMembershipRequest = {
        digitalPlatformId: Number(formValue.digitalPlatformId),
        subscriptionType: Number(formValue.subscriptionType),
        creditCardId: Number(formValue.creditCardId)
      };
      
      console.log('Request object:', request);
      console.log('Request JSON:', JSON.stringify(request));
      console.log('========================');
      
      this.isLoading = true;
      this.membershipService.createMembership(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          Swal.fire({
            title: 'Başarılı!',
            text: response || 'Abonelik başarıyla oluşturuldu.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            willClose: () => {
              this.router.navigate(['/home']);
            }
          });
        },
        error: (error) => {
          console.error('Membership creation error:', error);
          console.error('Error response body:', error.error);
          this.isLoading = false;
          
          let errorMessage = 'Abonelik oluşturulurken bir hata oluştu.';
          
          // Backend hata mesajını parse et
          try {
            if (error.error && error.error.Errors && Array.isArray(error.error.Errors)) {
              // Backend'den gelen error format: {"StatusCode":500,"Errors":["Hata mesajı : ..."]}
              errorMessage = error.error.Errors.join(', ');
            } else if (error.error && typeof error.error === 'string') {
              // String formatında error
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
      console.log('Form invalid:', this.membershipForm.errors);
      console.log('Form controls status:');
      Object.keys(this.membershipForm.controls).forEach(key => {
        const control = this.membershipForm.get(key);
        console.log(`${key}:`, control?.value, control?.valid, control?.errors);
      });
      
      Swal.fire({
        title: 'Eksik Bilgi!',
        text: 'Lütfen tüm alanları doldurun.',
        icon: 'warning',
        confirmButtonText: 'Tamam'
      });
    }
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      console.log('❌ Image FAILED to load:', target.src);
      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMTYgMjJDMTkuMzEzNyAyMiAyMiAxOS4zMTM3IDIyIDE2QzIyIDEyLjY4NjMgMTkuMzEzNyAxMCAxNiAxMEMxMi42ODYzIDEwIDEwIDEyLjY4NjMgMTAgMTZDMTAgMTkuMzEzNyAxMi42ODYzIDIyIDE2IDIyWiIgZmlsbD0iIzZDNzU3RCIvPgo8L3N2Zz4K';
    }
  }

  onImageLoad(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      console.log('✅ Image SUCCESSFULLY loaded:', target.src);
    }
  }

  trackByPlatformId(index: number, platform: DigitalPlatform): number {
    return platform.id;
  }

  trackByCardId(index: number, card: CreditCard): number {
    return card.cardId;
  }

  trackByTypeValue(index: number, type: any): number {
    return type.value;
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  // Dropdown'un dışına tıklandığında kapat
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isPlatformDropdownOpen = false;
    }
  }

  // Custom dropdown metodları
  togglePlatformDropdown() {
    this.isPlatformDropdownOpen = !this.isPlatformDropdownOpen;
  }

  selectPlatform(platform: DigitalPlatform) {
    this.membershipForm.patchValue({ digitalPlatformId: platform.id });
    this.isPlatformDropdownOpen = false;
    // Form'un touched olduğunu işaretle
    this.membershipForm.get('digitalPlatformId')?.markAsTouched();
  }

  getSelectedPlatform(): DigitalPlatform | null {
    const selectedId = this.membershipForm.get('digitalPlatformId')?.value;
    if (!selectedId) return null;
    return this.digitalPlatforms.find(platform => platform.id == selectedId) || null;
  }
} 