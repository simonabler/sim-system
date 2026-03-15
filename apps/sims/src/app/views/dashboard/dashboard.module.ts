import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { CommonModule } from '@angular/common';
import { InventoryComponent } from './inventory/inventory.component';
import { VerbrauchComponent } from './verbrauch/verbrauch.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    DataTablesModule,
  ],
  declarations: [ DashboardComponent, InventoryComponent, VerbrauchComponent ]
})
export class DashboardModule { }
