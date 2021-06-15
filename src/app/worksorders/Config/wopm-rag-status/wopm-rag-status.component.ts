import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService, WopmConfigurationService } from '../../../_services'
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { WopmRagstatusModel, SurveyPortalXports } from '../../../_models'

@Component({
  selector: 'app-wopm-rag-status',
  templateUrl: './wopm-rag-status.component.html',
  styleUrls: ['./wopm-rag-status.component.css']
})
export class WopmRagStatusComponent implements OnInit {
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
    ragStatusDetails: any;
    ragStatusDetailsTemp: any
    selectedItem: any;
    wopmRagstatusModel: WopmRagstatusModel
    touchtime = 0;
    public mode: any = 'single';
    currentUser: any;
    loading = true
    wopmSecurityList: any = [];
    public editFormWindow: boolean = false;
    public editFormType: any;
    compareNumbers: any;
    compareToNumbers: any;
    compareToDates: any;
    surveyQuestions: any;

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
              if (!(this.checkWorksOrdersAccess("Config RAG Status Tab") && this.checkWorksOrdersAccess("Works Order Portal Access"))) {
                this.router.navigate(['/dashboard']);
              }
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
      return distinct(this.ragStatusDetails, fieldName).map(item => {
        return { val: item[fieldName], text: item[fieldName] }
      });
    }

    getGridDataDetails() {
      this.subs.add(
        this.wopmConfigurationService.getWorksOrdersRAGStatusList('').subscribe(
          data => {
            if (data.isSuccess) {
              const RAGStatus = data.data.worksOrderRAGStatusList;
              const compareNumber = data.data.compareNumber;
              const compareToNumber = data.data.compareToNumber;
              const compareToDate = data.data.compareToDate;
              const surveyQuestions = data.data.surveyQuestions;
              this.ragStatusDetails = RAGStatus;
              this.compareNumbers = compareNumber;
              this.compareToNumbers = compareToNumber;
              this.compareToDates = compareToDate;
              this.surveyQuestions = surveyQuestions;
              this.ragStatusDetailsTemp = Object.assign([], RAGStatus);
              this.gridView = process(this.ragStatusDetailsTemp, this.state);
              this.loading = false;
            }
            else
            {
              this.alertService.error(data.message)
            }
          }
        )
      )
    }


    public sortChange(sort: SortDescriptor[]): void {
      this.state.sort = sort;
      this.gridView = process(this.ragStatusDetailsTemp, this.state);
    }

    public filterChange(filter: any): void {
      this.state.filter = filter;
      this.gridView = process(this.ragStatusDetailsTemp, this.state);

    }

    export() {
     if (this.ragStatusDetails.length != undefined && this.ragStatusDetails.length > 0) {
      let tempData = this.ragStatusDetails;
      let label = {
        'rAGStatus' :   'Active',
        'compareName' : 'Name',
        'compareType' : 'Type',
        'compareField' :   'Compare This',
        'compareToField' :  'To This',
        'greenMax' : 'Green Max Value',
        'amberMax' : 'Amber Max Value',
        'decimalPlaces' : 'Decimal Places',
      }

       this.helper.exportAsExcelFile(tempData, 'RAG Status', label)

     } else {
       alert('There is no data to export');
     }
  }

  openEditRagStatus(action, ragStatus) {
    $('.disabledBackground').addClass('ovrlay');
    if (action=="new")
    {
      this.wopmRagstatusModel = new WopmRagstatusModel();
      this.wopmRagstatusModel.userID = this.currentUser.userId;
      this.wopmRagstatusModel.newRecord = true;
    }
    else
    {
      this.selectedItem = ragStatus;
      this.wopmRagstatusModel = this.selectedItem;
      this.wopmRagstatusModel.userID = this.currentUser.userId;
      this.wopmRagstatusModel.newRecord = false;
    }
    this.editFormType = action;
    this.editFormWindow = true;
  }

  closeEditFormWin($event) {
    this.editFormWindow = false;
    $('.disabledBackground').removeClass('ovrlay');
    this.getGridDataDetails();
  }

  activateRagStatus(dataitem) {
    this.selectedItem = dataitem;
    this.wopmRagstatusModel = new WopmRagstatusModel();
    this.wopmRagstatusModel.compareName = this.selectedItem.compareName;
    this.wopmRagstatusModel.checkProcess  = "C";
    this.wopmRagstatusModel.userID = this.currentUser.userId;
    this.wopmConfigurationService.ActivateRAGStatus(this.wopmRagstatusModel)
      .subscribe(
        data => {
          if (data.isSuccess) {
              this.activateRagStatusProcess()
              this.getGridDataDetails();
              } else {
                this.alertService.error(data.message);
              }
        });
  }

  activateRagStatusProcess() {
    this.wopmRagstatusModel.checkProcess  = "P";
    this.wopmConfigurationService.ActivateRAGStatus(this.wopmRagstatusModel)
      .subscribe(
        data => {
          if (data.isSuccess) {
              this.getGridDataDetails();
              } else {
                this.alertService.error(data.message);
              }
        });
  }

  deleteRagStatus(dataitem) {
    this.selectedItem = dataitem;
    this.wopmRagstatusModel = new WopmRagstatusModel();
    this.wopmRagstatusModel.compareName = this.selectedItem.compareName;
    this.wopmRagstatusModel.userID = this.currentUser.userId;
    this.wopmRagstatusModel.checkProcess = 'C';
    this.wopmConfigurationService.DeleteRAGStatus(this.wopmRagstatusModel)
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
          this.wopmRagstatusModel.checkProcess = 'P';
          this.wopmConfigurationService.DeleteRAGStatus(this.wopmRagstatusModel)
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
          if(this.checkWorksOrdersAccess('Edit RAG Status')){
            this. openEditRagStatus('edit', dataItem);
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
