import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventManagerChartComponent } from '../event-manager/event-manager-chart/event-manager-chart.component';
import { EventManagerComponent } from './event-manager.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { TasksComponent } from './tasks/tasks.component';

const routes: Routes = [
  {
    path: '',
    component: EventManagerComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EventManagerChartComponent },
      { path: 'configuration', component: TaskDetailsComponent },
      { path: 'tasks', component: TasksComponent },


    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class EventManagerRoutingModule { }