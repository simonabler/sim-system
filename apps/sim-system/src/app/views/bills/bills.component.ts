import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BillService } from '../../services/bill.service';
import { Bill } from '../../models/bill.model';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.scss',
})
export class BillsComponent implements OnInit {
  bills: Bill[] = [];
  loading = true;

  constructor(private billService: BillService, private router: Router) {}

  ngOnInit() {
    this.billService.getAll().subscribe({
      next: data => { this.bills = data; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  goTo(id: number) { this.router.navigate(['/bills', id]); }

  badgeClass(state: string): string {
    if (state === 'open')   return 'sims-badge sims-badge-warning';
    if (state === 'closed') return 'sims-badge sims-badge-success';
    if (state === 'payed')  return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }

  badgeLabel(state: string): string {
    if (state === 'open')   return 'offen';
    if (state === 'closed') return 'erstellt';
    if (state === 'payed')  return 'bezahlt';
    return state;
  }
}
