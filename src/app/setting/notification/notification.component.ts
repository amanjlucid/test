import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, EventManagerService, HelperService, SettingsService } from '../../_services'
import { tap, switchMap } from 'rxjs/operators';
import { interval } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  allowUnsort = true;
  multiple = false;
  gridView: DataResult;
  loading = true
  selectableSettings: SelectableSettings;
  notificationList: any;
  selectedItem: any;
  addWin = false;
  editWin = false;
  manageEmailsWIn = false;
  manageEmailfor = 'apex'
  currentUser: any;
  touchtime = 0;

  constructor(
    private settingService: SettingsService,
    private eventManagerService: EventManagerService,
    private confirmationDialogService: ConfirmationDialogService,
    private alertService: AlertService,
    private helper: HelperService
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    //update notification on top
    this.helper.updateNotificationOnTop();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getNotificationList();
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.notificationList, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.notificationList, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedItem = dataItem
    if (columnIndex > 1) {
      if (this.touchtime == 0) {
        // set first click
        this.touchtime = new Date().getTime();
      } else {
        // compare first click to this click and see if they occurred within double click threshold
        if (((new Date().getTime()) - this.touchtime) < 400) {
          // double click occurred
          this.edit(dataItem)
          this.touchtime = 0;
        } else {
          // not a double click so set as a new first click
          this.touchtime = new Date().getTime();
        }
      }
    }
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  getNotificationList() {
    this.subs.add(
      this.settingService.getNotificationList().subscribe(
        data => {
          if (data.isSuccess) {
            this.notificationList = data.data
            this.gridView = process(this.notificationList, this.state);
          }
          this.loading = false;
        }
      )
    )
  }

  add() {
    this.addWin = true;
    $('.notificationOverlay').addClass('ovrlay');
  }

  closeAddWin($eve) {
    this.addWin = $eve;
    $('.notificationOverlay').removeClass('ovrlay');

  }


  reloadGrid(eve) {
    if (eve) {
      this.selectedItem = undefined
      this.getNotificationList();
    }
  }


  edit(item) {
    this.selectedItem = item
    this.editWin = true;
    $('.notificationOverlay').addClass('ovrlay');


  }

  closeEditWin($eve) {
    this.editWin = $eve;
    $('.notificationOverlay').removeClass('ovrlay');
  }

  openConfirmationDialog(obj: any) {
    if (obj.inUse == "Y") {
      // this.alertService.error("This record is in use.");
      return
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `Do you really want to delete ${obj.groupDesc} ?`)
      .then((confirmed) => (confirmed) ? this.delete(obj) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));

  }

  delete(obj) {
    this.subs.add(
      this.settingService.validateDeleteNotificationGroup(obj.groupId, this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(data.message);
            this.reloadGrid(true)
          } else {
            this.alertService.error(data.message);
          }
        },
        err => {
          this.alertService.error(err)
        }
      )
    )

  }


  manageEmails(manageFor) {
    this.manageEmailfor = manageFor;
    this.manageEmailsWIn = true;
    $('.notificationOverlay').addClass('ovrlay');
  }

  closeManageEmailWin(event) {
    this.manageEmailsWIn = event;
    $('.notificationOverlay').removeClass('ovrlay');
  }


}
