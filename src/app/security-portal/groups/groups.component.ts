import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { GroupService, AlertService, LoaderService, ConfirmationDialogService, HelperService } from '../../_services'
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';

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
  gridHeight = 750;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateGridHeight();
  }
  isGroupForm = false;
  groupFormMode = 'new';







  groupDataTable: any;
  securityFormType: string;

  public windowTitle: string;

  public charGrpWindow = false;
  public elmGrpWindow = false
  public attrGrpWindow = false;
  public portalGrpWindow = false;
  public functionSecurityWindow = false;
  public propertySecurityWindow = false;
  public openReports = false;
  public reportingAction = "";

  public windowWidth = 'auto';
  public windowHeight = 'auto';
  public windowTop = '45';
  public windowLeft = 'auto';

  constructor(
    private groupService: GroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private helper: HelperService
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

    this.getAllGroups();
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


  cellClickHandler({ columnIndex, dataItem }) {
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
        console.log(data);
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



  // functions for opening popup and window
  openCharGrpWin(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.charGrpWindow = true;
  }

  closeCharGrpWin($event) {
    this.charGrpWindow = $event;
    $('.bgblur').removeClass('ovrlay');
  }

  openElmGrpWin(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.elmGrpWindow = true;
  }

  closeElmGrpWin($event) {
    this.elmGrpWindow = $event;
    $('.bgblur').removeClass('ovrlay');
  }


  openAttrGrpWin(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.attrGrpWindow = true;
  }

  closeAttrGrpWin($event) {
    this.attrGrpWindow = $event;
    $('.bgblur').removeClass('ovrlay');
  }


  openPortalGrpWin(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.portalGrpWindow = true;
  }

  closePortalGrpWin($event) {
    $('.bgblur').removeClass('ovrlay');
    this.portalGrpWindow = $event;
  }


  openFunctionSecWindow(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.functionSecurityWindow = true;

  }

  closeFuncitonSecWin($event) {
    this.functionSecurityWindow = $event;
    $('.bgblur').removeClass('ovrlay');

  }


  openPropSecWindow(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.propertySecurityWindow = true;
  }


  closePropSecWin($event) {
    this.propertySecurityWindow = $event;
    $('.bgblur').removeClass('ovrlay');

  }

  public openReport(group, action) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.reportingAction = action;
    this.openReports = true;
  }

  public closeReportingWin() {
    $('.bgblur').removeClass('ovrlay');
    this.openReports = false;
  }




}
