import { Component } from "@angular/core";
import { Subscription } from "rxjs";
import { ColDef, ColGroupDef } from "ag-grid-community";
import { SiteApiResponseService } from "../../core/services/site-api-response.service";
import { EpcReadListService } from "../../core/services/epc-read-list/epc-read-list.service";
import { EPCReadList } from "./epc-read-list.model";
import { CommonService } from '../../shared/services/common.service';
import {DataDogService} from "../../shared/services/datadog.service";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";

@Component({
  selector: "app-epc-read-list",
  templateUrl: "./epc-read-list.component.html",
  styleUrls: ["./epc-read-list.component.scss"],
})
export class EpcReadListComponent {
  applyFilterSubscription$!: Subscription;
  epcReadListSubscription$!: Subscription;
  epcReadList: EPCReadList[] = [];
  dynamicColumns:string[] = [];
  excludedColumns = ["Read Point", "Exit Event ID", "POS Transaction ID", "Product Code"];
  siteCodeMap: Map<string, string> = new Map();
  isLoading = false;
  public epcColumnDef: (ColDef | ColGroupDef)[] = [];
  newEPCHeaders: any[] = [];
  allEPCTableHeaders: any[] = [];

  constructor(
    public siteApiResponseService: SiteApiResponseService,
    public epcReadListService: EpcReadListService,
    public commonService:CommonService,
    public dataDogService:DataDogService,
    public router: Router,
    public translateService : TranslateService) {
  }

  ngOnInit() {
    this.commonService.sendPageTitle('EPC Read List')
    this.getEpcData();
    this.getFilterAppliedValue();
  }

  getFilterAppliedValue(){
    this.applyFilterSubscription$ = this.commonService
    .getFilterAppliedValue()
    .subscribe((res) => {
      if ((res.applied || res.clearAction) && (res.pageUrl === "/dashboard/epc-read-list")) {
        this.commonService.updateQueryParams();
        this.getEpcData();
      }
    });
  }

  getEpcData() {
    let time = new Date().getTime() / 1000;
    this.isLoading = true;
    this.epcReadListSubscription$ = this.epcReadListService
      .getEPCReadList()
      .subscribe((res: { headers: string[], data: EPCReadList[] }) => {
        if (res) {
          const formattedColumns = [
            { field: 'EPC', headerName: this.translateService.instant('EPC'), minWidth: 180, colId: 'EPC', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true },
            { field: 'Site Code', headerName: this.translateService.instant('SiteID'), minWidth: 140, colId: 'SiteID', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true },
            { field: 'Site Name', headerName: this.translateService.instant('Site Name'), minWidth: 200, colId: 'Site Name', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true },
            { field: 'Event Time', headerName: this.translateService.instant('Date/Time'), minWidth: 210, colId: 'Event Time', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true },
            { field: 'Read Point', headerName: this.translateService.instant('Read Point'), minWidth: 150, colId: 'Read Point', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true },
            { field: 'Last Read Time', headerName: this.translateService.instant('Prior Read Time'), minWidth: 210, colId: 'Prior Read Time', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true }
          ];

          this.dynamicColumns = res.headers.filter(header => !formattedColumns.some(col => col.field === header) && !this.excludedColumns.includes(header) );

          this.epcColumnDef = [...formattedColumns, ...this.dynamicColumns.map(header => (
            { field: header, headerName: this.translateService.instant(header), minWidth: 180, colId: header, filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true }
          ))];

          const responseTime = (new Date().getTime() / 1000) - time;
          this.dataDogService.log("EpcReadListComponent", this.getEpcData.name, "Overall Time for Getting EPC read list Data: " + responseTime + " seconds", responseTime);

          this.epcReadList = res.data.map(item => {
            item["Site Name"] = this.siteApiResponseService.getSiteNameBySiteCode(item["Site Code"]);
            return { ...item, ...this.epcColumnDef };
          });
          this.newEPCHeaders = this.epcColumnDef;
          this.allEPCTableHeaders = this.epcColumnDef;
        }
        this.isLoading = false;
      });
  }

  downloadCSVFile () {
     const filteredData = this.epcReadList.map((item) => {
         return this.generateFormattedData(item, this.dynamicColumns);
     });
    const fileName = this.translateService.instant('Epc_read_list');
    this.commonService.downloadFile(filteredData, fileName, this.commonService.startDate, this.commonService.endDate);
  }
  
  generateFormattedData(item: EPCReadList, dynamicColumns: string[]) {
     const formattedData: any = {};
     formattedData[this.translateService.instant("EPC")] = item.EPC;
     formattedData[this.translateService.instant("SiteID")] = item["Site Code"];
     formattedData[this.translateService.instant("Site Name")] = item["Site Name"];
     formattedData[this.translateService.instant("Date/Time")] = item["Event Time"];
     formattedData[this.translateService.instant("Read Point")] = item["Read Point"];
     formattedData[this.translateService.instant("Prior Read Time")] = item["Last Read Time"];
     dynamicColumns.forEach((attr) => {
         formattedData[this.translateService.instant(attr)] = item.hasOwnProperty(attr) ? item[attr] ?? '' : '';
     });
     return formattedData;
  }

  setHeadersForEPC(event: any){
    this.newEPCHeaders = [];
    this.newEPCHeaders = this.commonService.setTableHeaders(event, this.allEPCTableHeaders);
    this.epcColumnDef = this.newEPCHeaders;
  }

  ngOnDestroy() {
    if (this.epcReadListSubscription$) {
      this.epcReadListSubscription$.unsubscribe();
    }
    if (this.applyFilterSubscription$) {
      this.applyFilterSubscription$.unsubscribe();
    }
  }
}
