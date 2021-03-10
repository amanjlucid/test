import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/index';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SitelayoutComponent } from './_layout/sitelayout/sitelayout.component';
import { AuthGuard } from './_guards';
import { SecurityPortalComponent } from './security-portal/security-portal/security-portal.component';
import { UsersComponent } from './security-portal/users/users.component';
import { GroupsComponent } from './security-portal/groups/groups.component';
import { AssetsPortalComponent } from './assets-portal/assets-portal.component';
import { AssetsComponent } from './assets-portal/assets/assets.component';
import { DefaultComponent } from './assets-portal/default/default.component';
import { IndividualAssetReportComponent } from './asbestos/individual-asset-report/individual-asset-report.component';
import { ServicePortalComponent } from './service-portal/service-portal.component';
import { ServiceChartComponent } from './service-portal/service-chart/service-chart.component';
import { ManagementComponent } from './service-portal/management/management.component';
import { ServiceSettingsComponent } from './setting/service-settings/service-settings.component';
import { HnsSettingsComponent } from './hns-settings/hns-settings.component';
import { EpcSettingsComponent } from './setting/epc-settings/epc-settings.component';
// import { HnsChartComponent } from './hns-portal/hns-chart/hns-chart.component';
//import { MyProfileComponent } from './my-profile/my-profile.component';
import { WebReporterSettingComponent } from './setting/web-reporter-setting/web-reporter-setting.component';
import { AssetEpcDashboardComponent } from './assets-portal/asset-energy/asset-epc-dashboard/asset-epc-dashboard.component';
import { AssetEpcRouterComponent } from './assets-portal/asset-energy/asset-epc-router/asset-epc-router.component';
import {WorksordersDashboardComponent} from './worksorders/worksorders-dashboard/worksorders-dashboard.component';
import {WorksordersRouterComponent} from './worksorders/worksorders-router/worksorders-router.component';
import { SurveyProjectsComponent } from './survey-portal/survey-projects/survey-projects.component';
import { SurveyProjectSurveysComponent } from './survey-portal/survey-project-surveys/survey-project-surveys.component';
import { SurveyBatchesComponent } from './survey-portal/survey-batches/survey-batches.component';
import { SurveyBatchSurveysComponent } from './survey-portal/survey-batch-surveys/survey-batch-surveys.component';
import { SurveyProjectAccessComponent } from './survey-portal/survey-project-access/survey-project-access.component';
import { SurveyProjectSettingsComponent } from './survey-portal/survey-project-settings/survey-project-settings.component';
import { SurveyDashboardComponent } from './survey-portal/survey-dashboard/survey-dashboard.component';
import { SurveyCbcreportComponent } from './survey-portal/survey-cbcreport/survey-cbcreport.component';
import { WorksordersManagementComponent } from './worksorders/worksorders-management/worksorders-management.component';

const appRoutes: Routes = [

    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'change-password', loadChildren: () => import('./change-password/change-password.module').then(m => m.ChangePasswordModule) },
    { path: 'default', component: DefaultComponent },
    {
        path: '',
        component: SitelayoutComponent, canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            {
                path: 'security-portal',
                component: SecurityPortalComponent,
                children: [
                    { path: '', redirectTo: 'users', pathMatch: 'full' },
                    { path: 'users', component: UsersComponent, canActivate: [AuthGuard], }, // use authguard and lazy loading here
                    { path: 'groups', component: GroupsComponent, canActivate: [AuthGuard], }
                ]
            },
            {
                path: 'asset-list',
                component: AssetsPortalComponent,
                pathMatch: 'full',
                children: [

                    { path: '', component: AssetsComponent, canActivate: [AuthGuard], }

                ]
            },
            {
                path: 'servicing',
                component: ServicePortalComponent,
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', component: ServiceChartComponent, canActivate: [AuthGuard] },
                    { path: 'management', component: ManagementComponent, canActivate: [AuthGuard] }

                ]
            },
            {
                path: 'epc',
                component: AssetEpcRouterComponent,
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', component: AssetEpcDashboardComponent, canActivate: [AuthGuard] },
                ]
            },
            {
                path: 'worksorders',
                component: WorksordersRouterComponent,
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', component: WorksordersDashboardComponent, canActivate: [AuthGuard] },
                    { path: 'management', component: WorksordersManagementComponent },
                ]
            },
            
            { path: 'health&safety', loadChildren: () => import('./hns-portal/hns.module').then(m => m.HnsModule) },
            { path: 'tasks', loadChildren: () => import('./event-manager/eventmanager.module').then(m => m.EventManagerModule) },

            { path: 'reporting', loadChildren: () => import('./web-reporter/web-reporter.module').then(m => m.WebReporterModule) },
            { path: 'my-profile', loadChildren: () => import('./my-profile/my-profile.module').then(m => m.MyProfileModule) },
            { path: 'service-settings', component: ServiceSettingsComponent, canActivate: [AuthGuard] },
            { path: 'hns-settings', component: HnsSettingsComponent, canActivate: [AuthGuard] },
            { path: 'epc-settings', component: EpcSettingsComponent, canActivate: [AuthGuard] },
            { path: 'business-areas', loadChildren: () => import('./setting/business-area/business-area.module').then(m => m.BusinessModule) },
            { path: 'notification', loadChildren: () => import('./setting/notification/notification.module').then(m => m.NotificationModule) },
            { path: 'tasks-settings', loadChildren: () => import('./setting/event-manager-setting/event-manager-setting.module').then(m => m.EventManagerSettingModule) },
            { path: 'web-reporter-settings', component: WebReporterSettingComponent, canActivate: [AuthGuard] },
            {
                path: 'surveying',
                component: ServicePortalComponent,
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', component: SurveyDashboardComponent, canActivate: [AuthGuard] },
                    { path: 'projects', component: SurveyProjectsComponent, canActivate: [AuthGuard] },
                    { path: 'projectsurveys', component: SurveyProjectSurveysComponent, canActivate: [AuthGuard] },
                    { path: 'batches', component: SurveyBatchesComponent, canActivate: [AuthGuard] },
                    { path: 'batchsurveys', component: SurveyBatchSurveysComponent, canActivate: [AuthGuard] },
                    { path: 'surveyors', component: SurveyProjectsComponent, canActivate: [AuthGuard] },
                    { path: 'projectaccess', component: SurveyProjectAccessComponent, canActivate: [AuthGuard] },
                    { path: 'projectsettings', component: SurveyProjectSettingsComponent, canActivate: [AuthGuard] },
                    { path: 'cbcreport', component: SurveyCbcreportComponent, canActivate: [AuthGuard] }


                ]
            },

        ]
    },
    { path: 'pdf', component: IndividualAssetReportComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '/login' }
];

export const routing = RouterModule.forRoot(appRoutes);