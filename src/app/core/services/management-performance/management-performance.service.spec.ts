import { TestBed } from '@angular/core/testing';

import { ManagementPerformanceService } from './management-performance.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonService } from 'src/app/shared/services/common.service';
import { CookieModule, CookieService } from 'ngx-cookie';
import { DatePipe } from '@angular/common';

describe('ManagementPerformanceService', () => {
  let service: ManagementPerformanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
          HttpClientTestingModule,
          CookieModule.forRoot()
      ],
      providers: [
          CommonService,
          CookieService,
          DatePipe
      ]
  });
    service = TestBed.inject(ManagementPerformanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
