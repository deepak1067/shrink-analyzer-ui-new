import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfidExitReadRoutingModule } from './rfid-exit-read-routing.module';
import { RFIDExitReadComponent } from './rfid-exit-read.component';
import { MaterialModule } from 'src/app/shared/module/material.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    RFIDExitReadComponent
  ],
  imports: [
    CommonModule,
    RfidExitReadRoutingModule,
    MaterialModule,
    SharedModule
  ]
})
export class RfidExitReadModule { }
