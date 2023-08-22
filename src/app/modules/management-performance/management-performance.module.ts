import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagementPerformanceRoutingModule } from './management-performance-routing.module';
import { ManagementPerformanceComponent } from './management-performance.component';
import { MaterialModule } from 'src/app/shared/module/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { LoginEventsCardComponent } from './login-events-card/login-events-card.component';


@NgModule({
  declarations: [
    ManagementPerformanceComponent,
    LoginEventsCardComponent
  ],
  imports: [
    CommonModule,
    ManagementPerformanceRoutingModule,
    MaterialModule,
    SharedModule
  ]
})
export class ManagementPerformanceModule { }
