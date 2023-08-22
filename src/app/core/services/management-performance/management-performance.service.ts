import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class ManagementPerformanceService {

  constructor(private http: HttpClient,
    private commonService: CommonService){}

  getCardsData(): Observable<any> {
    const data = 'assets/data/mgmtData.csv';
    return this.commonService.parseCsvData(data, "Management Performance");
  }
}
