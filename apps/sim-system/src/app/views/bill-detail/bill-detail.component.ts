import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BillService } from '../../services/bill.service';
import { Bill } from '../../models/bill.model';

@Component({
  selector: 'app-bill-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bill-detail.component.html',
  styleUrl: './bill-detail.component.scss',
})
export class BillDetailComponent implements OnInit {
  bill: Bill | null = null;
  loading = true;
  error = '';
  downloading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billService: BillService,
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.billService.getAll().subscribe({
      next: bills => {
        this.bill = bills.find(b => b.id === id) || null;
        this.loading = false;
        if (!this.bill) this.error = 'Rechnung nicht gefunden.';
      },
      error: () => { this.loading = false; this.error = 'Rechnung konnte nicht geladen werden.'; }
    });
  }

  // Bug #2 fix: GET /bills/:id/pdf is read-only – does NOT regenerate the PDF
  downloadPdf() {
    if (!this.bill) return;
    this.downloading = true;
    this.billService.getPdf(this.bill.id).subscribe({
      next: blob => {
        this.downloading = false;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rechnung-${this.bill!.getNumber()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => { this.downloading = false; this.error = 'PDF nicht gefunden. Bitte neu erzeugen.'; }
    });
  }

  back() { this.router.navigate(['/bills']); }

  badgeClass(state: string): string {
    if (state === 'open')   return 'sims-badge sims-badge-warning';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }
}
