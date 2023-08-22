import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkShrinkEventsComponent } from './bulk-shrink-events.component';
import {  DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieModule, CookieService } from 'ngx-cookie';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FilterChange } from '../shrink-visibility/shrink-visibility.model';
import { of } from 'rxjs';
import { BulkShrinkEventsService } from 'src/app/core/services/bulk-shrink-events/bulk-shrink-events.service';
import { SiteApiResponseService } from 'src/app/core/services/site-api-response.service';
import {TranslateModule} from "@ngx-translate/core";

describe('BulkShrinkEventsComponent', () => {
  let component: BulkShrinkEventsComponent;
  let commonService:CommonService;
  let bulkShrinkEventsService:BulkShrinkEventsService;
  let siteApiResponseService: SiteApiResponseService
  let fixture: ComponentFixture<BulkShrinkEventsComponent>;
  const mockBulkEventData = [
    {
      'Event Time': 'Time1',
      'Event ID': 'event id 1',
      'Site Code': 'SiteCode1',
      'Exit Door ID': 'EPC1',
      'Event Count': 'SiteCode1',
      'Video URL': 'http://abc/sample/ForBiggerBlazes.mp4',
      'Status': 'Employee',
    },
  ];

  const tableHeaders = [
    {
        field: "EventID",
        colId: "eventId",
        headerName: "Event ID",
        filter: "agTextColumnFilter",
        suppressMenu: true,
        unSortIcon: true,
        hide: false
    },
    {
        field: "Event Time",
        colId: "eventTime",
        headerName: "Date/Time",
        filter: "agTextColumnFilter",
        suppressMenu: true,
        unSortIcon: true,
        hide: false
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkShrinkEventsComponent],
      imports:[HttpClientTestingModule,
         CookieModule.forRoot(),TranslateModule.forRoot()],
      providers: [AuthService, CookieService, DatePipe, CommonService, BulkShrinkEventsService,SiteApiResponseService],
      schemas: [NO_ERRORS_SCHEMA]

    });
    fixture = TestBed.createComponent(BulkShrinkEventsComponent);
    commonService = TestBed.inject(CommonService);
    bulkShrinkEventsService = TestBed.inject(BulkShrinkEventsService);
    siteApiResponseService = TestBed.inject(SiteApiResponseService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send page Title', ()=>{
    spyOn(commonService ,'sendPageTitle')
    component.ngOnInit()
    expect(commonService.sendPageTitle).toHaveBeenCalledWith('BULK SHRINK EVENTS')
  })

  it('should call getBulkShrinkEventsData if applied is true', () => {
    const updateFilter:FilterChange = {
      applied: true,
      clearAction: false,
      pageUrl: '/dashboard/bulk-shrink-events'
  };
    spyOn(commonService, 'getFilterAppliedValue').and.returnValue(of(updateFilter));
    spyOn(component, 'getBulkShrinkEventsData');
    component.getFilterAppliedValue();
    expect(component.getBulkShrinkEventsData).toHaveBeenCalled();
  });

  it("should generate formatted data correctly", () => {
    const formattedData = component.generateFormattedData(mockBulkEventData[0]);
    expect(formattedData["Date/Time"]).toEqual("Time1");
    expect(formattedData["Exit Door"]).toEqual("EPC1");
  });

  it('should call getBulkShrinkEventsData if clearAction is true', () => {
    const updateFilter: FilterChange = {
      applied: false,
      clearAction: true,
      pageUrl: '/dashboard/bulk-shrink-events'
    };
    spyOn(commonService, 'getFilterAppliedValue').and.returnValue(of(updateFilter));
    spyOn(component, 'getBulkShrinkEventsData');
    component.getFilterAppliedValue();
    expect(component.getBulkShrinkEventsData).toHaveBeenCalled();
  });


  it('should handle no data returned from getBulkEvents', () => {
    spyOn(bulkShrinkEventsService, 'getBulkEvents').and.returnValue(of({ headers: [], data: [] }));
    component.getBulkShrinkEventsData();
    expect(component.bulkShrinkEvents.length).toBe(0);
    expect(component.isLoading).toBe(false);
  });

  it('should set the updated headers for bulk shrink', () => {
    spyOn(commonService,'setTableHeaders').and.returnValue(tableHeaders);
    const event = ['eventId', 'eventTime'];
    component.setHeadersForBulkShrink(event);
    expect(component.bulkColumnDef.length).toEqual(2);
   });

  it('should call downloadFile() with correct arguments when downloadCSVFile() is called', () => {
    spyOn(component, 'generateFormattedData').and.callThrough();
    spyOn(commonService, 'downloadFile');
    component.bulkShrinkEvents = mockBulkEventData;
    component.downloadCsvFile();
    expect(component.generateFormattedData).toHaveBeenCalledTimes(mockBulkEventData.length);
    const expectedFilteredData = mockBulkEventData.map((item) => {
      return component.generateFormattedData(item);
    });

    let url = component.router.url;

    let fileName = '';
    if (url.endsWith('/bulk-shrink-events')) {
      fileName = component.translateService.instant('Bulk_shrink');
    } else if (url.includes('/bulk-shrink-events?day=')) {
      fileName = component.translateService.instant('Bulk_shrink_day_of_the_week');
    } else if (url.includes('/bulk-shrink-events?hour=')) {
      fileName = component.translateService.instant('Bulk_shrink_hours_of_the_day');
    }
    expect(commonService.downloadFile).toHaveBeenCalledWith(
      expectedFilteredData,fileName,component.commonService.startDate,component.commonService.endDate
    );
  });
});
