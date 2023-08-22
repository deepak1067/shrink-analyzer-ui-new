import { Component } from "@angular/core";
import { ShrinkEventsData } from "../shrink-visibility.model";
import { ShrinkVisibilityService } from "src/app/core/services/shrink-visibility/shrink-visibility.service";
import { Subscription } from "rxjs";
import { ColDef, ColGroupDef } from "ag-grid-community";
import { CommonService } from '../../../shared/services/common.service';
import {DataDogService} from "../../../shared/services/datadog.service";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";

@Component({
  selector: "app-shrink-event",
  templateUrl: "./shrink-event.component.html",
  styleUrls: ["./shrink-event.component.scss"],
})
export class ShrinkEventComponent {
  isLoading = false;
  selectedTabId = 0;
  barChartId: string = "";
  viewType = "chart";
  subTabs = [
    { id: 0, name: "Day of the Week" },
    { id: 1, name: "Hours of the Day" },
  ];
  days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  dayOfWeekDataSubscription$!: Subscription;
  refreshEventSubscription$!: Subscription;
  hoursOfTheDaySubscription$!: Subscription;
  shrinkEventsByDay: ShrinkEventsData[] = [];
  shrinkEventsByHours: ShrinkEventsData[] = [];
  shrinkEventData:ShrinkEventsData[] = [];
  updatedShrinkHeaders: any[] = [];
  allTableHeaders: any[] = [];

  public eventColumnDef: (ColDef | ColGroupDef)[]= [];
  public ShrinkEventByHoursEventColumnDef: (ColDef | ColGroupDef)[] = [
    { field: 'hour-of-day',colId:'hourOfDay', headerName: this.translateService.instant('Hours of Day') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false },
    { field: 'shrink-event-count',colId:'totalShrinkEvents', headerName: this.translateService.instant('Total Shrink Items') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
    { field: 'bulk-event-count', colId:'bulkEventCount',headerName: this.translateService.instant('Bulk Events') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
    { field: 'sweetheart-count',colId:'sweetheartCount', headerName: this.translateService.instant('Sweetheart') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
  ];
  public ShrinkEventByDayEventColumnDef: (ColDef | ColGroupDef)[] = [
    { field: 'day-of-week',colId:'day', headerName: this.translateService.instant('Day of Week') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false },
    { field: 'shrink-event-count', colId:'totalShrinkEvents', headerName: this.translateService.instant('Total Shrink Items') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
    { field: 'bulk-event-count',colId:'bulkEventCount',  headerName: this.translateService.instant('Bulk Events') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
    { field: 'sweetheart-count',colId:'sweetheartCount', headerName: this.translateService.instant('Sweetheart') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
  ];
  applyFilterSubscription$!: Subscription;
  constructor(
    private shrinkVisibilityService: ShrinkVisibilityService,
    private commonService:CommonService,
    public dataDogService:DataDogService,
    public router : Router,
    private translateService:TranslateService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.getDaysOfWeekData();
    this.getRefreshData()
    this.getFilterData()
    this.updateColumnHeaders();
  }

  private updateColumnHeaders(): void {
    this.ShrinkEventByHoursEventColumnDef = [
      { field: 'hour-of-day',colId:'hourOfDay', headerName: this.translateService.instant('Hours of Day') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false },
      { field: 'shrink-event-count',colId:'totalShrinkEvents', headerName: this.translateService.instant('Total Shrink Items') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
      { field: 'bulk-event-count', colId:'bulkEventCount',headerName: this.translateService.instant('Bulk Events') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
      { field: 'sweetheart-count',colId:'sweetheartCount', headerName: this.translateService.instant('Sweetheart') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
    ];
    this.ShrinkEventByDayEventColumnDef = [
      { field: 'day-of-week',colId:'day', headerName: this.translateService.instant('Day of Week') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false },
      { field: 'shrink-event-count', colId:'totalShrinkEvents', headerName: this.translateService.instant('Total Shrink Items') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
      { field: 'bulk-event-count',colId:'bulkEventCount',  headerName: this.translateService.instant('Bulk Events') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
      { field: 'sweetheart-count',colId:'sweetheartCount', headerName: this.translateService.instant('Sweetheart') ,filter: 'agTextColumnFilter', suppressMenu: true,unSortIcon: true, hide: false},
    ];
    this.updatedShrinkHeaders = this.selectedTabId === 1 ? this.ShrinkEventByHoursEventColumnDef:  this.ShrinkEventByDayEventColumnDef;
    this.allTableHeaders = this.selectedTabId === 1 ? this.ShrinkEventByHoursEventColumnDef:  this.ShrinkEventByDayEventColumnDef;
  }

  getRefreshData(){
    this.refreshEventSubscription$ = this.commonService
    .getRefreshClick()
    .subscribe((res) => {
      if (res){
        if (this.selectedTabId === 1) {
          this.selectedTabId = 0;
        }
       this.isLoading = true;
       this.shrinkEventData=[];
       this.getDaysOfWeekData();
      }
    });
  }

  getFilterData(){
    this.applyFilterSubscription$ = this.commonService.getFilterAppliedValue().subscribe((res) => {
      if ((res.applied || res.clearAction) && res.pageUrl === '/dashboard') {
        this.commonService.updateQueryParams()
        if (this.selectedTabId === 0) {
          this.getDaysOfWeekData();
        } else {
          this.getDataForHoursOfTheDay()
        }
      }
    })
  }
  
  getDaysOfWeekData() {
    let time = new Date().getTime()/1000;
    this.dayOfWeekDataSubscription$ = this.shrinkVisibilityService
      .getShrinkEventsByDay()
      .subscribe((res: ShrinkEventsData[]) => {
        if (res) {
          this.isLoading = false;
          this.shrinkEventsByDay = [...res];
          const responseTime = (new Date().getTime() / 1000) - time
          this.dataDogService.log("ShrinkEventComponent", this.getDaysOfWeekData.name, "Overall Time for Getting Days of Week Data: " + responseTime + " seconds", responseTime);
          this.shrinkEventsByDay.forEach((item, index) => {
            item["day-of-week"] = this.translateService.instant(this.days[index])
          });
          this.eventColumnDef = [...this.ShrinkEventByDayEventColumnDef]
          this.shrinkEventData =[...this.shrinkEventsByDay]
        }
      });
  }

  getDataForHoursOfTheDay() {
    let time = new Date().getTime()/1000;
    this.hoursOfTheDaySubscription$ = this.shrinkVisibilityService.getHoursOfWeekData()
      .subscribe((response: ShrinkEventsData[]) => {
        this.isLoading = false;
        this.shrinkEventsByHours = response;
        const responseTime = (new Date().getTime() / 1000) - time
        this.dataDogService.log("ShrinkEventComponent", this.getDaysOfWeekData.name, "Overall Time for Getting Days of Week Data: " + responseTime + " seconds", responseTime);
        this.eventColumnDef = [...this.ShrinkEventByHoursEventColumnDef]
        this.shrinkEventData =[...this.shrinkEventsByHours]
      });
  }

  onTabChange(event: number) {
    this.viewType = 'chart'
    this.selectedTabId = event;
    this.isLoading = true;
    this.shrinkEventData=[]
    if (event === 0) {
     this.getDaysOfWeekData()
    } else if (event === 1) {
      this.getDataForHoursOfTheDay()
    }
    this.updatedShrinkHeaders = this.selectedTabId === 1 ? this.ShrinkEventByHoursEventColumnDef:  this.ShrinkEventByDayEventColumnDef;
    this.allTableHeaders = this.selectedTabId === 1 ? this.ShrinkEventByHoursEventColumnDef:  this.ShrinkEventByDayEventColumnDef;
  }

  onToggle(event: string) {
    if (event) {
      this.viewType = event;
    }
  }

  generateFormattedData(item: ShrinkEventsData, id: number) {
  const formattedData: any = {};
    if (id === 0) {
      formattedData[this.translateService.instant("Day of Week")] = item["day-of-week"];
    } else if (id === 1) {
      formattedData[this.translateService.instant("Hours of Day")] = item["hour-of-day"];
    }
  formattedData[this.translateService.instant("Total Shrink Items")] = item["shrink-event-count"];
  formattedData[this.translateService.instant("Bulk Events")] = item["bulk-event-count"];
  formattedData[this.translateService.instant("Sweetheart")] = item["sweetheart-count"];
  return formattedData;
}

  downloadFile(_event: string, id: number) {
    const startDate = this.commonService.startDate;
    const endDate = this.commonService.endDate;
    const fileName = this.translateService.instant(this.subTabs[id].name).replace(/ /g, '_');
    let filteredData: ShrinkEventsData[] = [];
    if (this.viewType === "table") {
      if (id === 0) {
        filteredData = this.shrinkEventsByDay.map((item) => {
          return this.generateFormattedData(item, id);
        });
      } else if (id === 1) {
        filteredData = this.shrinkEventsByHours.map((item) => {
          return this.generateFormattedData(item, id);
        });
      }
      this.commonService.downloadFile(filteredData, fileName, startDate, endDate);
    }else if (this.viewType === "chart"){
      this.commonService.downloadChartAsPDF(this.barChartId, fileName, startDate, endDate);
    }
  }

  getChartId(event: string) {
    this.barChartId = event;
  }

  setHeaders(event: any){
    this.updatedShrinkHeaders = [];
    this.updatedShrinkHeaders = this.commonService.setTableHeaders(event, this.allTableHeaders);
    this.eventColumnDef = this.updatedShrinkHeaders;
  }

  ngOnDestroy(): void {
    if (this.dayOfWeekDataSubscription$) {
      this.dayOfWeekDataSubscription$.unsubscribe();
    }
    if (this.refreshEventSubscription$) {
      this.refreshEventSubscription$.unsubscribe();
    }
    if (this.hoursOfTheDaySubscription$) {
      this.hoursOfTheDaySubscription$.unsubscribe();
    }
    if(this.applyFilterSubscription$ ){
      this.applyFilterSubscription$.unsubscribe();
    }
  }
}
