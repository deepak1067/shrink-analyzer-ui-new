import { TestBed } from '@angular/core/testing';

import { RfidExitReadService } from './rfid-exit-read.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieModule } from 'ngx-cookie';
import { DatePipe } from '@angular/common';

describe('RfidExitReadService', () => {
  let service: RfidExitReadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule, CookieModule.forRoot()],
      providers: [DatePipe]
    });
    service = TestBed.inject(RfidExitReadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
