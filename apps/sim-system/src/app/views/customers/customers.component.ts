import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, startWith } from 'rxjs/operators';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { ariaSort, nextSortState, sortIcon, sortItems, SortState } from '../../shared/table-sort';

type CustomerSortKey = 'name' | 'customerNumber' | 'email' | 'place';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersComponent {
  private customerService = inject(CustomerService);
  private router = inject(Router);

  readonly searchCtrl = new FormControl('');
  readonly sortState = signal<SortState<CustomerSortKey>>({ key: null, direction: null });

  private readonly allCustomers = toSignal(this.customerService.getAll(), { initialValue: [] as Customer[] });
  private readonly searchTerm = toSignal(
    this.searchCtrl.valueChanges.pipe(debounceTime(200), startWith('')),
    { initialValue: '' }
  );

  readonly loading = computed(() => this.allCustomers() === undefined);

  readonly filtered = computed(() => {
    const q = (this.searchTerm() ?? '').toLowerCase();
    const filtered = (this.allCustomers())
      .filter(c =>
        c.companyName?.toLowerCase().startsWith(q) ||
        c.firstName?.toLowerCase().startsWith(q) ||
        c.lastName?.toLowerCase().startsWith(q)
      )
      .sort((a, b) => a.getName().localeCompare(b.getName(), 'de-AT', { sensitivity: 'base' }));

    return sortItems(filtered, this.sortState(), {
      name: customer => customer.getName(),
      customerNumber: customer => customer.customerNumber,
      email: customer => customer.email,
      place: customer => `${customer.postcode} ${customer.country}`,
    });
  });

  sortBy(key: CustomerSortKey) {
    this.sortState.update(state => nextSortState(state, key));
  }

  sortIcon(key: CustomerSortKey): string {
    return sortIcon(this.sortState(), key);
  }

  ariaSort(key: CustomerSortKey): 'none' | 'ascending' | 'descending' {
    return ariaSort(this.sortState(), key);
  }

  goToCustomer(id: number) { this.router.navigate(['/customers', id]); }
  newCustomer() { this.router.navigate(['/customers', 'new']); }
}
