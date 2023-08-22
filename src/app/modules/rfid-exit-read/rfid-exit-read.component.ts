import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonService} from '../../shared/services/common.service';
import {ColDef, ColGroupDef} from 'ag-grid-community';
import {RfidExitReadService} from 'src/app/core/services/rfid-exit-read/rfid-exit-read.service';
import {RFIDList} from './rfid-exit-read.model';
import {SiteApiResponseService} from 'src/app/core/services/site-api-response.service';
import {ActionColumnComponent} from 'src/app/shared/components/action-column/action-column.component';
import {Subscription} from 'rxjs';
import {TranslateService} from "@ngx-translate/core";
import {DataDogService} from "../../shared/services/datadog.service";
import {ActivatedRoute, Params, Router} from "@angular/router";

@Component({
  selector: 'app-rfit-exit-read',
  templateUrl: './rfid-exit-read.component.html',
  styleUrls: ['./rfid-exit-read.component.scss']
})
export class RFIDExitReadComponent implements OnInit, OnDestroy {
  filterSubscription$!: Subscription;
  rfidEventsSubscription$!: Subscription;
  rfidEventsList: RFIDList[] = [];
  rfidColumnDef: (ColDef | ColGroupDef)[] = [];
  isLoading!: boolean;
  rfidActionColumnDef: (ColDef | ColGroupDef)[] = [];
  dynamicColumns: string[] = []
  excludedColumns = ["Product Code", "Video URL", "Event ID", "Status"];
  updatedRFIDHeaders: any[] = [];
  allTableHeaders: any[] = [];
  eventContextSubscription$!: Subscription

  constructor(
    public commonService: CommonService,
    private siteApiResponseService: SiteApiResponseService,
    private rfidService: RfidExitReadService,
    public dataDogService: DataDogService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute) {
    this.eventContextSubscription$ = this.commonService.sendEventContext$.subscribe(updatedParams => {
      this.router.navigate([], {
        relativeTo: this.route, queryParams: updatedParams, replaceUrl: true
      });
      this.getRfidEvents(updatedParams);
    });
  }

  ngOnInit(): void {
    this.commonService.sendPageTitle('RFID Exit Read');
    this.getValuesForFilterChange();
    this.getRfidEvents();
  }

  getValuesForFilterChange() {
    this.filterSubscription$ = this.commonService
      .getFilterAppliedValue()
      .subscribe((res) => {
        if ((res.applied || res.clearAction) && (res.pageUrl === "/dashboard/rfid-exit-read")) {
          this.commonService.updateQueryParams();
          this.getRfidEvents();
        }
      });
  }

  getRfidEvents(updatedParams?: Params) {
    this.isLoading = true;
    let time = new Date().getTime() / 1000;
    this.rfidEventsSubscription$ = this.rfidService.getRFIDList(updatedParams)
      .subscribe((res: { headers: string[], data: RFIDList[] }) => {
        if (res) {
          const formattedColumns = [
            {field: 'EPC', headerName: this.translateService.instant('EPC'), minWidth:180,  colId: 'EPC',filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Site Code', headerName: this.translateService.instant('Site ID'),minWidth:140,  colId: 'SiteID', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Site Name', headerName: this.translateService.instant('Site Name'),minWidth:200,  colId: 'Site Name', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Event Time', headerName: this.translateService.instant('Date/Time'),minWidth:210,  colId: 'Event Time', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Last Prior Read', headerName: this.translateService.instant('Prior Read Location'),minWidth:150,  colId: 'Read Point', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Last Read Time', headerName: this.translateService.instant('Prior Read Time'),minWidth:210, colId: 'Prior Read Time', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true},
            {field: 'Exit Door ID', headerName: this.translateService.instant('Exit Location'),minWidth:210, colId: 'Exit Door Id', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true}
          ]

          this.dynamicColumns = res.headers.filter(header => !formattedColumns.some(col => col.field === header) && !this.excludedColumns.includes(header) );

          this.rfidActionColumnDef = [
            {field: 'Action', headerName: this.translateService.instant('Action'), colId: 'Action',cellRenderer: ActionColumnComponent, floatingFilter: false}
          ]

          this.rfidColumnDef = [...formattedColumns, ...this.dynamicColumns.map(header => (
            {field: header, headerName: this.translateService.instant(header), minWidth: 180, colId: header, filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true}
          )), ...this.rfidActionColumnDef];

          const responseTime: number = (new Date().getTime() / 1000) - time
          this.dataDogService.log("RFIDExitReadComponent", this.getRfidEvents.name, "Overall Time for Getting RFID Exit Read Data: " + responseTime + " seconds", responseTime);

          this.rfidEventsList = res.data.map(item => {
            item["Site Name"] = this.siteApiResponseService.getSiteNameBySiteCode(item["Site Code"]);
            const eventTimeEpoch = parseInt(item["Event Time"]);
            item["Event Time"] = new Date(eventTimeEpoch).toISOString().replace(/\.\d+Z$/, "").replace("T",", ");
            return {...item, ...this.rfidColumnDef};
          });
          this.updatedRFIDHeaders = this.rfidColumnDef;
          this.allTableHeaders = this.rfidColumnDef;
        }
        this.isLoading = false;
      })
  }

  generateFormattedData(item: RFIDList, dynamicColumns: string[]) {
    const formattedData: any = {};
    formattedData[this.translateService.instant("EPC")] = item.EPC;
    formattedData[this.translateService.instant("Site ID")] = item["Site Code"];
    formattedData[this.translateService.instant("Site Name")] = item["Site Name"];
    formattedData[this.translateService.instant("Date/Time")] = item["Event Time"];
    formattedData[this.translateService.instant("Prior Read Location")] = item["Last Prior Read"];
    formattedData[this.translateService.instant("Prior Read Time")] = item["Last Read Time"];
    formattedData[this.translateService.instant("Exit Location")] = item["Exit Door ID"];
    formattedData[this.translateService.instant("Assigned Status")] = item["Status"];
    dynamicColumns.forEach((attr) => {
      formattedData[this.translateService.instant(attr)] = item.hasOwnProperty(attr) ? item[attr] ?? '' : '';
    });
    return formattedData;
  }

  downloadCSVFile() {
    const filteredData = this.rfidEventsList.map((item) => {
      return this.generateFormattedData(item, this.dynamicColumns);
    });
    let fileName = this.translateService.instant('Rfid_exit_read');
    this.commonService.downloadFile(filteredData, fileName, this.commonService.startDate, this.commonService.endDate);
  }

  setHeadersForRFID(event: any){
    this.updatedRFIDHeaders = [];
    this.updatedRFIDHeaders = this.commonService.setTableHeaders(event, this.allTableHeaders);
    this.rfidColumnDef = this.updatedRFIDHeaders;
  }

  ngOnDestroy(): void {
    if (this.filterSubscription$) {
      this.filterSubscription$.unsubscribe();
    }
    if (this.rfidEventsSubscription$) {
      this.rfidEventsSubscription$.unsubscribe();
    }
    if (this.eventContextSubscription$) {
      this.eventContextSubscription$.unsubscribe();
    }
  }
}
