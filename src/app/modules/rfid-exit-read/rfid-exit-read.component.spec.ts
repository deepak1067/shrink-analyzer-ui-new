import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RFIDExitReadComponent } from './rfid-exit-read.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonService } from 'src/app/shared/services/common.service';
import { DatePipe } from '@angular/common';
import { CookieModule, CookieService } from 'ngx-cookie';
import { AuthService } from 'src/app/core/services/auth.service';
import { MaterialModule } from 'src/app/shared/module/material.module';
import { RfidExitReadService } from 'src/app/core/services/rfid-exit-read/rfid-exit-read.service';
import { of } from 'rxjs';
import { FilterChange } from '../shrink-visibility/shrink-visibility.model';
import {TranslateModule} from "@ngx-translate/core";
import {RouterTestingModule} from "@angular/router/testing";
import {RFIDList} from "./rfid-exit-read.model";
import { SharedModule } from 'src/app/shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RFIDExitReadComponent', () => {
  let component: RFIDExitReadComponent;
  let commonService:CommonService
  let fixture: ComponentFixture<RFIDExitReadComponent>;
  let rfidService: RfidExitReadService;

  const mockExitEvents: RFIDList[] = [
    {
      "Event Time": "2020-12-23T12:22:36Z",
      "Event ID": "Event ID 5",
      "EPC": "EPC 1",
      "Site Code": "SiteCode10",
      "Exit Door ID": "Exit Door ID 4",
      "Last Prior Read": "Last Prior Read 6",
      "Last Read Time": "2022-07-07T02:18:39Z",
      "Status": "Others",
      "Video URL": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "Product Code": "Product 2",
      "Color": "Color1",
      "Size": "Size1",
      "Style": "Style1"
    }
  ];

  const tableHeaders = [
    {
        field: "EPC",
        colId: "EPC",
        headerName: "EPC",
        filter: "agTextColumnFilter",
        suppressMenu: true,
        unSortIcon: true,
        hide: false
    },
    {
        field: "Site Code",
        colId: "SiteID",
        headerName: "Site ID",
        filter: "agTextColumnFilter",
        suppressMenu: true,
        unSortIcon: true,
        hide: false
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RFIDExitReadComponent],
      imports:[HttpClientTestingModule,NoopAnimationsModule, RouterTestingModule,SharedModule, CookieModule.forRoot(), MaterialModule, TranslateModule.forRoot()],
      providers: [AuthService, CookieService, DatePipe, CommonService, RfidExitReadService],
    });
    fixture = TestBed.createComponent(RFIDExitReadComponent);
    commonService = TestBed.inject(CommonService);
    rfidService = TestBed.inject(RfidExitReadService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send page Title', ()=>{
    spyOn(commonService ,'sendPageTitle')
    component.ngOnInit()
    expect(commonService.sendPageTitle).toHaveBeenCalledWith('RFID Exit Read')
  });

  it('should call get rfid events if applied is true', () => {
    const updateFilter:FilterChange = {
      applied: true,
      clearAction: false,
      pageUrl: '/dashboard/rfid-exit-read'
  };
    spyOn(commonService, 'getFilterAppliedValue').and.returnValue(of(updateFilter));
    spyOn(component, 'getRfidEvents');
    component.getValuesForFilterChange();
    expect(component.getRfidEvents).toHaveBeenCalled();
  });

  it('should call downloadFile() with correct arguments when downloadCSVFile() is called', () => {
    spyOn(component, 'generateFormattedData').and.callThrough();
    spyOn(commonService, 'downloadFile');
    component.rfidEventsList = mockExitEvents;
    component.downloadCSVFile();
    expect(component.generateFormattedData).toHaveBeenCalledTimes(mockExitEvents.length);
    const expectedFilteredData = mockExitEvents.map((item) => {
      return component.generateFormattedData(item, component.dynamicColumns);
    });

    expect(commonService.downloadFile).toHaveBeenCalledWith(
      expectedFilteredData,'Rfid_exit_read',component.commonService.startDate,component.commonService.endDate
    );
  });

  it('should fetch RFID events', () => {
    const response = {
      headers: ['EPC', 'Site Code', 'Site Name', 'Event Time', 'Last Prior Read', 'Last Read Time', 'Exit Door ID'],
      data: mockExitEvents,
    };

    spyOn(rfidService, 'getRFIDList').and.returnValue(of(response));

    component.getRfidEvents();

    expect(rfidService.getRFIDList).toHaveBeenCalled();
    expect(component.rfidEventsList.length).toBe(mockExitEvents.length);
  });

  it("should generate RFID formatted data correctly", () => {
    component.dynamicColumns = ["Color", "Size", "Style"];

    const formattedData = component.generateFormattedData(mockExitEvents[0], component.dynamicColumns);

    expect(formattedData["EPC"]).toEqual("EPC 1");
    expect(formattedData["Site ID"]).toEqual("SiteCode10");
    expect(formattedData["Prior Read Location"]).toEqual("Last Prior Read 6");
    expect(formattedData["Prior Read Time"]).toEqual("2022-07-07T02:18:39Z");
    expect(formattedData["Exit Location"]).toEqual("Exit Door ID 4");
    expect(formattedData["Assigned Status"]).toEqual("Others")
    expect(formattedData["Color"]).toEqual("Color1");
    expect(formattedData["Size"]).toEqual("Size1");
    expect(formattedData["Style"]).toEqual("Style1");
  });

  it('should set the updated headers for RFID', () => {
    spyOn(commonService,'setTableHeaders').and.returnValue(tableHeaders);
    const event = ['EPC', 'SiteID'];
    component.setHeadersForRFID(event);
    expect(component.rfidColumnDef.length).toEqual(2);
   });
   
  it('should call getRfidEvents method on event context subscription', () => {
    const commonService = TestBed.inject(CommonService);
    const rfidService = TestBed.inject(RfidExitReadService);

    spyOn(rfidService, 'getRFIDList').and.returnValue(of({
      headers: ['EPC', 'Site Code', 'Site Name', 'Event Time', 'Last Prior Read', 'Last Read Time', 'Exit Door ID'],
      data: mockExitEvents,
    }));

    commonService.sendEventContext$.next({ 'event-context': '120', 'event-id': '29HbZj' });

    expect(rfidService.getRFIDList).toHaveBeenCalledWith({ 'event-context': '120', 'event-id': '29HbZj' });
  });
});
