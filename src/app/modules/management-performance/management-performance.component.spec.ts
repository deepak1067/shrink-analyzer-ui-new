import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementPerformanceComponent } from './management-performance.component';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieModule, CookieService } from 'ngx-cookie';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ManagementPerformanceService } from 'src/app/core/services/management-performance/management-performance.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('ManagementPerformanceComponent', () => {
  let component: ManagementPerformanceComponent;
  let commonService:CommonService
  let fixture: ComponentFixture<ManagementPerformanceComponent>;
  let managementPerformanceService: ManagementPerformanceService;

  const cardsData = {
    headers: [ "user", "no_of_logins", "no_of_validated_events", "percent_validated_events",
      "total_duration", "avg_duration", "no_of_abandoned_sessions" ],
    data: [
      {
          "user": "Alice",
          "no_of_logins": "10",
          "no_of_validated_events": "8",
          "percent_validated_events": "80.0",
          "total_duration": "240",
          "avg_duration": "30",
          "no_of_abandoned_sessions": "2"
      },     
      {
          "user": "Eve",
          "no_of_logins": "12",
          "no_of_validated_events": "10",
          "percent_validated_events": "83.3",
          "total_duration": "300",
          "avg_duration": "30",
          "no_of_abandoned_sessions": "1"
      }
    ]
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagementPerformanceComponent],
      imports:[HttpClientTestingModule, CookieModule.forRoot(), RouterTestingModule],
      providers: [AuthService, CookieService, DatePipe, CommonService, ManagementPerformanceService],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(ManagementPerformanceComponent);
    commonService = TestBed.inject(CommonService);
    managementPerformanceService = TestBed.inject(ManagementPerformanceService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send page Title', () => {
    spyOn(commonService ,'sendPageTitle')
    component.ngOnInit();
    expect(commonService.sendPageTitle).toHaveBeenCalledWith('MANAGEMENT PERFORMANCE');
  });

  it('should set default cards', () => {
    component.setDefaultCards();
    expect(component.cards.length).toEqual(6);
  });

  it('should get card data from assets', () => {
    spyOn(component,'setDefaultCards');
    spyOn(managementPerformanceService,'getCardsData').and.returnValue(of(cardsData));
    component.getDataForCards();
    expect(component.cardData[0].no_of_logins).toEqual('10');
  });
});
