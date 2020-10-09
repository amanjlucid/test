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
// import { SimpleTextFilterComponent} from '../kendo-component/simple-text-filter.component';
// import { DateRangeFilterComponent} from '../kendo-component/date-range-filter.component';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';

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
    DatePickerModule
  ],

  declarations: [
    EventManagerComponent,
    EventManagerChartComponent,
    UserEventsGridComponent,
    // SimpleTextFilterComponent,
    // DateRangeFilterComponent
  ],

  

})

export class EventManagerModule { }