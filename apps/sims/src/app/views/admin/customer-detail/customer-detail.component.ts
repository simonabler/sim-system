import { Component, OnInit, ComponentFactoryResolver, ApplicationRef, ViewChildren, QueryList } from '@angular/core';
import { Injector, ViewChild, OnDestroy } from '@angular/core';

import { Customer, Shoppingcart, ArticleGroup, Discount } from '../../../models';
import { CustomerService } from '../../../services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { ShoppingcartService } from '../../../services/shoppingcart.service';
import { map } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap';
import { ArticleGroupService } from '../../../services/article-group.service';
import { environment } from '../../../../environments/environment';
import { BillService } from '../../../services/bill.service';
import { DataTableDirective } from 'angular-datatables';
import { Bill } from '../../../models/bill.model';
import { ToastrService } from 'ngx-toastr';
import { german } from '../../../helpers/datatable.german';
import { BillWithShop } from '../../../models/billWithShop';
import { ShoppingcartComponent } from '../../shoppingcart/shoppingcart.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit, OnDestroy {

  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  get dtSlip(): DataTableDirective {
    return this.dtElements.find((dtElement: any) => {

      return dtElement.el.nativeElement.id === 'slipTable'
    });
  }

  get dtBill(): DataTableDirective {
    return this.dtElements.find((dtElement: any) => dtElement.el.nativeElement.id === 'billTable');
  }

  @ViewChild('shoppingcart') shoppingcartComponent: ShoppingcartComponent;

  customer: Customer = new Customer();

  shoppingcarts: Shoppingcart[];

  bills: BillWithShop[];
  @ViewChild('billModal', { static: false }) public modal: ModalDirective;

  ArticleGroups$: Observable<ArticleGroup[]>;
  private articleGroupsSubject = new Subject<ArticleGroup[]>();
  private articleGroups = new Array<ArticleGroup>();
  cartIdx: number;
  submitted;
  isLoading: boolean = false;

  dtOptionsBills = {};
  dtOptions = {};
  dtTriggerBills: Subject<any> = new Subject();
  dtTrigger: Subject<any> = new Subject();

  apiUrlHTTP = environment.apiUrlHTTP;

  BillForm;

  get f() { return this.BillForm.controls; }


  constructor(
    private customerService: CustomerService,
    private billService: BillService,
    private articlegroupService: ArticleGroupService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private toastr: ToastrService,
  ) {


    this.shoppingcarts = [];
    this.intiForm();
    this.intiBillForm();
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


  }


  loadCustomer(id) {
    if (id !== 'new') {
      this.customerService.getById(id).subscribe(
        (data: Customer) => {
          this.customer = data;
          this.loadShoppingcarts(data);
          this.loadBills(data);
          this.articleGroupsSubject.next(this.articleGroups);


        }, (error) => {
          this.customer = new Customer();
        });


    } else {
      this.customer = new Customer();
    }
  }

  loadShoppingcarts(customer) {
    this.customerService.getShoppingcarts(customer).subscribe(
      (data: Shoppingcart[]) => {
        this.shoppingcarts = data;
        this.dtTrigger.next();
      }, (error) => {
      });
  }

  loadBills(customer) {
    this.customerService.getBills(customer).subscribe(
      (data: BillWithShop[]) => {
        this.bills = data;
        this.dtTriggerBills.next();
      }, (error) => {
      });
  }

  ngOnInit(): void {



    this.dtOptions = {
      columnDefs: [{
        orderable: false,
        className: 'select-checkbox',
        targets: 0,
        defaultContent: ''
      }],
      select: {
        style: 'multi',
        selector: 'td:first-child'
      },
      order: [[1, 'asc']],
      searching: true,
      scrollX: true,
      language: german,
      dom: '<"row"<"col-md-6"B><"col-md-6">>rtip',
      buttons: [
        'copy',
        'excel',
        'pageLength',
        {
          text: 'Alle',
          key: '1',
          action: (e, dt, node, config) => {
            dt.columns(3).search('').draw();
          }
        },
        {
          text: 'Offene',
          key: '2',
          action: (e, dt, node, config) => {
            dt.columns(3).search('^$', true, false).draw();
          }
        }
      ]

    };


    this.dtOptionsBills = {

      order: [[1, 'desc']],
      searching: true,
      scrollX: true,
      language: german,
      dom: '<"row"<"col-md-6"B><"col-md-6"f>>rtip',
      buttons: [
        'copy',
        'excel',
        'pageLength'
      ]

    };

    this.route.paramMap.subscribe(params => {
      if (this.router.url.search('bill') !== -1) {
        //  this.loadPrintComponent(params.get('id')).subscribe();
      } else {
        this.loadCustomer(params.get('id'));
      }
    });

  }

  selectBill(billNumber) {
    const dtEl: any = this.dtSlip;
    dtEl.dt.columns(3).search(billNumber).draw();
  }


  rerenderSlip(): void {
    if (this.dtSlip && this.dtSlip.dtInstance) {
      this.dtSlip.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    } else {
      this.dtTrigger.next();
    }

  }


  rerenderBills(): void {
    if (this.dtBill && this.dtBill.dtInstance) {
      this.dtBill.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTriggerBills.next();
      });
    } else {
      this.dtTriggerBills.next();
    }

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


  intiBillForm() {

    this.BillForm = new FormGroup({

      id: new FormControl(null, [
        // Validators.required,
      ]),
      billNumber: new FormControl('', [
        // Validators.required,
      ]),
      billDate: new FormControl('', [
        // Validators.required,
      ]),
    });
  }

  loadFormData(data: Bill) {
    this.submitted = false;
    this.BillForm.patchValue(data);
  }

  editBill(bill) {

    this.loadFormData(new Bill(bill));
    this.modal.show();

  }
  saveBill() {
    this.submitted = true;

    this.BillForm.updateValueAndValidity();

    if (this.BillForm.invalid) {
      console.log("Invalid")
      return;
    }
    this.submitted = false;
    const bill = new Bill(this.BillForm.getRawValue());
    if (bill.id) {
      this.billService.update(bill)
        .subscribe((data: Bill) => {
          const idx = this.bills.findIndex(o => o.id === data.id)
          if (idx >= 0) {
            this.bills[idx].billNumber = data.billNumber;
            this.bills[idx].billDate = data.billDate;
          }
          this.toastrService.success(`Rechnungs wurde geändert`);
          this.modal.hide();
        },
          (error) => this.toastrService.error(error));
    }
  }


  // markAsPayed(bill) {

  //   const newBill = new Bill(bill);
  //   newBill.paymentAt = new Date();

  //   this.billService.update(newBill)
  //     .subscribe(data => {

  //       const idx = this.bills.findIndex(b => b.id === data.id);
  //       this.bills[idx].state = data.state;
  //       this.bills[idx].paymentAt = data.paymentAt;

  //       this.toastr.success('Rechnung bezahlt');
  //     }, error => {
  //       console.error(error);
  //       this.toastr.error(error);
  //     });
  // }

  // reopen(bill) {
  //   const newBill = new Bill(bill);
  //   newBill.paymentAt = null;
  //   this.billService.update(newBill)
  //     .subscribe(data => {
  //       const idx = this.bills.findIndex(b => b.id === data.id);
  //       this.bills[idx].state = data.state;
  //       this.bills[idx].paymentAt = data.paymentAt;
  //       this.toastr.success('Rechnung offen');

  //     }, error => {
  //       console.error(error);
  //       this.toastr.error(error);
  //     });
  // }


  changeShoppingcarts(event) {
    // console.log(event)
    this.shoppingcarts[this.cartIdx] = event;
    this.updateState(this.shoppingcarts[this.cartIdx].id, event.state);
    this.rerenderSlip();
  }


  addOrder() {
    this.shoppingcartComponent.addOrder();
  }

  makeBill() {
    const dt: any = this.dtSlip;
    try {
      const carts: Shoppingcart[] = dt.dt.rows({ selected: true })[0].map(row => this.shoppingcarts[row]);
      const numbers: number[] = carts.map(row => row.id);

      dt.dt.rows({ selected: true }).deselect();

      this.billService.generate(numbers).subscribe(
        data => {
          carts.forEach((element: Shoppingcart) => {
            element.bill = data;
          });
          const newBill = new BillWithShop(data);
          carts.forEach(c => c.state = 'closed');
          newBill.slipsheets.push(...carts);
          this.bills.push(newBill);
          this.rerenderSlip();
          this.rerenderBills();
          this.toastr.success('Rechnung ' + newBill.getNumber() + 'erstellt');
        }, (error) => this.toastr.error(error)


      );
    } catch (error) {
      console.error(error);
    }
  }


  downloadBill(bill) {
    const idx = this.bills.findIndex(b => b.id === bill.id);
    this.billService.recreate(bill).subscribe(data => {
      if (idx >= 0) {
        this.bills[idx].createdAt = data.createdAt;
        this.bills[idx].updatedAt = data.updatedAt;
        this.bills[idx].billNumber = data.billNumber;
      }
      this.getBillPdf(bill, idx);
    });
  }

  getBillPdf(bill, idx) {
    // const link = document.createElement('a');
    // link.setAttribute('type', 'hidden');
    // link.href = this.apiUrlHTTP + '/bills/' + bill.id +"/pdf";
    // document.body.appendChild(link);
    // link.click();
    // link.remove();
    // this.bills[idx].state = 'closed';

    window.open(this.apiUrlHTTP + '/bills/' + bill.id + "/pdf", '_blank');
  }

  updateState(slipId, state) {
    const idx = this.shoppingcarts.findIndex(b => b.id === slipId);
    this.shoppingcarts[idx].state = state;
    if (this.shoppingcarts[idx].bill.id) {
      const idx_bill = this.bills.findIndex(b => b.id === this.shoppingcarts[idx].bill.id);
      const idx_slip = this.bills[idx_bill].slipsheets.findIndex(b => b.id === slipId);

      if (idx_slip >= 0) {
        this.bills[idx_bill].slipsheets[idx_slip].state = state;
      }
    }
  }

  downloadSlip(slip) {

    this.updateState(slip.id, 'closed');

    // const link = document.createElement('a');
    // link.setAttribute('type', 'hidden');
    // link.href = this.apiUrlHTTP + '/slipsheets/' + slip.id + '/pdf';
    // document.body.appendChild(link);
    // link.click();
    // link.remove();

    window.open(this.apiUrlHTTP + '/slipsheets/' + slip.id + '/pdf', '_blank');

  }

  printSlip(slip) {
    const idx = this.shoppingcarts.findIndex(b => b.id === slip.id);
    this.shoppingcarts[idx].state = 'closed';

    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = this.apiUrlHTTP + '/shoppingcarts/' + slip.id + '/deliverySlip?print=true';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

}
