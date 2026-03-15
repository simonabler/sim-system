import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerComponent } from './customer/customer.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { BillsComponent } from './bills/bills.component';
import { CustomerEditComponent } from './customer-edit/customer-edit.component';

const routes: Routes = [
  {
    path: 'customer',
    data: {
      title: 'Kunde'
    },
    children: [
      {
        path: '',
        component: CustomerComponent,
      }, 
      {
        path: 'detail/:id',
        data: {
          title: 'Detail'
        },
        component: CustomerDetailComponent,
      },
      {
        path: 'edit/:id',
        data: {
          title: 'Edit'
        },
        component: CustomerEditComponent,
      },
    ]
  },
  {
    path: 'bills',
    data: {
      title: 'Rechnungen'
    },
    component: BillsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
