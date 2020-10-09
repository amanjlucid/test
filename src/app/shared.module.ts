import { NgModule } from '@angular/core';
import { SimpleTextFilterComponent } from './kendo-component/simple-text-filter.component';
import { DateFormatPipe } from './_pipes/date-format.pipe'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateRangeFilterComponent } from './kendo-component/date-range-filter.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';

@NgModule({
  imports: [ FormsModule, ReactiveFormsModule, GridModule, DatePickerModule],
  declarations: [DateFormatPipe, SimpleTextFilterComponent, DateRangeFilterComponent],
  exports: [DateFormatPipe, SimpleTextFilterComponent, DateRangeFilterComponent]
})

export class SharedModule { }