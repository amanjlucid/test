import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { SimpleTextFilterComponent } from './kendo-component/simple-text-filter.component';
import { DateFormatPipe } from './_pipes/date-format.pipe'

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateRangeFilterComponent } from './kendo-component/date-range-filter.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { MultiCheckFilterComponent } from './kendo-component/multicheck-filter.component';
import { RoundOffPipe } from './_pipes/round-off.pipe';



@NgModule({
  imports: [ FormsModule, ReactiveFormsModule, GridModule, DatePickerModule, CommonModule],
  declarations: [DateFormatPipe, RoundOffPipe, SimpleTextFilterComponent, DateRangeFilterComponent, MultiCheckFilterComponent],
  exports: [DateFormatPipe,RoundOffPipe, SimpleTextFilterComponent, DateRangeFilterComponent, MultiCheckFilterComponent]
})

export class SharedModule { }