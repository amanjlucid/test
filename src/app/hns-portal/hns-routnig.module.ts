import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HnsPortalComponent } from './hns-portal.component';
import { HnsChartComponent } from './hns-chart/hns-chart.component'
import { HnsDefinitionsComponent } from './hns-definitions/hns-definitions.component';
import { HnsResultComponent } from './hns-result/hns-result.component';
import { HnsResActionComponent } from './hns-res-action/hns-res-action.component';
import { HnsResInformationComponent } from './hns-res-information/hns-res-information.component';
import { HnsResSummaryComponent } from './hns-res-summary/hns-res-summary.component';
import { HnsResAssessmenttabComponent } from './hns-res-assessmenttab/hns-res-assessmenttab.component';

const routes: Routes = [
  {
    path: '',
    component: HnsPortalComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HnsChartComponent },
      { path: 'definitions', component: HnsDefinitionsComponent },
      {
        path: 'results',
        component: HnsResultComponent,
        children: [
          { path: '', redirectTo: 'actions', pathMatch: 'full' },
          { path: 'actions', component: HnsResActionComponent },
          { path: 'information', component: HnsResInformationComponent },
          { path: 'summary', component: HnsResSummaryComponent },
          { path: 'assessment', component: HnsResAssessmenttabComponent },
        ]
      }
      // { path: 'management', component: ManagementComponent, canActivate: [AuthGuard] }

    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HnsRoutingModule { }