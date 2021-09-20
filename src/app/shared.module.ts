import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { SimpleTextFilterComponent } from './kendo-component/simple-text-filter.component';
import { TextFilterComponent } from './kendo-component/text-filter.component';
import { DateFormatPipe } from './_pipes/date-format.pipe'
import { CurrencyFormatPipe } from './_pipes/currency-format.pipe'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateRangeFilterComponent } from './kendo-component/date-range-filter.component';
import { RangeFilterComponent } from './kendo-component/range-filter.component';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { MultiCheckFilterComponent } from './kendo-component/multicheck-filter.component';
import { RoundOffPipe } from './_pipes/round-off.pipe';
import { TreeListModule } from '@progress/kendo-angular-treelist';
import { RetrievedEpcGridComponent } from './assets-portal/asset-energy/retrieved-epc-grid/retrieved-epc-grid.component';

import { MultiCheckTreeListFilterComponent } from './kendo-component/multicheck-treelist-filter.component';
import { DateRangeTreeListFilterComponent } from './kendo-component/date-range-treelist-filter.component';

import { ReportingComponent } from './security-portal/groups/reporting/reporting.component';
import { MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CurrencyMaskDirective, NumberDecimalMaskDirective } from './_directives';
import { AssetRiskComponent } from './asset-resident-info/asset-risk/asset-risk.component';
import { AssetResidentInfoComponent } from './asset-resident-info/asset-resident-info.component';
import { DashboardChartSharedComponent } from './dashboard-chart-shared/dashboard-chart-shared.component';

@NgModule({
  imports: [ FormsModule, ReactiveFormsModule, GridModule, DatePickerModule, CommonModule, ExcelModule, InputsModule, DialogsModule, TreeListModule, MultiSelectModule,  NgMultiSelectDropDownModule],
  declarations: [DateFormatPipe, CurrencyFormatPipe, RoundOffPipe, SimpleTextFilterComponent, DateRangeFilterComponent, MultiCheckTreeListFilterComponent, MultiCheckFilterComponent, RangeFilterComponent,TextFilterComponent, AssetResidentInfoComponent, AssetRiskComponent,DateRangeTreeListFilterComponent,CurrencyMaskDirective, NumberDecimalMaskDirective, RetrievedEpcGridComponent,ReportingComponent, DashboardChartSharedComponent],
  exports: [DateFormatPipe, CurrencyFormatPipe, RoundOffPipe, SimpleTextFilterComponent, DateRangeFilterComponent, MultiCheckTreeListFilterComponent, MultiCheckFilterComponent, RangeFilterComponent,TextFilterComponent, AssetResidentInfoComponent,DateRangeTreeListFilterComponent,CurrencyMaskDirective, NumberDecimalMaskDirective, RetrievedEpcGridComponent,ReportingComponent, DashboardChartSharedComponent]
})

export class SharedModule { }
