import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Shoppingcart } from '../../../models';
import { ShoppingcartService } from '../../../services/shoppingcart.service';
import { BillService } from '../../../services/bill.service';
import { BillWithShop } from '../../../models/billWithShop';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.css'],
})
export class BillsComponent implements OnInit {
  shoppingcarts: Shoppingcart[] = [];
  bills: BillWithShop[] = [];
  apiUrlHTTP = environment.apiUrlHTTP;
  cartIdx: number | null = null;
  isLoading = false;

  constructor(
    private billService: BillService,
    private shoppingcartService: ShoppingcartService,
  ) {}

  ngOnInit() {
    this.loadBills();
    this.loadSlips();
  }

  loadBills() {
    this.billService.get().subscribe({ next: (data: BillWithShop[]) => this.bills = data });
  }

  loadSlips() {
    this.shoppingcartService.getAll().subscribe({ next: (data: Shoppingcart[]) => this.shoppingcarts = data });
  }

  downloadBill(bill: BillWithShop) {
    this.billService.recreate(bill).subscribe(data => {
      const idx = this.bills.findIndex(b => b.id === bill.id);
      if (idx >= 0) { this.bills[idx].createdAt = data.createdAt; this.bills[idx].billNumber = data.billNumber; }
      window.open(`${this.apiUrlHTTP}/bills/${bill.id}/pdf`, '_blank');
      if (idx >= 0) this.bills[idx].state = 'closed';
    });
  }

  downloadSlip(slip: Shoppingcart) {
    window.open(`${this.apiUrlHTTP}/slipsheets/${slip.id}/pdf`, '_blank');
  }
}
