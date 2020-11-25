import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerService, HelperService, SettingsService } from '../../_services'
import { DataStateChangeEvent, RowArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { forkJoin } from 'rxjs';
import { PageChangeEvent } from '@progress/kendo-angular-dropdowns/dist/es2015/common/page-change-event';
import { trim } from 'jquery';


@Component({
  selector: 'app-manage-group-users',
  templateUrl: './manage-group-users.component.html',
  styleUrls: ['./manage-group-users.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageGroupUsersComponent implements OnInit {

  subs = new SubSink();
  @Input() parentSelectedRow: any;
  @Output() closeEditWin = new EventEmitter<boolean>();
  @Output() reloadParentGrid = new EventEmitter<boolean>();
  @Input() editWin: any = false;
  title = "Manage Group Users";
  state: State = {
    skip: 0,
    sort: [{
      field: 'userName',
      dir: 'asc'
    }],
    take: 25,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  statetwo: State = {
    skip: 0,
    sort: [{
      field: 'userName',
      dir: 'asc'
    }],
    take: 25,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  pageSize = 25;
  pageSize2 = 25
  mode: any = 'multiple';
  mySelection: number[] = [];
  selectableSettings: SelectableSettings;
  allowUnsort = true;
  multiple = false;
  availableGridView: DataResult;
  incluedeGridView: DataResult;
  availableUser: any;
  includedUser: any
  selectedAvailableUser: any = [];
  selectedIncUser: any = [];
  currentUser: any;
  groupName = ''
  loading1 = true;
  loading2 = true;
  pushClickedData: any = [];
  availableUsersToSave = [];
  originalIncUsers: any = [];


  constructor(
    private chRef: ChangeDetectorRef,
    private eventmanagerService: EventManagerService,
    private settingService: SettingsService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.groupName = this.parentSelectedRow.groupDesc;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.setSelectableSettings();
    this.loadGroupUser();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  public onSelectedKeysChange(e) {
    const len = this.mySelection.length;
  }

  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: this.mode
    };
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.availableGridView = {
      data: this.availableUser.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.availableUser.length
    };
    this.chRef.detectChanges();
  }

  pageChange2(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.incluedeGridView = {
      data: this.includedUser.slice(this.statetwo.skip, this.statetwo.skip + this.pageSize2),
      total: this.includedUser.length
    };
    this.chRef.detectChanges();
  }


  loadGroupUser() {
    this.subs.add(
      this.settingService.loadNotificationGroupUser(this.parentSelectedRow.groupId).subscribe(
        data => {
          if (data.isSuccess) {
            this.availableUser = data.data.availableNotificationGroupUsers
            this.includedUser = data.data.notificationGroupUsers
            this.originalIncUsers = data.data.notificationGroupUsers
            this.availableGridView = process(this.availableUser, this.state);
            this.incluedeGridView = process(this.includedUser, this.statetwo);
          } else {
            this.alert.error(data.message);
          }
          this.loading1 = false
          this.loading2 = false;
          this.chRef.detectChanges();
        },
        err => {
          this.alert.error(err);
        }
      )
    )


  }

  sortChange(sort: SortDescriptor[]): void {
    this.resetAvailableUserGridSelection()
    this.state.sort = sort;
    this.availableGridView = process(this.availableUser, this.state);
  }

  filterChange(filter: any): void {
    this.resetAvailableUserGridSelection()
    this.state.filter = filter;
    this.availableGridView = process(this.availableUser, this.state);
  }

  public dataStateChangeForAssignUser(state: DataStateChangeEvent): void {
    this.statetwo = state;
    this.incluedeGridView = process(this.includedUser, this.statetwo);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedAvailableUser = [];
    this.pushClickedData.push({ row: rowIndex, data: dataItem });
    for (let ind of this.mySelection) {
      let findVal = this.pushClickedData.find(x => x.row == ind)
      if (findVal) {
        this.selectedAvailableUser.push(findVal.data)
      }
    }

    this.chRef.detectChanges();
  }

  cellClickHandlerForInclude(eve) {
    this.selectedIncUser = eve.dataItem
    this.chRef.detectChanges();
  }


  closeEditWindow() {
    this.editWin = false;
    this.closeEditWin.emit(this.editWin);
  }

  add() {
    if (this.selectedAvailableUser.length > 0) {
      let userAvailable = []
      let userEmailEmpty = [];

      for (let availableUsr of this.selectedAvailableUser) {
        if (trim(availableUsr.email) != "") {
          userAvailable.push(availableUsr)
          this.availableUsersToSave.push(availableUsr);
        } else {
          userEmailEmpty.push(availableUsr)
        }
      }

      if (userEmailEmpty.length > 0) {
        this.alert.error("Only users with email addresses can be added! ");
      }

      if (userAvailable.length > 0) {
        let filteredAvailableUser = this.availableUser.filter(x => this.selectedAvailableUser.some(y => JSON.stringify(y) != JSON.stringify(x)))

        this.availableUser = filteredAvailableUser
        this.availableGridView = process(this.availableUser, this.state);

        this.includedUser = [...this.includedUser, ...userAvailable];
        this.incluedeGridView = process(this.includedUser, this.statetwo);

        this.resetAvailableUserGridSelection()
        this.chRef.detectChanges();
      }

    }

  }

  remove() {
    if (this.selectedIncUser) {
      let filteredIncUser = this.includedUser.filter(x => JSON.stringify(x) != JSON.stringify(this.selectedIncUser));
      this.availableUsersToSave = this.availableUsersToSave.filter(x => JSON.stringify(x) != JSON.stringify(this.selectedIncUser));
      this.includedUser = filteredIncUser;
      this.incluedeGridView = process(this.includedUser, this.statetwo);

      this.availableUser.push(this.selectedIncUser);
      this.availableGridView = process(this.availableUser, this.state);
      this.selectedIncUser = [];
      this.resetAvailableUserGridSelection()
      this.chRef.detectChanges();

    }

  }

  resetAvailableUserGridSelection() {
    this.mySelection = [];
    this.pushClickedData = [];
    this.selectedAvailableUser = [];
  }


  saveGroup() {
    if (this.groupName == this.parentSelectedRow.groupDesc) {
      this.updateGroupUserList();
    } else {
      this.updateGrpDesc();
    }
  }

  updateGrpDesc() {
    this.subs.add(
      this.settingService.ValidateUpdateNotificationGroupDesc(this.parentSelectedRow.groupId, this.groupName).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data == "S") {
              this.validateSaveGroupWithNoUsers();

            } else {
              this.alert.error(data.message);
            }

          }
        }
      )
    )
  }

  validateSaveGroupWithNoUsers() {
    this.subs.add(
      this.settingService.validateSaveGroupWithNoUsers(this.parentSelectedRow.groupId).subscribe(
        data => {
          if (data.isSuccess) {
            this.updateGroupUserList();
          }
        }
      )
    )
  }

  updateGroupUserList() {
    let userids = [];
    let groupNameChanged = false;
    let groupUsersChanged = false;
    for (let incusers of this.includedUser) {
      userids.push(incusers.userId);
    }

    if (this.groupName != this.parentSelectedRow.groupDesc) {
      groupNameChanged = true;
    } else {
      groupNameChanged = false;
    }

    if (JSON.stringify(this.includedUser) == JSON.stringify(this.originalIncUsers)) {
      groupUsersChanged = false;
    } else {
      groupUsersChanged = true;
    }

    const params = {
      GroupNameChanged: groupNameChanged,
      GroupId: this.parentSelectedRow.groupId,
      GroupDesc: this.groupName,
      UserId: this.currentUser.userId,
      GroupUsersChanged: groupUsersChanged,
      UserIds: userids
    }

    this.subs.add(
      this.settingService.UpdateGroupUserList(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.alert.success(data.message);
            this.emitAndClose()

          } else {
            this.alert.error(data.message)
          }
        }
      )
    )

  }

  emitAndClose() {
    this.reloadParentGrid.emit(true);
    this.closeEditWindow();
  }




}
