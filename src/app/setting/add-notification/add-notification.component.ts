import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, ConfirmationDialogService, EventManagerService, HelperService, SettingsService } from '../../_services'



@Component({
  selector: 'app-add-notification',
  templateUrl: './add-notification.component.html',
  styleUrls: ['./add-notification.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddNotificationComponent implements OnInit {
  @ViewChild('notificationGrpForm') form: any;
  subs = new SubSink();
  @Input() addWin = false
  @Output() closeAddWin = new EventEmitter<boolean>();
  @Output() reloadParentGrid = new EventEmitter<boolean>();
  submitted = false;
  notificationGrpName = '';
  currentUser: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private settingService: SettingsService,
    private alertService: AlertService

  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeWindow() {
    this.addWin = false;
    this.closeAddWin.emit(this.addWin)
  }

  onSubmit() {
    this.submitted = true;
    // console.log(this.form);
    if (this.form.valid) {
      this.subs.add(
        this.settingService.validateAddNotificationGroup(this.notificationGrpName, this.currentUser.userId).subscribe(
          data => {
            // console.log(data);
            if (data.isSuccess) {
              this.alertService.success(data.message);
              this.reloadParentGrid.emit(true);
              this.closeWindow();
            } else {
              this.alertService.error(data.message)
            }
          },
          err => {
            this.alertService.error(err);
          }
        )
      )
    }
    // console.log(this.notificationGrpName)
  }

  






}
