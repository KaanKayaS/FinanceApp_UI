import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  
  stats = [
    { number: '0', label: 'Aktif Kullanıcı', icon: 'people' },
    { number: '₺50M+', label: 'Yönetilen Birikim', icon: 'savings' },
    { number: '5+', label: 'Yıllık Deneyim', icon: 'timeline' },
    { number: '99.9%', label: 'Güvenilirlik', icon: 'security' }
  ];

  isLoadingUserCount = true;

  features = [
    {
      icon: 'account_balance_wallet',
      title: 'Akıllı Bütçe Yönetimi',
      description: 'Gelir ve giderlerinizi kategorilere ayırarak detaylı analiz yapın'
    },
    {
      icon: 'trending_up',
      title: 'Yatırım Planları',
      description: 'Hedeflerinize uygun yatırım planları oluşturun ve takip edin'
    },
    {
      icon: 'credit_card',
      title: 'Kart Yönetimi',
      description: 'Kredi kartlarınızı güvenle ekleyin ve bakiyelerinizi kontrol edin'
    },
    {
      icon: 'schedule',
      title: 'Otomatik Talimatlar',
      description: 'Ödeme talimatlarınızı otomatikleştirin ve zamanında ödeyin'
    },
    {
      icon: 'analytics',
      title: 'Detaylı Raporlar',
      description: 'Harcama analizleri ve gelir-gider raporları ile finansal durumunuzu görün'
    },
    {
      icon: 'security',
      title: 'Güvenli Altyapı',
      description: 'Verileriniz 256-bit SSL şifreleme ile korunur'
    }
  ];

  teamMembers = [
    {
      name: 'Kaan Kaya',
      role: 'Software Developer',
      image: '👨‍💻',
      description: 'Yazılım geliştirme lideri'
    }
  ];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadUserCount();
  }

  private loadUserCount() {
    this.isLoadingUserCount = true;
    
    this.http.get<number>(`${environment.apiUrl}/Users/GetUserCount`).subscribe({
      next: (userCount) => {
        // Kullanıcı sayısını formatla
        this.stats[0].number = this.formatUserCount(userCount);
        this.isLoadingUserCount = false;
      },
      error: (error) => {
        console.error('Kullanıcı sayısı yüklenirken hata:', error);
        // Hata durumunda varsayılan değeri göster
        this.stats[0].number = '10K+';
        this.isLoadingUserCount = false;
      }
    });
  }

  private formatUserCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M+`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K+`;
    } else {
      return count.toString();
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
