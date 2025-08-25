import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { Menu, MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent]
})
export class MainLayoutComponent implements OnInit {
  menus: Menu[] = [];
  isSidebarOpen = false; // Mobilde başlangıçta kapalı
  openSubmenus = new Set<number>();
  isMobileView = false;

  constructor(private menuService: MenuService) {}

  ngOnInit() {
    this.loadMenus();
    this.checkMobileView();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkMobileView();
  }

  private checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  loadMenus() {
    this.menuService.getMenus().subscribe({
      next: (menus) => {
        this.menus = menus;
        // İlk menüyü otomatik aç
        if (this.menus.length > 0) {
          this.openSubmenus.add(this.menus[0].id);
        }
      },
      error: (error) => {
        console.error('Menüler yüklenirken hata oluştu:', error);
      }
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    
    // Mobilde body scroll'u kontrol et
    if (this.isMobileView) {
      if (this.isSidebarOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    if (this.isMobileView) {
      document.body.style.overflow = '';
    }
  }

  toggleSubmenu(menu: Menu) {
    if (this.openSubmenus.has(menu.id)) {
      this.openSubmenus.delete(menu.id);
    } else {
      this.openSubmenus.add(menu.id);
    }
  }

  isSubmenuOpen(menu: Menu): boolean {
    return this.openSubmenus.has(menu.id);
  }
} 