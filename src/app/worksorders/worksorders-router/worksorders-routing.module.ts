import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorksordersRouterComponent } from './worksorders-router.component';
import { WorkorderListComponent } from '../workorder-list/workorder-list.component';
import { WorksordersDashboardComponent } from '../worksorders-dashboard/worksorders-dashboard.component';
import { WorksordersManagementComponent } from '../worksorders-management/worksorders-management.component';
import { WorksordersDetailsComponent } from '../worksorders-details/worksorders-details.component';


const routes: Routes = [
  {
    path: '',
    component: WorksordersRouterComponent,
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'dashboard', component: WorksordersDashboardComponent },
      { path: 'management', component: WorksordersManagementComponent },
      { path: 'list', component: WorkorderListComponent },
      { path: 'details', component: WorksordersDetailsComponent },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorksOrderRoutingModule { }
