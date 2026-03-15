import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShoppingcartService } from '../../services/shoppingcart.service';
import { Shoppingcart } from '../../models';
import { ShoppingcartComponent } from '../../views/shoppingcart/shoppingcart.component';
import { navItems } from '../../_nav';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ShoppingcartComponent],
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent implements OnInit {
  navItems = navItems;
  sidebarOpen = true;
  cartOpen = false;
  shoppingcart: Shoppingcart | null = null;

  constructor(private shoppingcartService: ShoppingcartService) {}

  ngOnInit() {
    this.shoppingcartService.getShoppingcart().subscribe((data: Shoppingcart) => {
      this.shoppingcart = data;
    });
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  toggleCart() { this.cartOpen = !this.cartOpen; }
  closeCart() { this.cartOpen = false; }
}
