import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CookieOptions, CookieService} from 'ngx-cookie';
import {finalize, Observable, of, Subject, takeUntil} from 'rxjs';
import {environment} from 'src/environments/environment';
import {retry} from 'rxjs/operators';
import {Router} from '@angular/router';
import {SiteApiResponseService} from "./site-api-response.service";
import {DataDogService} from "../../shared/services/datadog.service";
import { Site } from 'src/app/dashboard/dashboard.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    SSOUrl = environment.ssoApiUrl;
    domain = environment.api.baseUrl;
    resTenantId: string = "";
    resTenantName: string = "";
    private refreshInterval :any;

  private destroy$ = new Subject<void>();

  constructor(
    private httpClient: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private siteApiResponseService: SiteApiResponseService,
    private dataDogService: DataDogService) {
  }

  /**
   * return token stored in cookie
   */
  getTokenFromCookie(): string | null{
    const token = this.cookieService.get('token');
    if (token && token.trim() !== '') {
      return token;
    }
    return null;
  }

  /**
   * return token stored in cookie
   */
  removeTokenFromCookie(): void {
    this.cookieService.remove('token');
  }

  saveTokenInCookie(token: string): string | null {
    if (token && token.trim() !== '') {
      this.cookieService.put('token', token);
      return token;
    }
    return null;
  }

  /**
   * return tenant id from local cookie
   */
  getTenantIdFromCookie(): string | null{
    const tenantId = this.cookieService.get('tenantId');
    if (tenantId && tenantId.trim() !== '') {
      return tenantId;
    }
    return null;
  }

  /**
   * remove tenant id from local cookie
   */
  removeTenantIdFromCookie(): void {
    this.cookieService.remove('tenantId');
  }

  saveInCookie(key: string, value: string) {
    if (!key && !value) {
      return;
    }
    this.cookieService.put(key, value);
  }

  getFromCookie(key: string) {
    if (!key) {
      return;
    }
    return this.cookieService.get(key);
  }

  removeFromCookie(key: string) {
    if (!key) {
      return;
    }
    this.cookieService.remove(key);
  }

  saveTenantIdInCookie(tenantId: string): string | null{
    if (tenantId && tenantId.trim() !== '') {
      this.cookieService.put('tenantId', tenantId);
      return tenantId;
    }
    return null;
  }

  saveTenantDetailsInCookie() {
    const url = `${this.domain}${environment.api.routes.tenants.getTenant}`;
    let time = new Date().getTime() / 1000;

    this.httpClient.get(url, this.getAuthHttpOptions())
      .pipe(takeUntil(this.destroy$),
        finalize(() => {
          this.destroy$.next();
          this.destroy$.complete();
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.data) {
            const responseData = response.data;
            this.resTenantId = responseData.id;
            this.resTenantName = responseData.name;
            this.saveInCookie('resTenantId', this.resTenantId);
            this.saveInCookie('resTenantName', this.resTenantName);
            const responseTime = (new Date().getTime() / 1000) - time
            this.dataDogService.log("AuthService", this.saveTokenInCookie.name, "Time for Getting TenantId: "
              + this.resTenantId + " is: " + responseTime + " seconds", responseTime);
            this.getSiteData();
          } else {
            this.dataDogService.error("AuthService",this.saveTokenInCookie.name,"Tenant API :: Response data is missing or empty");
            this.router.navigateByUrl('/dashboard/api-error');
          }
        },
        error: (err) => {
          this.dataDogService.error("AuthService",this.saveTokenInCookie.name,"Error fetching Tenant Info: " + err);
          this.router.navigateByUrl('/api-error');
        }
      });
  }

  getSiteData() {
    const tenantId = this.cookieService.get('resTenantId');
    let url = `${this.domain}${environment.api.routes.apis.sites}?tenant-id=${tenantId}`;

    let time = new Date().getTime() / 1000;
    this.httpClient.get<{ data: Site[] }>(url, this.getAuthHttpOptions()).subscribe({
      next: (response) => {
        if (response.data) {
          const responseData = response.data;
          let size = this.siteApiResponseService.setSiteData(responseData);

          if (size > 0) {
            this.router.navigateByUrl('/dashboard');
          }
          const responseTime = (new Date().getTime() / 1000) - time
          this.dataDogService.log("AuthService", this.getSiteData.name, "Overall Time for Getting SITE API Data: "
            + responseTime + " seconds", responseTime);
        } else {
          this.dataDogService.error("AuthService",this.getSiteData.name,"Site API :: Response data is missing or empty");
          this.router.navigateByUrl('/dashboard/api-error');
        }
      },
      error: (err) => {
        this.dataDogService.error("AuthService", this.getSiteData.name, "Error fetching Site Data: " + err)
      }
    });
  }

  /**
   *
   * @param token
   * funtion verfies the token at server
   * @param tenantId
   */
  verifyToken(token: string, tenantId: string): Observable<any> {
    if (!token || token.trim() === '') {
      return of(null);
    }
    const url = `${this.SSOUrl}${environment.api.routes.auth.verifyToken}`;

    // Request payload
    const payload = {
      token: token,
      tenantId: tenantId
    };

    return this.httpClient.post(url, payload).pipe(
      retry(1) // retry a failed request
    );
  }

    fetchTokenFromSSOServer(uuid: string): Observable<any> {
        if (!uuid || uuid.trim() === '' || !this.isValidUUID(uuid)) {
            return of(null);
        }
        const url = this.SSOUrl + '' + environment.api.routes.auth.fetchToken + '/' + encodeURIComponent(uuid);
        return this.httpClient.get(url);
    }

  getRefreshToken(refreshToken: any) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      const logoutReq = {
        url: `${this.SSOUrl}${environment.api.routes.auth.refreshToken}`,
        body: {
          refresh_token: refreshToken
        },
      };

      this.httpClient.post(logoutReq.url, logoutReq.body).subscribe({
        next: (response :any) => {
          this.setToCookie('token', response.id_token, 1);
        },
        error: (error) => {
          this.dataDogService.error("AuthService", this.getRefreshToken.name,'Refresh Token Error: ' + error);
          this.router.navigateByUrl('/dashboard/api-error');
        }
      });
    }, 3540000);
  }

    isValidUUID(uuid: string): boolean {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

  /**
   * fetch the token from sso server
   */
  loginSSO(): void {
    let origin = `${location.origin}/#/`;

    const encodedComponent = encodeURIComponent(origin);
    window.location.href = `${this.SSOUrl}${environment.api.routes.auth.validate}?userid=${null}
    &redirecturl=${encodedComponent}&appId=shrinkanalyzer`;
  }

  getAuthHttpOptions(): { headers: HttpHeaders } {
    const authToken = this.getTokenFromCookie();
    const bearerToken = `Bearer ${authToken}`;
    const headers = new HttpHeaders()
      .set('Authorization', bearerToken);
    return {
      headers
    };
  }

  fetchUserInformation(): Observable<any> {
    const url = `${this.SSOUrl}${environment.api.routes.user.fetch}`;
    const token = this.getTokenFromCookie();
    if (!token) {
      return of(null);
    }
    const payload = {
      token: token
    };
    return this.httpClient.post(url, payload);
  }

  /**
   * remove all cookies from
   */
  clearAllCookies() {
    this.cookieService.removeAll();
  }

  setToCookie(key: string, value: string, expiry?: number) {
    const options: CookieOptions = {};
    if (expiry) {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + expiry);
      options.expires = expirationDate;
    }
    this.cookieService.put(key, value, options);
  }

  logout() {

    // fetch user id from cookie before deleting it.
    this.getFromCookie('uid');
    
    // remove all cookies from local browser
    this.clearAllCookies();
    localStorage.clear();
    let origin = `${location.origin}/#/`;

    // call api to remove cookie from server
    const encodedComponent = encodeURIComponent(origin);
    // redirect logout to sso server
    window.location.href = `${this.SSOUrl}${environment.api.routes.auth.deleteToken}?userid=${null}
    &redirecturl=${encodedComponent}`;
    }
}
