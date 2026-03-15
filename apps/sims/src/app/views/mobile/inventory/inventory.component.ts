import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Article } from '../../../models';
import { ArticleService } from '../../../services/article.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
})
export class MobileInventoryComponent implements OnInit {
  InputForm!: FormGroup;
  Article: Article | null = null;
  submitted = false;

  get f() { return this.InputForm.controls; }

  constructor(private articleService: ArticleService, private toastr: ToastrService) {}

  ngOnInit() { this.createForm(); }

  createForm() {
    this.InputForm = new FormGroup({
      code: new FormControl('', [Validators.required]),
      should: new FormControl({ value: 0, disabled: true }),
      is: new FormControl(0, [Validators.required, Validators.min(0)]),
    });
    this.InputForm.get('code')!.valueChanges.pipe(debounceTime(250)).subscribe(v => this.findCode(v));
  }

  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(e: CustomEvent) { this.InputForm.get('code')!.setValue(e.detail); }

  findCode(code: string) {
    this.articleService.getByCode(code).subscribe({
      next: data => this.setArticleData(data),
      error: () => this.setArticleData(null),
    });
  }

  setArticleData(article: Article | null) {
    if (article) {
      this.Article = article;
      this.InputForm.get('should')!.setValue(article.stock);
      this.InputForm.get('is')!.setValue(article.stock);
    } else {
      this.Article = null;
      this.InputForm.get('should')!.setValue(0);
      this.InputForm.get('is')!.setValue(0);
    }
  }

  reset() { this.InputForm.reset(); this.submitted = false; }

  onSubmit() {
    this.submitted = true;
    this.InputForm.updateValueAndValidity();
    if (this.InputForm.invalid || !this.Article) return;
    const { is } = this.InputForm.getRawValue();
    this.articleService.createInventory(this.Article, is).subscribe({
      next: data => {
        this.setArticleData(data);
        this.submitted = false;
        this.toastr.success(`OK: ${data.stock} ${data.unit}`, '', { timeOut: 1000 });
      },
      error: e => { this.setArticleData(null); this.toastr.error(e); },
    });
  }
}
