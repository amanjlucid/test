import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { SimpleTextFilterComponent } from './kendo-component/simple-text-filter.component';
import { DateFormatPipe } from './_pipes/date-format.pipe'
import { CurrencyFormatPipe } from './_pipes/currency-format.pipe'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateRangeFilterComponent } from './kendo-component/date-range-filter.component';

import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';

import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { MultiCheckFilterComponent } from './kendo-component/multicheck-filter.component';
import { RoundOffPipe } from './_pipes/round-off.pipe';
import { TreeListModule } from '@progress/kendo-angular-treelist';
import { RetrievedEpcGridComponent } from './assets-portal/asset-energy/retrieved-epc-grid/retrieved-epc-grid.component';





@NgModule({
  imports: [FormsModule, ReactiveFormsModule, GridModule, InputsModule, DialogsModule, DatePickerModule, CommonModule, TreeListModule],
  declarations: [DateFormatPipe, CurrencyFormatPipe, RoundOffPipe, SimpleTextFilterComponent, DateRangeFilterComponent, MultiCheckFilterComponent, RetrievedEpcGridComponent],
  exports: [DateFormatPipe, CurrencyFormatPipe, RoundOffPipe, SimpleTextFilterComponent, DateRangeFilterComponent, MultiCheckFilterComponent, RetrievedEpcGridComponent]
})

export class SharedModule { }