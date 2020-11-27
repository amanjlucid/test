import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventManagerSettingComponent } from './event-manager-setting.component';

const routes: Routes = [
  {
    path: '',
    component: EventManagerSettingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class EventManagerSettingRoutingModule { }