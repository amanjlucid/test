import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService, WopmConfigurationService } from '../../../_services'
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { WopmRefusalcodeModel, SurveyPortalXports } from '../../../_models'

@Component({
  selector: 'app-wopm-refusal-codes',
  templateUrl: './wopm-refusal-codes.component.html',
  styleUrls: ['./wopm-refusal-codes.component.css']
})
export class WopmRefusalCodesComponent implements OnInit {
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
    dataDetails: any;
    dataDetailsTemp: any
    selectedItem: any;
    wopmRefusalcodeModel:WopmRefusalcodeModel
    touchtime = 0;
    public mode: any = 'single';
    currentUser: any;
    loading = true
    wopmSecurityList: any = [];
    public editFormWindow: boolean = false;
    public editFormType: any;

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
              if (!(this.checkWorksOrdersAccess("Config Refusal Codes Tab") && this.checkWorksOrdersAccess("Works Order Portal Access"))) {
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
      return distinct(this.dataDetails, fieldName).map(item => {
        return { val: item[fieldName], text: item[fieldName] }
      });
    }

    getGridDataDetails() {
      this.subs.add(
        this.wopmConfigurationService.getWorksOrdersRefusalCodesList().subscribe(
          data => {
            if (data.isSuccess) {
              const refusalCodes = data.data;
              this.dataDetails = refusalCodes;
              this.dataDetailsTemp = Object.assign([], refusalCodes);
              this.gridView = process(this.dataDetailsTemp, this.state);
              this.loading = false;
            }
          }
        )
      )
    }

    public sortChange(sort: SortDescriptor[]): void {
      this.state.sort = sort;
      this.gridView = process(this.dataDetailsTemp, this.state);
    }

    public filterChange(filter: any): void {
      this.state.filter = filter;
      this.gridView = process(this.dataDetailsTemp, this.state);

    }

    public onSelectedKeysChange(e) {
     // const len = this.mySelection.length;
    }

    setSeletedRow(dataItem) {
      this.selectedItem = dataItem;
    }

    export() {
     if (this.dataDetails.length != undefined && this.dataDetails.length > 0) {
      let tempData = this.dataDetails;
      let label = {
        'refusalCode': 'Refusal Code',
        'refusalDesc': 'Description',
        'refusalStatus': 'Status',
      }

       this.helper.exportAsExcelFile(tempData, 'Refusal Codes', label)

     } else {
       alert('There is no data to export');
     }
  }


  openEditForm(action, refusalCode) {
    $('.disabledBackground').addClass('ovrlay');
    if (action=="new")
    {
      this.wopmRefusalcodeModel = new WopmRefusalcodeModel();
      this.wopmRefusalcodeModel.userID = this.currentUser.userId;
      this.wopmRefusalcodeModel.newRecord = true;
      this.wopmRefusalcodeModel.refusalDesc = "";
      this.wopmRefusalcodeModel.refusalCode = "";
      this.wopmRefusalcodeModel.refusalStatus = "Active";
    }
    else
    {
      this.selectedItem = refusalCode;
      this.wopmRefusalcodeModel = this.selectedItem;
      this.wopmRefusalcodeModel.userID = this.currentUser.userId;
      this.wopmRefusalcodeModel.newRecord = false;
    }
    this.editFormType = action;
    this.editFormWindow = true;
  }

  closeEditFormWin($event) {
    this.editFormWindow = false;
    $('.disabledBackground').removeClass('ovrlay');
    this.getGridDataDetails();
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
          if(this.checkWorksOrdersAccess('Config Edit Refusal Code')){
            this.openEditForm('edit', dataItem);
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

