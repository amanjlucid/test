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


            { path: 'health&safety', loadChildren: () => import('./hns-portal/hns.module').then(m => m.HnsModule) },
            { path: 'tasks', loadChildren: () => import('./event-manager/eventmanager.module').then(m => m.EventManagerModule) },
            { path: 'my-profile', loadChildren: () => import('./my-profile/my-profile.module').then(m => m.MyProfileModule) },
            { path: 'service-settings', component: ServiceSettingsComponent, canActivate: [AuthGuard] },
            { path: 'hns-settings', component: HnsSettingsComponent, canActivate: [AuthGuard] },
            { path: 'business-areas', loadChildren: () => import('./setting/business-area/business-area.module').then(m => m.BusinessModule) },
            { path: 'notification', loadChildren: () => import('./setting/notification/notification.module').then(m => m.NotificationModule) },

        ]
    },
    { path: 'pdf', component: IndividualAssetReportComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '/login' }
];

export const routing = RouterModule.forRoot(appRoutes);