import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class RfidExitReadService {
  private rfidListUrl = `${environment.api.baseUrl}${environment.api.routes.apis.setExitEventLabel}`;

  constructor(private commonService: CommonService,
              private route: ActivatedRoute) {}

  queryParams: any = {};

  getRFIDList(updatedParams?: any): Observable<any> {
    this.commonService.updateQueryParams()
    if (updatedParams!== undefined) {
      this.queryParams = {
        ...this.commonService.queryParams,
        ...updatedParams
      };
    } else {
      this.queryParams = {
        ...this.commonService.queryParams,
        ...updatedParams,
        ...this.route.snapshot.queryParams,
      };
    }
    const url = `${this.rfidListUrl}?${this.commonService.buildQueryParams(this.queryParams)}`;
    return this.commonService.parseCsvData(url, "RFID Exit Read");
  }
}
