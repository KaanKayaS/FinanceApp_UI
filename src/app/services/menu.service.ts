import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Menu {
    id: number;
    name: string;
    parentId: number | null;
    order: number;
    url?: string;
    children?: Menu[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/Menu/GetAllAccountMenuBar`;

  constructor(private http: HttpClient) { }

  getMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.apiUrl).pipe(
      map(menus => this.buildMenuTree(menus))
    );
  }

  private buildMenuTree(menus: Menu[]): Menu[] {
    // URL eşleştirmelerini tanımla
    const urlMappings: { [key: string]: string } = {
      'Ödeme Geçmişim': '/payment-history',
      'Gider Ajandası': '/manual-expenses',
      'Gider Ekle': '/add-expense',
      'Talimat Oluştur': '/instructions/create',
      'Talimatlarım': '/instructions/list',
      'Kartlarım': '/cards',
      'Bakiye Yükle': '/cards/add-balance',
      'Kart Ekle': '/cards/add',
      'Dijital Platform Aboneliği': '/membership/create',
      'Aboneliklerim': '/subscriptions',
    };

    // Menülerin URL'lerini güncelle
    menus = menus.map(menu => ({
      ...menu,
      url: urlMappings[menu.name] || menu.url
    }));

    // Parent menüleri bul
    const parentMenus = menus.filter(menu => menu.parentId === null)
      .sort((a, b) => a.order - b.order);

    // Child menüleri ekle
    parentMenus.forEach(parent => {
      parent.children = menus
        .filter(menu => menu.parentId === parent.id)
        .sort((a, b) => a.order - b.order);
    });

    return parentMenus;
  }
} 