import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HnsRoutingModule } from './hns-routnig.module';
import { HnsPortalComponent } from './hns-portal.component';
import { HnsChartComponent } from './hns-chart/hns-chart.component';
import { HnsDefinitionsComponent } from './hns-definitions/hns-definitions.component'
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { SharedModule } from '../shared.module';
import { DropdownComponent } from '../kendo-component/dropdown/dropdown.component'
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { PopupModule } from '@progress/kendo-angular-popup';
import { HnsDefinitionFormComponent } from './hns-definition-form/hns-definition-form.component';
import { HnsSurveyTypeListComponent } from './hns-survey-type-list/hns-survey-type-list.component';
import { GridContextMenuComponent } from '../kendo-component/grid-context-menu.component';
import { HnsDefinitionDetailComponent } from './hns-definition-detail/hns-definition-detail.component';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
// import { ContextMenuModule } from '@progress/kendo-angular-menu';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { TreeviewContextMenuComponent } from '../kendo-component/treeview-context-menu.component'
import { SimpleContextMenuComponent } from '../kendo-component/simple-context-menu.component';
import { KendoTreeNodeColor } from '../_directives/kendo-treenode-colo.directive';
import { HnsDefinitionGroupComponent } from './hns-definition-group/hns-definition-group.component';
import { HnsDefinitionHeadingComponent } from './hns-definition-heading/hns-definition-heading.component';
import { HnsDefinitionQuestionComponent } from './hns-definition-question/hns-definition-question.component';
import { HnsCharacteristicComponent } from './hns-characteristic/hns-characteristic.component';
import { HnsTemplateIssueComponent } from './hns-template-issue/hns-template-issue.component';
import { HnsAddTemplateIssueComponent } from './hns-add-template-issue/hns-add-template-issue.component';
import { HnsTemplateActionComponent } from './hns-template-action/hns-template-action.component';
import { HnsAddTemplateActionComponent } from './hns-add-template-action/hns-add-template-action.component';
import { HnsEditScoringRulesComponent } from './hns-edit-scoring-rules/hns-edit-scoring-rules.component';
import { HnsPriorityListComponent } from './hns-priority-list/hns-priority-list.component';
import { HnsAddPriorityComponent } from './hns-add-priority/hns-add-priority.component';
import { HnsBudgetListComponent } from './hns-budget-list/hns-budget-list.component';
import { HnsAddBudgetComponent } from './hns-add-budget/hns-add-budget.component';
import { HnsScoringBandsComponent } from './hns-scoring-bands/hns-scoring-bands.component';
import { HnsAddScoringBandComponent } from './hns-add-scoring-band/hns-add-scoring-band.component';
import { HnsSeverityListComponent } from './hns-severity-list/hns-severity-list.component';
import { HnsAddSeverityComponent } from './hns-add-severity/hns-add-severity.component';
import { HnsProbabilityListComponent } from './hns-probability-list/hns-probability-list.component';
import { HnsAddProbabilityComponent } from './hns-add-probability/hns-add-probability.component';
import { HnsResultComponent } from './hns-result/hns-result.component';
import { HnsResActionComponent } from './hns-res-action/hns-res-action.component';
import { HnsResHeaderComponent } from './hns-res-header/hns-res-header.component';
import { HnsResAssessmentComponent } from './hns-res-assessment/hns-res-assessment.component';
import { HnsResEditAnswerComponent } from './hns-res-edit-answer/hns-res-edit-answer.component';
import { TextFilterComponent } from '../kendo-component/text-filter.component'
import { AssessmentHeaderPipe } from '../_pipes/hns-res-assessment-header.pipe';
import { MultiCheckFilterComponent } from '../kendo-component/multicheck-filter.component';
import { RangeFilterComponent } from '../kendo-component/range-filter.component';
import { NgbDate, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HnsResAddEditIssueComponent } from './hns-res-add-edit-issue/hns-res-add-edit-issue.component';
import { HnsResAnsImageComponent } from './hns-res-ans-image/hns-res-ans-image.component';
import { HnsResUploadAnsImageComponent } from './hns-res-upload-ans-image/hns-res-upload-ans-image.component';
import { HnsResDocumentComponent } from './hns-res-document/hns-res-document.component';
import { HnsResEditDocumentComponent } from './hns-res-edit-document/hns-res-edit-document.component';
import { HnsResInformationComponent } from './hns-res-information/hns-res-information.component'
import { HnsResTemplateActionComponent } from './hns-res-template-action/hns-res-template-action.component';
import { HnsResTemplateIssueComponent } from './hns-res-template-issue/hns-res-template-issue.component';
import { HnsResSummaryComponent } from './hns-res-summary/hns-res-summary.component';
import { HnsResAssessmenttabComponent } from './hns-res-assessmenttab/hns-res-assessmenttab.component';
import { HnsResEditAssetTextComponent } from './hns-res-edit-asset-text/hns-res-edit-asset-text.component';
import { HnsResInfoEditAnsComponent } from './hns-res-info-edit-ans/hns-res-info-edit-ans.component';
import { SpellCheckerComponent } from '../spell-checker/spell-checker.component';
import { AssessmentBudgetCodeComponent } from './assessment-budget-code/assessment-budget-code.component';
import { ResViewImageComponent } from './res-view-image/res-view-image.component';
import { RiskScorePipe } from '../_pipes/risk-score.pipe';
// import { SimpleTextFilterComponent } from '../kendo-component/simple-text-filter.component';
// import { DateRangeFilterComponent} from '../kendo-component/date-range-filter.component'


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HnsRoutingModule,
    ReactiveFormsModule,
    GridModule,
    ExcelModule,
    InputsModule,
    DialogsModule,
    SharedModule,
    DropDownListModule,
    PopupModule,
    TreeViewModule,
    // ContextMenuModule
    DatePickerModule,
    NgbModule



  ],
  declarations: [
    HnsPortalComponent,
    HnsChartComponent,
    HnsDefinitionsComponent,
    DropdownComponent,
    HnsDefinitionFormComponent,
    HnsSurveyTypeListComponent,
    GridContextMenuComponent,
    HnsDefinitionDetailComponent,
    TreeviewContextMenuComponent,
    SimpleContextMenuComponent,
    KendoTreeNodeColor,
    HnsDefinitionGroupComponent,
    HnsDefinitionHeadingComponent,
    HnsDefinitionQuestionComponent,
    HnsCharacteristicComponent,
    HnsTemplateIssueComponent,
    HnsAddTemplateIssueComponent,
    HnsTemplateActionComponent,
    HnsAddTemplateActionComponent,
    HnsEditScoringRulesComponent,
    HnsPriorityListComponent,
    HnsAddPriorityComponent,
    HnsBudgetListComponent,
    HnsAddBudgetComponent,
    HnsScoringBandsComponent,
    HnsAddScoringBandComponent,
    HnsSeverityListComponent,
    HnsAddSeverityComponent,
    HnsProbabilityListComponent,
    HnsAddProbabilityComponent,
    HnsResultComponent,
    HnsResActionComponent,
    HnsResHeaderComponent,
    HnsResAssessmentComponent,
    HnsResEditAnswerComponent,
    TextFilterComponent,
    AssessmentHeaderPipe,
    MultiCheckFilterComponent,
    RangeFilterComponent,
    HnsResAddEditIssueComponent,
    HnsResAnsImageComponent,
    HnsResUploadAnsImageComponent,
    HnsResDocumentComponent,
    HnsResEditDocumentComponent,
    HnsResInformationComponent,
    HnsResTemplateActionComponent,
    HnsResTemplateIssueComponent,
    HnsResSummaryComponent,
    HnsResAssessmenttabComponent,
    HnsResEditAssetTextComponent,
    HnsResInfoEditAnsComponent,
    SpellCheckerComponent,
    AssessmentBudgetCodeComponent,
    ResViewImageComponent,
    RiskScorePipe,
    // SimpleTextFilterComponent,
    // DateRangeFilterComponent,


    // DateRangeFilterComponent
  ],

 

})

export class HnsModule { }