import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, filter, switchMap, catchError, of } from 'rxjs';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-edit.component.html',
  styleUrl: './customer-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerEditComponent {
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

  /** null = route customers/new (kein :id-Param), string = edit-Route */
  private readonly customerId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('id'))),
    { initialValue: null }
  );

  readonly isNew = computed(() => !this.customerId());

  readonly customer = toSignal(
    this.route.paramMap.pipe(
      map(p => p.get('id')),
      filter((id): id is string => id !== null),
      switchMap(id =>
        this.customerService.getById(+id).pipe(
          catchError(() => { this.error.set('Kunde konnte nicht geladen werden.'); return of(null); })
        )
      )
    )
  );

  readonly loading = computed(() => !this.isNew() && this.customer() === undefined && !this.error());

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
      next: () => {
        this.saving.set(false);
        const id = this.customerId();
        if (id) this.router.navigate(['/customers', id]);
        else this.router.navigate(['/customers']);
      },
      error: err => { this.saving.set(false); this.error.set(err.message || 'Fehler beim Speichern'); },
    });
  }

  back() {
    const id = this.customerId();
    if (id) this.router.navigate(['/customers', id]);
    else this.router.navigate(['/customers']);
  }
}
