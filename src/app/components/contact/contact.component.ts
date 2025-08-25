import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;

  contactInfo = [
    {
      icon: 'phone',
      title: 'Telefon',
      content: '+90 534 704 59 69',
      action: 'Ara'
    },
    {
      icon: 'email',
      title: 'E-posta',
      content: 'finstatsapp@gmail.com',
      action: 'Mail Gönder'
    }
  ];

  socialLinks = [
    { icon: 'fab fa-instagram', name: 'Instagram', url: 'https://www.instagram.com/kaankya18', color: '#e4405f' },
    { icon: 'fab fa-linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/kaankaya07', color: '#0077b5' }
  ];

  faqs = [
    {
      question: 'FinStats nasıl çalışır?',
      answer: 'FinStats, kişisel finansmanınızı yönetmenizi sağlayan kapsamlı bir platformdur. Gelir-gider takibi, yatırım planları, otomatik ödemeler ve detaylı raporlar ile finansal hedeflerinize ulaşmanızda size yardımcı olur.'
    },
    {
      question: 'Verilerim güvende mi?',
      answer: 'Evet, verileriniz 256-bit SSL şifreleme ile korunur. Ayrıca bankacılık standartlarında güvenlik protokolleri kullanıyoruz ve verilerinizi hiçbir zaman üçüncü taraflarla paylaşmıyoruz.'
    },
    {
      question: 'Ücretlendirme nasıl?',
      answer: 'FinStats temel özelliklerini ücretsiz olarak sunuyoruz. Premium özellikler için uygun fiyatlı abonelik paketlerimiz bulunmaktadır. Detaylı bilgi için bizimle iletişime geçin.'
    },
    {
      question: 'Mobil uygulama var mı?',
      answer: 'Şu anda web tabanlı uygulamamız tüm cihazlarda mükemmel çalışmaktadır. iOS ve Android uygulamalarımız geliştirme aşamasında olup yakında mağazalarda yerini alacaktır.'
    },
    {
      question: 'Teknik destek nasıl alırım?',
      answer: 'Teknik destek için 7/24 chat sistemimizi kullanabilir, e-posta gönderebilir veya telefon ile iletişime geçebilirsiniz. Uzman ekibimiz size en kısa sürede yardımcı olacaktır.'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  openMap() {
    window.open('https://maps.google.com/?q=Nurol+Plaza+Maslak+İstanbul', '_blank');
  }

  callPhone() {
    window.open('tel:+905347045969');
  }

  sendEmail() {
    window.open('finstatsapp@gmail.com');
  }
}
