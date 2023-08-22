import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {EpcReadListComponent} from './epc-read-list.component';
import {ShrinkVisibilityService} from '../../core/services/shrink-visibility/shrink-visibility.service';
import {SiteApiResponseService} from '../../core/services/site-api-response.service';
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {EPCReadList} from "./epc-read-list.model";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {CookieModule, CookieService} from "ngx-cookie";
import {AuthService} from "../../core/services/auth.service";
import {DatePipe} from "@angular/common";
import { CommonService } from 'src/app/shared/services/common.service';
import {TranslateModule} from "@ngx-translate/core";

describe('EpcReadListComponent', () => {
  let component: EpcReadListComponent;
  let fixture: ComponentFixture<EpcReadListComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  const mockEPCReadList: EPCReadList[] = [
    {
      "Event Time": "Time1",
      "Exit Event ID": "",
      "POS Transaction ID": "",
      "EPC": "EPC1",
      "Site Code": "SiteCode1",
      "Read Point": "Point1",
      "Last Read Time": "",
      "Product Code": "",
      "product-attributes": []
    },
    {
      "Event Time": "Time2",
      "Exit Event ID": "",
      "POS Transaction ID": "",
      "EPC": "EPC2",
      "Site Code": "SiteCode2",
      "Read Point": "Point2",
      "Last Read Time": "",
      "Product Code": "",
      "product-attributes": []
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EpcReadListComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        CookieModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [
        AuthService,
        CookieService,
        DatePipe,
        SiteApiResponseService,
        CommonService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    commonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;

    fixture = TestBed.createComponent(EpcReadListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getEpcData on ngOnInit', () => {
    spyOn(component, 'getEpcData');
    component.ngOnInit();
    expect(component.getEpcData).toHaveBeenCalled();
  });

  it('should call downloadFile() with correct arguments when downloadCSVFile() is called', () => {
    spyOn(component, 'generateFormattedData').and.callThrough();
    spyOn(commonService, 'downloadFile');
    component.epcReadList = mockEPCReadList;
    component.downloadCSVFile();
    expect(component.generateFormattedData).toHaveBeenCalledTimes(mockEPCReadList.length);
    const expectedFilteredData = mockEPCReadList.map((item) => {
      return component.generateFormattedData(item, component.dynamicColumns);
    });

    expect(commonService.downloadFile).toHaveBeenCalledWith(
      expectedFilteredData,'Epc_read_list',component.commonService.startDate,component.commonService.endDate
    );
   });

   it('should send page Title', ()=>{
    spyOn(commonService ,'sendPageTitle')
    component.ngOnInit()
    expect(commonService.sendPageTitle).toHaveBeenCalledWith('EPC Read List')
  })

  it('should fetch EPC Read List', () => {
    const response = {
      headers: ['EPC', 'Site Code', 'Site Name', 'Event Time', 'Last Read Time'],
      data: mockEPCReadList,
    };

    spyOn(component.epcReadListService, 'getEPCReadList').and.returnValue(of(response));

    component.getEpcData();

    expect(component.epcReadListService.getEPCReadList).toHaveBeenCalled();
    expect(component.epcReadList.length).toBe(mockEPCReadList.length);
  });

  it('should set the updated headers for EPC', () => {
    spyOn(commonService,'setTableHeaders').and.returnValue(tableHeaders);
    const event = ['EPC', 'SiteID'];
    component.setHeadersForEPC(event);
    expect(component.epcColumnDef.length).toEqual(2);
   });
});
