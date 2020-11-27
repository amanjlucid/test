import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventManagerSettingRoutingModule } from './event-manager-setting-routnig.module';
import { EventManagerSettingComponent } from './event-manager-setting.component';


@NgModule({
  imports: [
    CommonModule,
    EventManagerSettingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  
  ],
  declarations: [EventManagerSettingComponent]
})

export class EventManagerSettingModule { }