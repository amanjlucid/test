import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BusinessAreaComponent } from './business-area.component';



const routes: Routes = [
  {
    path: '',
    component: BusinessAreaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessAreaRoutingModule { }