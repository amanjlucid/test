import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventManagerRoutingModule } from './eventmanager-routing.module';
import { EventManagerComponent } from './event-manager.component';
import { EventManagerChartComponent } from './event-manager-chart/event-manager-chart.component';
import { UserEventsGridComponent } from './user-events-grid/user-events-grid.component';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { SharedModule } from '../shared.module';
import { NgbDate, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { EventParametersComponent } from './event-parameters/event-parameters.component';
import { EditService } from '../_services'
import { EventParametersListComponent } from './event-parameters-list/event-parameters-list.component';
import { NotifyComponent } from './notify/notify.component';
import { ManageEventNotifierComponent } from './manage-event-notifier/manage-event-notifier.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import { AddEventComponent } from './add-event/add-event.component';
import { MultiCheckFilterComponent } from '../kendo-component/multicheck-filter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EventManagerRoutingModule,
    ReactiveFormsModule,
    GridModule,
    ExcelModule,
    InputsModule,
    DialogsModule,
    SharedModule,
    DatePickerModule,
    NgbModule
  ],

  declarations: [
    EventManagerComponent,
    EventManagerChartComponent,
    UserEventsGridComponent,
    TaskDetailsComponent,
    EventParametersComponent,
    EventParametersListComponent,
    NotifyComponent,
    ManageEventNotifierComponent,
    EditEventComponent,
    AddEventComponent,
    
   
  ],

  providers: [
    EditService
  ]



})

export class EventManagerModule { }