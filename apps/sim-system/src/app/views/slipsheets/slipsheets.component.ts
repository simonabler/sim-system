import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SlipsheetService } from '../../services/slipsheet.service';
import { Slipsheet } from '../../models/bill.model';

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

  readonly slipsheets = toSignal(this.slipsheetService.getAll(), { initialValue: [] as Slipsheet[] });
  readonly loading = computed(() => this.slipsheets() === undefined);

  readonly showOnlyOpen = signal(false);

  readonly openCount = computed(() => this.slipsheets().filter(s => s.isOpen()).length);

  readonly filteredSlipsheets = computed(() => {
    const all = this.slipsheets();
    return this.showOnlyOpen() ? all.filter(s => s.isOpen()) : all;
  });

  toggleFilter() { this.showOnlyOpen.update(v => !v); }

  goTo(s: Slipsheet) {
    if (s.customer?.id) {
      const extras = s.isOpen() ? { queryParams: { preselect: s.id } } : {};
      this.router.navigate(['/customers', s.customer.id], extras);
    } else {
      this.router.navigate(['/slipsheets', s.id]);
    }
  }

  newOrder() { this.router.navigate(['/order/new']); }

  stateBadgeClass(state: string): string {
    if (state === 'open')    return 'sims-badge sims-badge-warning';
    if (state === 'changed') return 'sims-badge sims-badge-accent';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }

  billBadgeClass(s: Slipsheet): string {
    return s.isOpen()
      ? 'sims-badge slip-badge-open'
      : 'sims-badge slip-badge-billed';
  }
}
