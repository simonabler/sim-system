import {
  ChangeDetectionStrategy, Component, computed,
  inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, startWith } from 'rxjs';
import { CustomerService } from '../../services/customer.service';
import { SlipsheetService } from '../../services/slipsheet.service';
import { Customer } from '../../models/customer.model';
import { Slipsheet } from '../../models/bill.model';
import { SlipsheetEditorComponent } from '../../components/slipsheet-editor/slipsheet-editor.component';

@Component({
  selector: 'app-order-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlipsheetEditorComponent],
  templateUrl: './order-new.component.html',
  styleUrl: './order-new.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderNewComponent {
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private slipsheetService = inject(SlipsheetService);

  // ── Kunden-Suche ──────────────────────────────────────────────
  readonly customerSearchCtrl = new FormControl('');

  readonly allCustomers = toSignal(this.customerService.getAll(), { initialValue: [] as Customer[] });

  private readonly customerSearch = toSignal(
    this.customerSearchCtrl.valueChanges.pipe(debounceTime(150), startWith('')),
    { initialValue: '' }
  );

  readonly filteredCustomers = computed(() => {
    const q = (this.customerSearch() ?? '').toLowerCase();
    if (!q) return this.allCustomers();
    return this.allCustomers().filter(c =>
      c.companyName?.toLowerCase().startsWith(q) ||
      c.firstName?.toLowerCase().startsWith(q) ||
      c.lastName?.toLowerCase().startsWith(q)
    );
  });

  readonly selectedCustomer = signal<Customer | null>(
    this.customerService.currentCustomer ?? null
  );

  // ── Aktueller Lieferschein ────────────────────────────────────
  readonly slipsheet = signal<Slipsheet | null>(null);

  constructor() {
    const preselected = this.selectedCustomer();
    if (preselected) this.loadOpenSlipsheet(preselected.id);
  }

  private loadOpenSlipsheet(customerId: number) {
    this.slipsheetService.getByCustomer(customerId).subscribe({
      next: slips => this.slipsheet.set(slips[0] ?? null),
    });
  }

  selectCustomer(c: Customer) {
    this.selectedCustomer.set(c);
    this.customerService.selectCustomer(c);
    this.customerSearchCtrl.setValue('', { emitEvent: false });
    this.loadOpenSlipsheet(c.id);
  }

  clearCustomer() {
    this.selectedCustomer.set(null);
    this.slipsheet.set(null);
  }

  onSlipUpdated(slip: Slipsheet) {
    this.slipsheet.set(slip);
  }

  back() { this.router.navigate(['/slipsheets']); }
}
