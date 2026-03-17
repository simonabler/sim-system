import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SlipsheetService } from '../../services/slipsheet.service';
import { Slipsheet } from '../../models/bill.model';

@Component({
  selector: 'app-slipsheets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slipsheets.component.html',
  styleUrl: './slipsheets.component.scss',
})
export class SlipsheetsComponent implements OnInit {
  slipsheets: Slipsheet[] = [];
  loading = true;

  constructor(private slipsheetService: SlipsheetService, private router: Router) {}

  ngOnInit() {
    this.slipsheetService.getAll().subscribe({
      next: data => { this.slipsheets = data; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  goTo(id: number) { this.router.navigate(['/slipsheets', id]); }
  newOrder() { this.router.navigate(['/order/new']); }

  badgeClass(state: string): string {
    if (state === 'open')    return 'sims-badge sims-badge-warning';
    if (state === 'changed') return 'sims-badge sims-badge-accent';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }
}
