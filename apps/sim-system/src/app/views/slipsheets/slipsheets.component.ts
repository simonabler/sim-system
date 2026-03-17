import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SlipsheetService } from '../../services/slipsheet.service';

@Component({
  selector: 'app-slipsheets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slipsheets.component.html',
  styleUrl: './slipsheets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlipsheetsComponent {
  private slipsheetService = inject(SlipsheetService);
  private router = inject(Router);

  readonly slipsheets = toSignal(this.slipsheetService.getAll(), { initialValue: [] });
  readonly loading = computed(() => this.slipsheets() === undefined);

  goTo(id: number) { this.router.navigate(['/slipsheets', id]); }
  newOrder() { this.router.navigate(['/order/new']); }

  badgeClass(state: string): string {
    if (state === 'open')    return 'sims-badge sims-badge-warning';
    if (state === 'changed') return 'sims-badge sims-badge-accent';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }
}
