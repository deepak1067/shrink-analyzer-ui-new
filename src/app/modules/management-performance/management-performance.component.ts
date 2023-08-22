import { Component } from '@angular/core';
import { ManagementPerformanceService } from 'src/app/core/services/management-performance/management-performance.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-management-performance',
  templateUrl: './management-performance.component.html',
  styleUrls: ['./management-performance.component.scss']
})
export class ManagementPerformanceComponent {
  cardData: any;
  cards: any[] = [];

  constructor(private commonService:CommonService,
    private managementPerformanceService: ManagementPerformanceService){}

  ngOnInit(): void {
    this.commonService.sendPageTitle('MANAGEMENT PERFORMANCE');
    this.getDataForCards();
  }

  setDefaultCards(){
    this.cards = [
    {
      title: '# of Logins',
      count: '...'
    },
    {
      title: '# of Validated Events',
      count: '...'
    },
    {
      title: 'Avg % of Validated Events',
      count: '...'
    },
    {
      title: 'Total Duration in Mins',
      count: '...'
    },
    {
      title: 'Avg Dur per user in Min',
      count: '...'
    },
    {
      title: '# of Abandoned Sessions',
      count: '...'
    },
  ];
  }

  getDataForCards(){
    this.setDefaultCards();
    this.managementPerformanceService.getCardsData()
      .subscribe((response: any) => {
        if (response.data.length) {
          this.cardData = response?.data;
          this.cards = [{
            title: '# of Logins',
            count: this.cardData[0]?.no_of_logins
          },
          {
            title: '# of Validated Events',
            count: this.cardData[0]?.no_of_validated_events,
          },
          {
            title: 'Avg % of Validated Events',
            count: this.cardData[0]?.percent_validated_events + '%'
          },
          {
            title: 'Total Duration in Mins',
            count: this.cardData[0]?.total_duration
          },
          {
            title: 'Avg Dur per user in Min',
            count: this.cardData[0]?.avg_duration
          },
          {
            title: '# of Abandoned Sessions',
            count: this.cardData[0]?.no_of_abandoned_sessions
          }]
        }
      })
  }
}
