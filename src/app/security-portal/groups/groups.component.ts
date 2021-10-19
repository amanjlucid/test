import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { GroupService, AlertService, LoaderService, ConfirmationDialogService, HelperService, FunctionSecurityService } from '../../_services'
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
})

export class GroupsComponent implements OnInit {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  subs = new SubSink();
  submitted = false;
  groups: any;
  selectedGroup: any;
  canDelete = false
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
    return context.dataItem.groupID
  }
  booleanFilterDropDown = [{ valid: "A", val: "Active" }, { valid: "I", val: "Inactive" }];
  yesNoFilterDropDown = [{ valid: true, val: "Yes" }, { valid: false, val: "No" }];
  gridHeight = 750;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateGridHeight();
  }
  isGroupForm = false;
  groupFormMode = 'new';
  showAssetDetail = false;
  openReports = false;
  reportingAction = "";
  functionSecurityWindow = false;
  propertySecurityWindow = false;
  groupCustomFilter: any = { group: '', description: '' }
  textSearch$ = new Subject<any>();

  constructor(
    private groupService: GroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private helper: HelperService,
    private functionSecService: FunctionSecurityService,
  ) {
    this.setSelectableSettings();
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

  ngOnInit() {
    //update notification on top
    this.helper.updateNotificationOnTop();
    this.updateGridHeight();
    this.getAllGroups();

    this.subs.add(
      this.textSearch$
        .pipe(debounceTime(300))
        .subscribe(searchObj => this.searchGroupAndDescription(searchObj))
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

  checkCanDelete(dataItem) {
    this.canDelete = false;
    this.subs.add(
      this.groupService.groupListByGroupId(dataItem.groupID).subscribe(
        data => {
          if (data.isSuccess) {
            this.selectedGroup = dataItem;
            this.canDelete = data.data.canDelete
          }
        }
      )
    )
  }


  cellClickHandler({ dataItem }) {
    this.selectedGroup = dataItem;
    // this.checkCanDelete(dataItem);
  }

  sortChange(sort: SortDescriptor[]): void {
    this.resetGrid()
    this.state.sort = sort;
    this.gridView = process(this.groups, this.state);
  }

  filterChange(filter: any): void {
    this.resetGrid()
    this.state.filter = filter;
    this.gridView = process(this.groups, this.state);
  }


  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.groups.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.groups.length
    };
  }

  resetGrid() {
    this.state.skip = 0;
  }

  getAllGroups() {
    this.groupService.newGroupList().subscribe(
      data => {
        // console.log(data);
        if (data.isSuccess) {
          this.groups = data.data;
          this.gridView = process(this.groups, this.state);
          this.loading = false;
        }
      }
    )
  }


  reloadGroup(event) {
    if (event) this.getAllGroups();
  }

  openGroupForm(mode = 'new', group = null) {
    $('.groupOverlay').addClass('ovrlay');
    this.isGroupForm = true;
    this.groupFormMode = mode;
    if (mode != 'new') this.selectedGroup = group;
  }

  closeGroupForm($event) {
    $('.groupOverlay').removeClass('ovrlay');
    this.isGroupForm = false;
  }


  openConfirmationDialog(group) {
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.deleteSecurityGroup(group) : console.log(confirmed))
      .catch(() => console.log('User dismissed the dialog.'));
  }

  private async deleteSecurityGroup(group) {
    this.loaderService.pageShow()
    const canDelete: any = await this.groupService.groupListByGroupId(group.groupID).toPromise();
    this.loaderService.pageHide()

    if (canDelete.isSuccess && canDelete.data.canDelete) {
      this.groupService.deleteSecurityGroup(group.groupID).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Record deleted successfully.");
            this.getAllGroups();
          } else this.alertService.error(data.message)
        }
      )
    } else this.alertService.error("This record can not be deleted.")

  }


  openAssetDetail() {
    $('.groupOverlay').addClass('ovrlay');
    this.showAssetDetail = true;
  }


  closeAssetDetail(eve) {
    $('.groupOverlay').removeClass('ovrlay');
    this.showAssetDetail = false;
  }

  public openReport(group = null, action) {
    if (this.selectedGroup == undefined) {
      this.alertService.error("Please select one record from the list.")
      return
    }

    $('.groupOverlay').addClass('ovrlay');
    // this.selectedGroup = group;
    this.reportingAction = action;
    this.openReports = true;
  }

  public closeReportingWin() {
    $('.groupOverlay').removeClass('ovrlay');
    this.openReports = false;
  }



  openFunctionSecWindow(group) {
    this.selectedGroup = group;
    $('.groupOverlay').addClass('ovrlay');
    this.functionSecurityWindow = true;
  }

  closeFuncitonSecWin($event) {
    this.functionSecurityWindow = $event;
    $('.groupOverlay').removeClass('ovrlay');
  }

  cancelGroupFunctionEvents(event) {
    if (event) {
      this.subs.add(
        this.functionSecService.cancelGroupFunctions(this.selectedGroup.groupID, this.currentUser.userId).subscribe()
      )
    }
  }


  openPropSecWindow(group) {
    this.selectedGroup = group;
    $('.groupOverlay').addClass('ovrlay');
    this.propertySecurityWindow = true;
  }


  closePropSecWin($event) {
    this.propertySecurityWindow = $event;
    $('.groupOverlay').removeClass('ovrlay');
  }


  openSearchBar() {
    const scrollTop = $('.layout-container').height();
    $('.notification-container').show();
    $('.notification-container').css('height', scrollTop);
    if ($('.notification-container').hasClass('dismiss')) {
      $('.notification-container').removeClass('dismiss').addClass('selectedcs').show();
    }

  }

  closeSearchBar() {
    if ($('.notification-container').hasClass('selectedcs')) {
      $('.notification-container').removeClass('selectedcs').addClass('dismiss');
      $('.notification-container').animate({ width: 'toggle' });
    }
  }



  onFilter(inputValue: string, column): void {
    if (column == 'group') this.groupCustomFilter.group = inputValue
    if (column == 'description') this.groupCustomFilter.description = inputValue

    this.textSearch$.next(this.groupCustomFilter);
  }


  searchGroupAndDescription(searchObj: any) {
    this.resetGrid()

    this.gridView = process(this.groups, {
      filter: {
        logic: "and",
        filters: [
          {
            field: 'group',
            operator: 'contains',
            value: searchObj.group
          },
          {
            field: 'description',
            operator: 'contains',
            value: searchObj.description
          },
        ]
      }
    });

  }


  clearGroupSearchForm() {
    $("#groupSearch").trigger("reset");
    this.groupCustomFilter.group = ''
    this.groupCustomFilter.description = ''
    this.textSearch$.next(this.groupCustomFilter);
  }


  refreshSecurityGroupGrid(event) {
    if (event) this.getAllGroups();
  }




}
