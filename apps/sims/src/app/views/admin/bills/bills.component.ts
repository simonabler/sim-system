import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { Shoppingcart } from '../../../models';
import { ShoppingcartService } from '../../../services/shoppingcart.service';
import { BillService } from '../../../services/bill.service';
import { Bill } from '../../../models/bill.model';
import { BillWithShop } from '../../../models/billWithShop';
import { environment } from '../../../../environments/environment';
import { DataTableDirective } from 'angular-datatables';
import { german } from '../../../helpers/datatable.german';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.css']
})
export class BillsComponent implements OnInit {


  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  get dtSlip(): DataTableDirective {
    return this.dtElements.find((dtElement: any) => dtElement.dt.table().node().id === 'slipTable');
  }

  get dtBill(): DataTableDirective {
    return this.dtElements.find((dtElement: any) => dtElement.dt.table().node().id === 'billTable');
  }


  shoppingcarts: Shoppingcart[];
  bills: BillWithShop[];
  apiUrlHTTP = environment.apiUrlHTTP;
  cartIdx;
  isLoading = false;


  dtOptionsBills = {};
  dtOptionsSlip = {};
  dtTriggerBills: Subject<any> = new Subject();
  dtTriggerSlip: Subject<any> = new Subject();

  constructor(
    private billService: BillService,
    private shoppingcartService: ShoppingcartService) {
    this.shoppingcarts = [];
  }

  ngOnInit(): void {


    this.dtOptionsSlip = {
      order: [[2, 'asc']],
      searching: true,
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
            dt.columns(2).search('').draw();
            dt.columns(1).search('').draw();
          }
        },
        {
          text: 'nicht gedruckt',
          key: '2',
          action: (e, dt, node, config) => {
            dt.columns(2).search('^$', true, false)
            .columns(1).search('')
            .columns(3).search('^(?!Abler gmbh)', true, false).draw();

          }
        },
        {
          text: 'nicht verrechnet',
          key: '3',
          action: (e, dt, node, config) => {
            dt.columns(1).search('^$', true, false)
            .columns(2).search('^.+$', true, false)
            .columns(3).search('^(?!Abler gmbh)', true, false).draw();
          }
        }
      ]

    };



    this.dtOptionsBills = {

      order: [[1, 'desc']],
      searching: true,
      language: german,
      dom: '<"row"<"col-md-6"B><"col-md-6"f>>rtip',
      buttons: [
        'copy',
        'excel',
        'pageLength'
      ]

    };



    this.loadBills();
    this.loadSlips();

  }

  loadBills() {
    this.billService.get().subscribe(
      (data: BillWithShop[]) => {
        this.bills = data;
        this.dtTriggerBills.next();
      }, (error) => {
      });
  }

  loadSlips() {
    this.shoppingcartService.getAll().subscribe(
      (data: Shoppingcart[]) => {
        this.shoppingcarts = data;
        this.dtTriggerSlip.next();
      }, (error) => {
      });
  }



  rerenderSlip(): void {
    if (this.dtSlip && this.dtSlip.dtInstance) {
      this.dtSlip.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTriggerSlip.next();
      });
    } else {
      this.dtTriggerSlip.next();
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



  downloadBill(bill) {
    this.billService.recreate(bill).subscribe(data => {
      const idx = this.bills.findIndex(b => b.id === bill.id);
      this.bills[idx].createdAt = data.createdAt;
      this.bills[idx].updatedAt = data.updatedAt;
      this.bills[idx].billNumber = data.billNumber;
      // this.bills[idx].year = data.year;


      const link = document.createElement('a');
      link.setAttribute('type', 'hidden');
      link.href = this.apiUrlHTTP + '/bills/' + bill.id + '/pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      this.bills[idx].state = 'closed';

    });
  }


  downloadSlip(slip) {

    // const idx = this.shoppingcarts.findIndex(b => b.id === slip.id);
    // this.shoppingcarts[idx].state = 'closed';

    // const link = document.createElement('a');
    // link.setAttribute('type', 'hidden');
    // link.href = this.apiUrlHTTP + '/shoppingcarts/' + slip.id + '/deliverySlip';
    // document.body.appendChild(link);
    // link.click();
    // link.remove();

    window.open(this.apiUrlHTTP + '/slipsheets/' + slip.id + '/pdf', '_blank');
  }


}
