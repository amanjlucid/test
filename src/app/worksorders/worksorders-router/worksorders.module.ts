import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
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
import { TreeListModule } from '@progress/kendo-angular-treelist';
import { WorksordersNewmanagementComponent } from '../worksorders-newmanagement/worksorders-newmanagement.component'
import { WorksordersAssetChecklistComponent } from '../worksorders-asset-checklist/worksorders-asset-checklist.component';
import { WorkorderListComponent } from '../workorder-list/workorder-list.component';
import { WorkOrderFormComponent } from '../workorder-list/workorder-form/workorder-form.component';
import { WorksordersDetailsComponent } from '../worksorders-details/worksorders-details.component';
import { WorksordersNewPhaseComponent } from '../worksorders-new-phase/worksorders-new-phase.component';
import { WorksordersPackageMappingComponent } from '../worksorders-package-mapping/worksorders-package-mapping.component';
import { WorksordersAddAssetsComponent } from '../worksorders-add-assets/worksorders-add-assets.component';
import { WorksordersAssetDetailComponent } from '../worksorders-asset-detail/worksorders-asset-detail.component';
import { WorksordersAddAssetsworklistComponent } from '../worksorders-add-assetsworklist/worksorders-add-assetsworklist.component';
import { WorksordersAddPackageToWorklistComponent } from '../worksorders-add-package-to-worklist/worksorders-add-package-to-worklist.component';
import { WorksordersAddPackageEnterQuantityComponent } from '../worksorders-add-package-enter-quantity/worksorders-add-package-enter-quantity.component';
import { WorksordersAssetChecklistDocumentComponent } from '../worksorders-asset-checklist-document/worksorders-asset-checklist-document.component';
import { WorksordersAssetChecklistPredecessorsComponent } from '../worksorders-asset-checklist-predecessors/worksorders-asset-checklist-predecessors.component';
import { WorksordersAssetChecklistEditDescriptionComponent } from '../worksorders-asset-checklist-edit-description/worksorders-asset-checklist-edit-description.component';
import { WorksordersAssetChecklistUploadDocComponent } from '../worksorders-asset-checklist-upload-doc/worksorders-asset-checklist-upload-doc.component';
import { PickDateComponent } from '../pick-date/pick-date.component';

@NgModule({
  declarations: [
    WorksordersRouterComponent,
    WorksordersDashboardComponent,
    WorksordersManagementComponent,
    WorksordersNewmanagementComponent,
    WorksordersAssetChecklistComponent,
    WorkorderListComponent,
    WorkOrderFormComponent,
    WorksordersDetailsComponent,
    WorksordersNewPhaseComponent,
    WorksordersPackageMappingComponent,
    WorksordersAddAssetsComponent,
    WorksordersAssetDetailComponent,
    WorksordersAddAssetsworklistComponent,
    WorksordersAddPackageToWorklistComponent,
    WorksordersAddPackageEnterQuantityComponent,
    WorksordersAssetChecklistDocumentComponent,
    WorksordersAssetChecklistPredecessorsComponent,
    WorksordersAssetChecklistEditDescriptionComponent,
    WorksordersAssetChecklistUploadDocComponent,
    PickDateComponent
  ],

  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,
    ReactiveFormsModule,
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
