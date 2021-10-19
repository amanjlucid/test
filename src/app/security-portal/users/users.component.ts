import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { User, UserGroup } from '../../_models'
import { UserService, AlertService, LoaderService, ConfirmationDialogService, HelperService } from '../../_services'
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
  userCustomFilter: any = { userId: '', userName: '', email: '', status: '', logAllowed: '', admin: '', loginType: '', userType: '', deaEnabled: '', contractor: '' }
  textSearch$ = new Subject<any>();


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

    this.subs.add(
      this.textSearch$
        .pipe(debounceTime(300))
        .subscribe(searchObj => this.searchInUserGrid(searchObj))
    )

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



  openSearchBar() {
    const scrollTop = $('.layout-container').height();
    $('.search-container').show();
    $('.search-container').css('height', scrollTop);
    if ($('.search-container').hasClass('dismiss')) {
      $('.search-container').removeClass('dismiss').addClass('selectedcs').show();
    }


  }

  closeSearchBar() {
    if ($('.search-container').hasClass('selectedcs')) {
      $('.search-container').removeClass('selectedcs').addClass('dismiss');
      $('.search-container').animate({ width: 'toggle' });
    }
  }



  searchInUserTable(event, column) {
    const inputValue = event.target.value

    if (column == 'userId') this.userCustomFilter.userId = inputValue
    if (column == 'userName') this.userCustomFilter.userName = inputValue
    if (column == 'email') this.userCustomFilter.email = inputValue
    if (column == 'status') this.userCustomFilter.status = inputValue
    if (column == 'logAllowed') this.userCustomFilter.logAllowed = inputValue
    if (column == 'admin') this.userCustomFilter.admin = inputValue
    if (column == 'loginType') this.userCustomFilter.loginType = inputValue
    if (column == 'userType') this.userCustomFilter.userType = inputValue
    if (column == 'deaEnabled') this.userCustomFilter.deaEnabled = inputValue
    if (column == 'contractor') this.userCustomFilter.contractor = inputValue

    this.textSearch$.next(this.userCustomFilter);
  }


  searchInUserGrid(searchObj: any) {
    this.resetGrid();

    this.gridView = process(this.users, {
      filter: {
        logic: "and",
        filters: [
          {
            field: 'userId',
            operator: 'contains',
            value: searchObj.userId
          },
          {
            field: 'userName',
            operator: 'contains',
            value: searchObj.userName
          },
          {
            field: 'email',
            operator: 'contains',
            value: searchObj.email
          },
          {
            field: 'status',
            operator: 'contains',
            value: searchObj.status
          },
          {
            field: 'logAllowed',
            operator: 'contains',
            value: searchObj.logAllowed
          },
          {
            field: 'admin',
            operator: 'contains',
            value: searchObj.admin
          },
          {
            field: 'loginType',
            operator: 'contains',
            value: searchObj.loginType
          },
          {
            field: 'userType',
            operator: 'contains',
            value: searchObj.userType
          },
          {
            field: 'deaEnabled',
            operator: 'contains',
            value: searchObj.deaEnabled
          },
          {
            field: 'contractor',
            operator: 'contains',
            value: searchObj.contractor
          },
        ]
      }
    });


  }

  clearUserSearchForm() {
    $("#userSearch").trigger("reset");
    this.userCustomFilter.userId = ''
    this.userCustomFilter.userName = '';
    this.userCustomFilter.email = '';
    this.userCustomFilter.status = '';
    this.userCustomFilter.logAllowed = '';
    this.userCustomFilter.admin = '';
    this.userCustomFilter.loginType = '';
    this.userCustomFilter.userType = '';
    this.userCustomFilter.deaEnabled = '';
    this.userCustomFilter.contractor = '';

    this.textSearch$.next(this.userCustomFilter);

  }


  refreshUserSecurityGrid(event) {
    if (event) this.getUserList();
  }

}
