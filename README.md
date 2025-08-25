# 💰 FinStats - Kişisel Finans Yönetim Sistemi

FinStats, modern teknoloji ile güvenli ve kolay finans yönetimi sunan kapsamlı bir kişisel finansal yönetim uygulamasıdır. Angular 17 ile geliştirilmiş bu uygulama, kullanıcıların finansal hedeflerine ulaşmalarına yardımcı olmak için tasarlanmıştır.

## 🌟 Özellikler

### 💳 Kart Yönetimi
- Kredi kartlarını güvenle ekleme ve yönetme
- Kart bakiyelerini gerçek zamanlı takip
- Bakiye yükleme işlemleri
- Kart bilgilerini güvenli saklama

### 💸 Gider Takibi
- Manuel gider ekleme ve düzenleme
- Gider kategorileri ile detaylı analiz
- Ödeme geçmişi görüntüleme
- Gider ajandası ile gelecek ödemeler

### 📊 Yatırım Planları
- Kişiselleştirilmiş yatırım planları oluşturma
- Hedef odaklı birikim stratejileri
- Yatırım kategorileri (Araç, Eğitim, Ev, Seyahat, vb.)
- Günlük, haftalık, aylık yatırım frekansları

### 🔄 Otomatik Talimatlar
- Düzenli ödeme talimatları oluşturma
- Otomatik ödeme hatırlatmaları
- Talimat listesi ve yönetimi

### 📱 Dijital Platform Abonelikleri
- Dijital platform aboneliklerini takip
- Abonelik ödemeleri yönetimi
- Abonelik listesi görüntüleme

### 🤖 AI Chatbot
- Finansal konularda AI destekli yardım
- Akıllı sohbet sistemi
- Kişiselleştirilmiş finansal öneriler

### 📈 Dashboard & Raporlama
- Kapsamlı finansal dashboard
- Gelir-gider analizleri
- Günlük kar-zarar grafikleri
- Son giderler özeti
- Abonelik sayısı takibi

## 🛠️ Teknoloji Stack

### Frontend Framework
- **Angular 17** - Modern JavaScript framework
- **TypeScript** - Type-safe development
- **SCSS** - Advanced styling

### UI/UX Kütüphaneleri
- **Angular Material** - Material Design components
- **FontAwesome** - Icon library
- **SweetAlert2** - Beautiful alert dialogs

### Veri Görselleştirme
- **Chart.js** - Grafikler ve veri görselleştirme
- **FullCalendar** - Takvim entegrasyonu

### Real-time İletişim
- **SignalR** - Real-time web functionality

### HTTP & Routing
- **Angular Router** - Single page application routing
- **Angular HTTP Client** - API communication

## 🚀 Kurulum

### Ön Gereksinimler
- **Node.js** (v18 veya üzeri)
- **npm** veya **yarn**
- **Angular CLI** (v17)

### Kurulum Adımları

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/yourusername/financeapp-frontend.git
cd financeapp-frontend
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment ayarlarını yapılandırın:**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://your-api-url.com/api'
};
```

4. **Geliştirme sunucusunu başlatın:**
```bash
ng serve
```

5. **Uygulamayı açın:**
Tarayıcınızda `http://localhost:4200` adresine gidin.

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── components/           # UI Components
│   │   ├── about/           # Hakkımızda sayfası
│   │   ├── ai-chat/         # AI Chatbot
│   │   ├── cards/           # Kart yönetimi
│   │   ├── contact/         # İletişim sayfası
│   │   ├── home/            # Ana dashboard
│   │   ├── instructions/    # Ödeme talimatları
│   │   ├── investment/      # Yatırım planları
│   │   ├── login/           # Giriş sayfası
│   │   ├── membership/      # Abonelik yönetimi
│   │   ├── profile/         # Kullanıcı profili
│   │   ├── register/        # Kayıt sayfası
│   │   └── transactions/    # İşlem geçmişi
│   ├── models/              # TypeScript interface'ler
│   ├── services/            # API servisleri
│   ├── guards/              # Route guards
│   └── interceptors/        # HTTP interceptors
├── assets/                  # Statik dosyalar
├── environments/            # Environment configurations
└── styles.scss             # Global styles
```

## 🔧 Komutlar

### Geliştirme
```bash
# Geliştirme sunucusunu başlat
ng serve

# Watch mode ile build
ng build --watch --configuration development
```

### Build
```bash
# Production build
ng build --configuration production

# Development build
ng build
```

### Test
```bash
# Unit testleri çalıştır
ng test

# E2E testleri çalıştır
ng e2e
```

### Code Generation
```bash
# Yeni component oluştur
ng generate component component-name

# Yeni service oluştur
ng generate service service-name

# Yeni module oluştur
ng generate module module-name
```

## 🌐 API Entegrasyonu

Uygulama, RESTful API ile iletişim kurar:

```typescript
// API Base URL
const API_URL = 'https://api.finstats.net/api'

// Temel endpoints
/auth              # Kimlik doğrulama
/expense           # Gider yönetimi
/creditcard        # Kart işlemleri
/investment        # Yatırım planları
/instruction       # Ödeme talimatları
/membership        # Abonelik yönetimi
/menu              # Menü yapısı
```

## 🔐 Güvenlik

- **JWT Token** tabanlı kimlik doğrulama
- **Route Guards** ile sayfa koruma
- **HTTP Interceptors** ile token yönetimi
- **256-bit SSL** şifreleme
- **CORS** politikaları

## 📱 Responsive Tasarım

- **Mobile-first** yaklaşım
- **iPhone, Android** uyumlu
- **Tablet** optimizasyonu
- **Desktop** tam özellik desteği

## 🎨 UI/UX Özellikleri

- **Material Design** prensipler
- **Dark/Light** tema desteği
- **Smooth animations** ve transitions
- **Intuitive navigation** yapısı
- **Accessibility** standartları

## 🔄 Real-time Özellikler

- **SignalR** ile canlı bildirimler
- **Real-time** balance updates
- **Live** transaction notifications
- **Instant** chat responses

## 📊 Analitik & Raporlama

- **Interactive charts** (Chart.js)
- **Financial dashboards**
- **Expense categorization**
- **Investment tracking**
- **Profit/Loss analysis**

## 🚀 Deployment

### Production Build
```bash
ng build --configuration production
```

### Environment Yapılandırması
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.finstats.net/api'
};
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim & Destek

- **Email:** support@finstats.net
- **Website:** https://finstats.net
- **Documentation:** [Dokümantasyon](docs/)

## 🏆 Özellikler Roadmap

- [ ] **Mobil uygulama** (React Native/Flutter)
- [ ] **Çoklu dil** desteği
- [ ] **Advanced AI** finansal danışman
- [ ] **Cryptocurrency** entegrasyonu
- [ ] **Social trading** özellikleri
- [ ] **Banka API** entegrasyonları

---

**FinStats ile finansal geleceğinizi şekillendirin! 💪**

> *"Finansal özgürlüğe giden yolda size rehberlik etmek"*
