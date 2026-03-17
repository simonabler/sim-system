import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss',
})
export class ArticlesComponent implements OnInit {
  articles: Article[] = [];
  filtered: Article[] = [];
  loading = true;
  searchCtrl = new FormControl('');
  codeCtrl = new FormControl('');

  constructor(private articleService: ArticleService, private router: Router) {}

  ngOnInit() {
    this.articleService.getAll().subscribe(data => {
      this.articles = data;
      this.applyFilter();
      this.loading = false;
    });

    merge(
      this.searchCtrl.valueChanges.pipe(debounceTime(200)),
      this.codeCtrl.valueChanges.pipe(debounceTime(200))
    ).subscribe(() => this.applyFilter());
  }

  applyFilter() {
    const name = (this.searchCtrl.value || '').toLowerCase();
    const code = (this.codeCtrl.value || '').toLowerCase();
    this.filtered = this.articles.filter(a =>
      a.name.toLowerCase().includes(name) &&
      a.code.toLowerCase().includes(code)
    );
  }

  getBadgeClass(stock: number): string {
    if (stock <= 0)  return 'sims-badge sims-badge-error';
    if (stock < 10)  return 'sims-badge sims-badge-warning';
    return 'sims-badge sims-badge-success';
  }

  getBadgeLabel(stock: number): string {
    if (stock <= 0)  return 'Kein Bestand';
    if (stock < 10)  return 'Niedrig';
    return 'Verfügbar';
  }

  goToArticle(id: number) {
    this.router.navigate(['/articles', id]);
  }

  newArticle() {
    this.router.navigate(['/articles', 'new']);
  }
}
