import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of } from 'rxjs';
import { SlipsheetService } from '../../services/slipsheet.service';

@Component({
  selector: 'app-slipsheet-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './slipsheet-detail.component.html',
  styleUrl: './slipsheet-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlipsheetDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private slipsheetService = inject(SlipsheetService);

  readonly error = signal('');

  readonly slipsheet = toSignal(
    this.route.paramMap.pipe(
      map(p => +p.get('id')!),
      switchMap(id =>
        this.slipsheetService.getById(id).pipe(
          catchError(() => { this.error.set('Lieferschein konnte nicht geladen werden.'); return of(null); })
        )
      )
    )
  );

  readonly loading = computed(() => this.slipsheet() === undefined && !this.error());

  readonly total = computed(() =>
    (this.slipsheet()?.orderEntries ?? []).reduce((sum, o) => sum + o.amount * o.price, 0)
  );

  downloadPdf() {
    const s = this.slipsheet();
    if (!s) return;
    this.slipsheetService.getPdf(s.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lieferschein-${s.slipsheetnumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  back() { this.router.navigate(['/slipsheets']); }

  badgeClass(state: string): string {
    if (state === 'open')    return 'sims-badge sims-badge-warning';
    if (state === 'changed') return 'sims-badge sims-badge-accent';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }
}
