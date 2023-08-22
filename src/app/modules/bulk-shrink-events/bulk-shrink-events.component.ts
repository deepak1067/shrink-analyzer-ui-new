import { Component } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { BulkShrinkEventsService } from '../../core/services/bulk-shrink-events/bulk-shrink-events.service';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { SiteApiResponseService } from 'src/app/core/services/site-api-response.service';
import { BulkShrinkEvents } from './bulk-shrink-events.model';
import { ActionColumnComponent } from 'src/app/shared/components/action-column/action-column.component';
import {Router} from "@angular/router";
import {DataDogService} from "../../shared/services/datadog.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-bulk-shrink-events',
  templateUrl: './bulk-shrink-events.component.html',
  styleUrls: ['./bulk-shrink-events.component.scss']
})
export class BulkShrinkEventsComponent {
  applyFilterSubscription$!: Subscription;
  bulkShrinkEventsSubscription$!: Subscription;
  bulkShrinkEvents: BulkShrinkEvents[] = [];
  siteCodeMap: Map<string, string> = new Map();
  isLoading = false;
  bulkColumnDef: (ColDef | ColGroupDef)[] = [];
  updatedBulkShrinkHeaders: any[] = [];
  allTableHeaders: any[] = [];

  constructor(public commonService:CommonService,
    public siteApiResponseService: SiteApiResponseService,
    public bulkShrinkEventsService:BulkShrinkEventsService,
    public router: Router,
    public dataDogService:DataDogService,
    public translateService: TranslateService){
  }

  ngOnInit(): void {
    this.commonService.sendPageTitle('BULK SHRINK EVENTS');
    this.getBulkShrinkEventsData();
    this.getFilterAppliedValue();
  }

  getFilterAppliedValue(){
    this.applyFilterSubscription$ = this.commonService
    .getFilterAppliedValue()
    .subscribe((res) => {
      if ((res.applied || res.clearAction) && (res.pageUrl === "/dashboard/bulk-shrink-events")) {
        this.commonService.updateQueryParams();
        this.getBulkShrinkEventsData();
      }
    });
  }

  getBulkShrinkEventsData() {
    let time = new Date().getTime() / 1000;
    this.isLoading = true;
    this.bulkShrinkEventsSubscription$ = this.bulkShrinkEventsService
      .getBulkEvents()
      .subscribe((res: { headers: string[], data: BulkShrinkEvents[] }) => {
        if (res) {
          const formattedColumns = [
            {field: 'Event ID', headerName: this.translateService.instant('Bulk Event ID'),  colId: 'BulkID',minWidth:180, filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Event Time', headerName: this.translateService.instant('Date/Time'), colId: 'Date/Time', minWidth:210, filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Site Code', headerName: this.translateService.instant('Site ID'), colId: 'SiteID', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Site Name', headerName: this.translateService.instant('Site Name'), colId: 'Site Name', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Exit Door ID', headerName: this.translateService.instant('Exit Door'), colId: 'Exit Door',minWidth:210, filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Event Count', headerName: this.translateService.instant('Event Count'), colId: 'Event Count', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Action', headerName: this.translateService.instant('Action'), colId: 'Action',cellRenderer: ActionColumnComponent, floatingFilter: false}
          ]

          this.bulkColumnDef = [...formattedColumns]

          const responseTime = (new Date().getTime() / 1000) - time;
          this.dataDogService.log("BulkShrinkEventsComponent", this.getBulkShrinkEventsData.name, "Overall Time for Getting Bulk Shrink Event Data: " + responseTime + " seconds", responseTime);

          this.bulkShrinkEvents = res.data.map(item => {
            item["Site Name"] = this.siteApiResponseService.getSiteNameBySiteCode(item["Site Code"]);
            return { ...item, ...this.bulkColumnDef };
          });
          this.updatedBulkShrinkHeaders = this.bulkColumnDef;
          this.allTableHeaders = this.bulkColumnDef;
          this.commonService.setTotalBulkEventCount(this.bulkShrinkEvents.length)
        }
        
        this.isLoading = false;
      });
    }

  downloadCsvFile() {
    const filteredData = this.bulkShrinkEvents.map((item) => {
      return this.generateFormattedData(item);
    });

    let url = this.router.url;
    let fileName = '';
    if (url.endsWith('/bulk-shrink-events')) {
      fileName = this.translateService.instant('Bulk_shrink');
    } else if (url.includes('/bulk-shrink-events?day=')) {
      fileName = this.translateService.instant('Bulk_shrink_day_of_the_week');
    } else if (url.includes('/bulk-shrink-events?hour=')) {
      fileName = this.translateService.instant('Bulk_shrink_hours_of_the_day');
    }
    this.commonService.downloadFile(filteredData, fileName, this.commonService.startDate, this.commonService.endDate);
  }

  generateFormattedData(item: BulkShrinkEvents) {
    const formattedData: any = {};
    formattedData[this.translateService.instant("Bulk Event ID")] = item["Event ID"];
    formattedData[this.translateService.instant("Date/Time")] = item["Event Time"];
    formattedData[this.translateService.instant("Site ID")] = item["Site Code"];
    formattedData[this.translateService.instant("Site Name")] = item["Site Name"];
    formattedData[this.translateService.instant("Exit Door")] = item["Exit Door ID"];
    formattedData[this.translateService.instant("Event Count")] = item["Event Count"];
    formattedData[this.translateService.instant("Assigned Status")] = item["Status"];
    return formattedData;
  }

  setHeadersForBulkShrink(event: any){
    this.updatedBulkShrinkHeaders = [];
    this.updatedBulkShrinkHeaders = this.commonService.setTableHeaders(event, this.allTableHeaders);
    this.bulkColumnDef = this.updatedBulkShrinkHeaders;
  }

  ngOnDestroy() {
    if (this.bulkShrinkEventsSubscription$) {
      this.bulkShrinkEventsSubscription$.unsubscribe();
    }
    if (this.applyFilterSubscription$) {
      this.applyFilterSubscription$.unsubscribe();
    }
  }
}
