import {Component} from '@angular/core';
import {Subscription} from 'rxjs';
import {Coordinates, ShrinkBySites} from '../shrink-visibility.model';
import {ShrinkVisibilityService} from '../../../core/services/shrink-visibility/shrink-visibility.service';
import {SiteApiResponseService} from "../../../core/services/site-api-response.service";
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { CommonService } from '../../../shared/services/common.service';
import {TranslateService} from "@ngx-translate/core";
import {DataDogService} from "../../../shared/services/datadog.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-highest-shrink-by-sites',
  templateUrl: './highest-shrink-by-sites.component.html',
  styleUrls: ['./highest-shrink-by-sites.component.scss']
})
export class HighestShrinkBySitesComponent {
  shrinkBySites$!: Subscription;
  refreshEvent$!: Subscription;
  shrinkEventsBySite: ShrinkBySites[] = [];
  siteCodeMap: Map<string, string> = new Map();
  isLoading = false;
  viewType: string = "map";
  chartId!: string;
  mapId!: string;
  coordinates: Coordinates[] =[];
  siteCoordinate!: any;
  public eventColumnDef: (ColDef | ColGroupDef)[] = [];
  updatedRFIDHeaders: any[] = [];
  allTableHeaders: any[] = [];

  mapData: ShrinkBySites[] = [];

  constructor(
    public shrinkVisibilityService: ShrinkVisibilityService,
    public siteApiResponseService:SiteApiResponseService,
    public commonService:CommonService,
    public dataDogService:DataDogService,
    public router: Router,
    public translateService: TranslateService) {
  }

  ngOnInit() {
    this.getEventsBySites();
    this.updateColumnHeaders();
  }

  private updateColumnHeaders(): void {
    this.eventColumnDef = [
      { field: 'site-code', colId:'siteId', headerName: this.translateService.instant('Site ID') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true },
      { field: 'site-name', colId:'siteName', headerName: this.translateService.instant('Site Name') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true},
      { field: 'shrink-event-count',colId:'shrinkEvents', headerName: this.translateService.instant('Shrink Events') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true},
      { field: 'bulk-event-ratio',colId:'bulkShrinksPercent', headerName: this.translateService.instant('% Bulk Events') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true,
        valueGetter: (params) => params.data.formattedData[this.translateService.instant('% Bulk Events') ] },
      { field: 'shrink-event-trend',colId:'changeInShrinkPercent', headerName: this.translateService.instant('% Change in Shrink') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true,
        valueGetter: (params) => params.data.formattedData[this.translateService.instant('% Change in Shrink')] },
      { field: 'shrink-event-trend',colId:'trendArrow', headerName: this.translateService.instant('Trend Arrow'),unSortIcon: true, filter: false,
        cellRenderer: (params: { value: number; }) => params.value > 0 ?
          `<img src="assets/svg/Arrow_Green.svg" alt="arrow" height="auto" width="auto">`  :
          `<img src="assets/svg/Arrow_Red.svg" alt="arrow" height="auto" width="auto">`},
      { field: 'shrink-item-ratio',colId:'withoutSales', headerName: this.translateService.instant('WOS %') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true,
        valueGetter: (params) => params.data.formattedData[this.translateService.instant('WOS %')] },
    ];
    this.updatedRFIDHeaders = this.eventColumnDef;
    this.allTableHeaders = this.eventColumnDef;
  }

  getEventsBySites() {
    this.isLoading = true;
    let time = new Date().getTime()/1000;
    this.shrinkBySites$ = this.shrinkVisibilityService.getShrinkEventBySitesData().subscribe((res: ShrinkBySites[]) => {
      if (res) {
        this.shrinkEventsBySite = res.map(item => {
          return {
            ...item,
            formattedData: this.generateFormattedData(item),
          };
        });
        const responseTime = (new Date().getTime() / 1000) - time
        this.dataDogService.log("HighestShrinkBySitesComponent", this.getEventsBySites.name, "Overall Time for Getting Events By Sites Data: " + responseTime + " seconds", responseTime);
        this.shrinkEventsBySite.forEach((item, index) => {
          item["site-name"] = this.siteApiResponseService.getSiteNameBySiteCode(item["site-code"])
        });
        this.updateMapData();
      }
      this.isLoading = false;
    })
  }

  updateMapData() {
    this.mapData = [];
    this.shrinkEventsBySite.forEach((item) => {
      this.siteCoordinate = this.siteApiResponseService.getGeoLocationBySiteName(item["site-name"] ?? '');
      this.coordinates.push(this.siteCoordinate);
      this.mapData.push({
        "site-code": item["site-code"] ?? '',
        "shrink-event-count": item["shrink-event-count"],
        "shrink-item-ratio": item["shrink-item-ratio"],
        "bulk-event-ratio": item["bulk-event-ratio"],
        "shrink-event-trend": item["shrink-event-trend"],
        "site-name": item["site-name"],
        "coordinates": this.siteCoordinate
      });
    });
  }


  onToggleClick(event: string) {
    if (event) {
      this.viewType = event;
    }
  }

  generateFormattedData(item: ShrinkBySites) {
    const formattedData: any = {};
    formattedData[this.translateService.instant("Site ID")] = item["site-code"];
    formattedData[this.translateService.instant("Site Name")] = item["site-name"];
    formattedData[this.translateService.instant("Shrink Events")] = item["shrink-event-count"];
    formattedData[this.translateService.instant("% Bulk Events")] = (item["bulk-event-ratio"]* 100).toFixed(2);
    formattedData[this.translateService.instant("% Change in Shrink")] = item["shrink-event-trend"];
    formattedData[this.translateService.instant("WOS %")] = (item["shrink-item-ratio"]* 100).toFixed(2);
    return formattedData;
  }

  downloadFile(_event: string) {
    const startDate = this.commonService.startDate;
    const endDate = this.commonService.endDate;
    let filteredData: ShrinkBySites[] = [];
    let fileName = this.translateService.instant('Highest_Shrink_By_Sites');
    if (this.viewType === 'table') {
      filteredData = this.shrinkEventsBySite.map((item) => {
        return this.generateFormattedData(item);
      });
      this.commonService.downloadFile(filteredData, fileName, startDate, endDate);
    }
    else if(this.viewType === 'chart'){
      fileName =  fileName + "_" + this.translateService.instant("chart");
      this.commonService.downloadChartAsPDF(this.chartId,fileName,startDate,endDate);
    }
    else if(this.viewType === 'map'){
      fileName = fileName + "_" + this.translateService.instant("map");
      this.commonService.downloadMapAsPDF(this.mapId,fileName,startDate,endDate);
    }
  }

  getChartId(event: string){
    this.chartId = event;
  }

  getMapId(event: string){
    this.mapId = event;
  }

  setHeadersForHighestShrink(event: any){
    this.updatedRFIDHeaders = [];
    this.updatedRFIDHeaders = this.commonService.setTableHeaders(event, this.allTableHeaders);
    this.eventColumnDef = this.updatedRFIDHeaders;
  }

  ngOnDestroy(): void {
    if (this.shrinkBySites$) {
      this.shrinkBySites$.unsubscribe()
    }
    if (this.refreshEvent$) {
      this.refreshEvent$.unsubscribe()
    }
  }
}
