import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService, WopmConfigurationService } from '../../_services'
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { WopmContractcost, SurveyPortalXports } from '../../_models'
import { DateFormatPipe } from '../../_pipes/date-format.pipe';

@Component({
  selector: 'app-management-costs',
  templateUrl: './management-costs.component.html',
  styleUrls: ['./management-costs.component.css']
})
export class ManagementCostsComponent implements OnInit {
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

    @Input() managementCostsTab: boolean = false
    @Input() selectedWorksOrder: any
    @Output() closeManagementCostsTab = new EventEmitter<boolean>();

    allowUnsort = true;
    multiple = false;
    public gridView: DataResult;
    conCosts: any;
    conCostsTemp: any
    selectedItem: any;
    touchtime = 0;
    public mode: any = 'single';
    currentUser: any;
    loading = true
    wopmSecurityList: any = [];
    public editFormWindow: boolean = false;
    public editFormType: any;
    public title: string = '';
    wopmContractcost: WopmContractcost
    RemoveCostButton = false;
    EditCostButton = false;
    UnAuthoriseCostButton = false;
    AuthoriseCostButton = false;

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
      //update notification on top
      this.helper.updateNotificationOnTop();
      let WOName = this.selectedWorksOrder.name != undefined? this.selectedWorksOrder.name:this.selectedWorksOrder.woname;
      this.title = 'Contract Costs: ' +this.selectedWorksOrder.wosequence + ' - ' +  WOName ;
      this.getGridDataDetails();
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
              if (!(this.checkWorksOrdersAccess("Contract Costs Tab") && this.checkWorksOrdersAccess("Works Order Portal Access"))) {
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
      return distinct(this.conCosts, fieldName).map(item => {
        return { val: item[fieldName], text: item[fieldName] }
      });
    }

    getGridDataDetails() {
      this.subs.add(
        this.wopmConfigurationService.getWorksOrderContractCosts(this.selectedWorksOrder.wosequence).subscribe(
          data => {
            if (data.isSuccess) {
              let tempData = data.data;
              tempData.map(s => {
                s.requestDate = (s.requestDate != "") ? (s.requestDate != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.requestDate, 'DD-MMM-YYYY HH:mm:ss'): '' : s.requestDate;
                s.paymentDate = (s.paymentDate != "") ? (s.paymentDate != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.paymentDate, 'DD-MMM-YYYY'): '' : s.paymentDate;
                s.approvalDate = (s.approvalDate != "") ? (s.approvalDate != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.approvalDate, 'DD-MMM-YYYY HH:mm:ss'): '' : s.approvalDate;
              });
              this.conCosts = tempData;

              this.conCostsTemp = Object.assign([], tempData);
              this.gridView = process(this.conCostsTemp, this.state);
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
      this.gridView = process(this.conCostsTemp, this.state);
    }

    public filterChange(filter: any): void {
      this.state.filter = filter;
      this.gridView = process(this.conCostsTemp, this.state);

    }

    public onSelectedKeysChange(e) {
     // const len = this.mySelection.length;
    }

    setSeletedRow(dataItem) {
      this.selectedItem = dataItem;
    }

   openEditContractCost(action, contractcost) {
    $('.ManagementCostsOverlay').addClass('ovrlay');
    if (action=="new")
    {

      this.wopmContractcost = new WopmContractcost();
      this.wopmContractcost.worksOrderSeq = this.selectedWorksOrder.wosequence;
      this.wopmContractcost.worksOrderName = this.selectedWorksOrder.name;
      this.wopmContractcost.paymentStatus = 'Unpaid'
      this.wopmContractcost.status = 'Unauthorised';
      this.wopmContractcost.phaseSeq = 0;
      this.wopmContractcost.contractCost = 0.00;
      this.wopmContractcost.phaseName = 'N/A';
      this.wopmContractcost.userID = this.currentUser.userId;
      this.wopmContractcost.newRecord = true;
      this.wopmContractcost.reason = '';
    }
    else
    {
      this.selectedItem = contractcost;
      this.wopmContractcost = this.selectedItem;
      this.wopmContractcost.userID = this.currentUser.userId;
      this.wopmContractcost.newRecord = false;
    }
    this.editFormType = action;
    this.editFormWindow = true;
  }

  closeEditFormWin($event) {
    this.editFormWindow = false;
    $('.ManagementCostsOverlay').removeClass('ovrlay');
    this.getGridDataDetails();
  }

  closeCostsTab(){
    this.managementCostsTab = false;
    this.closeManagementCostsTab.emit(false)
  }


  deleteCosts(dataitem) {
    this.wopmContractcost = dataitem;
    this.wopmContractcost.userID = this.currentUser.userId;
    this.wopmContractcost.checkProcess = 'C';
    this.wopmConfigurationService.deleteContractCosts(this.wopmContractcost)
      .subscribe(
        data => {
          if (data.isSuccess){
            this.openConfirmationDialogAction(data.data, data.message, 'delete')
            } else {
              this.alertService.error(data.message);
            }
        });
  }

  authoriseCost(dataitem, auth) {
    this.wopmContractcost = dataitem;
    this.wopmContractcost.authorise = auth;
    this.wopmContractcost.userID = this.currentUser.userId;
    if(auth){
      this.wopmContractcost.checkProcess = 'C';
      this.wopmConfigurationService.authoriseContractCosts(this.wopmContractcost)
        .subscribe(
          data => {
            if (data.isSuccess){
              this.openConfirmationDialogAction(data.data, data.message, 'auth')
              } else {
                this.alertService.error(data.message);
              }
          });
    }
   else{
      this.wopmContractcost.checkProcess = 'C';
      this.wopmConfigurationService.authoriseContractCosts(this.wopmContractcost)
        .subscribe(
          data => {
            if (data.isSuccess ){
              if (data.data == 'S'){
                this.alertService.success(data.message);
                this.getGridDataDetails();
              }
              else{
                this.openConfirmationDialogAction(data.data, data.message, 'auth')
              }

              } else {
                this.alertService.error(data.message);
              }
          });
    }

  }


  openConfirmationDialogAction(ReturnStatus, ReturnMessage, process) {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${ReturnMessage}`)
      .then((confirmed) => {
        if (confirmed) {
          if (ReturnStatus == 'E') {
            return
          }
          this.wopmContractcost.checkProcess = 'P';
          if(process == 'auth'){
            this.wopmConfigurationService.authoriseContractCosts(this.wopmContractcost)
            .subscribe(
              data => {
                if (data.isSuccess) {
                    this.alertService.success(data.message)
                    this.getGridDataDetails();
                    } else {
                      this.alertService.error(data.message);
                    }
              });
          }else{
            this.wopmConfigurationService.deleteContractCosts(this.wopmContractcost)
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
          if(this.checkWorksOrdersAccess('Edit Cost')){
            this.openEditContractCost('edit', dataItem);
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
