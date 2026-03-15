import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { InventoryComponent } from './inventory/inventory.component';
import { VerbrauchComponent } from './verbrauch/verbrauch.component';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Dashboard'
    },
    children: [
      {
        path: '',
        component: DashboardComponent,
        data: {
          title: 'Dashboard'
        },
      },
      {
        path: 'inventory',
        component: InventoryComponent,
        data: {
          title: 'Inventur'
        },
      },
      {
        path: 'verbrauch',
        component: VerbrauchComponent,
        data: {
          title: 'Verbrauch'
        },
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
