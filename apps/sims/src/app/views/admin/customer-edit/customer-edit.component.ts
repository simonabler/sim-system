import { Component, OnInit, ComponentFactoryResolver, ApplicationRef } from '@angular/core';
import { Injector, ViewChild, OnDestroy } from '@angular/core';

import { Customer, ArticleGroup, Discount } from '../../../models';
import { CustomerService } from '../../../services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { ShoppingcartService } from '../../../services/shoppingcart.service';
import { map } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap';
import { ArticleGroupService } from '../../../services/article-group.service';
import { environment } from '../../../../environments/environment';
import { BillService } from '../../../services/bill.service';
import { atLeastOne } from '../../../helpers/atLeastOneValidator';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.css']
})
export class CustomerEditComponent implements OnInit, OnDestroy {


  customer: Customer = new Customer();

  ArticleGroups$: Observable<ArticleGroup[]>;
  private articleGroupsSubject = new Subject<ArticleGroup[]>();
  private articleGroups = new Array<ArticleGroup>();
  cartIdx: number;
  submitted;
  CustomerForm: FormGroup;
  isLoading: boolean = false;



  dtOptionsBills = {};
  dtOptions = {};
  dtTriggerBills: Subject<any> = new Subject();
  dtTrigger: Subject<any> = new Subject();


  discountValue: Discount = new Discount();
  @ViewChild('discountModal', { static: false }) public discountModal: ModalDirective;

  apiUrlHTTP = environment.apiUrlHTTP;




  get f() { return this.CustomerForm.controls; }

  constructor(
    private customerService: CustomerService,
    private billService: BillService,
    private articlegroupService: ArticleGroupService,
    private shoppingcartService: ShoppingcartService,
    private route: ActivatedRoute,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private toastr: ToastrService,
  ) {





    this.intiForm();
    this.submitted = false;

    this.ArticleGroups$ = this.articleGroupsSubject.asObservable()
      .pipe(
        map(o => o.filter(s => !this.customer.discounts.map(i => i.articleGroup.id).includes(s.id)))
      );


    this.articlegroupService.getAll().subscribe(data => {
      this.articleGroups = data;
      this.articleGroupsSubject.next(this.articleGroups);
    });

  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  intiForm() {
    this.CustomerForm = new FormGroup({

      id: new FormControl('', [
        // Validators.required,
      ]),
      email: new FormControl('', [

      ]),
      customerNumber: new FormControl('', [
        Validators.required,
      ]),
      firstName: new FormControl('', [
        // Validators.required,
      ]),
      lastName: new FormControl('', [
        // Validators.required,
      ]),
      companyName: new FormControl('', [
        //  Validators.required,
      ]),
      phoneCompany: new FormControl('', [
        //  Validators.required,
      ]),
      phonePrivate: new FormControl('', [
        // Validators.required,
      ]),
      address: new FormControl('', [
        // Validators.required,
      ]),
      postcode: new FormControl('', [
        //  Validators.required,
      ]),
      country: new FormControl('', [
        // Validators.required,
      ]),
      uid: new FormControl('', [
        // Validators.required,
      ]),
      customerDiscount: new FormControl('', [
        // Validators.required,
      ]),
    }, atLeastOne(Validators.required, ['companyName', 'lastName']));




  }

  loadFormData(data: Customer) {
    this.submitted = false;

    this.CustomerForm.patchValue(data);
  }

  loadCustomer(id) {
    if (id !== 'new') {
      this.customerService.getById(id).subscribe(
        (data: Customer) => {
          this.customer = data;
          this.loadFormData(data);
          this.articleGroupsSubject.next(this.articleGroups);


        }, (error) => {
          this.customer = new Customer();
          this.loadFormData(this.customer);
        });


    } else {
      this.customer = new Customer();
      this.loadFormData(this.customer);
    }
  }



  ngOnInit(): void {


    this.route.paramMap.subscribe(params => {
      if (this.router.url.search('bill') !== -1) {
        // this.loadPrintComponent(params.get('id')).subscribe();
      } else {
        this.loadCustomer(params.get('id'));
      }
    });

  }



  save() {
    this.submitted = true;

    this.CustomerForm.updateValueAndValidity();

    if (this.CustomerForm.invalid) {
      return;
    }

    const customer = new Customer(this.CustomerForm.getRawValue());

    if (customer.id) {
      this.update(customer);
    } else {
      this.newArticle(customer);
    }
    this.submitted = false;

  }

  newArticle(customer) {
    this.customerService.create(customer)
      .subscribe(data => {
        if (!data) {
          throw new Error('Fehler beim Erstellen');
        }
        this.router.navigate(['/admin/customer']);
      }, error => {
        console.error(error);
      });
  }

  update(customer) {
    this.customerService.update(customer)
      .subscribe(data => {
        if (!data) {
          throw new Error('Fehler beim Updaten');
        }
        this.router.navigate(['/admin/customer']);
      }, error => {
        console.error(error);
      });
  }

  back() {
    this.router.navigate(['/admin/customer']);

  }

  editDiscount(discount) {
    this.discountValue = new Discount(discount);
    this.discountModal.show();
  }

  deleteDiscount(discount) {
    this.customerService.deleteDiscount(this.customer, discount).subscribe(
      (data) => {
        const el = this.customer.discounts.findIndex(o => o.id === discount.id);
        if (el > -1) {
          this.customer.discounts.splice(el, 1);
        }
        this.articleGroupsSubject.next(this.articleGroups);
        console.log(this.customer.discounts);
        this.toastr.success('Rabatt gelöscht');
      }, (error) => {
        this.toastr.error(error);
      });
  }

  saveDiscount() {
    this.customerService.updateOrCreateDiscount(this.customer, this.discountValue).subscribe(
      (data) => {
        this.discountModal.hide();
        console.log(data);

        const el = this.customer.discounts.findIndex(o => o.id === this.discountValue.id);
        if (el !== -1) {
          this.customer.discounts[el] = data;
        } else {
          this.customer.discounts.push(data);
        }
        this.articleGroupsSubject.next(this.articleGroups);

      }, (error) => {
        this.toastr.error(error);
        this.discountModal.hide();
      });

  }

  addDiscount() {
    this.discountValue = new Discount();
    this.discountModal.show();
  }



}

