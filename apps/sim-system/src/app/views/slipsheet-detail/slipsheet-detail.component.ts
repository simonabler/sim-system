import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SlipsheetService } from '../../services/slipsheet.service';
import { Slipsheet, Order } from '../../models/bill.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-slipsheet-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './slipsheet-detail.component.html',
  styleUrl: './slipsheet-detail.component.scss',
})
export class SlipsheetDetailComponent implements OnInit {
  slipsheet: Slipsheet | null = null;
  loading = true;
  error = '';
  apiUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private slipsheetService: SlipsheetService,
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.slipsheetService.getById(id).subscribe({
      next: s => { this.slipsheet = s; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Lieferschein konnte nicht geladen werden.'; }
    });
  }

  downloadPdf() {
    if (!this.slipsheet) return;
    this.slipsheetService.getPdf(this.slipsheet.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lieferschein-${this.slipsheet!.slipsheetnumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  get total(): number {
    return (this.slipsheet?.orderEntries || []).reduce((sum, o) => sum + (o.amount * o.price), 0);
  }

  back() { this.router.navigate(['/slipsheets']); }

  badgeClass(state: string): string {
    if (state === 'open')    return 'sims-badge sims-badge-warning';
    if (state === 'changed') return 'sims-badge sims-badge-accent';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }
}
