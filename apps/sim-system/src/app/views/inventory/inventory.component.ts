import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

interface LogEntry {
  articleName: string;
  code: string;
  isVal: number;
  diff: number;
  unit: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent implements OnInit {
  @ViewChild('codeInput') codeInputRef!: ElementRef<HTMLInputElement>;

  codeCtrl = new FormControl('');
  article: Article | null = null;
  shouldVal = 0;
  isVal = 0;
  submitting = false;
  recentLog: LogEntry[] = [];

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.codeCtrl.valueChanges.pipe(debounceTime(300)).subscribe(code => {
      if (code) this.findCode(code);
    });
  }

  findCode(code: string) {
    this.articleService.getByCode(code).subscribe({
      next: article => {
        this.article = article;
        this.shouldVal = article.stock || 0;
        this.isVal = this.shouldVal; // Vorbelegen: häufigster Fall ist kein Fehler
      },
      error: () => {
        this.article = null;
        this.shouldVal = 0;
        this.isVal = 0;
      }
    });
  }

  get diff(): number { return this.isVal - this.shouldVal; }

  get diffClass(): string {
    if (this.diff < 0) return 'negative';
    if (this.diff > 0) return 'positive';
    return 'zero';
  }

  stepIs(delta: number) { this.isVal = Math.max(0, this.isVal + delta); }

  onIsInput(event: Event) {
    const val = +(event.target as HTMLInputElement).value;
    this.isVal = isNaN(val) ? 0 : val;
  }

  onSubmit() {
    if (!this.article) return;
    this.submitting = true;
    this.articleService.createInventory(this.article, this.isVal).subscribe({
      next: updatedArticle => {
        this.submitting = false;
        const entry: LogEntry = {
          articleName: this.article!.name,
          code: this.article!.code,
          isVal: this.isVal,
          diff: this.diff,
          unit: this.article!.unit,
        };
        this.recentLog = [entry, ...this.recentLog].slice(0, 5);
        this.article = null;
        this.codeCtrl.setValue('', { emitEvent: false });
        this.shouldVal = 0;
        this.isVal = 0;
        setTimeout(() => this.codeInputRef?.nativeElement?.focus(), 50);
      },
      error: () => { this.submitting = false; }
    });
  }

  logDiffClass(diff: number): string {
    if (diff < 0) return 'neg';
    if (diff > 0) return 'pos';
    return 'ok';
  }
}
