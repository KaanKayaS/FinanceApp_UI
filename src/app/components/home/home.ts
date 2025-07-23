import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { Expense } from '../../models/expense';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { InstructionService } from '../../services/instruction.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        FullCalendarModule,
        RouterModule,
        MatButtonModule
    ],
    templateUrl: './home.html',
    styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
    // Dashboard verileri
    lastExpenses: Expense[] = [];
    lastMonthTotal: number = 0;
    membershipCount: number = 0;
    isLoading: boolean = true;

    // Takvim ayarları
    isMobileView: boolean = false;
    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        height: 'auto',
        locale: 'tr',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
        },
        eventClick: this.handleEventClick.bind(this),
        eventContent: (info) => {
            // Başlıktaki 00'ı kaldır
            const eventTitle = info.event.title.startsWith('00') 
                ? info.event.title.substring(2) 
                : info.event.title;
            
            return {
                html: `<div class="fc-content">
                    <div class="fc-title">${eventTitle}</div>
                    <div class="fc-amount">${info.event.extendedProps['amount']} ₺</div>
                </div>`
            };
        },
        dayMaxEventRows: this.isMobileView ? 2 : true,
        moreLinkClick: 'popover'
    };

    constructor(
        private dashboardService: DashboardService,
        private instructionService: InstructionService
    ) {
        this.checkScreenSize();
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.checkScreenSize();
        this.updateCalendarOptions();
    }

    ngOnInit() {
        this.loadDashboardData();
        this.loadInstructions();
    }

    private checkScreenSize() {
        this.isMobileView = window.innerWidth <= 768;
    }

    private updateCalendarOptions() {
        this.calendarOptions = {
            ...this.calendarOptions,
            headerToolbar: {
                left: this.isMobileView ? 'prev,next' : 'prev,next today',
                center: 'title',
                right: this.isMobileView ? 'dayGridMonth' : 'dayGridMonth,dayGridWeek'
            },
            dayMaxEventRows: this.isMobileView ? 2 : true
        };
    }

    private loadDashboardData() {
        // Son 3 harcama
        this.dashboardService.getLast3Expenses().subscribe({
            next: (data) => {
                this.lastExpenses = data;
            },
            error: (error) => {
                console.error('Son harcamalar yüklenirken hata:', error);
            }
        });

        // Son ay toplam harcama
        this.dashboardService.getLastMonthExpenseTotal().subscribe({
            next: (total) => {
                this.lastMonthTotal = total;
            },
            error: (error) => {
                console.error('Son ay harcamaları yüklenirken hata:', error);
            }
        });

        // Abonelik sayısı
        this.dashboardService.getMembershipCount().subscribe({
            next: (count) => {
                this.membershipCount = count;
            },
            error: (error) => {
                console.error('Abonelik sayısı yüklenirken hata:', error);
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }

    private loadInstructions() {
        this.instructionService.getAllInstructions().pipe(
            catchError(error => {
                console.error('Talimatlar yüklenirken hata:', error);
                return of([]);
            })
        ).subscribe(instructions => {
            const events: EventInput[] = instructions.map(instruction => {
                let backgroundColor = '#4f46e5'; // Normal ödeme (mavi)
                let borderColor = '#4f46e5';
                let className = 'normal-event';
                
                if (this.isPast(instruction.scheduledDate)) {
                    // Geçmiş ödemeler (sarı)
                    backgroundColor = '#f39c12';
                    borderColor = '#f39c12';
                    className = 'past-event';
                } else if (this.isUpcoming(instruction.scheduledDate)) {
                    // Yaklaşan ödemeler (kırmızı)
                    backgroundColor = '#ff4444';
                    borderColor = '#ff4444';
                    className = 'upcoming-event';
                }
                
                return {
                    title: instruction.title,
                    start: instruction.scheduledDate,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    textColor: '#ffffff',
                    classNames: [className],
                    display: 'block',
                    extendedProps: {
                        amount: instruction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
                        description: instruction.description,
                        daysLeft: this.calculateDaysLeft(instruction.scheduledDate)
                    }
                };
            });

            this.calendarOptions.events = events;
        });
    }

    private isUpcoming(date: string): boolean {
        const eventDate = new Date(date);
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3); // 3 gün içindeki ödemeler yaklaşan ödeme sayılır
        return eventDate >= now && eventDate <= threeDaysFromNow;
    }

    private isPast(date: string): boolean {
        const eventDate = new Date(date);
        const now = new Date();
        // Sadece tarihi karşılaştır, saat farkını yok say
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return eventDay < today;
    }

    private calculateDaysLeft(date: string): string {
        const eventDate = new Date(date);
        const now = new Date();
        const diffTime = eventDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Bugün';
        if (diffDays === 1) return 'Yarın';
        if (diffDays < 0) return 'Geçmiş';
        return `${diffDays} gün kaldı`;
    }

    handleEventClick(info: any) {
        const daysLeft = info.event.extendedProps.daysLeft;
        const isUpcoming = this.isUpcoming(info.event.start);
        const isPast = this.isPast(info.event.start);
        const eventTitle = info.event.title.startsWith('00') 
            ? info.event.title.substring(2) 
            : info.event.title;
        
        let icon: 'warning' | 'info' | 'success' = 'info';
        let confirmButtonColor = '#4f46e5';
        
        if (isPast) {
            icon = 'success';
            confirmButtonColor = '#f39c12';
        } else if (isUpcoming) {
            icon = 'warning';
            confirmButtonColor = '#ff4444';
        }
        
        Swal.fire({
            title: eventTitle,
            html: `
                <div class="event-details">
                    <p><strong>Tutar:</strong> ${info.event.extendedProps.amount} ₺</p>
                    <p><strong>Tarih:</strong> ${new Date(info.event.start).toLocaleDateString('tr-TR')}</p>
                    <p><strong>Kalan Süre:</strong> ${daysLeft}</p>
                    ${info.event.extendedProps.description ? `<p><strong>Açıklama:</strong> ${info.event.extendedProps.description}</p>` : ''}
                </div>
            `,
            icon: icon,
            confirmButtonText: 'Tamam',
            confirmButtonColor: confirmButtonColor,
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    }
}
