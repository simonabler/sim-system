import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CompanySettings, LetterheadMode } from '../../models/settings.model';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);

  readonly activeTab = signal<'firma' | 'zahlung' | 'logos'>('firma');
  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly saveSuccess = signal(false);

  readonly logoPreviewUrl = signal<string | null>(null);
  readonly badge1PreviewUrl = signal<string | null>(null);
  readonly badge2PreviewUrl = signal<string | null>(null);
  readonly templatePdfUrl = signal<string | null>(null);
  readonly templatePdfLabel = signal('');

  readonly form = new FormGroup({
    companyName: new FormControl(''),
    street: new FormControl(''),
    zip: new FormControl(''),
    city: new FormControl(''),
    country: new FormControl('Österreich'),
    phone: new FormControl(''),
    email: new FormControl(''),
    website: new FormControl(''),
    firmenbuchnummer: new FormControl(''),
    vatId: new FormControl(''),
    issueCity: new FormControl(''),
    vatRate: new FormControl<number>(20),
    paymentTermDays: new FormControl<number>(14),
    paymentFooterText: new FormControl(''),
    letterheadMode: new FormControl<LetterheadMode>('generated', { nonNullable: true }),
    bankAccounts: new FormArray<FormGroup>([]),
  });

  get bankAccountsArray(): FormArray<FormGroup> {
    return this.form.get('bankAccounts') as FormArray<FormGroup>;
  }

  ngOnInit() {
    this.settingsService.get().subscribe({
      next: (settings) => {
        this.patchForm(settings);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Einstellungen konnten nicht geladen werden');
        this.loading.set(false);
      },
    });
  }

  private patchForm(settings: CompanySettings) {
    this.form.patchValue({
      companyName: settings.companyName,
      street: settings.street,
      zip: settings.zip,
      city: settings.city,
      country: settings.country,
      phone: settings.phone,
      email: settings.email,
      website: settings.website,
      firmenbuchnummer: settings.firmenbuchnummer,
      vatId: settings.vatId,
      issueCity: settings.issueCity,
      vatRate: settings.vatRate,
      paymentTermDays: settings.paymentTermDays,
      paymentFooterText: settings.paymentFooterText,
      letterheadMode: settings.letterheadMode,
    });

    this.bankAccountsArray.clear();
    (settings.bankAccounts ?? []).forEach((bank) =>
      this.bankAccountsArray.push(this.newBankGroup(bank)),
    );

    this.logoPreviewUrl.set(this.toUploadUrl(settings.logoPath));
    this.badge1PreviewUrl.set(this.toUploadUrl(settings.badge1Path));
    this.badge2PreviewUrl.set(this.toUploadUrl(settings.badge2Path));
    this.templatePdfUrl.set(this.toUploadUrl(settings.templatePdfPath));
    this.templatePdfLabel.set(this.extractFileName(settings.templatePdfPath));
  }

  private newBankGroup(init?: { name: string; iban: string; bic: string }): FormGroup {
    return new FormGroup({
      name: new FormControl(init?.name ?? ''),
      iban: new FormControl(init?.iban ?? ''),
      bic: new FormControl(init?.bic ?? ''),
    });
  }

  private toUploadUrl(path: string | null | undefined): string | null {
    if (!path) {
      return null;
    }

    const relative = path.split('uploads/').pop();
    return relative ? `/uploads/${relative}` : null;
  }

  private extractFileName(path: string | null | undefined): string {
    if (!path) {
      return '';
    }

    const normalized = path.replace(/\\/g, '/');
    return normalized.split('/').pop() ?? '';
  }

  addBank() {
    this.bankAccountsArray.push(this.newBankGroup());
  }

  removeBank(index: number) {
    this.bankAccountsArray.removeAt(index);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.saveSuccess.set(false);

    this.settingsService.save(this.form.getRawValue() as any).subscribe({
      next: (settings) => {
        this.patchForm(settings);
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.message || 'Fehler beim Speichern');
      },
    });
  }

  onFileChange(event: Event, field: 'logo' | 'badge1' | 'badge2' | 'templatePdf') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.error.set('');

    const upload$ =
      field === 'logo'
        ? this.settingsService.uploadLogo(file)
        : field === 'badge1'
          ? this.settingsService.uploadBadge1(file)
          : field === 'badge2'
            ? this.settingsService.uploadBadge2(file)
            : this.settingsService.uploadTemplatePdf(file);

    upload$.subscribe({
      next: (settings) => {
        this.patchForm(settings);

        if (field === 'templatePdf') {
          this.templatePdfLabel.set(file.name);
          input.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          if (field === 'logo') this.logoPreviewUrl.set(url);
          if (field === 'badge1') this.badge1PreviewUrl.set(url);
          if (field === 'badge2') this.badge2PreviewUrl.set(url);
        };
        reader.readAsDataURL(file);
        input.value = '';
      },
      error: (err) => {
        this.error.set(err.message || 'Upload fehlgeschlagen');
        input.value = '';
      },
    });
  }

  setTab(tab: 'firma' | 'zahlung' | 'logos') {
    this.activeTab.set(tab);
  }

  setLetterheadMode(mode: LetterheadMode) {
    this.form.controls.letterheadMode.setValue(mode);
  }

  isLetterheadMode(mode: LetterheadMode): boolean {
    return this.form.controls.letterheadMode.value === mode;
  }
}
