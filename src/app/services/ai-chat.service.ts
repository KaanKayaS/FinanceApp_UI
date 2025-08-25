import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  connectionId?: string;
  userId?: string; // Kullanıcı ID'si ekle
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private hubConnection: HubConnection | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private connectionIdSubject = new BehaviorSubject<string>('');
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private currentStreamingMessage: ChatMessage | null = null;
  private messageTimeout: any = null;

  public messages$ = this.messagesSubject.asObservable();
  public connectionId$ = this.connectionIdSubject.asObservable();
  public isConnected$ = this.isConnectedSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor() {
    // Kullanıcı değişikliklerini dinle
    this.watchUserChanges();
  }

   private initializeConnection() {
    // AuthService'den token'ı al
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const token = currentUser.token || '';

    console.log('🔑 Token alınıyor:', token ? 'Token var' : 'Token yok');
    console.log('🔑 Kullanıcı bilgileri:', {
      id: currentUser.id,
      email: currentUser.email,
      username: currentUser.username
    });
    if (token) {
      console.log('🔑 Token başlangıcı:', token.substring(0, 20) + '...');
    }

    if (!token) {
      console.error('❌ Token bulunamadı, bağlantı kurulamıyor');
      this.isConnectedSubject.next(false);
      // 5 saniye sonra tekrar dene
      setTimeout(() => {
        this.initializeConnection();
      }, 5000);
      return;
    }

    // SignalR hub URL'ini oluştur - environment.apiUrl'den /api kısmını çıkar
    console.log('🔧 Debug - environment.apiUrl:', environment.apiUrl);
    // Daha güvenli URL oluşturma
    const apiUrl = new URL(environment.apiUrl);
    const hubBaseUrl = `${apiUrl.protocol}//${apiUrl.host}`;
    console.log('🔧 Debug - hubBaseUrl:', hubBaseUrl);
    const hubUrl = `${hubBaseUrl}/ai-hub`;
    console.log('🔗 Hub URL:', hubUrl);

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

  this.hubConnection.on('ReceiveMessage', (message: string) => {
    if (!this.currentStreamingMessage) {
      this.currentStreamingMessage = {
        id: this.generateId(),
        content: message,
        isUser: false,
        timestamp: new Date(),
        connectionId: this.connectionIdSubject.value
      };
      this.addMessage(this.currentStreamingMessage);
    } else {
      this.currentStreamingMessage.content += message;
      this.updateMessage(this.currentStreamingMessage);
    }

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    
    this.messageTimeout = setTimeout(() => {
      this.currentStreamingMessage = null;
      this.isLoadingSubject.next(false);
      this.messageTimeout = null;
    }, 2000);
  });

  this.hubConnection.on('MessageComplete', () => {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    this.currentStreamingMessage = null;
    this.isLoadingSubject.next(false);
  });

  this.hubConnection.start()
    .then(() => {
      console.log('AI Hub bağlantısı başarılı');
      this.isConnectedSubject.next(true);
      if (this.hubConnection?.connectionId) {
        this.connectionIdSubject.next(this.hubConnection.connectionId);
      }
    })
    .catch(err => {
      console.error('AI Hub bağlantı hatası:', err);
      this.isConnectedSubject.next(false);
    });

  this.hubConnection.onclose(() => {
    console.log('AI Hub bağlantısı kapandı');
    this.isConnectedSubject.next(false);
  });
}

  public sendMessage(message: string): void {
    if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
      console.error('Hub bağlantısı yok');
      return;
    }

    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: message,
      isUser: true,
      timestamp: new Date(),
      connectionId: this.connectionIdSubject.value
    };

    this.addMessage(userMessage);
    this.isLoadingSubject.next(true);

    // Token'ı al
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const token = currentUser.token || '';

    console.log('📤 Mesaj gönderiliyor...');
    console.log('📤 Connection ID:', this.connectionIdSubject.value);
    console.log('📤 Token var mı:', !!token);

    // Backend'e mesaj gönder
    const apiUrl = new URL(environment.apiUrl);
    const chatUrl = `${apiUrl.protocol}//${apiUrl.host}/chat`;
    console.log('📤 Chat URL:', chatUrl);
    fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt: message,
        connectionId: this.connectionIdSubject.value
      })
    })
    .then(response => {
      console.log('📥 Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    })
    .catch(error => {
      console.error('❌ Mesaj gönderme hatası:', error);
      this.isLoadingSubject.next(false);
      
      // Test yanıtı göster
      const testMessage: ChatMessage = {
        id: this.generateId(),
        content: `Test yanıtı: "${message}" mesajınızı aldım. Backend bağlantısı kurulduğunda gerçek AI yanıtları alacaksınız.`,
        isUser: false,
        timestamp: new Date(),
        connectionId: this.connectionIdSubject.value
      };
      this.addMessage(testMessage);
    });
  }

  private addMessage(message: ChatMessage): void {
    // Kullanıcı ID'sini ekle
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    message.userId = currentUser.id;
    
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  private updateMessage(updatedMessage: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map(msg => 
      msg.id === updatedMessage.id ? updatedMessage : msg
    );
    this.messagesSubject.next(updatedMessages);
  }

  public clearMessages(): void {
    console.log('🗑️ Mesaj geçmişi temizleniyor...');
    this.messagesSubject.next([]);
    this.currentStreamingMessage = null;
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    console.log('✅ Mesaj geçmişi temizlendi');
  }

  // Sadece mevcut kullanıcının mesajlarını getir
  public getCurrentUserMessages(): ChatMessage[] {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUserId = currentUser.id;
    
    return this.messagesSubject.value.filter(message => 
      message.userId === currentUserId
    );
  }

  // Kullanıcı değiştiğinde sadece o kullanıcının mesajlarını göster
  public filterMessagesForCurrentUser(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUserId = currentUser.id;
    
    if (!currentUserId) {
      this.messagesSubject.next([]);
      return;
    }
    
    const userMessages = this.messagesSubject.value.filter(message => 
      message.userId === currentUserId
    );
    
    console.log(`👤 Kullanıcı ${currentUserId} için ${userMessages.length} mesaj filtrelendi`);
    this.messagesSubject.next(userMessages);
  }

  public getConnectionId(): string {
    return this.connectionIdSubject.value;
  }

  public isConnected(): boolean {
    return this.isConnectedSubject.value;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public disconnect(): void {
    console.log('🔌 AI Chat bağlantısı kapatılıyor...');
    
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
    
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    
    // Bağlantı durumunu sıfırla
    this.isConnectedSubject.next(false);
    this.connectionIdSubject.next('');
    
    console.log('✅ AI Chat bağlantısı kapatıldı');
  }

  // Kullanıcı değişikliklerini dinle
  private watchUserChanges(): void {
    // localStorage değişikliklerini dinle
    window.addEventListener('storage', (event) => {
      if (event.key === 'currentUser') {
        console.log('👤 Storage event: Kullanıcı değişikliği algılandı');
        console.log('👤 Eski değer:', event.oldValue);
        console.log('👤 Yeni değer:', event.newValue);
        this.reinitializeConnection();
      }
    });

    // Sayfa yüklendiğinde ilk bağlantıyı kur
    this.initializeConnection();

    // Periyodik olarak kullanıcı değişikliklerini kontrol et
    setInterval(() => {
      this.checkUserChange();
    }, 3000); // 3 saniyede bir kontrol et (daha sık kontrol)
  }

  // Kullanıcı değişikliğini kontrol et
  private checkUserChange(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentToken = currentUser.token || '';
    const currentUserId = currentUser.id || '';
    
    // Eğer token veya kullanıcı ID'si değiştiyse bağlantıyı yeniden kur
    if (this.lastKnownToken !== currentToken || this.lastKnownUserId !== currentUserId) {
      console.log('🔄 Kullanıcı değişikliği algılandı:', {
        oldToken: this.lastKnownToken ? 'var' : 'yok',
        newToken: currentToken ? 'var' : 'yok',
        oldUserId: this.lastKnownUserId,
        newUserId: currentUserId
      });
      this.lastKnownToken = currentToken;
      this.lastKnownUserId = currentUserId;
      this.reinitializeConnection();
    }
  }

  // Bağlantıyı yeniden başlat
  private reinitializeConnection(): void {
    console.log('🔄 AI Chat bağlantısı yeniden başlatılıyor...');
    
    // Mevcut bağlantıyı kapat
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
    
    // Bağlantı durumunu sıfırla
    this.isConnectedSubject.next(false);
    this.connectionIdSubject.next('');
    
    // Kullanıcı değiştiğinde sadece o kullanıcının mesajlarını göster
    this.filterMessagesForCurrentUser();
    
    // Yeni bağlantı kur
    setTimeout(() => {
      this.initializeConnection();
    }, 1000);
  }

  private lastKnownToken: string = '';
  private lastKnownUserId: string = '';
} 