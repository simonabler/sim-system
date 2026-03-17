import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of, filter } from 'rxjs';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { Slipsheet, Bill } from '../../models/bill.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);

  readonly form = new FormGroup({
    id:               new FormControl<number | null>(null),
    firstName:        new FormControl(''),
    lastName:         new FormControl(''),
    companyName:      new FormControl(''),
    email:            new FormControl(''),
    customerNumber:   new FormControl(''),
    phoneCompany:     new FormControl(''),
    phonePrivate:     new FormControl(''),
    address:          new FormControl(''),
    postcode:         new FormControl(''),
    country:          new FormControl(''),
    uid:              new FormControl(''),
    customerDiscount: new FormControl<number>(0),
  });

  readonly saving = signal(false);
  readonly error = signal('');

  private readonly routeId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('id'))),
    { initialValue: null }
  );

  readonly isNew = computed(() => this.routeId() === 'new');

  readonly customer = toSignal(
    this.route.paramMap.pipe(
      map(p => p.get('id')),
      filter(id => id !== 'new' && id !== null),
      switchMap(id =>
        this.customerService.getById(+id!).pipe(
          catchError(() => { this.error.set('Kunde konnte nicht geladen werden.'); return of(null); })
        )
      )
    )
  );

  readonly loading = computed(() => !this.isNew() && this.customer() === undefined && !this.error());

  readonly slipsheets = toSignal(
    toObservable(this.customer).pipe(
      filter((c): c is Customer => c != null),
      switchMap(c => this.customerService.getSlipsheets(c).pipe(catchError(() => of([] as Slipsheet[]))))
    ),
    { initialValue: [] as Slipsheet[] }
  );

  readonly bills = toSignal(
    toObservable(this.customer).pipe(
      filter((c): c is Customer => c != null),
      switchMap(c => this.customerService.getBills(c).pipe(catchError(() => of([] as Bill[]))))
    ),
    { initialValue: [] as Bill[] }
  );

  constructor() {
    effect(() => {
      const c = this.customer();
      if (c) this.form.patchValue(c as any);
    });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.getRawValue();
    const customer = new Customer(val as any);
    const op = val.id ? this.customerService.update(customer) : this.customerService.create(customer);
    op.subscribe({
      next: () => { this.saving.set(false); this.router.navigate(['/customers']); },
      error: err => { this.saving.set(false); this.error.set(err.message || 'Fehler beim Speichern'); }
    });
  }

  back() { this.router.navigate(['/customers']); }

  slipsheetBadge(state: string): string {
    if (state === 'open' || state === 'changed') return 'sims-badge sims-badge-warning';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }

  billBadge(state: string): string {
    if (state === 'open') return 'sims-badge sims-badge-warning';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }
}
