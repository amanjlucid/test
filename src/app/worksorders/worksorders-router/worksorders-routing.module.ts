import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorksordersRouterComponent } from './worksorders-router.component';
import { WorkorderListComponent } from '../workorder-list/workorder-list.component';
import { WorksordersDashboardComponent } from '../worksorders-dashboard/worksorders-dashboard.component';
import { WorksordersManagementComponent } from '../worksorders-management/worksorders-management.component';
import { WorksordersDetailsComponent } from '../worksorders-details/worksorders-details.component';
import { WopmConfigComponent } from '../Config/wopm-config/wopm-config.component';
import { WopmTemplatesComponent } from '../Config/wopm-templates/wopm-templates.component';
import { WopmMasterstagesComponent } from '../Config/wopm-masterstages/wopm-masterstages.component';


const routes: Routes = [
  {
    path: '',
    component: WorksordersRouterComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: WorksordersDashboardComponent },
      { path: 'management', component: WorksordersManagementComponent },
      { path: 'list', component: WorkorderListComponent },
      { path: 'details', component: WorksordersDetailsComponent },
      { path: 'templates', component: WopmTemplatesComponent },
      {
        path: 'config',
        component: WopmConfigComponent,
        children: [
          { path: '', redirectTo: 'templates', pathMatch: 'full' },
          { path: 'templates', component: WopmTemplatesComponent },
          { path: 'masterstages', component: WopmMasterstagesComponent },
        ]
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorksOrderRoutingModule { }
