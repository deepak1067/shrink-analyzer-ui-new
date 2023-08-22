import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import * as Highcharts from "highcharts";
import {Router} from "@angular/router";
import {ShrinkEventsData} from "src/app/modules/shrink-visibility/shrink-visibility.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-shrink-bar-chart",
  templateUrl: "./shrink-bar-chart.component.html",
  styleUrls: ["./shrink-bar-chart.component.scss"],
})
export class ShrinkBarChartComponent implements AfterViewInit{
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @Input() barChartData: ShrinkEventsData[] = [];
  @Input() isEventByDay:number = 0
  @Output() sendChartId: EventEmitter<string> = new EventEmitter<string>();
  xAxisData=['0','','2','','4','','6','','8','','10','','12','','14','','16','','18','','20','','22','']

  constructor(private router: Router, private translateService : TranslateService) {
  }

  ngAfterViewInit() {
    if (this.barChartData.length) {
      this.createChartColumn();
    }
  }
  private createChartColumn(): void {
    Highcharts.chart(this.chartContainer.nativeElement, {
      chart: {
        type: 'column'
      },
      title: {
        text: ''
      },
       responsive: true,
     
      xAxis: {
        categories: this.isEventByDay ? this.xAxisData : this.barChartData.map((data) => data['day-of-week']) ,        labels: {
          useHTML: true,
          style: {
            fontWeight: '400',
            fontSize: '10px',
            fontFamily: 'Montserrat',
            lineHeight: '15px',
            letterSpacing: '0px',
            textAlign: 'right',
            color: '#000000'
          }
        },
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        }
      },
      tooltip: {
        headerFormat: '<table>',
        pointFormat: '<tr><td style="color:#666666; padding:3px; font-size:13px; font-family: \'Montserrat\'">{series.name}</td>'
          + '<td style="color:#333333; font-size:13px; padding-left:20px;text-align: right; font-family: \'Montserrat\'"><b>{point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true,
      },

      credits: {
        enabled: false
      },
      accessibility: {
        enabled: false
      },
      plotOptions: {
        column: {
          pointPadding: 0,
          borderWidth: 0,
          borderRadius: this.isEventByDay ? 5 : 10,
          pointWidth: this.isEventByDay ? 9 : 16,
        },
        series: {
          marker: {
            width: 0
          },
        }
      },
      series: [
        {
          data: this.barChartData.map((data) => data["shrink-event-count"]),
          name: this.translateService.instant("Total Shrink Items"),
          color: "#04C3DE",
          cursor: "pointer",
          events: {
            click: (event: any) => {
              let category= this.isEventByDay ? event.point.index : event.point.category;
              this.navigateToPage(
                category,
                event.point.options.y,
                "TOTAL SHRINK ITEMS"
              );
            },
          },
        },
        {
          data: this.barChartData.map((data) => data["bulk-event-count"]),
          name: this.translateService.instant("Bulk Events"),
          color: "#0081B6",
          cursor: "pointer",
          point: {
            events: {
              click: (event: any) => {
                let category = this.isEventByDay ? event.point.index : event.point.category;
                this.navigateToPage(
                  category,
                  event.point.options.y,
                  "BULK EVENTS"
                );
              },
            },
          },
        },
        {
          data: this.barChartData.map((data) => data["sweetheart-count"]),
          name: this.translateService.instant("Sweetheart"),
          color: "#A46CFA",
          cursor: "pointer",
          events: {
            click: (event: any) => {
              let category = this.isEventByDay ? event.point.index : event.point.category;
              this.navigateToPage(
                category,
                event.point.options.y,
                "SWEETHEART"
              );
            },
          },
        },
      ],
    } as any)
    this.sendChartId.emit('barChart');
  }

  navigateToPage(xAxis: string | number, yAxis: number, data: string) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let value = this.isEventByDay ? {'hour-of-day':xAxis} : {'day-of-week':daysOfWeek.indexOf(xAxis.toString())};

    if (data === "TOTAL SHRINK ITEMS") {
      this.router.navigate(["dashboard/rfid-exit-read"],{ queryParams: {...value, 'shrink-only': true}});
    } else if (data === "BULK EVENTS") {
      this.router.navigate(["dashboard/bulk-shrink-events"],{ queryParams: {...value, bulkEvent: yAxis}});
    } else {
      this.router.navigate(["dashboard/rfid-exit-read"],{ queryParams: {...value, sweetheart: true, 'shrink-only': true}});
    }
  }
}
