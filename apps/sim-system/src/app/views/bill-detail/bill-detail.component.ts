import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of } from 'rxjs';
import { BillService } from '../../services/bill.service';

@Component({
  selector: 'app-bill-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bill-detail.component.html',
  styleUrl: './bill-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private billService = inject(BillService);

  readonly error = signal('');
  readonly downloading = signal(false);

  readonly bill = toSignal(
    this.route.paramMap.pipe(
      map(p => +p.get('id')!),
      switchMap(id =>
        this.billService.getAll().pipe(
          map(bills => {
            const found = bills.find(b => b.id === id);
            if (!found) this.error.set('Rechnung nicht gefunden.');
            return found ?? null;
          }),
          catchError(() => { this.error.set('Rechnung konnte nicht geladen werden.'); return of(null); })
        )
      )
    )
  );

  readonly loading = computed(() => this.bill() === undefined && !this.error());

  downloadPdf() {
    const b = this.bill();
    if (!b) return;
    this.downloading.set(true);
    this.billService.getPdf(b.id).subscribe({
      next: blob => {
        this.downloading.set(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rechnung-${b.getNumber()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => { this.downloading.set(false); this.error.set('PDF nicht gefunden. Bitte neu erzeugen.'); }
    });
  }

  back() { this.router.navigate(['/bills']); }

  badgeClass(state: string): string {
    if (state === 'open')   return 'sims-badge sims-badge-warning';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }
}
