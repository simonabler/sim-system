import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../../services/article.service';

export interface ArticleFieldDescriptor {
  key: string | null;
  label: string;
  aliases: string[];
}

export interface CsvColumnMapping {
  csvHeader: string;
  articleField: string | null;
}

interface ImportPreviewResponse {
  articleCount: number;
  newArticle: { code: string; name?: string }[];
  updateableArticle: { code: string; name?: string }[];
}

interface ImportExecuteResponse {
  succeeded: number;
  failed: number;
  failedCodes: string[];
}

export const ARTICLE_FIELDS: ArticleFieldDescriptor[] = [
  { key: null,        label: '— ignorieren —',        aliases: [] },
  { key: 'code',      label: 'Barcode (Pflichtfeld)',  aliases: ['barcode', 'ean', 'gtin', 'code'] },
  { key: 'name',      label: 'Bezeichnung',            aliases: ['artikelbez', 'bezeichnung', 'name', 'artikel', 'artbez'] },
  { key: 'artNumber', label: 'Artikel-Nr.',            aliases: ['verkaufsobjekt', 'artnr', 'artikelnummer', 'art-nr', 'art.nr', 'art nr'] },
  { key: 'type',      label: 'Typ (Bez. 2)',           aliases: ['bez. 2', 'bez.2', 'bez2', 'bezeichnung 2', 'bezeichnung2', 'typ', 'type'] },
  { key: 'unit',      label: 'Einheit (MEH)',          aliases: ['meh', 'einheit', 'unit', 'me'] },
  { key: 'price',     label: 'Preis Brutto',           aliases: ['brutto', 'bruttopreis', 'preis', 'vk', 'verkaufspreis'] },
  { key: 'netto',     label: 'Preis Netto',            aliases: ['netto', 'nettopreis', 'ek', 'einkaufspreis'] },
  { key: 'pe',        label: 'Preiseinheit (PE)',      aliases: ['pe', 'per', 'preiseinheit', 'vpe'] },
];

function suggestField(header: string): string | null {
  const h = header.toLowerCase().trim();
  for (const field of ARTICLE_FIELDS) {
    if (field.key && field.aliases.some(a => h === a || h.includes(a))) {
      return field.key;
    }
  }
  return null;
}

@Component({
  selector: 'app-article-import-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-import-dialog.component.html',
  styleUrl: './article-import-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleImportDialogComponent {
  private articleService = inject(ArticleService);

  @ViewChild('importDialogEl') private dialogEl!: ElementRef<HTMLDialogElement>;

  readonly articleFields = ARTICLE_FIELDS;

  // ── Step machine ──
  readonly step = signal<1 | 2 | 3 | 4>(1);

  // ── Step 1 ──
  readonly selectedFile   = signal<File | null>(null);
  readonly csvHeaders     = signal<string[]>([]);
  readonly fileError      = signal('');

  // ── Step 2 ──
  readonly mapping        = signal<CsvColumnMapping[]>([]);
  readonly mappingError   = signal('');
  readonly suggestedKeys  = signal<Set<string>>(new Set());

  // ── Step 3 ──
  readonly previewLoading = signal(false);
  readonly preview        = signal<ImportPreviewResponse | null>(null);
  readonly previewError   = signal('');
  readonly showNewList    = signal(false);
  readonly showUpdateList = signal(false);

  // ── Step 4 ──
  readonly importing      = signal(false);
  readonly result         = signal<ImportExecuteResponse | null>(null);
  readonly importError    = signal('');

  readonly mappingHasCode = computed(() =>
    this.mapping().some(m => m.articleField === 'code')
  );

  // ── Open / Close ──
  open() {
    this.reset();
    this.dialogEl.nativeElement.showModal();
  }

  close() {
    this.dialogEl.nativeElement.close();
  }

  onDialogClose() {
    this.reset();
  }

  // ── Step 1: Datei lesen ──
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.fileError.set('');
    if (!file) { this.selectedFile.set(null); return; }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.fileError.set('Nur CSV-Dateien (.csv) sind erlaubt.');
      return;
    }
    this.selectedFile.set(file);
    file.text().then(text => {
      const firstLine = text.split(/\r?\n/).find(l => l.trim().length > 0) ?? '';
      const sep = firstLine.includes(';') ? ';' : ',';
      const headers = firstLine.split(sep).map(h => h.trim().replace(/^"|"$/g, ''));
      this.csvHeaders.set(headers);
      const suggested = new Set<string>();
      const initial = headers.map(h => {
        const field = suggestField(h);
        if (field) suggested.add(h);
        return { csvHeader: h, articleField: field };
      });
      this.suggestedKeys.set(suggested);
      this.mapping.set(initial);
    });
  }

  goToMapping() {
    if (!this.selectedFile()) {
      this.fileError.set('Bitte zuerst eine Datei wählen.');
      return;
    }
    this.step.set(2);
  }

  // ── Step 2 ──
  updateMapping(index: number, value: string) {
    this.mapping.update(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], articleField: value || null };
      return updated;
    });
  }

  isSuggested(csvHeader: string): boolean {
    return this.suggestedKeys().has(csvHeader);
  }

  toggleNewList()    { this.showNewList.set(!this.showNewList()); }
  toggleUpdateList() { this.showUpdateList.set(!this.showUpdateList()); }

  goToPreview() {
    if (!this.mappingHasCode()) {
      this.mappingError.set('Bitte eine Spalte als "Barcode (Pflichtfeld)" zuweisen.');
      return;
    }
    this.mappingError.set('');
    this.loadPreview();
  }

  // ── Step 3 ──
  private loadPreview() {
    this.previewLoading.set(true);
    this.previewError.set('');
    this.preview.set(null);
    this.step.set(3);
    this.articleService.importArticle(true, this.buildFormData()).subscribe({
      next: res => {
        this.previewLoading.set(false);
        this.preview.set(res.data ?? res);
      },
      error: err => {
        this.previewLoading.set(false);
        this.previewError.set(err?.error?.message ?? 'Vorschau fehlgeschlagen.');
      },
    });
  }

  confirmImport() {
    this.importing.set(true);
    this.importError.set('');
    this.articleService.importArticle(false, this.buildFormData()).subscribe({
      next: res => {
        this.importing.set(false);
        this.result.set(res.data ?? res);
        this.step.set(4);
      },
      error: err => {
        this.importing.set(false);
        this.importError.set(err?.error?.message ?? 'Import fehlgeschlagen.');
      },
    });
  }

  private buildFormData(): FormData {
    const fd = new FormData();
    fd.append('file', this.selectedFile()!);
    fd.append('mapping', JSON.stringify(this.mapping()));
    return fd;
  }

  private reset() {
    this.step.set(1);
    this.selectedFile.set(null);
    this.csvHeaders.set([]);
    this.fileError.set('');
    this.mapping.set([]);
    this.mappingError.set('');
    this.suggestedKeys.set(new Set());
    this.preview.set(null);
    this.previewError.set('');
    this.previewLoading.set(false);
    this.result.set(null);
    this.importError.set('');
    this.importing.set(false);
    this.showNewList.set(false);
    this.showUpdateList.set(false);
  }
}
