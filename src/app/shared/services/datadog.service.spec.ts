import {TestBed} from '@angular/core/testing';
import {CookieService} from 'ngx-cookie';
import {datadogRum} from '@datadog/browser-rum';
import {datadogLogs} from '@datadog/browser-logs';
import {DataDogService} from './datadog.service';

describe('DataDogService', () => {
  let service: DataDogService;
  let cookieServiceMock: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    const cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        DataDogService,
        {provide: CookieService, useValue: cookieServiceSpy},
      ],
    });

    service = TestBed.inject(DataDogService);
    cookieServiceMock = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log message', () => {
    const componentName = 'TestComponent';
    const method = 'testMethod';
    const message = 'Test Message';
    const timeInSeconds = 0.012344;
    cookieServiceMock.get.and.returnValues('user-id', 'tenant-id');
    spyOn(datadogLogs.logger, 'info');
    service.log(componentName, method, message, timeInSeconds);

    const expectedProperties = {
      TenantId: 'tenant-id',
      UserId: 'user-id',
      Method: `${componentName}.${method}`,
      TimeInSeconds: timeInSeconds
    };
    const expectedMessage = jasmine.stringMatching(message);

    expect(cookieServiceMock.get).toHaveBeenCalledWith('uid');
    expect(cookieServiceMock.get).toHaveBeenCalledWith('tenantId');
    expect(datadogLogs.logger.info).toHaveBeenCalled();
    expect(datadogLogs.logger.info).toHaveBeenCalledWith(expectedMessage, expectedProperties);
  });


  it('should not initialize DataDog in LOCAL environment', () => {
    spyOn(datadogRum, 'init');
    spyOn(datadogLogs, 'init');
    spyOn(datadogLogs.logger, 'setHandler');
    spyOn(datadogLogs.logger, 'setLevel');
    service['datadogEnv'] = 'LOCAL';
    service.initializeDataDog();
    expect(datadogRum.init).not.toHaveBeenCalled();
    expect(datadogLogs.init).not.toHaveBeenCalled();
    expect(datadogLogs.logger.setHandler).not.toHaveBeenCalled();
    expect(datadogLogs.logger.setLevel).not.toHaveBeenCalled();
  });


  it('should initialize DataDog in any environment other then LOCAL', () => {
    spyOn(datadogRum, 'init');
    spyOn(datadogLogs, 'init');
    spyOn(datadogLogs.logger, 'setHandler');
    spyOn(datadogLogs.logger, 'setLevel');
    service['datadogEnv'] = 'DEV';
    service.initializeDataDog();
    expect(datadogRum.init).toHaveBeenCalled();
    expect(datadogLogs.init).toHaveBeenCalled();
    expect(datadogLogs.logger.setHandler).toHaveBeenCalled();
    expect(datadogLogs.logger.setLevel).toHaveBeenCalled();
  });

  it('should log error message', () => {
    const componentName = 'TestComponent';
    const method = 'testMethod';
    const message = 'Error Message';
    spyOn(datadogLogs.logger, 'error');
    service.error(componentName, method, message);

    const expectedMessage = `${componentName}.${method} ::  ${message}`;

    expect(datadogLogs.logger.error).toHaveBeenCalled();
    expect(datadogLogs.logger.error).toHaveBeenCalledWith(expectedMessage);
  });
});
