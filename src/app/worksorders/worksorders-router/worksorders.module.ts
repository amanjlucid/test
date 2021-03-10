import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { SharedModule } from '../../shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbDate, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { WorksOrderRoutingModule } from './worksorders-routing.module';
import { WorksordersRouterComponent } from '../worksorders-router/worksorders-router.component';
import { WorksordersDashboardComponent } from '../worksorders-dashboard/worksorders-dashboard.component';
import { WorksordersManagementComponent } from '../worksorders-management/worksorders-management.component'
import { RetrievedEpcGridComponent } from '../../assets-portal/asset-energy/retrieved-epc-grid/retrieved-epc-grid.component';
import { TreeListModule } from '@progress/kendo-angular-treelist';

@NgModule({
  declarations: [WorksordersRouterComponent, WorksordersDashboardComponent, WorksordersManagementComponent],
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,
    ReactiveFormsModule,
    ExcelModule,
    DropDownsModule,
    InputsModule,
    DialogsModule,
    SharedModule,
    GridModule,
    NgMultiSelectDropDownModule,
    WorksOrderRoutingModule,
    NgbModule,
    TreeListModule
    
  ]
})
export class WorksOrderModule { }
