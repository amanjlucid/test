import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { User, UserGroup } from '../../_models'
import { UserService, AlertService, LoaderService, ConfirmationDialogService, HelperService } from '../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})

export class UsersComponent implements OnInit {
  subs = new SubSink();
  selectedUser: User;
  users: User[];
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  gridView: DataResult;
  pageSize = 25;
  loading = true;
  selectableSettings: SelectableSettings;
  mySelection: any = [];
  mySelectionKey(context: RowArgs): string {
    return context.dataItem.userId
  }
  gridHeight = 750;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateGridHeight();
  }

  userFormWindow = false;
  userFormType: any = "new";
  openUserAssignGroup = false;
  touchtime = 0;


  constructor(
    private router: Router,
    private userService: UserService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private helper: HelperService
  ) {
    this.setSelectableSettings();
  }


  ngOnInit() {
    //update notification on top
    this.helper.updateNotificationOnTop();

    this.updateGridHeight();
    this.getUserList();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  updateGridHeight() {
    const innerHeight = window.innerHeight;

    if (innerHeight < 754) {
      this.gridHeight = innerHeight - 330;
    } else {
      this.gridHeight = innerHeight - 230;
    }

    if (this.gridHeight > 900) {
      this.pageSize = 40;
    } else {
      this.pageSize = 25;
    }

  }

  getUserList() {
    this.resetGrid()

    this.subs.add(
      this.userService.getAllUsers().subscribe(
        data => {
          if (data && data.isSuccess) {
            this.users = data.data;
            this.gridView = process(this.users, this.state);
            this.loading = false;
          }
        }
      )
    )
  }


  cellClickHandler({ columnIndex, dataItem }) {
    this.selectedUser = dataItem;

    if (columnIndex > 0) {
      if (this.touchtime == 0) {
        this.touchtime = new Date().getTime();
      } else {
        if (((new Date().getTime()) - this.touchtime) < 400) {
          this.opneUserGroup(dataItem)
          this.touchtime = 0;
        } else {
          // not a double click so set as a new first click
          this.touchtime = new Date().getTime();
        }
      }
    }

  }

  sortChange(sort: SortDescriptor[]): void {
    this.resetGrid()
    this.state.sort = sort;
    this.gridView = process(this.users, this.state);
  }

  filterChange(filter: any): void {
    this.resetGrid()
    this.state.filter = filter;
    this.gridView = process(this.users, this.state);
  }


  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.users.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.users.length
    };
  }

  resetGrid() {
    this.state.skip = 0;
  }


  openUserPopup(action, user: User = null) {
    $('.userlistOverlay').addClass('ovrlay');
    this.userFormType = action;
    this.selectedUser = user;
    this.userFormWindow = true;
  }


  closeUserFormWin($event) {
    this.userFormWindow = $event;
    $('.userlistOverlay').removeClass('ovrlay');
    this.getUserList();
  }


  openConfirmationDialog(user: User) {
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.deleteUser(user) : console.log(confirmed))
      .catch(() => console.log('User dismissed the dialog.'));
  }


  private deleteUser(user: User) {
    this.subs.add(
      this.userService.deleteUser(user.userId).subscribe(
        delData => {
          if (delData.message == "") {
            this.getUserList();
            this.alertService.success("Record deleted successfully.");
          } else this.alertService.error(delData.message);
        }, err => this.alertService.error(err)
      )
    )
  }

  opneUserGroup(user) {
    this.selectedUser = user;
    $('.userlistOverlay').addClass('ovrlay');
    this.openUserAssignGroup = true;
  }


  closeAssignGroupEvent(event) {
    this.openUserAssignGroup = event;
    $('.userlistOverlay').removeClass('ovrlay');
    this.getUserList();
  }

  exportData() {
    if (this.users.length == 0) {
      this.alertService.error('There is no record to export');
      return
    }

    let tempData = Object.assign([], this.users);
    let label = {
      'userId': 'User',
      'userName': 'Name',
      'email': 'Email',
      'status': 'Status',
      'logAllowed': 'Login Allowed',
      'admin': 'Admin',
      'loginType': 'Login Type',
      'userType': 'User Type',
      'deaEnabled': 'DEA Enabled',
      'contractor': 'Contractor Name',
    }

    const fieldsToFormat = {}
    this.helper.exportAsExcelFileWithCustomiseFields(tempData, 'User list', label, fieldsToFormat)

  }





}
