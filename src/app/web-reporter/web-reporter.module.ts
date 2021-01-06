import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { SharedModule } from '../shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


import { WebReporterRoutingModule } from './web-reporter-routing.module';
import { WebReporterComponent } from './web-reporter.component';
import { ReportsComponent } from './reports/reports.component';


@NgModule({
  declarations: [WebReporterComponent, ReportsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExcelModule,
    DropDownsModule,
    InputsModule,
    DialogsModule,
    SharedModule,
    GridModule,
    NgMultiSelectDropDownModule,
    WebReporterRoutingModule
  ]
})
export class WebReporterModule { }
