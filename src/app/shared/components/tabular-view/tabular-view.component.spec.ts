import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabularViewComponent } from './tabular-view.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AgGridModule } from 'ag-grid-angular';
import { Router } from '@angular/router';
import { ShrinkBySites } from 'src/app/modules/shrink-visibility/shrink-visibility.model';
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {MatSelect} from "@angular/material/select";
import { CommonService } from '../../services/common.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieModule } from 'ngx-cookie';
import { DatePipe } from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";

describe('TabularViewComponent', () => {
  let component: TabularViewComponent;
  let fixture: ComponentFixture<TabularViewComponent>;
  let router: Router;
  let mockMatSelect: Partial<MatSelect>;
  let commonService: CommonService;

  beforeEach(() => {
    mockMatSelect = { writeValue: jasmine.createSpy('writeValue') };
    TestBed.configureTestingModule({
      declarations: [TabularViewComponent],
      imports: [RouterTestingModule, AgGridModule, HttpClientTestingModule, CookieModule.forRoot(),TranslateModule.forRoot()],
      providers: [{ provide: MatSelect, useValue: mockMatSelect }, CommonService, DatePipe],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(TabularViewComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    commonService = TestBed.inject(CommonService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set navigate the user to bulk shrink events', () => {
    spyOn(router,'navigateByUrl');
    const data = {
        "hour-of-day": 4,
        "shrink-event-count": 892,
        "bulk-event-count": 44,
        "sweetheart-count": 533
    };
    component.onCellClicked(data,'bulkEventCount')
    expect(router.navigateByUrl).toHaveBeenCalled();
  });

  it('should set navigate the user', () => {
    spyOn(router,'navigateByUrl');
    const data = {
        "hour-of-day": 4,
        "shrink-event-count": 892,
        "bulk-event-count": 44,
        "sweetheart-count": 533
    };
    component.onCellClicked(data,'totalShrinkEvents')
    expect(router.navigateByUrl).toHaveBeenCalled();
  });

  it('should set navigate the user to rfid-exit-read with site code', () => {
    spyOn(router,'navigateByUrl');
    let data: ShrinkBySites[] = [
      {
        'site-code': 'SiteCode1',
        'shrink-event-count': 10,
        'shrink-item-ratio': 0.5,
        'bulk-event-ratio': 0.2,
        'shrink-event-trend': 42
      },
      {
        'site-code': 'SiteCode2',
        'shrink-event-count': 15,
        'shrink-item-ratio': 0.8,
        'bulk-event-ratio': 0.3,
        'shrink-event-trend': 89
      },
    ];
    component.onCellClicked(data,'siteId')
    expect(router.navigateByUrl).toHaveBeenCalled();
  });

  it('should set navigate the user to rfid-exit-read for sweetheart count', () => {
    spyOn(router,'navigateByUrl');
    const data = {
        "hour-of-day": 4,
        "shrink-event-count": 892,
        "bulk-event-count": 44,
        "sweetheart-count": 533
    };
    component.onCellClicked(data,'sweetheartCount')
    expect(router.navigateByUrl).toHaveBeenCalled();
  });
});
