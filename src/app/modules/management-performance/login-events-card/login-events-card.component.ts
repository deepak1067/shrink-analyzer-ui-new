import { Component } from '@angular/core';

@Component({
  selector: 'app-login-events-card',
  templateUrl: './login-events-card.component.html',
  styleUrls: ['./login-events-card.component.scss']
})
export class LoginEventsCardComponent {
  selectedTabId = 0;
  viewType = "chart";
  isLoading: boolean = false;

  onToggleView(event: string){
    this.viewType = event;
  }

  downloadFile(event: string, selectedTabId: number){
    console.log(event,selectedTabId)
  }

}
