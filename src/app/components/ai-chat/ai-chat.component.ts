import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { AiChatService, ChatMessage } from '../../services/ai-chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule
  ],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss']
})
export class AiChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  connectionId = '';
  isConnected = false;
  isLoading = false;

  private messagesSubscription!: Subscription;
  private connectionIdSubscription!: Subscription;
  private isConnectedSubscription!: Subscription;
  private isLoadingSubscription!: Subscription;

  constructor(private aiChatService: AiChatService) {}

  ngOnInit() {
    this.messagesSubscription = this.aiChatService.messages$.subscribe(messages => {
      this.messages = messages;
      this.scrollToBottom();
    });

    this.connectionIdSubscription = this.aiChatService.connectionId$.subscribe(id => {
      this.connectionId = id;
    });

    this.isConnectedSubscription = this.aiChatService.isConnected$.subscribe(connected => {
      this.isConnected = connected;
    });

    this.isLoadingSubscription = this.aiChatService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    if (this.connectionIdSubscription) {
      this.connectionIdSubscription.unsubscribe();
    }
    if (this.isConnectedSubscription) {
      this.isConnectedSubscription.unsubscribe();
    }
    if (this.isLoadingSubscription) {
      this.isLoadingSubscription.unsubscribe();
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      // Mobile'da chat açıldığında viewport optimizasyonu
      if (window.innerWidth <= 480) {
        setTimeout(() => {
          // Body scroll'u kilitle
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          document.body.style.height = '100%';
        }, 100);
      }
      
      setTimeout(() => {
        this.messageInput?.nativeElement?.focus();
        this.scrollToBottom();
      }, 100);
    } else {
      // Chat kapandığında body scroll'u geri getir
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  }

  sendMessage() {
    if (this.newMessage.trim() && !this.isLoading && this.isConnected) {
      console.log('📤 Mesaj gönderiliyor:', this.newMessage.trim());
      this.aiChatService.sendMessage(this.newMessage.trim());
      this.newMessage = '';
    } else {
      console.log('❌ Mesaj gönderilemedi:', {
        message: this.newMessage.trim(),
        isLoading: this.isLoading,
        isConnected: this.isConnected
      });
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
      
      // Mobile keyboard için scroll düzeltmesi
      if (window.innerWidth <= 480) {
        setTimeout(() => {
          this.scrollToBottom();
          // Input'u viewport'ta görünür hale getir
          const inputElement = event.target as HTMLInputElement;
          if (inputElement) {
            inputElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }, 100);
      }
    }
  }

  clearChat() {
    this.aiChatService.clearMessages();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  formatTimestamp(date: Date): string {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getConnectionStatusText(): string {
    return this.isConnected ? 'Bağlı' : 'Bağlanıyor...';
  }

  getConnectionStatusColor(): string {
    return this.isConnected ? '#10b981' : '#f59e0b';
  }
} 