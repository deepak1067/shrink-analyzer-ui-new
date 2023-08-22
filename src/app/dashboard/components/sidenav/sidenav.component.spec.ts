import {ComponentFixture, ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import { SidenavComponent } from './sidenav.component';
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {CookieModule} from "ngx-cookie";
import { DatePipe } from '@angular/common';
import {CommonService} from "../../../shared/services/common.service";

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;
  let commonService: CommonService;

  class MockRouter {
    public event = new NavigationEnd(0, 'http://localhost:4200/dashboard', 'http://localhost:4200/bulk-shrink-events');
    public events = new Observable(observer => {
      observer.next(this.event);
      observer.complete();
    });
    public url = '/dashboard'
  }

  beforeEach(() => {
    // @ts-ignore
    TestBed.configureTestingModule({
      declarations: [SidenavComponent],
      imports: [HttpClientTestingModule, CookieModule.forRoot(),
      TranslateModule.forRoot()],
      providers: [
        RouterTestingModule,
        DatePipe,
        CommonService,
        { provide: ComponentFixtureAutoDetect, useValue: false },
        {
          provide: Router,
          useClass: MockRouter
       }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(SidenavComponent);
    commonService = TestBed.inject(CommonService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resize the content margin to 240 when isMenuOpen is true', () =>{
    component.isMenuOpen = true;
    component.contentMargin = 70;
    component.onToolbarMenuToggle()
    expect(component.contentMargin).toEqual(70);
  });

  it('should resize the content margin to 70 when isMenuOpen is false', () =>{
    component.isMenuOpen = false;
    component.contentMargin = 240;
    component.onToolbarMenuToggle()
    expect(component.contentMargin).toEqual(240);
  });

  it('should return true for active route', () =>{
    const result = component.checkRouteActive('/dashboard');
    expect(result).toEqual(true);
  });

  it('should call sendBulkShrinkNavigationValue function', () =>{
    spyOn(commonService,'sendBulkShrinkNavigationValue');
    component.setContextButtonValue();
    expect(commonService.sendBulkShrinkNavigationValue).toHaveBeenCalledWith(false);
  });
});
