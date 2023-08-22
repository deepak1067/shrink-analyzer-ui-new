import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {FilterChange, FilterFields, ShrinkDataRefresh} from 'src/app/modules/shrink-visibility/shrink-visibility.model';
import {saveAs} from "file-saver";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {map} from "rxjs/operators";
import {AuthService} from 'src/app/core/services/auth.service';
import {HttpClient} from '@angular/common/http';
import {DatePipe} from '@angular/common';
import {CookieService} from 'ngx-cookie';
import * as Highcharts from "highcharts";
import * as Papa from 'papaparse';
import {DataDogService} from "./datadog.service";
import { ColDef } from 'ag-grid-community';
import {Params} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  queryParams: any = {};
  startDate!: string | null;
  endDate!: string | null;
  isFilter!: boolean;
  sendRefreshEvent$ = new Subject<boolean>();
  shrinkDataRefresh$ = new Subject<ShrinkDataRefresh>();
  filterChange$ = new Subject<FilterChange>();
  getPageTitle$ = new Subject<string>();
  getBulkEventCount$ = new Subject<number>();
  sendBulkShrinkNavigationClickEvent$ = new Subject<boolean>();
  sendEventContext$ = new Subject<Params>();


  constructor(private authService:AuthService,
    private http: HttpClient,
    public datePipe: DatePipe,
    private cookieService: CookieService,
    private dataDogService:DataDogService) {
      this.setDefaultDateRange();
     }


    setDefaultDateRange() {
      this.startDate = this.datePipe.transform(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 6), 'yyyyMMdd');
      this.endDate = this.datePipe.transform(new Date(), 'yyyyMMdd');
    }
  
    setDefaultQueryParams() {
      this.queryParams = {
        "tenant-id": this.cookieService.get("resTenantId"),
        "start-date": this.startDate,
        "end-date": this.endDate,
        "shrink-only": false
      };
    }
  
     updateQueryParams() {
      const filterValuesString = localStorage.getItem("filterValues");
      if (!filterValuesString) {
        this.setDefaultDateRange();
        this.setDefaultQueryParams();
      } else {
        const filterValues: FilterFields = JSON.parse(filterValuesString);
        this.isFilter = localStorage.getItem('isFilterApplied') !== 'false';
  
        if (this.isFilter) {
          this.startDate = filterValues['start-date'] ? filterValues['start-date']?.replaceAll('-', '') : this.getDefaultStartDate();
          this.endDate = filterValues['end-date'] ? filterValues['end-date']?.replaceAll('-', '') : this.getDefaultEndDate();
  
          let startHour = filterValues["start-time"];
          let endHour = filterValues["end-time"];
  
          this.queryParams = {
            "tenant-id": this.cookieService.get("resTenantId"),
            "start-date": this.startDate,
            "end-date": this.endDate,
            "start-time": startHour,
            "end-time": endHour,
            "site-code": filterValues["site-code"],
            "bulk-tags": filterValues["bulk-tags"],
            'event-label': filterValues["itemLabel"],
            "shrink-only": false,
            "include-not-in-catalog": filterValues["include-not-in-catalog"],
          };
        } else {
          this.setDefaultDateRange();
          this.setDefaultQueryParams();
        }
      }
    }
  
    getDefaultStartDate(): string {
      return <string>this.datePipe.transform(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 6), 'yyyyMMdd');
    }
  
    getDefaultEndDate(): string {
      return <string>this.datePipe.transform(new Date(), 'yyyyMMdd');
    }

  parseCsvData(url: string, method: string) {
    const options = this.authService.getAuthHttpOptions();
    const time = new Date().getTime() / 1000;
    return this.http.get(url, {...options, responseType: 'text'}).pipe(
      map((responseText: string) => {
        const responseTime = (new Date().getTime() / 1000) - time
        this.dataDogService.log("CommonService", this.parseCsvData.name, 'Time for Getting ' + method + ' response: ' + responseTime + " seconds", responseTime)
        const time2 = new Date().getTime() / 1000;
        const parsedData = Papa.parse(responseText, {header: true, skipEmptyLines: true});
        const parsingTime = (new Date().getTime() / 1000) - time2
        this.dataDogService.log("CommonService", this.parseCsvData.name, 'Time for Parsing ' + method + ' CSV Data: ' + parsingTime + " seconds", parsingTime)
        const headers = parsedData.meta.fields;
        const headerTime = (new Date().getTime() / 1000) - time2
        this.dataDogService.log("CommonService", this.parseCsvData.name, 'Time for Parsing ' + method + ' CSV Data as well as get all the Headers: ' + headerTime + " seconds", headerTime)
        return { headers, data: parsedData.data };
      })
    );
  }

  buildQueryParams(params: { [key: string]: any }): string {
    return Object.entries(params)
      .filter(([_, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        } else {
          return value !== undefined && value !== null && value !== '';
        }
      })
      .map(([key, value]) => {
        if ((key === 'start-time' || key === 'end-time') && value === 24) {
          return `${key}=0`;
        } else {
          return `${key}=${encodeURIComponent(value)}`;
        }
      })
      .filter((param) => param !== '')
      .join("&");
  }

  downloadFile(data: any, fileName: string, startDate: string | null, endDate: string | null) {
    const replacer = (key: any, value: null) => value ?? '';
    const header = Object.keys(data[0]);
    let csv = data.map((row: {
      [x: string]: any;
    }) => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');

    const downloadedFileName = `${fileName}_${startDate}_${endDate}.csv`;
    let blob = new Blob(["\uFEFF" + csvArray], {type: 'text/csv;charset=utf-8'});
    saveAs(blob, downloadedFileName);
  }

  downloadChartAsPDF(id: string, fileName: string, startDate: string | null, endDate: string | null) {
    const downloadedFileName = `${fileName}_${startDate}_${endDate}.pdf`;
    let DATA: any = document.getElementById(id);
    html2canvas(DATA).then((canvas: any) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 20;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save(downloadedFileName);
    });
  }

  createChartColumn(chartId: string, xAxisCategories: any[], seriesData: any[], tooltipHeader: string, plotOptions: any): void {
    Highcharts.chart(chartId, {
      chart: {
        type: 'column',
      },
      title: {
        text: '',
      },
      xAxis: {
        title: {
          text: ``,
          style: {
            fontWeight: '400',
            fontSize: '12px',
            fontFamily: 'Montserrat',
            lineHeight: '15px',
            letterSpacing: '0px',
            textAlign: 'right',
            color: '#000000',
          },
        },
        categories: xAxisCategories,
        labels: {
          useHTML: true,
          style: {
            fontWeight: '400',
            fontSize: '10px',
            fontFamily: 'Montserrat',
            lineHeight: '15px',
            letterSpacing: '0px',
            textAlign: 'right',
            color: '#000000',
          },
        },
        crosshair: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
        },
      },
      responsive: true,
      tooltip: {
        headerFormat: `<table>`,
        pointFormat: tooltipHeader,
        footerFormat: `</table>`,
        shared: true,
        useHTML: true,
      },
      credits: {
        enabled: false,
      },
      accessibility: {
        enabled: false,
      },
      plotOptions: plotOptions,
      series: seriesData,
      legend: {
        enabled: false,
      },
    } as any);
  }

  downloadMapAsPDF(id: string, name: string, startDate: string| null,endDate: string | null) {
    const downloadedFileName = `${name}_${startDate}_${endDate}.pdf`;   
    let DATA: any = document.getElementById(id);
    const containerWidth = DATA.offsetWidth; 
    DATA.querySelector('img[alt~="Google"]').style.display = 'none';
    Array.prototype.forEach.call(DATA.getElementsByClassName('gmnoprint'), function(element) {
      element.style.display = 'none';
    });
    let options = {
      width: containerWidth,
      height: 500,
      scale: 2,
      useCORS: true
    };
    html2canvas(DATA,options).then(canvas => {
      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p','px','a4');
      pdf.addImage(imageData,'PNG',10,30,425,200);
      pdf.save(downloadedFileName);
    })
    setTimeout(() => {
      Array.prototype.forEach.call(DATA.getElementsByClassName('gmnoprint'), function(element) {
        element.style.display = '';
      });
      DATA.querySelector('img[alt~="Google"]').style.display = '';
      },1000);
    }

  ////Subjects/////
  sendRefreshClick(value: boolean) {
    this.sendRefreshEvent$.next(value);
  }

  getRefreshClick(): Observable<boolean> {
    return this.sendRefreshEvent$.asObservable();
  }

  sendFilterAppliedValue(value:FilterChange) {
    this.filterChange$.next(value);
  }

  getFilterAppliedValue(): Observable<FilterChange> {
    return this.filterChange$.asObservable();
  }

  sendShrinkDataRefresh(value:ShrinkDataRefresh ) {
    this.shrinkDataRefresh$.next(value);
  }

  getShrinkDataRefresh(): Observable<ShrinkDataRefresh> {
    return this.shrinkDataRefresh$.asObservable();
  }

  sendPageTitle(title:string ) {
    this.getPageTitle$.next(title);
  }

  getPageTitle(): Observable<string> {
    return this.getPageTitle$.asObservable();
  }

  setTotalBulkEventCount(count:number ) {
    this.getBulkEventCount$.next(count);
  }

  getTotalBulkEventCount(): Observable<number> {
    return this.getBulkEventCount$.asObservable();
  }

  getBulkshrinkNavigationClick(): Observable<boolean> {
    return this.sendBulkShrinkNavigationClickEvent$.asObservable();
  }

  sendBulkShrinkNavigationValue(value:boolean) {
    this.sendBulkShrinkNavigationClickEvent$.next(value);
  }

  setTableHeaders(event: any, tableHeaders: ColDef[]): ColDef<any,any>[]{
    let updatedHeaders: ColDef<any, any>[] = [];
    if(event.length > 0){
      tableHeaders.forEach((item:ColDef) => {
        if(event.includes(item.colId)){
          updatedHeaders.push(item);
        }
      });
    }
    return updatedHeaders;
  }

  sendEventContextParam(updatedParams: Params) {
    return this.sendEventContext$.next(updatedParams);
  }
}
