import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordRoutingModule } from './change-password-routnig.module';
import { ChangePasswordComponent } from './change-password.component';


@NgModule({
  imports: [
    CommonModule,
    ChangePasswordRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ChangePasswordComponent]
})

export class ChangePasswordModule { }