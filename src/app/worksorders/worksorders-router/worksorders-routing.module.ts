import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorksordersDashboardComponent } from '../worksorders-dashboard/worksorders-dashboard.component';
import { WorksordersManagementComponent } from '../worksorders-management/worksorders-management.component';
import { WorksordersRouterComponent } from './worksorders-router.component';

const routes: Routes = [
  {
    path: '',
    component: WorksordersRouterComponent,
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'dashboard', component: WorksordersDashboardComponent },
      { path: 'management', component: WorksordersManagementComponent },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorksOrderRoutingModule { }
