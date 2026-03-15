import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ShoppingcartService } from '../../services/shoppingcart.service';
import { ArticleService } from '../../services/article.service';
import { Shoppingcart, Order, Article } from '../../models';

@Component({
  selector: 'app-shoppingcart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './shoppingcart.component.html',
  styleUrls: ['./shoppingcart.component.scss'],
})
export class ShoppingcartComponent implements OnInit {
  shoppingcartStorage: Shoppingcart | null = null;
  Articles$: any;
  CartForm!: FormGroup;
  annotationText = '';
  submitted = false;
  modalOpen = false;

  @Output() shoppingcartChange = new EventEmitter<Shoppingcart>();

  @Input() set shoppingcart(value: Shoppingcart) { this.shoppingcartStorage = value; }
  get shoppingcart(): Shoppingcart | null { return this.shoppingcartStorage; }

  @Input() showDiscount = false;
  @Input() showArticlenr = false;
  @Input() showEdit = false;

  get f() { return this.CartForm.controls; }

  constructor(
    private shoppingcartService: ShoppingcartService,
    private articleService: ArticleService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.Articles$ = this.articleService.getAll();
  }

  initForm() {
    this.CartForm = new FormGroup({
      id: new FormControl(null),
      articleGroupRabatt: new FormControl(0),
      customerRabatt: new FormControl(0),
      amount: new FormControl(0, [Validators.required]),
      price: new FormControl(0),
      article: new FormControl(null),
      text: new FormControl(''),
    });
  }

  openAddModal() {
    this.initForm();
    this.modalOpen = true;
  }

  editOrder(order: Order) {
    this.CartForm.patchValue(order);
    this.modalOpen = true;
  }

  closeModal() { this.modalOpen = false; }

  deleteOrder(order: Order) {
    if (!confirm('Eintrag löschen?')) return;
    const o = new Order({ ...order, amount: 0 });
    this.shoppingcartService.updateOrder(this.shoppingcartStorage!, o).subscribe({
      next: (data: Shoppingcart) => {
        this.shoppingcartStorage = data;
        this.shoppingcartChange.emit(data);
      },
    });
  }

  addAnnotation() {
    const text = (this.annotationText || '').trim();
    if (!this.shoppingcartStorage?.id || !text) return;
    this.shoppingcartService.addAnnotation(this.shoppingcartStorage, text).subscribe({
      next: (data: Shoppingcart) => {
        this.shoppingcartStorage = data;
        this.annotationText = '';
        this.shoppingcartChange.emit(data);
        this.toastr.success('Kommission hinzugefügt');
      },
      error: () => this.toastr.error('Fehler beim Speichern'),
    });
  }

  saveShoppingcart() {
    this.submitted = true;
    if (this.CartForm.invalid) return;
    this.submitted = false;
    const order = new Order(this.CartForm.getRawValue());

    if (!order.id) {
      this.shoppingcartService.addOrder(this.shoppingcartStorage!, order).subscribe({
        next: (data: Shoppingcart) => {
          this.shoppingcartStorage = data;
          this.shoppingcartChange.emit(data);
          this.toastr.success('Artikel hinzugefügt');
          this.closeModal();
        },
        error: (e) => this.toastr.error(e),
      });
    } else {
      this.shoppingcartService.updateOrder(this.shoppingcartStorage!, order).subscribe({
        next: (data: Shoppingcart) => {
          this.shoppingcartStorage = data;
          this.shoppingcartChange.emit(data);
          this.toastr.success('Artikel geändert');
          this.closeModal();
        },
        error: (e) => this.toastr.error(e),
      });
    }
  }

  transSearchFn = (term: string, item: Article) => {
    const t = term.toLocaleLowerCase();
    return (item.name?.toLocaleLowerCase().includes(t) || item.artNumber?.toLocaleLowerCase().includes(t)) ?? false;
  };
}
