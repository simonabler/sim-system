import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerComponent } from './customer/customer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalModule } from 'ngx-bootstrap';
import { AdminRoutingModule } from './admin-routing.module';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { SharedModule } from '../../shared.module';
import { DiscountComponent } from './discount/discount.component';
import { BillsComponent } from './bills/bills.component';
import { DataTablesModule } from 'angular-datatables';
import { CustomerEditComponent } from './customer-edit/customer-edit.component';


@NgModule({
  declarations: [CustomerComponent, CustomerDetailComponent,  DiscountComponent, BillsComponent, CustomerEditComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    NgSelectModule,
    SharedModule,
    DataTablesModule,
    ModalModule.forRoot()
  ]
})
export class AdminModule { }
