import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileTrackingComponent } from './mobile-tracking/mobile-tracking.component';
import { MobileRoutingModule } from './mobile-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fakeBackendProvider } from '../../helpers';
import { InventoryComponent } from './inventory/inventory.component';
import { MobileComponent } from './mobile.component';


@NgModule({
  declarations: [MobileTrackingComponent, InventoryComponent, MobileComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MobileRoutingModule,
    NgSelectModule
  ],
})
export class MobileModule { }
