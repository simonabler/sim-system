import {
  ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of } from 'rxjs';
import { SlipsheetService } from '../../services/slipsheet.service';
import { Slipsheet } from '../../models/bill.model';
import { Customer } from '../../models/customer.model';
import { SlipsheetEditorComponent } from '../../components/slipsheet-editor/slipsheet-editor.component';

@Component({
  selector: 'app-slipsheet-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SlipsheetEditorComponent],
  templateUrl: './slipsheet-detail.component.html',
  styleUrl: './slipsheet-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlipsheetDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private slipsheetService = inject(SlipsheetService);
  private destroyRef = inject(DestroyRef);

  readonly slipsheet = signal<Slipsheet | null>(null);
  readonly loading   = signal(true);
  readonly error     = signal('');

  // Derive customer from slipsheet so the editor always has it
  readonly customer = computed<Customer | null>(() => this.slipsheet()?.customer ?? null);

  constructor() {
    this.route.paramMap.pipe(
      map(p => +p.get('id')!),
      switchMap(id =>
        this.slipsheetService.getById(id).pipe(
          catchError(() => {
            this.error.set('Lieferschein konnte nicht geladen werden.');
            this.loading.set(false);
            return of(null);
          })
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(s => {
      this.slipsheet.set(s);
      this.loading.set(false);
    });
  }

  onSlipUpdated(updated: Slipsheet) {
    this.slipsheet.set(updated);
  }

  back() {
    const cId = this.slipsheet()?.customer?.id;
    if (cId) this.router.navigate(['/customers', cId]);
    else this.router.navigate(['/slipsheets']);
  }

  badgeClass(state: string): string {
    if (state === 'open')    return 'sims-badge sims-badge-low';
    if (state === 'changed') return 'sims-badge sims-badge-empty';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-ok';
    return 'sims-badge sims-badge-neutral';
  }
}
