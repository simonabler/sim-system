import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ShoppingcartService } from '../../services/shoppingcart.service';
import { Shoppingcart, Order, Article } from '../../models';
import { BsModalService, ModalDirective } from 'ngx-bootstrap';
import { ArticleService } from '../../services/article.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { QuestionPromptContentComponent } from '../common/modals/question-prompt.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shoppingcart',
  templateUrl: './shoppingcart.component.html',
  styleUrls: ['./shoppingcart.component.scss']
})
export class ShoppingcartComponent implements OnInit {

  shoppingcartStorage: Shoppingcart;
  Articles$;
  CartForm;
  annotationText = '';
  submitted;
  @ViewChild('shoppingcartModal', { static: false }) public modal: ModalDirective;


  @Output() shoppingcartChange: EventEmitter<Shoppingcart> = new EventEmitter<Shoppingcart>();

  @Input() set shoppingcart(value: Shoppingcart) {
    this.shoppingcartStorage = value;
  }
  get shoppingcart(): Shoppingcart {
    return this.shoppingcartStorage;
  }

  @Input()
  showDiscount: boolean;

  @Input()
  showArticlenr: boolean;


  _showEdit: boolean;

  @Input() set showEdit(value: boolean) {
    this._showEdit = value;
    if (this._showEdit) {
      this.Articles$ = this.articleService.getAll();
    }
  }
  get showEdit(): boolean {
    return this._showEdit;
  }
  get f() { return this.CartForm.controls; }


  constructor(
    private shoppingcartService: ShoppingcartService,
    private articleService: ArticleService,
    private toastrService: ToastrService,
    private modalService: BsModalService) {

  }

  ngOnInit(): void {

    this.intiForm();
  }

  intiForm() {

    this.CartForm = new FormGroup({

      id: new FormControl(null, [
        // Validators.required,
      ]),
      articleGroupRabatt: new FormControl(0, [
        // Validators.required,
      ]),
      customerRabatt: new FormControl(0, [
        // Validators.required,
      ]),
      amount: new FormControl(0, [
        Validators.required,
      ]),
      price: new FormControl(0, [
        // Validators.required,
      ]),
      article: new FormControl(null, [
      ]),
      text: new FormControl('', [
        // Validators.required,
      ]),
    });
  }

  loadFormData(data: Order) {
    this.submitted = false;
    this.CartForm.patchValue(data);
  }


  deleteOrder(order) {
    this.openModalWithComponent().content.success
      .pipe(filter(data => data === true))
      .subscribe(result => {
        let orderToSend = Object.assign({}, order);
        orderToSend.amount = 0;
        this.shoppingcartService.updateOrder(this.shoppingcartStorage, orderToSend).subscribe(
          (data: Shoppingcart) => {
            console.log(result)

            this.shoppingcart = data;
            this.shoppingcartChange.emit(data);
          }, (error) => {
          });
      })
  }


  openModalWithComponent() {
    const initialState = {

      title: 'Löschen',
      message: 'Eintrag Löschen?',
      closeBtnName: 'Abbrechen',
      successBtnName: 'Löschen'
    };

    const modalRef = this.modalService.show(QuestionPromptContentComponent, { initialState });
    return modalRef
  }

  editOrder(order) {
    this.loadFormData(new Order(order));
    this.modal.show();
  }

  addOrder() {
    const order = new Order();
    order.id = null;
    this.intiForm();
    this.modal.show();
  }

  addAnnotation() {
    const annotation = (this.annotationText || '').trim();
    if (!this.shoppingcart?.id || !annotation) {
      return;
    }

    this.shoppingcartService.addAnnotation(this.shoppingcart, annotation)
      .subscribe(
        (data: Shoppingcart) => {
          this.shoppingcart = data;
          this.annotationText = '';
          this.shoppingcartChange.emit(data);
          this.toastrService.success('Kommission wurde hinzugefuegt');
        },
        () => this.toastrService.error('Kommission konnte nicht gespeichert werden'),
      );
  }



  saveShoppingcart() {

    this.submitted = true;

    this.CartForm.updateValueAndValidity();

    if (this.CartForm.invalid) {
      console.log("Involid")
      return;
    }
    this.submitted = false;
    const order = new Order(this.CartForm.getRawValue());

    if (!order.id) {
      this.shoppingcartService.addOrder(this.shoppingcart, order)
        .subscribe((data: Shoppingcart) => {
          this.shoppingcart = data;
          this.shoppingcartChange.emit(data);

          this.toastrService.success(`Artikel wurde hinzugefügt`);
          this.modal.hide();
        }, error => {
          this.toastrService.error(error);
        });

    } else {
      this.shoppingcartService.updateOrder(this.shoppingcart, order)
        .subscribe((data: Shoppingcart) => {

          console.log(data);
          this.shoppingcart = data;
          this.shoppingcartChange.emit(data);
          this.toastrService.success(`Artikel wurde geändert`);
          this.modal.hide();
        },
          (error) => this.toastrService.error(error));
    }
  }


  transSearchFn = (term: string, item: Article) => {
    term = term.toLocaleLowerCase();
    return item.name?.toLocaleLowerCase().indexOf(term) > -1 || item.artNumber?.toLocaleLowerCase().indexOf(term) > -1;
  }

}
