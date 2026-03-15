import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { german } from '../../../helpers/datatable.german';
import { ArticleService } from '../../../services/article.service';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit, OnDestroy {

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions;
  articles = [];

  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private articleService: ArticleService,
  ) {

    this.dtOptions = {
      pagingType: 'full_numbers',
      orderCellsTop: true,

      pageLength: 25,
      /*  drawCallback: (setting) => this.filterSum(setting),*/
      language: german,
      dom: '<"row"<"col-md-6"B><"col-md-6"f>>rtip',
      lengthMenu: [
        [25, 50, 100, -1],
        ['25', '50', '100', 'Alle'],
      ],
      buttons: ['copy', 'excel', 'pageLength'],
    };

    this.articleService.getAll().subscribe(data => {
      this.articles = data;
      this.rerender();
    });

  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


  ngOnInit(): void {

  }

  rerender(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // dtInstance.draw();
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    } else {
      this.dtTrigger.next();
    }
  }

}
