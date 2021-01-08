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
import { ReportParameterComponent } from './report-parameter/report-parameter.component';
import { ReportParameterListComponent } from './report-parameter-list/report-parameter-list.component';
import { SetUserCategoryComponent } from './set-user-category/set-user-category.component';
import { ManageUserCategoryComponent } from './manage-user-category/manage-user-category.component';
import { CreateUserCategoryComponent } from './create-user-category/create-user-category.component';


@NgModule({
  declarations: [WebReporterComponent, ReportsComponent, ReportParameterComponent, ReportParameterListComponent, SetUserCategoryComponent, ManageUserCategoryComponent, CreateUserCategoryComponent],
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
