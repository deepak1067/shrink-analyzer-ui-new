import {Injectable} from '@angular/core';
import {datadogRum} from '@datadog/browser-rum';
import {datadogLogs} from '@datadog/browser-logs';
import {environment} from 'src/environments/environment';
import {CookieService} from "ngx-cookie";
import {DeviceDetectorService} from "ngx-device-detector";

@Injectable({
  providedIn: 'root',
})
export class DataDogService {
  private datadogEnv = environment.env;

  constructor(private cookieService: CookieService, private deviceService: DeviceDetectorService) {
  }

  log(componentName: string, method: string, message: string, timeInSeconds: number) {
    const currentTime = new Date();
    const localTime = new Date(currentTime.getTime() - currentTime.getTimezoneOffset() * 60000);
    let userId = this.cookieService.get('uid')
    if (userId === undefined) {
      userId = `"User-Not-Logged-In"`
    }
    const tenantId = this.cookieService.get('tenantId');
    const customProperties: CustomProperties = {
      TenantId: tenantId,
      UserId: userId,
      Method: `${componentName}.${method}`,
      TimeInSeconds: timeInSeconds
    };
    const formattedMessage = `${localTime.toISOString()} - ${message}`;
    datadogLogs.logger.info(formattedMessage, customProperties);
  }

  error(componentName: string, method: string, message: string) {
    const formattedMessage = `${componentName}.${method} ::  ${message}`;
    datadogLogs.logger.error(formattedMessage);
  }

  initializeDataDog() {
    const datadogApplicationId = '4587fc2d-fe31-4bbe-b248-343976bc32d1';
    const datadogClientToken = 'pub642ad443da2be7d89378084029348ff1';
    const datadogSite = 'datadoghq.com';
    const datadogService = 'shrink--analyzer';

    if (this.datadogEnv !== 'LOCAL') {
      datadogRum.init({
        applicationId: datadogApplicationId,
        clientToken: datadogClientToken,
        site: datadogSite,
        service: datadogService,
        env: this.datadogEnv,
        sessionSampleRate: 100,
        sessionReplaySampleRate: 100,
        trackResources: true,
        trackLongTasks: true,
        trackUserInteractions: true,
        defaultPrivacyLevel: 'mask-user-input',
        allowedTracingUrls: ["http://localhost:4200/", "https://shrinkanalyzer.sensormatic.com/",
          "https://dev.shrinkanalyzer.sensormatic.com/", "https://qa.shrinkanalyzer.sensormatic.com/",
          "https://events.sea.dev.cloud.sensormatic.com","https://events.sea.test.cloud.sensormatic.com",
          "https://events.sea.cloud.sensormatic.com"]
      });


      let uinfo = this.cookieService.get('uinfo')
      let email;
      if (uinfo === undefined) {
        email = `"User-Not-Logged-In"`
      } else {
        email = JSON.parse(this.cookieService.get('uinfo') ?? '').email
      }


      let detectedBrowser: string = 'Unknown Browser';

      if (this.deviceService.browser.includes('Chrome')) {
        detectedBrowser = 'Google Chrome';
      } else if (this.deviceService.browser.includes('Firefox')) {
        detectedBrowser = 'Mozilla Firefox';
      } else if (this.deviceService.browser.includes('Safari')) {
        detectedBrowser = 'Apple Safari';
      } else if (this.deviceService.browser.includes('Opera')) {
        detectedBrowser = 'Opera';
      } else if (this.deviceService.browser.includes('Edge')) {
        detectedBrowser = 'Microsoft Edge';
      }


      datadogRum.setUser({
        id: this.cookieService.get('uid'),
        name: this.cookieService.get('uid'),
        email: email,
        browser: detectedBrowser,
        os: this.deviceService.os,
        deviceType: this.deviceService.deviceType
      });

      datadogRum.startSessionReplayRecording();

      // Logs configuration
      datadogLogs.init({
        clientToken: datadogClientToken,
        site: datadogSite,
        service: datadogService,
        env: this.datadogEnv,
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
        beforeSend: () => {
          return true;
        },
      });

      datadogLogs.setUser({
        id: this.cookieService.get('uid'),
        name: this.cookieService.get('uid'),
        email: email,
        browser: detectedBrowser,
        os: this.deviceService.os,
        deviceType: this.deviceService.deviceType
      });

      // Send logs to the console and Datadog (http)
      datadogLogs.logger.setHandler(['http', 'console']);
      datadogLogs.logger.setLevel(environment.datadogLogLevel);
      datadogLogs.logger.info('datadog configured for the environment');
    }
  }


  stopSession() {
    datadogRum.stopSessionReplayRecording();
  }
}

interface CustomProperties {
  TenantId: string | undefined;
  UserId: string | undefined;
  Method: string | undefined;
  TimeInSeconds: number | undefined;
}
