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
import { WopmTemplatesComponent } from '../Config/wopm-templates/wopm-templates.component';
import { WopmJobrolesComponent } from '../Config/wopm-jobroles/wopm-jobroles.component';
import { WopmEditJobrolesComponent } from '../Config/wopm-jobroles/wopm-edit-jobroles/wopm-edit-jobroles.component';
import { WopmContractTermsComponent } from '../Config/wopm-contract-terms/wopm-contract-terms.component';
import { WopmEditRagStatusComponent } from '../Config/wopm-rag-status/wopm-edit-rag-status/wopm-edit-rag-status.component';
import { WopmRagStatusComponent } from '../Config/wopm-rag-status/wopm-rag-status.component';
import { WopmEditRefusalCodesComponent } from '../Config/wopm-refusal-codes/wopm-edit-refusal-codes/wopm-edit-refusal-codes.component';
import { WopmRefusalCodesComponent } from '../Config/wopm-refusal-codes/wopm-refusal-codes.component';
import { WopmSecJobrolesComponent } from '../Config/wopm-jobroles/wopm-sec-jobroles/wopm-sec-jobroles.component';
import { WopmConfigComponent } from '../Config/wopm-config/wopm-config.component';
import { WopmMasterstagesComponent } from '../Config/wopm-masterstages/wopm-masterstages.component';
import { WopmEditTemplateComponent } from '../Config/wopm-templates/wopm-edit-template/wopm-edit-template.component';
import { WopmEditMasterstageComponent } from '../Config/wopm-masterstages/wopm-edit-masterstage/wopm-edit-masterstage.component';
import { WopmChecklistMasterComponent } from '../Config/wopm-templates/wopm-checklist-master/wopm-checklist-master.component';
import { WopmEditChecklistMasterComponent } from '../Config/wopm-templates/wopm-checklist-master/wopm-edit-checklist-master/wopm-edit-checklist-master.component';
import { WopmEditChecklistDependenciesComponent } from '../Config/wopm-templates/wopm-edit-checklist-dependencies/wopm-edit-checklist-dependencies.component';
import { MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { WorklistComponent } from '../worklist/worklist.component';
import { SwapPackageComponent } from '../swap-package/swap-package.component';
import { NoAccessComponent } from '../no-access/no-access.component';
import { NoAccessHistoryComponent } from '../no-access-history/no-access-history.component';
import { MoveAssetComponent } from '../move-asset/move-asset.component';
import { PhaseChecklistComponent } from '../phase-checklist/phase-checklist.component';
import { AssetRemoveReasonComponent } from '../asset-remove-reason/asset-remove-reason.component';
import { CompletionListComponent } from '../completion-list/completion-list.component';
import { VariationListComponent } from '../variation-list/variation-list.component';
import { VariationWorkListComponent } from '../variation-work-list/variation-work-list.component';
import { VariationFeesComponent } from '../variation-fees/variation-fees.component';
import { VariationNewComponent } from '../variation-new/variation-new.component';
import { VariationAdditionalWorkItemComponent } from '../variation-additional-work-item/variation-additional-work-item.component';
import { VariationChangefeeComponent } from '../variation-changefee/variation-changefee.component';
import { VariationListAllComponent } from '../variation-list-all/variation-list-all.component';
import { BlankVariationComponent } from '../blank-variation/blank-variation.component';
import { VariationAssetComponent } from '../variation-asset/variation-asset.component';
import { VariationDetailComponent } from '../variation-detail/variation-detail.component';
import { VariationAppendComponent } from '../variation-append/variation-append.component';
import { VariationPkzEnterQtyComponent } from '../variation-pkz-enter-qty/variation-pkz-enter-qty.component';
import { WoProgramManagmentInstructionComponent } from '../workorder-program-management/wo-program-management-instructions/wo-program-management-instructions.component';
import { WoPmInstructionAssetsComponent } from '../workorder-program-management/wo-pm-instruction-assets/wo-pm-instruction-assets.component';
import { WoPmInstructionAssetsDetailComponent } from '../workorder-program-management/wo-pm-instruction-assets-detail/wo-pm-instruction-assets-detail.component';
import { ManageMilestonesComponent } from '../manage-milestones/manage-milestones.component';
import { ManageMilestonesEditComponent } from '../manage-milestones-edit/manage-milestones-edit.component';
import { AssetDefectsListComponent } from '../asset-defects-list/asset-defects-list.component';
import { DefectFormComponent } from '../defect-form/defect-form.component';
import { SendEmailComponent } from '../send-email/send-email.component';
import { ProgramLogComponent } from '../programme-log/programme-log/programme-log.component';
import { ProgramTransactionsComponent } from '../programme-log/programme-transactions/programme-transactions.component';
import { WoAssociationsManageComponent } from '../wo-association/wo-association-manage/wo-association-manage.component';
import { WoDocumentListComponent } from '../wo-document-list/wo-document-list.component';
import { WoProgramManagmentPaymentScheduleComponent } from '../workorder-program-management/wo-pm-payment-schedule/wo-pm-payment-schedule.component';
import { WoProgramManagmentEditPaymentScheduleComponent } from '../workorder-program-management/wo-pm-edit-payment-schedule/wo-pm-edit-payment-schedule.component';
import { WoProgramManagmentAddPaymentScheduleComponent } from '../workorder-program-management/wo-pm-add-payment-schedule/wo-pm-add-payment-schedule.component';
import { WoProgramManagmentCreatePaymentScheduleComponent } from '../workorder-program-management/wo-pm-create-payment-schedule/wo-pm-create-payment-schedule.component';
import { ManagementRolesComponent } from '../management-roles/management-roles.component';
import { ManagementSorComponent } from '../management-sor/management-sor.component';
import { ManagementCostsComponent } from '../management-costs/management-costs.component';
import { ManagementEditRolesComponent } from '../management-roles/management-edit-roles/management-edit-roles.component';
import { ManagementEditCostsComponent } from '../management-costs/management-edit-costs/management-edit-costs.component';
import { MilestonesNotesComponent } from '../milestones-notes/milestones-notes.component';
import { MilestonesDocumentListComponent } from '../milestones-document-list/milestones-document-list.component';
import { WoPmPaymentsComponent } from '../workorder-program-management/wo-pm-payments/wo-pm-payments.component';
import { ValuationsComponent } from '../valuations/valuations.component';

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
    PickDateComponent,
    WopmTemplatesComponent,
    WopmConfigComponent,
    WopmMasterstagesComponent,
    WopmEditTemplateComponent,
    WopmEditMasterstageComponent,
    WopmChecklistMasterComponent,
    WopmEditChecklistMasterComponent,
    WopmEditChecklistDependenciesComponent,
    SwapPackageComponent,
    NoAccessComponent,
    NoAccessHistoryComponent,
    MoveAssetComponent,
    PhaseChecklistComponent,
    AssetRemoveReasonComponent,
    CompletionListComponent,
    VariationListComponent,
    VariationWorkListComponent,
    VariationFeesComponent,
    VariationNewComponent,
    VariationAdditionalWorkItemComponent,
    VariationChangefeeComponent,
    VariationListAllComponent,
    BlankVariationComponent,
    VariationAssetComponent,
    VariationDetailComponent,
    VariationAppendComponent,
    VariationPkzEnterQtyComponent,
    WoProgramManagmentInstructionComponent,
    WoPmInstructionAssetsComponent,
    WoPmInstructionAssetsDetailComponent,
    WorklistComponent,
    SwapPackageComponent,
    WopmJobrolesComponent,
    WopmEditJobrolesComponent,
    WopmContractTermsComponent,
    WopmEditRagStatusComponent,
    WopmRagStatusComponent,
    WopmEditRefusalCodesComponent,
    WopmRefusalCodesComponent,
    WopmSecJobrolesComponent,
    AssetDefectsListComponent,
    DefectFormComponent,
    SendEmailComponent,
    WoDocumentListComponent,
    ProgramLogComponent,
    ProgramTransactionsComponent,
    WoAssociationsManageComponent,
    ManageMilestonesComponent,
    ManageMilestonesEditComponent,
    ManagementRolesComponent,
    ManagementSorComponent,
    ManagementCostsComponent,
    ManagementEditRolesComponent,
    ManagementEditCostsComponent,
    MilestonesNotesComponent,
    MilestonesDocumentListComponent,
    WoProgramManagmentPaymentScheduleComponent,
    WoProgramManagmentEditPaymentScheduleComponent,
    WoProgramManagmentAddPaymentScheduleComponent,
    WoProgramManagmentCreatePaymentScheduleComponent,
    WoPmPaymentsComponent,
    ValuationsComponent
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
    TreeListModule,
    NgMultiSelectDropDownModule.forRoot(),
    MultiSelectModule,

  ]

})

export class WorksOrderModule { }
