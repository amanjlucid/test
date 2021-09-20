import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService, WopmConfigurationService } from '../../_services'
import { combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { WopmUserrole, SurveyPortalXports } from '../../_models'

@Component({
  selector: 'app-management-roles',
  templateUrl: './management-roles.component.html',
  styleUrls: ['./management-roles.component.css']
})
export class ManagementRolesComponent implements OnInit {
    subs = new SubSink();
    state: State = {
      skip: 0,
      sort: [],
      group: [],
      filter: {
        logic: "and",
        filters: []
      }
    }

    @Input() managementRolesTab: boolean = false
    @Input() selectedWorksOrder: any
    @Output() closeManagementRolesTab = new EventEmitter<boolean>();

    allowUnsort = true;
    multiple = false;
    public gridView: DataResult;
    jobRoleDetails: any;
    jobRoleDetailsTemp: any
    selectedItem: any;
    touchtime = 0;
    public mode: any = 'single';
    currentUser: any;
    loading = true
    public editFormWindow: boolean = false;
    public editFormType: any;
    public securityFunctionWindow: boolean = false;
    public title: string = '';
    public RoleType: string;
    public JobRole: string;
    wopmUserRole: WopmUserrole
    userRoles:any = [];
    worksOrderAccess = [];
    worksOrderUsrAccess: any = [];
    userType: any = [];

    constructor(
      private wopmConfigurationService: WopmConfigurationService,
      private alertService: AlertService,
      private confirmationDialogService: ConfirmationDialogService,
      private sharedService: SharedService,
      private helper: HelperService
    ) { }

    ngOnInit(): void {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      //update notification on top
      this.helper.updateNotificationOnTop();
      let WOName = this.selectedWorksOrder.name != undefined? this.selectedWorksOrder.name:this.selectedWorksOrder.woname;
      this.title = 'Roles: ' +this.selectedWorksOrder.wosequence + ' - ' +  WOName ;

      this.subs.add(
        combineLatest([
          this.sharedService.worksOrdersAccess,
          this.sharedService.woUserSecObs,
          this.sharedService.userTypeObs
        ]).subscribe(
          data => {
            this.worksOrderAccess = data[0];
            this.worksOrderUsrAccess = data[1];
            this.userType = data[2][0];
          }
        )
      )

      this.getGridDataDetails();
    }

    ngOnDestroy() {
      this.subs.unsubscribe();
    }

    checkWorksOrdersAccess(menuName): Boolean {
      return this.helper.checkWorkOrderAreaAccess(this.worksOrderUsrAccess, menuName)
    }

    distinctPrimitive(fieldName: string): any {
      return distinct(this.jobRoleDetails, fieldName).map(item => {
        return { val: item[fieldName], text: item[fieldName] }
      });
    }

    getGridDataDetails() {
      this.subs.add(
        this.wopmConfigurationService.getWorksOrderUserRoles(this.selectedWorksOrder.wosequence).subscribe(
          data => {
            if (data.isSuccess) {
              const jobRoles = data.data;
              this.jobRoleDetails = jobRoles;
              this.jobRoleDetailsTemp = Object.assign([], jobRoles);
              this.gridView = process(this.jobRoleDetailsTemp, this.state);
              this.loading = false;
            }
            else
            {
              this.alertService.error(data.message)
              this.loading = false;
            }
          }
        )
      )
    }


    public sortChange(sort: SortDescriptor[]): void {
      this.state.sort = sort;
      this.gridView = process(this.jobRoleDetailsTemp, this.state);
    }

    public filterChange(filter: any): void {
      this.state.filter = filter;
      this.gridView = process(this.jobRoleDetailsTemp, this.state);

    }

    public onSelectedKeysChange(e) {
     // const len = this.mySelection.length;
    }

    setSeletedRow(dataItem) {
      this.selectedItem = dataItem;
    }


  openEditJobRole(action, jobRole) {
  if (action=="new")
    {
      this.wopmUserRole = new WopmUserrole();
      this.wopmUserRole.userID = this.currentUser.userId;
      this.wopmUserRole.newRecord = true;
    }
    else
    {
      this.selectedItem = jobRole;
      this.wopmUserRole = this.selectedItem;
      this.wopmUserRole.userID = this.currentUser.userId;
      this.wopmUserRole.newRecord = false;
    }
    this.editFormType = action;
    $('.disabledBackground').addClass('ovrlay');
    this.editFormWindow = true;
  }

  closeEditFormWin($event) {
    this.editFormWindow = false;
    $('.disabledBackground').removeClass('ovrlay');
    this.getGridDataDetails();
  }

  closeRolesTab(){
    this.managementRolesTab = false;
    this.closeManagementRolesTab.emit(false)
  }


  openSecurityFunctionWindow(dataitem) {
    $('.disabledBackground').addClass('ovrlay');
    this.selectedItem = dataitem;
    this.RoleType = dataitem.jobRoleType;
    this.JobRole = dataitem.jobRole;
    this.securityFunctionWindow = true;
  }


  closeSecurityFunctionWindow($event) {
    this.securityFunctionWindow = false;
    $('.disabledBackground').removeClass('ovrlay');
  }


  deleteJobRole(dataitem) {
    this.wopmUserRole = dataitem;
    this.wopmUserRole.userID = this.currentUser.userId;
    this.wopmUserRole.checkProcess = 'C';
    this.wopmConfigurationService.deleteUserRole(this.wopmUserRole)
      .subscribe(
        data => {
          if (data.isSuccess){
            this.openConfirmationDialogAction(data.data, data.message)
            } else {
              this.alertService.error(data.message);
            }
        });
  }


  openConfirmationDialogAction(ReturnStatus, ReturnMessage) {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${ReturnMessage}`)
      .then((confirmed) => {
        if (confirmed) {
          if (ReturnStatus == 'E') {
            return
          }
          this.wopmUserRole.checkProcess = 'P';
          this.wopmConfigurationService.deleteUserRole(this.wopmUserRole)
          .subscribe(
            data => {
              if (data.isSuccess) {
                  this.alertService.success(data.message)
                  this.getGridDataDetails();
                  } else {
                    this.alertService.error(data.message);
                  }
            });
        }
      })
      .catch(() => console.log('User dismissed the dialog.'));
  }


  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    if (columnIndex > 0) {
      this.selectedItem = dataItem;
      if (this.touchtime == 0) {
        // set first click
        this.touchtime = new Date().getTime();
      } else {
        // compare first click to this click and see if they occurred within double click threshold
        if (((new Date().getTime()) - this.touchtime) < 400) {
          // double click occurred
          if(this.checkWorksOrdersAccess('Edit User Role')){
            this.openEditJobRole('edit', dataItem);
          }
          this.touchtime = 0;
        } else {
          // not a double click so set as a new first click
          this.touchtime = new Date().getTime();
        }
      }

    }
  }


}
