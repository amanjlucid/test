import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusinessAreaRoutingModule } from './business-area-routnig.module';
import { BusinessAreaComponent } from './business-area.component';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { PopupAnchorDirective } from '../../_directives'
import { PopupModule } from '@progress/kendo-angular-popup';

@NgModule({
  imports: [
    CommonModule,
    BusinessAreaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    GridModule,
    ExcelModule,
    InputsModule,
    DialogsModule,
    DropDownListModule,
    PopupModule
  ],
  declarations: [BusinessAreaComponent, PopupAnchorDirective]
})

export class BusinessModule { }