import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { ArticleService } from '../../services/article.service';
import { SlipsheetService } from '../../services/slipsheet.service';
import { Customer } from '../../models/customer.model';
import { Article } from '../../models/article.model';
import { Order } from '../../models/bill.model';

interface OrderPosition {
  article?: Article;
  text?: string;
  amount: number;
  price: number;
}

@Component({
  selector: 'app-order-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-new.component.html',
  styleUrl: './order-new.component.scss',
})
export class OrderNewComponent implements OnInit {
  customers: Customer[] = [];
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  selectedCustomer: Customer | null = null;
  positions: OrderPosition[] = [];
  searchQuery = new FormControl('');
  noteCtrl = new FormControl('');
  showArticlePicker = false;
  submitting = false;
  error = '';

  constructor(
    private router: Router,
    private customerService: CustomerService,
    private articleService: ArticleService,
    private slipsheetService: SlipsheetService,
  ) {}

  ngOnInit() {
    this.customerService.getAll().subscribe(c => this.customers = c);
    this.articleService.getAll().subscribe(a => { this.articles = a; this.filteredArticles = a; });
    this.searchQuery.valueChanges.subscribe(q => {
      const qLow = (q || '').toLowerCase();
      this.filteredArticles = this.articles.filter(a =>
        a.name.toLowerCase().includes(qLow) || a.artNumber.toLowerCase().includes(qLow)
      );
    });
  }

  get total(): number {
    return this.positions.reduce((sum, p) => sum + p.amount * p.price, 0);
  }

  get totalVat(): number { return this.total * 0.2; }
  get totalGross(): number { return this.total + this.totalVat; }

  selectCustomer(c: Customer) { this.selectedCustomer = c; }

  addArticle(article: Article) {
    const existing = this.positions.find(p => p.article?.id === article.id);
    if (existing) {
      existing.amount++;
    } else {
      this.positions.push({ article, amount: 1, price: article.price || 0 });
    }
    this.showArticlePicker = false;
  }

  addTextPosition() {
    this.positions.push({ text: '', amount: 1, price: 0 });
    this.showArticlePicker = false;
  }

  removePosition(index: number) { this.positions.splice(index, 1); }
  stepAmount(index: number, delta: number) {
    this.positions[index].amount = Math.max(1, this.positions[index].amount + delta);
  }

  get canSubmit(): boolean {
    return !!this.selectedCustomer && this.positions.length > 0;
  }

  submit() {
    if (!this.canSubmit) return;
    this.submitting = true;
    // Create a new slipsheet with first position's article as entry point
    const firstPos = this.positions[0];
    const data = {
      article: firstPos.article || null,
      amount: firstPos.amount,
      customer: this.selectedCustomer,
    };
    this.slipsheetService.create(data).subscribe({
      next: slip => {
        this.submitting = false;
        this.router.navigate(['/slipsheets', slip.id]);
      },
      error: err => { this.submitting = false; this.error = err.message || 'Fehler beim Erstellen'; }
    });
  }

  back() { this.router.navigate(['/slipsheets']); }
}
