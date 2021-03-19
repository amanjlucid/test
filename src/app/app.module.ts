import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClientJsonpModule  } from '@angular/common/http';
import { routing } from './app.routing';
import { NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { SitelayoutComponent } from './_layout/sitelayout/sitelayout.component';
import { LoginComponent } from './login';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './_guards';
import { JwtInterceptor, ErrorInterceptor, LoaderInterceptorService, NgbDateCustomParserFormatter } from './_helpers';
import { AlertService, AuthenticationService, UserService, LoaderService, GroupService, CharacteristicGroupService, ElementGroupService, AttributeGroupService, PortalGroupService, FunctionSecurityService, PropertySecurityGroupService, ReportingGroupService, ConfirmationDialogService, EventService, AssetAttributeService, SharedService, ServicePortalService, SettingsService, HnsPortalService, HnsResultsService, EventManagerDashboardService, EventManagerService, WebReporterService, SurveyPortalService, WorksorderManagementService, WorksOrdersService } from './_services';


import { AlertComponent, LoaderComponent, KendoGridColor, KendoZindex, MyDatePicker, DecimalValidation } from './_directives';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UsersComponent } from './security-portal/users/users.component';
import { SecurityPortalComponent } from './security-portal/security-portal/security-portal.component';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { GroupsComponent } from './security-portal/groups/groups.component';
import { FunctionSecurityComponent } from './security-portal/groups/function-security/function-security.component';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DataTablesModule } from 'angular-datatables';
import { CharacteristicGroupComponent } from './security-portal/groups/characteristic-group/characteristic-group.component';
import { ElementsGroupComponent } from './security-portal/groups/elements-group/elements-group.component';
import { AttributeGroupComponent } from './security-portal/groups/attribute-group/attribute-group.component';
import { PortalTabsComponent } from './security-portal/groups/portal-tabs/portal-tabs.component';
import { PropertySecurityComponent } from './security-portal/groups/property-security/property-security.component';
import { ReportingComponent } from './security-portal/groups/reporting/reporting.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
// import { DateFormatPipe } from './_pipes/date-format.pipe';
import { AsbestosRefDetailPipe } from './_pipes/asbestos-ref-detail.pipe'
import { NumberFormatPipe } from './_pipes/number-format.pipe';
import { RoundOffPipe } from './_pipes/round-off.pipe';
import { UserFormComponent } from './security-portal/users/user-form/user-form.component';
import { AssetsPortalComponent } from './assets-portal/assets-portal.component';
import { AssetsComponent } from './assets-portal/assets/assets.component';
import { TabWindowComponent } from './assets-portal/tab-window/tab-window.component'
import { AttributesComponent } from './assets-portal/attributes/attributes.component';
import { AssetAttributeComponent } from './assets-portal/asset-attribute/asset-attribute.component';
import { AssetWorkDetailComponent } from './assets-portal/asset-work-detail/asset-work-detail.component';
import { MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { AssetServicingDetailComponent } from './assets-portal/asset-servicing-detail/asset-servicing-detail.component';
import { AssetWagDetailComponent } from './assets-portal/asset-wag-detail/asset-wag-detail.component';
import { AssetCharacteristicsComponent } from './assets-portal/asset-characteristics/asset-characteristics.component';
import { AssetAsbestosComponent } from './assets-portal/asset-asbestos/asset-asbestos.component';
import { AssetEnergyComponent } from './assets-portal/asset-energy/asset-energy.component';
import { AssetSurveysComponent } from './assets-portal/asset-surveys/asset-surveys.component';
import { AssetHSAssessentsComponent } from './assets-portal/asset-hs-assessents/asset-hs-assessents.component';
import { AssetServicingComponent } from './assets-portal/asset-servicing/asset-servicing.component';
import { AssetHhsrsComponent } from './assets-portal/asset-hhsrs/asset-hhsrs.component';
import { AssetWorksManagementComponent } from './assets-portal/asset-works-management/asset-works-management.component';
import { AssetQualityComponent } from './assets-portal/asset-quality/asset-quality.component';
import { AssetNotepadComponent } from './assets-portal/asset-notepad/asset-notepad.component';
import { DefaultComponent } from './assets-portal/default/default.component';
import { AsbestosRequestComponent } from './asbestos/asbestos-request/asbestos-request.component';
import { AsbestosAttachmentComponent } from './asbestos/asbestos-attachment/asbestos-attachment.component';
import { AsbestosEditAttachmentComponent } from './asbestos/asbestos-edit-attachment/asbestos-edit-attachment.component';
import { AsbestosUploadAttachmentComponent } from './asbestos/asbestos-upload-attachment/asbestos-upload-attachment.component';
import { AsbestosAuthComponent } from './asbestos/asbestos-auth/asbestos-auth.component';
import { AsbestosViewAttachmentComponent } from './asbestos/asbestos-view-attachment/asbestos-view-attachment.component';
import { AsbestosManageRequestComponent } from './asbestos/asbestos-manage-request/asbestos-manage-request.component';
import { WorkStatusComponent } from './asbestos/work-status/work-status.component';
import { PrintAcmComponent } from './asbestos/print-acm/print-acm.component';
import { IndividualAssetReportComponent } from './asbestos/individual-asset-report/individual-asset-report.component';
import { ReqFurtherInfoComponent } from './asbestos/req-further-info/req-further-info.component';
import { ServicePortalComponent } from './service-portal/service-portal.component';
import { ServiceChartComponent } from './service-portal/service-chart/service-chart.component';
import { ManagementComponent } from './service-portal/management/management.component';
import { ServiceServicingDetailComponent } from './service-portal/service-servicing-detail/service-servicing-detail.component';
import { ServiceServiceAttributeComponent } from './service-portal/service-service-attribute/service-service-attribute.component';
import { ServiceServiceHistoryComponent } from './service-portal/service-service-history/service-service-history.component';
import { ServiceServiceAttrInfoComponent } from './service-portal/service-service-attr-info/service-service-attr-info.component';
import { ServiceServiceInfoComponent } from './service-portal/service-service-info/service-service-info.component';
import { ServiceServiceInfoEditComponent } from './service-portal/service-service-info-edit/service-service-info-edit.component';
import { ServiceServiceNotepadsComponent } from './service-portal/service-service-notepads/service-service-notepads.component';
import { ServiceUploadAttachmentComponent } from './service-portal/service-upload-attachment/service-upload-attachment.component';
import { ServiceEditNotepadComponent } from './service-portal/service-edit-notepad/service-edit-notepad.component';
import { ServiceResidentContactsComponent } from './service-portal/service-resident-contacts/service-resident-contacts.component';
import { ServiceSettingsComponent } from './setting/service-settings/service-settings.component';
import { SharedModule } from './shared.module';
import { HnsSettingsComponent } from './hns-settings/hns-settings.component';
import { SpellCheckerModule } from 'ngx-spellchecker';
import { HnsReportImagesComponent } from './hns-report-images/hns-report-images.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { AssetEpcComponent } from './assets-portal/asset-epc/asset-epc.component';
import { AssetEpcHistoryComponent } from './assets-portal/asset-epc-history/asset-epc-history.component';
import { AssetEpcRecommendationsComponent } from './assets-portal/asset-epc-recommendations/asset-epc-recommendations.component';
import { AssetEpcAddendaComponent } from './assets-portal/asset-epc-addenda/asset-epc-addenda.component';
import { AssetEpcDataComponent } from './assets-portal/asset-epc-data/asset-epc-data.component';
import { AssetEpcRetrieveComponent } from './assets-portal/asset-epc-retrieve/asset-epc-retrieve.component';
import { EpcSettingsComponent } from './setting/epc-settings/epc-settings.component';
import { MatCheckboxModule, } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { WebReporterSettingComponent } from './setting/web-reporter-setting/web-reporter-setting.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { AssetEpcDashboardComponent } from './assets-portal/asset-energy/asset-epc-dashboard/asset-epc-dashboard.component';
import { AssetEpcRouterComponent } from './assets-portal/asset-energy/asset-epc-router/asset-epc-router.component';
// import { RetrievedEpcGridComponent } from './assets-portal/asset-energy/retrieved-epc-grid/retrieved-epc-grid.component';
// import { WorksordersDashboardComponent } from './worksorders/worksorders-dashboard/worksorders-dashboard.component';
// import { WorksordersRouterComponent } from './worksorders/worksorders-router/worksorders-router.component';
import { SurveyProjectsComponent } from './survey-portal/survey-projects/survey-projects.component';
import { SurveyProjectSurveysComponent } from './survey-portal/survey-project-surveys/survey-project-surveys.component';
import { SurveyBatchesComponent } from './survey-portal/survey-batches/survey-batches.component';
import { SurveyBatchSurveysComponent } from './survey-portal/survey-batch-surveys/survey-batch-surveys.component';
import { SurveyProjectAccessComponent } from './survey-portal/survey-project-access/survey-project-access.component';
import { SurveyProjectSettingsComponent } from './survey-portal/survey-project-settings/survey-project-settings.component';
import { SurveyDashboardComponent } from './survey-portal/survey-dashboard/survey-dashboard.component';
import { SurveyCbcreportComponent } from './survey-portal/survey-cbcreport/survey-cbcreport.component';
import { SurveyCbcreportSelectPDFComponent } from './survey-portal/survey-cbcreport-select-pdf/survey-cbcreport-select-pdf.component';
import { SurveyCbcreportSelectImageComponent } from './survey-portal/survey-cbcreport-select-image/survey-cbcreport-select-image.component';
import { SurveyCbcreportSignatureImageComponent } from './survey-portal/survey-cbcreport-signature-image/survey-cbcreport-signature-image.component';
// import { WorksordersManagementComponent } from './worksorders/worksorders-management/worksorders-management.component';
import { TreeListModule } from '@progress/kendo-angular-treelist';



@NgModule({
  declarations: [
    AppComponent,
    SitelayoutComponent,
    LoginComponent,
    DashboardComponent,
    AlertComponent,
    LoaderComponent,
    UsersComponent,
    SecurityPortalComponent,
    GroupsComponent,
    FunctionSecurityComponent,
    CharacteristicGroupComponent,
    ElementsGroupComponent,
    AttributeGroupComponent,
    PortalTabsComponent,
    PropertySecurityComponent,
    ReportingComponent,
    ConfirmationDialogComponent,
    // DateFormatPipe,
    AsbestosRefDetailPipe,
    NumberFormatPipe,
    UserFormComponent,
    AssetsPortalComponent,
    AssetsComponent,
    AttributesComponent,
    TabWindowComponent,
    AssetAttributeComponent,
    AssetWorkDetailComponent,
    AssetServicingDetailComponent,
    AssetWagDetailComponent,
    AssetCharacteristicsComponent,
    AssetAsbestosComponent,
    AssetEnergyComponent,
    AssetSurveysComponent,
    AssetHSAssessentsComponent,
    AssetServicingComponent,
    AssetHhsrsComponent,
    AssetWorksManagementComponent,
    AssetQualityComponent,
    AssetNotepadComponent,
    DefaultComponent,
    KendoGridColor,
    KendoZindex,
    MyDatePicker,
    DecimalValidation,
    AsbestosRequestComponent,
    AsbestosAttachmentComponent,
    AsbestosEditAttachmentComponent,
    AsbestosUploadAttachmentComponent,
    AsbestosAuthComponent,
    AsbestosViewAttachmentComponent,
    AsbestosManageRequestComponent,
    WorkStatusComponent,
    PrintAcmComponent,
    IndividualAssetReportComponent,
    ReqFurtherInfoComponent,
    ServicePortalComponent,
    ServiceChartComponent,
    ManagementComponent,
    ServiceServicingDetailComponent,
    ServiceServiceAttributeComponent,
    ServiceServiceHistoryComponent,
    ServiceServiceAttrInfoComponent,
    ServiceServiceInfoComponent,
    ServiceServiceInfoEditComponent,
    ServiceServiceNotepadsComponent,
    ServiceUploadAttachmentComponent,
    ServiceEditNotepadComponent,
    ServiceResidentContactsComponent,
    ServiceSettingsComponent,
    HnsSettingsComponent,
    HnsReportImagesComponent,
    AssetEpcComponent,
    AssetEpcHistoryComponent,
    AssetEpcRecommendationsComponent,
    AssetEpcAddendaComponent,
    AssetEpcDataComponent,
    AssetEpcRetrieveComponent,
    EpcSettingsComponent,
    WebReporterSettingComponent,
    AssetEpcDashboardComponent,
    AssetEpcRouterComponent,
    // RetrievedEpcGridComponent,
    // WorksordersDashboardComponent,
    // WorksordersRouterComponent,
    SurveyProjectsComponent,
    SurveyProjectSurveysComponent,
    SurveyBatchesComponent,
    SurveyBatchSurveysComponent,
    SurveyProjectAccessComponent,
    SurveyProjectSettingsComponent,
    SurveyDashboardComponent,
    SurveyCbcreportComponent,
    SurveyCbcreportSelectImageComponent,
    SurveyCbcreportSelectPDFComponent,
    SurveyCbcreportSignatureImageComponent,
  
  
  ],

  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routing,
    ReactiveFormsModule,
    GridModule,
    ExcelModule,
    InputsModule,
    MultiSelectModule,
    BrowserAnimationsModule,
    DialogsModule,
    TreeViewModule,
    DataTablesModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgbModule.forRoot(),
    SharedModule,
    SpellCheckerModule.forRoot(),
    DateInputsModule,
    MatCheckboxModule,
    MatSelectModule,
    TooltipModule,
    MatExpansionModule,
    TreeListModule,
    HttpClientJsonpModule
  ],

  providers: [
    AuthGuard,
    AlertService,
    LoaderService,
    AuthenticationService,
    UserService,
    GroupService,
    CharacteristicGroupService,
    ElementGroupService,
    AttributeGroupService,
    PortalGroupService,
    FunctionSecurityService,
    PropertySecurityGroupService,
    ReportingGroupService,
    AssetAttributeService,
    ServicePortalService,
    HnsPortalService,
    HnsResultsService,
    EventManagerDashboardService,
    SettingsService,
    SharedService,
    ConfirmationDialogService,
    EventService,
    EventManagerService,
    WorksOrdersService,
    WebReporterService,
    SurveyPortalService,
    WorksorderManagementService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptorService, multi: true },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }

  ],
  // exports: [
  //   DialogModule
  // ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmationDialogComponent],

})
export class AppModule { }
