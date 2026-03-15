import { Component } from '@angular/core';
import { navItems } from '../../_nav';
import { ShoppingcartService } from '../../services/shoppingcart.service';
import { CustomerService } from '../../services/customer.service';
import { tap } from 'rxjs/operators';
import { Shoppingcart } from '../../models';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {
  public sidebarMinimized = false;
  public navItems = navItems;
  apiUrlHTTP = environment.apiUrlHTTP;

  shoppingcart: Shoppingcart;

  constructor(
    private shoppingcartService: ShoppingcartService,
    private customerService: CustomerService,
    private toastr: ToastrService,
  ) {
    this.shoppingcartService.getShoppingcart().pipe(
      tap(x => console.log(x))
    ).subscribe((data: Shoppingcart) => {
      this.shoppingcart = data;
    });

    this.customerService.getCustomer().subscribe(customer => {
      this.shoppingcartService.loadShoppingcart(customer);
    });
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }


  showPDF(id) {
    if (window.confirm("PDF anzeigen?")) {
      window.open(this.apiUrlHTTP + '/slipsheets/' + id + '/pdf?close=false');
    }
    // [href]="apiUrlHTTP+'/shoppingcarts/'+shoppingcart.id+'/deliverySlip'"
  }


  print(id) {
    if (window.confirm("Lieferschein drucker?")) {
      this.shoppingcartService.print(id).subscribe((data) => this.toastr.success("Lieferschein gedruckt!"),
        (error) => this.toastr.error(error))
    }
    // [href]="apiUrlHTTP+'/shoppingcarts/'+shoppingcart.id+'/deliverySlip'"
  }
}
