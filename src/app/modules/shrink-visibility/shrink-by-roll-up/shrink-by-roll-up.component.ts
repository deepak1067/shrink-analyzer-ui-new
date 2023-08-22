import {Component, OnDestroy, OnInit} from "@angular/core";
import {Subject, Subscription, take, takeUntil} from "rxjs";
import {ShrinkVisibilityService} from "src/app/core/services/shrink-visibility/shrink-visibility.service";
import {ColDef, ColGroupDef} from "ag-grid-community";
import {ShrinkEventsByProductAttributes} from "../shrink-visibility.model";
import {ActivatedRoute, Router} from "@angular/router";
import {tap} from "rxjs/operators";
import {getCurrencySymbol} from "@angular/common";
import {CommonService} from '../../../shared/services/common.service';
import {TranslateService} from "@ngx-translate/core";
import {DataDogService} from "../../../shared/services/datadog.service";

@Component({
  selector: "app-shrink-by-roll-up",
  templateUrl: "./shrink-by-roll-up.component.html",
  styleUrls: ["./shrink-by-roll-up.component.scss"],
})
export class ShrinkByRollUpComponent implements OnInit, OnDestroy {
  viewType: string = "chart";
  selectedValue: string = "";
  productAttributes: string[] = [];
  productAttributeSubscription!: Subscription;
  shrinkEventsByProductAttributes: ShrinkEventsByProductAttributes[] = [];
  shrinkEventsSubscription!: Subscription;
  rollUpColumnDef: (ColDef | ColGroupDef)[] = [];
  private unsubscribe$: Subject<void> = new Subject<void>();
  chartId!: string;
  isLoading = false;
  updatedRollupHeaders: any[] = [];
  allTableHeaders: any[] = [];

  constructor(
    public shrinkVisibilityService: ShrinkVisibilityService,
    private route: ActivatedRoute,
    private router: Router,
    public commonService: CommonService,
    public dataDogService:DataDogService,
    public translateService : TranslateService
  ) { }

  ngOnInit(): void {
    this.getProductAttributes()
      .pipe(
        tap(() => {
          this.route.queryParams
            .pipe(take(1), takeUntil(this.unsubscribe$))
            .subscribe((params) => {
              const attribute = params["attribute"];
              if (!attribute) {
                this.setQueryParamsAndLoadData(this.selectedValue);
              } else {
                this.setQueryParamsAndLoadData(attribute);
              }
            });
        })
      )
      .subscribe();
  }

  getProductAttributes() {
    let time = new Date().getTime()/1000;
    return this.shrinkVisibilityService.getProductAttributes().pipe(
      tap((res: string[]) => {
        if (res && res.length > 0) {
          this.productAttributes = [...res];
          const responseTime = (new Date().getTime() / 1000) - time
          this.dataDogService.log("ShrinkByRollUpComponent", this.getProductAttributes.name, "Overall Time for Getting Shrink Events by Product Attributes Data: " + responseTime + " seconds", responseTime);
          this.selectedValue = this.productAttributes[0];
        }
      })
    );
  }

  setQueryParamsAndLoadData(attribute: string) {
    this.filterByProductAttribute(attribute);
  }

  generateDynamicColumnDef(attribute: string) {
    this.rollUpColumnDef = [
      { field: 'Value', headerName: this.translateService.instant(attribute), colId: attribute, filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true,
        valueGetter: (params) => params.data.formattedData[attribute] },
      { field: 'Quantity', headerName: this.translateService.instant('Total Shrink Events'), colId: 'Quantity', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true,
        valueGetter: (params) => params.data.formattedData[this.translateService.instant("Total Shrink Events")] },
      { field: 'Amount', headerName: this.translateService.instant('Total Product Value'), colId: 'Amount', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true,
        valueGetter: (params) => params.data.formattedData[this.translateService.instant('Total Product Value')] },
      { field: 'Ratio', headerName: this.translateService.instant('Shrink %'), colId: 'Currency', filter: 'agTextColumnFilter', suppressMenu: true, unSortIcon: true,
        valueGetter: (params) => params.data.formattedData[this.translateService.instant('Shrink %')] },
    ];
    this.updatedRollupHeaders = this.rollUpColumnDef;
    this.allTableHeaders = this.rollUpColumnDef;
  }

  currencyCellRenderer(params: any) {
    const currencySymbol = getCurrencySymbol(params.data.Currency, "narrow");
    return `${currencySymbol} ${params.value}`;
  }

  getShrinkEventsData(attribute: string) {
    this.isLoading = true;
    let time = new Date().getTime()/1000;
    this.shrinkEventsSubscription = this.shrinkVisibilityService
      .getShrinkEventsByProductAttributeData(attribute)
      .subscribe((res: { headers: string[], data: ShrinkEventsByProductAttributes[] }) => {
        if (res) {
          const responseTime = (new Date().getTime() / 1000) - time
          this.dataDogService.log("ShrinkByRollUpComponent", this.getShrinkEventsData.name, "Overall Time for Getting Shrink Events Data: " + responseTime + " seconds", responseTime);
          this.shrinkEventsByProductAttributes = res.data.map(item => {
            return {
              ...item,
              formattedData: this.generateFormattedData(item),
            };
          });
        }
        this.isLoading = false;
      });
  }

  onToggleClick(event: string) {
    if (event) {
      this.viewType = event;
    }
  }

  downloadFile(_event: string) {
    const startDate = this.commonService.startDate;
    const endDate = this.commonService.endDate;
    const fileName = this.translateService.instant(`Rollup_by_`) + `${this.selectedValue}`;
    if (this.viewType === 'table') {
      const filteredData = this.shrinkEventsByProductAttributes.map((item) => {
        return this.generateFormattedData(item);
      });
      this.commonService.downloadFile(filteredData, fileName, startDate, endDate);
    } else if (this.viewType === 'chart') {
      this.commonService.downloadChartAsPDF(this.chartId, fileName, startDate, endDate);
    }
  }

  getChartId(event: string) {
    this.chartId = event;
  }

  generateFormattedData(item: ShrinkEventsByProductAttributes) {
    const formattedData: any = {};
    formattedData[this.selectedValue] = item.Value;
    formattedData[this.translateService.instant("Total Shrink Events")] = item.Quantity;
    formattedData[this.translateService.instant("Total Product Value")] = this.currencyCellRenderer({data: {Currency: item.Currency}, value: item.Amount});
    formattedData[this.translateService.instant("Shrink %")] = (item.Ratio * 100).toFixed(2);
    return formattedData;
  }

  filterByProductAttribute(attribute: string) {
    this.selectedValue = attribute;
    this.generateDynamicColumnDef(attribute);
    this.getShrinkEventsData(attribute);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {attribute},
      queryParamsHandling: "merge",
    });
  }

  setHeadersForShrinkByRollUp(event: any){
    this.updatedRollupHeaders = [];
    this.updatedRollupHeaders = this.commonService.setTableHeaders(event, this.allTableHeaders);
    this.rollUpColumnDef = this.updatedRollupHeaders;
  }

  ngOnDestroy() {
    this.productAttributeSubscription?.unsubscribe();
    this.shrinkEventsSubscription?.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
