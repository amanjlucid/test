import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { PopupAnchorDirective } from '../../_directives'
import { PopupModule } from '@progress/kendo-angular-popup';
import { NotificationComponent } from './notification.component';
import { NotificationRoutingModule } from './notification-routnig.module';
import { AddNotificationComponent } from '../add-notification/add-notification.component';
import { ManageEmailsComponent } from '../manage-emails/manage-emails.component';
import { ManageGroupUsersComponent } from '../manage-group-users/manage-group-users.component';

@NgModule({
  imports: [
    CommonModule,
    NotificationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    GridModule,
    ExcelModule,
    InputsModule,
    DialogsModule,
    DropDownListModule,
    PopupModule
  ],
  declarations: [NotificationComponent, AddNotificationComponent, ManageEmailsComponent, ManageGroupUsersComponent]
})

export class NotificationModule { }