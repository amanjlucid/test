import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyProfileRoutingModule } from './my-profile-routnig.module';
import { MyProfileComponent } from './my-profile.component';


@NgModule({
  imports: [
    CommonModule,
    MyProfileRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [MyProfileComponent]
})

export class MyProfileModule { }