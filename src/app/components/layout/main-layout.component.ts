import { Component, OnInit } from '@angular/core';
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
  isSidebarOpen = true;
  openSubmenus = new Set<number>();

  constructor(private menuService: MenuService) {}

  ngOnInit() {
    this.loadMenus();
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