import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService, WopmConfigurationService } from '../../../_services'
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { WopmJobroleModel, SurveyPortalXports } from '../../../_models'

@Component({
  selector: 'app-wopm-jobroles',
  templateUrl: './wopm-jobroles.component.html',
  styleUrls: ['./wopm-jobroles.component.css']
})
export class WopmJobrolesComponent implements OnInit {
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

    allowUnsort = true;
    multiple = false;
    public gridView: DataResult;
    jobRoleDetails: any;
    securityGroups: any = [];
    roleTypes: any = [];
    jobRoleDetailsTemp: any
    selectedItem: any;
    wopmJobroleModel:WopmJobroleModel
    wopmRefusalcodeModel;
    touchtime = 0;
    public mode: any = 'single';
    //public mySelection: number[] = [];
    //public selectableSettings: SelectableSettings;
    currentUser: any;
    loading = true
    wopmSecurityList: any = [];
    public editFormWindow: boolean = false;
    public editFormType: any;
   // public dialogDeleteJobRole:boolean = false;
    public securityFunctionWindow: boolean = false;
    public RoleType: string;
    public JobRole: string;

    constructor(
      private wopmConfigurationService: WopmConfigurationService,
      private alertService: AlertService,
      private confirmationDialogService: ConfirmationDialogService,
      private sharedService: SharedService,
      private router: Router,
      private helper: HelperService
    ) { }

    ngOnInit(): void {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getGridDataDetails();
      //update notification on top
      this.helper.updateNotificationOnTop();
    }

    ngOnDestroy() {
      this.subs.unsubscribe();
    }

    ngAfterViewInit() {
      this.subs.add(
        this.sharedService.worksOrdersAccess.subscribe(
          data => {
            this.wopmSecurityList = data;
            if (this.wopmSecurityList.length > 0) {
              if (!(this.checkWorksOrdersAccess("Config Job Roles Tab") && this.checkWorksOrdersAccess("Works Order Portal Access"))) {
                this.router.navigate(['/dashboard']);
              }
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        )
      )
    }

    checkWorksOrdersAccess(val: string): Boolean {
      if (this.wopmSecurityList != undefined) {
      return this.wopmSecurityList.includes(val);
      } else {
        return false;
      }
    }

    distinctPrimitive(fieldName: string): any {
      return distinct(this.jobRoleDetails, fieldName).map(item => {
        return { val: item[fieldName], text: item[fieldName] }
      });
    }

    getGridDataDetails() {
      this.subs.add(
        this.wopmConfigurationService.getWorksOrderJobRolesPanelItems().subscribe(
          data => {
            if (data.isSuccess) {
              const jobRoles = data.data.worksOrderJobRoles;
              this.jobRoleDetails = jobRoles;
              this.securityGroups = data.data.worksOrderSecurityGroups;
              this.jobRoleDetailsTemp = Object.assign([], jobRoles);
              this.gridView = process(this.jobRoleDetailsTemp, this.state);
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

    export() {
     if (this.jobRoleDetails.length != undefined && this.jobRoleDetails.length > 0) {
      let tempData = this.jobRoleDetails;
      let label = {
        'jobRoleType': 'Role Type',
        'jobRole': 'Job Role',
        'securityGroupCode': 'Security Group',
        'defaultJobRole': 'Default Role',
        'variationLimit': 'Variation Limit',
        'issueLimit': 'Issue Limit',
        'requestPaymentLimit': 'Request Payment Limit',
        'authPaymentLimit': 'Authorise Payment Limit',
        'requestFeeLimit': 'Request Fee Limit',
        'authFeeLimit': 'Authorise Fee Limit',
      }

       this.helper.exportAsExcelFile(tempData, 'Job Roles', label)

     } else {
       alert('There is no data to export');
     }
  }

  openEditJobRole(action, jobRole) {
    $('.disabledBackground').addClass('ovrlay');
    if (action=="new")
    {
      this.wopmJobroleModel = new WopmJobroleModel();
      this.wopmJobroleModel.userID = this.currentUser.userId;
      this.wopmJobroleModel.newRecord = true;
    }
    else
    {
      this.selectedItem = jobRole;
      this.wopmJobroleModel = this.selectedItem;
      this.wopmJobroleModel.userID = this.currentUser.userId;
      this.wopmJobroleModel.newRecord = false;
    }
    this.editFormType = action;
    this.editFormWindow = true;
  }

  closeEditFormWin($event) {
    this.editFormWindow = false;
    $('.disabledBackground').removeClass('ovrlay');
    this.getGridDataDetails();
  }


  openSecurityFunctionWindow(jobRole) {
    $('.disabledBackground').addClass('ovrlay');
    this.selectedItem = jobRole;
    this.RoleType = jobRole.jobRoleType;
    this.JobRole = jobRole.jobRole;
    this.securityFunctionWindow = true;
  }


  closeSecurityFunctionWindow($event) {
    this.securityFunctionWindow = false;
    $('.disabledBackground').removeClass('ovrlay');
  }


  deleteJobRole(dataitem) {
    this.selectedItem = dataitem;
    this.wopmJobroleModel = new WopmJobroleModel();
    this.wopmJobroleModel.jobRoleType = this.selectedItem.jobRoleType;
    this.wopmJobroleModel.jobRole = this.selectedItem.jobRole;
    this.wopmJobroleModel.userID = this.currentUser.userId;
    this.wopmJobroleModel.checkProcess = 'C';
    this.wopmConfigurationService.deleteJobRole(this.wopmJobroleModel)
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
    $('.k-window').css({ 'z-index': 10002 });
    this.confirmationDialogService.confirm('Please confirm..', `${ReturnMessage}`)
      .then((confirmed) => {
        if (confirmed) {
          if (ReturnStatus == 'E') {
            return
          }
          this.wopmJobroleModel.checkProcess = 'P';
          this.wopmConfigurationService.deleteJobRole(this.wopmJobroleModel)
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
          if(this.checkWorksOrdersAccess('Config Edit Job Role')){
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
