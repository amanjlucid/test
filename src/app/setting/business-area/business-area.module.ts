import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusinessAreaRoutingModule } from './business-area-routnig.module';
import { BusinessAreaComponent } from './business-area.component';


@NgModule({
  imports: [
    CommonModule,
    BusinessAreaRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [BusinessAreaComponent]
})

export class BusinessModule { }