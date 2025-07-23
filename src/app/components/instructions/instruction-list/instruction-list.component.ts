import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Instruction } from '../../../models/instruction';
import { InstructionService } from '../../../services/instruction.service';
import Swal from 'sweetalert2';

interface InstructionStats {
  totalInstruction: number;
  waitingInstruction: number;
  paidInstruction: number;
  totalAmount: number;
}

@Component({
  selector: 'app-instruction-list',
  templateUrl: './instruction-list.component.html',
  styleUrls: ['./instruction-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class InstructionListComponent implements OnInit {
  instructions: Instruction[] = [];
  stats: InstructionStats | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private instructionService: InstructionService
  ) {}

  ngOnInit() {
    this.loadInstructions();
    this.loadInstructionStats();
  }

  loadInstructions() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Instruction[]>('http://localhost:5055/api/Instruction/GetAllInstruction')
      .subscribe({
        next: (data) => {
          this.instructions = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Talimatlar yüklenirken hata oluştu:', error);
          this.errorMessage = 'Talimatlar yüklenirken bir hata oluştu.';
          this.isLoading = false;
        }
      });
  }

  loadInstructionStats() {
    this.http.get<InstructionStats>('http://localhost:5055/api/Instruction/GetInstructionCount')
      .subscribe({
        next: (data) => {
          this.stats = data;
          console.log('İstatistikler yüklendi:', data);
        },
        error: (error) => {
          console.error('İstatistikler yüklenirken hata oluştu:', error);
          // Hata durumunda fallback olarak frontend hesaplamasını kullan
          this.stats = {
            totalInstruction: this.instructions.length,
            waitingInstruction: this.instructions.filter(i => !i.isPaid).length,
            paidInstruction: this.instructions.filter(i => i.isPaid).length,
            totalAmount: this.instructions.reduce((total, instruction) => total + instruction.amount, 0)
          };
        }
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isOverdue(instruction: Instruction): boolean {
    const now = new Date();
    const scheduledDate = new Date(instruction.scheduledDate);
    return !instruction.isPaid && scheduledDate < now;
  }

  // API'den gelen veriler varsa onları kullan, yoksa fallback hesaplamalar
  getTotalCount(): number {
    return this.stats?.totalInstruction || this.instructions.length;
  }

  getPendingCount(): number {
    return this.stats?.waitingInstruction || this.instructions.filter(i => !i.isPaid).length;
  }

  getPaidCount(): number {
    return this.stats?.paidInstruction || this.instructions.filter(i => i.isPaid).length;
  }

  getTotalAmount(): number {
    return this.stats?.totalAmount || this.instructions.reduce((total, instruction) => total + instruction.amount, 0);
  }

  markAsPaid(instruction: Instruction) {
    if (confirm(`"${instruction.title}" talimatını ödendi olarak işaretlemek istediğinizden emin misiniz?`)) {
      this.instructionService.markAsPaid(instruction.id).subscribe({
        next: (response) => {
          instruction.isPaid = true;
          this.loadInstructionStats();
          
          // Success mesajını göster ve 2 saniye sonra sayfayı yenile
          Swal.fire({
            title: 'Başarılı!',
            text: response || 'Talimatınız ödendi olarak işaretlendi',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            willClose: () => {
              // 2 saniye sonra sayfayı yenile
              window.location.reload();
            }
          });
        },
        error: (error) => {
          console.error('Talimat güncellenirken hata oluştu:', error);
          
          Swal.fire({
            title: 'Hata!',
            text: 'Talimat güncellenirken bir hata oluştu.',
            icon: 'error',
            confirmButtonText: 'Tamam'
          });
        }
      });
    }
  }

  deleteInstruction(instruction: Instruction) {
    // GroupId kontrolü yap
    const isGroupInstruction = instruction.groupId !== null && instruction.groupId !== undefined;
    
    // Grup talimatı için özel uyarı mesajı
    const warningText = isGroupInstruction 
      ? `"${instruction.title}" bir grup talimatıdır. Bu talimatı sildiğinizde aynı gruba ait diğer talimatlar da silinecektir. Bu işlem geri alınamaz. Emin misiniz?`
      : `"${instruction.title}" talimatını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`;

    Swal.fire({
      title: 'Emin misiniz?',
      text: warningText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.instructionService.removeInstruction(instruction.id).subscribe({
          next: (response) => {
            // Grup talimatıysa, aynı gruptan tüm talimatları listeden çıkar
            if (isGroupInstruction) {
              this.instructions = this.instructions.filter(
                inst => inst.groupId !== instruction.groupId
              );
            } else {
              // Sadece bu talimatı listeden kaldır
              const index = this.instructions.indexOf(instruction);
              if (index > -1) {
                this.instructions.splice(index, 1);
              }
            }
            
            this.loadInstructionStats();
            
            // Success mesajını göster
            const successMessage = isGroupInstruction 
              ? 'Grup talimatları başarıyla silindi.'
              : 'Talimat başarıyla silindi.';
              
            Swal.fire({
              title: 'Silindi!',
              text: response || successMessage,
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
              allowOutsideClick: false
            });
          },
          error: (error) => {
            console.error('Talimat silinirken hata oluştu:', error);
            
            Swal.fire({
              title: 'Hata!',
              text: 'Talimat silinirken bir hata oluştu.',
              icon: 'error',
              confirmButtonText: 'Tamam'
            });
          }
        });
      }
    });
  }

  editInstruction(instruction: Instruction) {
    // Tarihi YYYY-MM-DD formatına çevir (datetime-local input için)
    const scheduledDate = new Date(instruction.scheduledDate);
    const formattedDate = scheduledDate.toISOString().slice(0, 16);
    
    // Grup talimatı kontrolü
    const isGroupInstruction = instruction.groupId !== null && instruction.groupId !== undefined;
    const modalTitle = isGroupInstruction ? 'Grup Talimatı Düzenle' : 'Talimat Düzenle';
    
    Swal.fire({
      title: modalTitle,
      html: `
        <div style="text-align: left;">
          ${isGroupInstruction ? `
            <div style="margin-bottom: 15px; padding: 12px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; color: #856404;">
              <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
              <strong>Uyarı:</strong> Bu bir grup talimatıdır. Yaptığınız değişiklikler aynı gruba ait tüm talimatları etkileyecektir.
            </div>
          ` : ''}
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Başlık:</label>
            <input id="swal-title" class="swal2-input" type="text" value="${instruction.title}" style="width: 100%; margin: 0;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tutar (₺):</label>
            <input id="swal-amount" class="swal2-input" type="number" value="${instruction.amount}" min="0" step="0.01" style="width: 100%; margin: 0;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tarih:</label>
            <input id="swal-date" class="swal2-input" type="datetime-local" value="${formattedDate}" style="width: 100%; margin: 0;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Açıklama:</label>
            <textarea id="swal-description" class="swal2-input" rows="3" style="width: 100%; margin: 0; resize: vertical;">${instruction.description || ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Güncelle',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280',
      width: '500px',
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const amount = parseFloat((document.getElementById('swal-amount') as HTMLInputElement).value);
        const scheduledDate = (document.getElementById('swal-date') as HTMLInputElement).value;
        const description = (document.getElementById('swal-description') as HTMLTextAreaElement).value;

        if (!title.trim()) {
          Swal.showValidationMessage('Başlık boş olamaz');
          return false;
        }
        if (!amount || amount <= 0) {
          Swal.showValidationMessage('Geçerli bir tutar giriniz');
          return false;
        }
        if (!scheduledDate) {
          Swal.showValidationMessage('Tarih seçiniz');
          return false;
        }

        return {
          id: instruction.id,
          title: title.trim(),
          amount: amount,
          scheduledDate: new Date(scheduledDate).toISOString(),
          description: description.trim()
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.instructionService.updateInstruction(result.value).subscribe({
          next: (response) => {
            // Grup talimatıysa tüm listeyi yeniden yükle, çünkü backend'te aynı grup ID'sine sahip tüm talimatlar güncelleniyor
            const isGroupInstruction = instruction.groupId !== null && instruction.groupId !== undefined;
            
            if (isGroupInstruction) {
              // Grup talimatıysa tüm listeyi yeniden yükle
              this.loadInstructions();
            } else {
              // Normal talimatsa sadece local state'i güncelle
              Object.assign(instruction, result.value);
            }
            
            this.loadInstructionStats();
            
            // Success mesajını göster
            const successMessage = isGroupInstruction 
              ? 'Grup talimatları başarıyla güncellendi.'
              : 'Talimat başarıyla güncellendi.';
              
            Swal.fire({
              title: 'Güncellendi!',
              text: response || successMessage,
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
              allowOutsideClick: false
            });
          },
          error: (error) => {
            console.error('Talimat güncellenirken hata oluştu:', error);
            
            Swal.fire({
              title: 'Hata!',
              text: 'Talimat güncellenirken bir hata oluştu.',
              icon: 'error',
              confirmButtonText: 'Tamam'
            });
          }
        });
      }
    });
  }
} 