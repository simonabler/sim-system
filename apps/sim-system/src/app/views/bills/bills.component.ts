import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BillService } from '../../services/bill.service';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillsComponent {
  private billService = inject(BillService);
  private router = inject(Router);

  readonly bills = toSignal(this.billService.getAll(), { initialValue: [] });
  readonly loading = computed(() => this.bills() === undefined);

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
