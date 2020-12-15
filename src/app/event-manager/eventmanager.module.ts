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
import { TooltipModule } from '@progress/kendo-angular-tooltip';
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
import { TasksComponent } from './tasks/tasks.component';
import { UserEventTaskDetailsComponent } from './user-event-task-details/user-event-task-details.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { UserTaskDataComponent } from './user-task-data/user-task-data.component';
import { AssigntoOtherComponent } from './assignto-other/assignto-other.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EventManagerRoutingModule,
    ReactiveFormsModule,
    GridModule,
    TooltipModule,
    ExcelModule,
    InputsModule,
    DialogsModule,
    SharedModule,
    DatePickerModule,
    NgbModule,
    NgCircleProgressModule.forRoot()
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
    TasksComponent,
    UserEventTaskDetailsComponent,
    UserTaskDataComponent,
    AssigntoOtherComponent

  ],

  providers: [
    EditService
  ]



})

export class EventManagerModule { }