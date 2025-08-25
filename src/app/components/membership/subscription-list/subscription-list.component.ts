import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MembershipService } from '../../../services/membership.service';
import { UserMembership } from '../../../models/membership';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './subscription-list.component.html',
  styleUrls: ['./subscription-list.component.scss']
})
export class SubscriptionListComponent implements OnInit {
  memberships: UserMembership[] = [];
  isLoading = false;

  constructor(
    private membershipService: MembershipService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMemberships();
  }

  loadMemberships() {
    this.isLoading = true;
    
    this.membershipService.getAllMembershipsByUser().subscribe({
      next: (memberships) => {
        this.memberships = memberships || [];
        this.isLoading = false;
        console.log('Loaded memberships:', this.memberships);
      },
      error: (error) => {
        console.error('Memberships loading error:', error);
        this.isLoading = false;
        Swal.fire({
          title: 'Hata!',
          text: 'Abonelikler yüklenirken bir hata oluştu.',
          icon: 'error',
          confirmButtonText: 'Tamam'
        });
      }
    });
  }

  getPlatformImage(membership: UserMembership): string {
    if (membership.imagePath) {
      let cleanPath = membership.imagePath.trim();
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }
      
      // Canlı ortam için direkt URL
      return `https://api.finstats.net/${cleanPath}`;
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMzIgNDJDMzYuNDE4MyA0MiA0MCAzOC40MTgzIDQwIDM0QzQwIDI5LjU4MTcgMzYuNDE4MyAyNiAzMiAyNkMyNy41ODE3IDI2IDI0IDI5LjU4MTcgMjQgMzRDMjQgMzguNDE4MyAyNy41ODE3IDQyIDMyIDQyWiIgZmlsbD0iIzZDNzU3RCIvPgo8L3N2Zz4K';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRemainingDays(endDate: string): number {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getStatusColor(membership: UserMembership): string {
    if (membership.isDeleted) {
      return 'deleted';
    }
    
    const remainingDays = this.getRemainingDays(membership.endDate);
    if (remainingDays <= 0) {
      return 'expired';
    } else if (remainingDays <= 7) {
      return 'warning';
    }
    return 'active';
  }

  getStatusText(membership: UserMembership): string {
    if (membership.isDeleted) {
      return `Aboneliğiniz ${this.formatDate(membership.endDate)} tarihine kadar devam ediyor`;
    }
    
    const remainingDays = this.getRemainingDays(membership.endDate);
    if (remainingDays <= 0) {
      return 'Aboneliğiniz sona ermiş';
    } else if (remainingDays <= 7) {
      return `${remainingDays} gün kaldı`;
    }
    return `${remainingDays} gün kaldı`;
  }

  cancelSubscription(membership: UserMembership) {
    Swal.fire({
      title: 'Aboneliği İptal Et',
      text: `${membership.digitalPlatformName} aboneliğinizi iptal etmek istediğinizden emin misiniz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Evet, İptal Et',
      cancelButtonText: 'Vazgeç'
    }).then((result) => {
      if (result.isConfirmed) {
        // Loading dialog göster
        Swal.fire({
          title: 'İptal ediliyor...',
          text: 'Abonelik iptal işlemi gerçekleştiriliyor, lütfen bekleyin.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // API çağrısı yap
        this.membershipService.removeMembership(membership.digitalPlatformId).subscribe({
          next: (response) => {
            console.log('Abonelik iptal edildi:', response);
            
            Swal.fire({
              title: 'Başarılı!',
              text: `${membership.digitalPlatformName} aboneliğiniz başarıyla iptal edildi.`,
              icon: 'success',
              confirmButtonText: 'Tamam'
            }).then(() => {
              // Abonelikleri yeniden yükle
              this.loadMemberships();
            });
          },
          error: (error) => {
            console.error('Abonelik iptal hatası:', error);
            
            Swal.fire({
              title: 'Hata!',
              text: 'Abonelik iptal edilirken bir hata oluştu. Lütfen tekrar deneyin.',
              icon: 'error',
              confirmButtonText: 'Tamam'
            });
          }
        });
      }
    });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMzIgNDJDMzYuNDE4MyA0MiA0MCAzOC40MTgzIDQwIDM0QzQwIDI5LjU4MTcgMzYuNDE4MyAyNiAzMiAyNkMyNy41ODE3IDI2IDI0IDI5LjU4MTcgMjQgMzRDMjQgMzguNDE4MyAyNy41ODE3IDQyIDMyIDQyWiIgZmlsbD0iIzZDNzU3RCIvPgo8L3N2Zz4K';
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goToCreateMembership() {
    this.router.navigate(['/membership/create']);
  }

  trackByPlatform(index: number, membership: UserMembership): number {
    return membership.digitalPlatformId;
  }
} 