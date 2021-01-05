import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { SharedModule } from '../shared.module';


import { WebReporterRoutingModule } from './web-reporter-routing.module';
import { WebReporterComponent } from './web-reporter.component';
import { ReportsComponent } from './reports/reports.component';


@NgModule({
  declarations: [WebReporterComponent, ReportsComponent],
  imports: [
    CommonModule,
    ExcelModule,
    InputsModule,
    DialogsModule,
    SharedModule,
    GridModule,
    WebReporterRoutingModule
  ]
})
export class WebReporterModule { }
