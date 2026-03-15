import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MobileTrackingComponent } from './mobile-tracking/mobile-tracking.component';
import { InventoryComponent } from './inventory/inventory.component';
import { MobileComponent } from './mobile.component';

const routes: Routes = [
  {
    path: '',
    component: MobileComponent,
    children: [

      {
        path: 'tracking',
        component: MobileTrackingComponent,
        data: {
          title: 'tracking'
        }
      },
      {
        path: 'inventory',
        component: InventoryComponent,
        data: {
          title: 'inventory'
        }
      }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MobileRoutingModule { }
