import {Component, Input, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, Column } from 'ag-grid-community';
import { CommonService } from '../../services/common.service';
import {LanguageTranslationService} from "../../services/language-translation.service";

@Component({
  selector: 'app-tabular-view',
  templateUrl: './tabular-view.component.html',
  styleUrls: ['./tabular-view.component.scss']
})
export class TabularViewComponent implements OnInit{
  @Input() tableRows: any;
  @Input() tableHeaders: ColDef[] = [];
  localeText!: any;
  language!: string;
  columnIds: string[] = [];
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
    floatingFilter: true,
    resizable: true,
    suppressMenu: true,
    wrapHeaderText: true,
    autoHeaderHeight: true
  };
  public autoGroupColumnDef: ColDef = {
    minWidth: 200,
  };
  selectedColumn!: (string | Column)[];
  page!: string;
  public overlayLoadingTemplate =
  '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>';
  public overlayNoRowsTemplate =
  '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">This is a custom \'no rows\' overlay</span>';

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(private router: Router, private commonService: CommonService,
              private localeService: LanguageTranslationService){
  }

  ngOnInit() {
    this.language = this.localeService.initializeLanguage();
    this.setLanguage(this.language)
  }

  setLanguage(language: string): void {
    if (language === 'en') {
      this.localeText = this.localeService.AG_GRID_LOCALE_EN;
    } else if (language === 'es') {
      this.localeText = this.localeService.AG_GRID_LOCALE_ES;
    }else if (language === 'fr'){
      this.localeText = this.localeService.AG_GRID_LOCALE_FR;
    } else if (language === 'pt'){
      this.localeText = this.localeService.AG_GRID_LOCALE_PT;
    }else if (language === 'zh'){
      this.localeText = this.localeService.AG_GRID_LOCALE_ZH;
    }
  }

  onCellClicked( data: any, column : string | undefined): void {
    this.commonService.sendBulkShrinkNavigationValue(false);
    let value;
    if (data.hasOwnProperty('day-of-week')) {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayIndex = daysOfWeek.indexOf(data['day-of-week']);
      value = {'day-of-week': dayIndex};
    }
    else if(data.hasOwnProperty('hour-of-day')){
      value = {'hour-of-day':data['hour-of-day']};
    }
    else if(data.hasOwnProperty('site-code')){
      value = {'site-code':data['site-code']};
    }

    if(column === 'bulkEventCount'){
      this.router.navigate(['/dashboard/bulk-shrink-events'],{ queryParams: {
        ...value
      }});
    }else if(column === 'sweetheartCount' ){
      this.router.navigate(['/dashboard/rfid-exit-read'],{ queryParams: {
        ...value,
        'shrink-only': true,
        sweetheart: true,
      }});
    } else if(column === 'totalShrinkEvents' || column === 'siteId' ){
      this.router.navigate(['/dashboard/rfid-exit-read'],{ queryParams: {
        ...value,
        'shrink-only': true,
      }});
    } else if(column === 'BulkID' ){
      this.commonService.sendBulkShrinkNavigationValue(true);
      this.router.navigate(['/dashboard/rfid-exit-read'],{ queryParams: {
          'event-id': data['Event ID'],
          'shrink-only': true,
          'exit-door-id': data['Exit Door ID']
        }});
    }
    else if(column === 'EPC' && this.router.url.includes('dashboard/rfid-exit-read')){
      this.router.navigate(['/dashboard/epc-read-list'],{ queryParams: {
         'epc': data['EPC'],
      }});
    }
  }
}
