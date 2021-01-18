import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublishedReportComponent } from './published-report/published-report.component';
import { ReportsComponent } from './reports/reports.component';
import { WebReporterComponent } from './web-reporter.component';

const routes: Routes = [
  {
    path: '',
    component: WebReporterComponent,
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'reports', component: ReportsComponent },
      { path: 'published', component: PublishedReportComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebReporterRoutingModule { }
