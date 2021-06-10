import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowClassArgs, RowArgs, PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, SharedService, WorksOrdersService, WorksorderReportService } from '../../_services'
import { combineLatest, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkordersListFilterModel } from '../../_models';
import { debounceTime } from 'rxjs/operators';
import { CurrencyPipe } from '@angular/common';


@Component({
  selector: 'app-workorder-list',
  templateUrl: './workorder-list.component.html',
  styleUrls: ['./workorder-list.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class WorkorderListComponent implements OnInit {
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  tempState: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  worksorderTempData: any;
  gridView: DataResult;
  pageSize = 25;
  mySelection: any = [];
  mySelectionKey(context: RowArgs): string {
    return context.dataItem.wosequence
  }
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  worksOrderData: any;
  loading = true;
  selectableSettings: SelectableSettings;
  woFormWindow = false;
  woFormDeleteWindow = false;
  filterObject: WorkordersListFilterModel;
  searchInGrid$ = new Subject<WorkordersListFilterModel>();
  selectedWorksOrder: any
  selectedWorkOrderAddEdit: any;
  woFormType = 'new';
  errorDeleteMsg = '';
  successDeleteMsg = '';
  deleteReasonMsgInput = false;
  wosequenceForDelete: any;
  worksOrderAccess = [];

  touchtime = 0;
  columnLocked: boolean = true;
  @ViewChild(GridComponent) grid: GridComponent;

  worksOrderUsrAccess: any = [];
  userType: any = [];

  mousePositioin: any = 0;
  openVariationListAll: boolean;

  tabWindow = false;
  completionList = false;

  workOrderId: number;

  woProgramManagmentInstructionsWindow = false;
  openManageMilestone : boolean;
  disabledMilestone : boolean = true;

  constructor(
    private worksOrderService: WorksOrdersService,
    private worksOrderReportService: WorksorderReportService,
    private activeRoute: ActivatedRoute,
    private alertService: AlertService,
    private helperService: HelperService,
    private sharedService: SharedService,
    private router: Router,
    private helper: HelperService,
    private chRef: ChangeDetectorRef,
    private currencyPipe : CurrencyPipe
  ) {
    this.setSelectableSettings();
    this.setInitialFilterValue();
  }

  ngOnInit(): void {
    //update notification on top
    this.helper.updateNotificationOnTop();

    // console.log(this.currentUser)
    //subscribe for work order security access
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

          if (this.worksOrderAccess.length > 0) {
            if (!this.worksOrderAccess.includes("Works Orders Menu")) {
              // this.alertService.error("No access")
              this.router.navigate(['login']);
            }
          }

        }
      )
    )


    // this.subs.add(
    //   this.sharedService.woUserSecObs.subscribe(
    //     data => {
    //       this.worksOrderUsrAccess = data;
    //       console.log(this.worksOrderUsrAccess)
    //     }
    //   )
    // )

    // this.subs.add(
    //   this.sharedService.worksOrdersAccess.subscribe(
    //     data => {
    //       this.worksOrderAccess = data;
    //       console.log(this.worksOrderAccess)

    //     }
    //   )
    // )


    this.getUserWorksOrdersList(this.filterObject, "menuOpen");

    // Filter grid from header filter area
    this.subs.add(
      this.searchInGrid$
        .pipe(
          debounceTime(100),
        ).subscribe(obj => this.getUserWorksOrdersList(obj))
    )




  }



  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.loading = false
      this.getUserWorksOrdersList(this.filterObject);
    }
  }

  lockUnlockColumn() {
    this.columnLocked = !this.columnLocked;
  }

  resetGrid() {
    this.state.skip = 0;
  }

  getUserWorksOrdersList(filter, menuOpen = null) {

    this.subs.add(
      this.worksOrderService.getListOfUserWorksOrderByUserId(filter).subscribe(
        data => {
          this.resetGrid();
          // console.log(data)
          if (data.isSuccess) {
            this.worksorderTempData = [...data.data]
            this.worksOrderData = [...data.data];
            this.gridView = process(this.worksOrderData, this.state);

            this.chRef.detectChanges();
          } else {
            this.alertService.error(data.message);
          }

          this.loading = false;

          //select the row if item exist in local storage
          // if (menuOpen == "menuOpen") {
          //   this.selectedWorksOrder = JSON.parse(localStorage.getItem('worksOrderSingleData'));
          //   this.mySelection = [this.selectedWorksOrder.wosequence];
          //   console.log(this.selectedWorksOrder);
          //   console.log(this.mySelection);
          //   if (this.selectedWorksOrder) {
          //     setTimeout(() => {

          //       setTimeout(() => {
          //         document.querySelector('.k-state-selected').scrollIntoView();
          //         setTimeout(() => {
          //           $('.selectedMenuBar' + this.selectedWorksOrder.wosequence).prev().trigger('click');
          //         }, 200);
          //       }, 100);

          //     }, 2000);
          //   }
          // }

          this.chRef.detectChanges();
        },
        err => this.alertService.error(err)
      )
    )
  }


  sortChange(sort: SortDescriptor[]): void {
    this.resetGrid()
    this.state.sort = sort;
    this.tempState.sort = sort;
    this.worksorderTempData = process(this.worksOrderData, this.tempState).data
    this.gridView = process(this.worksorderTempData, this.state);

  }

  filterChange(filter: any): void {
    this.resetGrid()
    this.state.filter = filter;
    this.tempState.filter = filter;
    this.worksorderTempData = process(this.worksOrderData, this.tempState).data //filter without skipping and pagination
    this.gridView = process(this.worksorderTempData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.worksorderTempData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.worksorderTempData.length
    };
  }


  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    //get work order user access when row is changed
    if (this.selectedWorksOrder?.wosequence != dataItem.wosequence) {
      this.helperService.getWorkOrderSecurity(dataItem.wosequence);
      this.helperService.getUserTypeWithWOAndWp(dataItem.wosequence, dataItem.wprsequence);
    }

    this.selectedWorksOrder = dataItem;

    this.disabledMilestone = this.selectedWorksOrder.wottemplatetype === "Works Order Milestone" ? false : true;

    if (columnIndex > 0) {
      if (this.selectedWorksOrder.wosequence)

        if (this.touchtime == 0) {
          this.touchtime = new Date().getTime();
        } else {
          if (((new Date().getTime()) - this.touchtime) < 400) {
            //open work order detail window
            setTimeout(() => {
              this.redirectToWorksOrder(dataItem)
              // if (this.worksOrderAccess.indexOf('Works Orders Menu') != -1 || this.worksOrderUsrAccess.indexOf('Works Orders Menu') != -1) {
              //   if (this.worksOrderAccess.indexOf('Works Order Detail') != -1 || this.worksOrderUsrAccess.indexOf('Works Order Detail') != -1) {
              //     this.redirectToWorksOrder(dataItem)
              //   }
              // }

            }, 200);

            this.touchtime = 0;
          } else {
            // not a double click so set as a new first click
            this.touchtime = new Date().getTime();
          }

        }
    }
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  filterGrid($event) {
    this.searchInGrid$.next(this.filterObject);
  }


  getMouseroverEve(eve) {
    this.mousePositioin = { x: eve.pageX, y: eve.pageY };
  }

  setSeletedRow(dataItem, event) {
    // console.log(event)

    if (dataItem != undefined) {
      setTimeout(() => {
        // let div: any = $(event).find('.selectedMenuBar' + dataItem.wosequence);
        let att = $('.selectedMenuBar' + dataItem.wosequence)[0].getAttribute("x-placement");
        // console.log($(event).find('.selectedMenuBar' + dataItem.wosequence))
        // console.log(att);
        // console.log(this.mousePositioin.y);
        if (att == "bottom-start" && this.mousePositioin.y > 600) {
          // console.log($('.selectedMenuBar' + dataItem.wosequence))
          $('.selectedMenuBar' + dataItem.wosequence).css("top", "-116px")
        }

      }, 50);


      if (this.selectedWorksOrder?.wosequence != dataItem.wosequence) {
        this.helperService.getWorkOrderSecurity(dataItem.wosequence);
        this.helperService.getUserTypeWithWOAndWp(dataItem.wosequence, dataItem.wprsequence);
      }

      this.selectedWorksOrder = dataItem;
      this.mySelection = [this.selectedWorksOrder.wosequence];
    }



  }

  openUserPopup(action, item = null) {
    $('.bgblur').addClass('ovrlay');
    this.woFormType = action;
    this.selectedWorkOrderAddEdit = item;
    this.woFormWindow = true;
  }

  resetFilter() {
    this.setInitialFilterValue();
    this.searchInGrid$.next(this.filterObject);
  }

  setInitialFilterValue() {
    this.filterObject = {
      UserId: this.currentUser.userId,
      ActiveInactive: 'A',
      Address: '',
      WoName: '',
      Woextref: '',
      Wosequence: null
    }
  }

  redirectToWorksOrder(item) {
    if (this.userType?.wourroletype == "Dual Role") {
      if (this.worksOrderAccess.indexOf('Works Order Detail') == -1 && this.worksOrderUsrAccess.indexOf('Works Order Detail') == -1) {
        return;
      }
    } else {
      if (this.worksOrderUsrAccess.indexOf('Works Order Detail') == -1) {
        return
      }
    }

    this.selectedWorksOrder = item;
    this.sharedService.changeWorksOrderSingleData(item);
    localStorage.setItem('worksOrderSingleData', JSON.stringify(item)); // remove code on logout service
    this.router.navigate(['worksorders/details']);
  }

  rowCallback(context: RowClassArgs) {
    if (context.dataItem.wostatus != "New") {
      return { notNew: true, gridRow: true }
    } else {
      return { notNew: false, gridRow: true }
    }

  }


  redirectToWorksOrderEdit(item) {
    if (this.userType?.wourroletype == "Dual Role") {
      if (this.worksOrderAccess.indexOf('Edit Works Order') == -1 && this.worksOrderUsrAccess.indexOf('Edit Works Order') == -1) {
        return;
      }
    } else {
      if (this.worksOrderUsrAccess.indexOf('Edit Works Order') == -1) {
        return
      }
    }

    $('.bgblur').addClass('ovrlay');
    this.woFormType = 'edit';
    this.selectedWorkOrderAddEdit = item;
    this.woFormWindow = true;
  }

  closewoFormDeleteWindow() {
    this.woFormDeleteWindow = false;
  }



  deleteThis(item) {
    this.wosequenceForDelete = item.wosequence;
    this.errorDeleteMsg = '';
    this.successDeleteMsg = '';

    let reason = 'no';
    let userId = this.currentUser.userId;
    let checkOrProcess = 'C';


    this.worksOrderService.DeleteWebWorkOrder(this.wosequenceForDelete, reason, userId, checkOrProcess).subscribe(
      (data) => {
        if (data.isSuccess) {
          if (data.data.pRETURNSTATUS == 'E') {
            this.alertService.error(data.data.pRETURNMESSAGE);
            return
            // this.errorDeleteMsg = data.data.pRETURNMESSAGE;
            // this.deleteReasonMsgInput = false;
          } else if (data.data.pRETURNSTATUS == 'S') {
            this.errorDeleteMsg = '';
            this.deleteReasonMsgInput = true;
            this.woFormDeleteWindow = true;
          }

        }

        // console.log('Delete Data Return ' + JSON.stringify(data.data));

      },
      error => {
        this.alertService.error(error);

      }
    )


  }


  finalDeleteSubmit(reason) {

    this.errorDeleteMsg = '';
    this.successDeleteMsg = '';

    if (reason == '' || reason == null) {
      this.errorDeleteMsg = 'You must enter a reason for deleting a Works Order';
    }
    else {
      let userId = this.currentUser.userId;
      let checkOrProcess = 'P';
      this.worksOrderService.DeleteWebWorkOrder(this.wosequenceForDelete, reason, userId, checkOrProcess).subscribe(
        (data) => {
          if (data.isSuccess) {

            if (data.data.pRETURNSTATUS == 'E') {
              this.errorDeleteMsg = data.data.pRETURNMESSAGE;
              this.alertService.error(data.data.pRETURNMESSAGE);
            }
            else {
              this.deleteReasonMsgInput = false;
              this.successDeleteMsg = 'Works Order Deleted';
              this.alertService.success(this.successDeleteMsg);
              this.woFormDeleteWindow = false;
              this.getUserWorksOrdersList(this.filterObject);

            }

          }

          // console.log('Final Delete ' + JSON.stringify(data.data));

        },
        error => {
          this.alertService.error(error);

        }
      )

    }

  }


  // public close() {
  //   $('.bgblur').removeClass('ovrlay');
  //   this.windowOpened = false;
  // }


  closeWoFormWin($event) {
    this.woFormWindow = $event;
    $('.bgblur').removeClass('ovrlay');
    this.getUserWorksOrdersList(this.filterObject);
  }

  export() {

    if (this.gridView.total > 0 && this.gridView.data) {
      // let tempData = this.gridView.data;
      let tempData = Object.assign([], this.worksorderTempData);
      tempData.map((x: any) => {
        x.wocontractorissuedate = this.helperService.formatDateWithoutTime(x.wocontractorissuedate)
        x.wotargetcompletiondate = this.helperService.formatDateWithoutTime(x.wotargetcompletiondate)
        x.wocontractoracceptancedate = this.helperService.formatDateWithoutTime(x.wocontractoracceptancedate)
        x.woplanstartdate = this.helperService.formatDateWithoutTime(x.woplanstartdate)
        x.woplanenddate = this.helperService.formatDateWithoutTime(x.woplanenddate)
        x.woactualstartdate = this.helperService.formatDateWithoutTime(x.woactualstartdate)
        x.woactualenddate = this.helperService.formatDateWithoutTime(x.woactualenddate)
        x.mPgpA = this.helperService.formatDateWithoutTime(x.mPgpA)
        x.mPgsA = this.helperService.formatDateWithoutTime(x.mPgsA)
      });

      let label = {
        'wosequence': 'Work Order',
        'woname': 'Name',
        'wostatus': 'Status',
        'contractorName': 'Contractor',
        'wobudget': 'Budget',
        'woforecastplusfee': 'Forecast',
        'wocommittedplusfee': 'Committed',
        'wocurrentcontractsum': 'Issued',
        'woacceptedvalue': 'Accepted',
        'woactualplusfee': 'Actual',
        'woapprovedplusfee': 'Approved',
        'wopendingplusfee': 'Pending',
        'wopayment': 'Payments',
        'wocontractorissuedate': 'Issue Date',
        'wotargetcompletiondate': 'Target Date',
        'wocontractoracceptancedate': 'Acceptance Date',
        'woplanstartdate': 'Plan Start Date',
        'woplanenddate': 'Plan End Date',
        'woactualstartdate': 'Actual Start Date',
        'woactualenddate': 'Actual End Date',
        'woextref': 'External Ref',
        'mPgoA': 'Created By',
        'mPgpA': 'Created Date',
        'mPgrA': 'Amended By',
        'mPgsA': 'Amended Date',

      }

      this.helperService.exportAsExcelFile(tempData, 'WorksOrders', label)

    } else {
      this.alertService.error('There is no record to export');
    }
  }


  woMenuAccess(menuName) {

    if (this.userType == undefined) return true;

    if (this.userType?.wourroletype == "Dual Role") {
      if (menuName == "Works Orders Menu") {
        if (this.worksOrderAccess.indexOf('Edit Works Order') != -1 || this.worksOrderUsrAccess.indexOf('Edit Works Order') != -1) {
          return true
        }

        if (this.worksOrderAccess.indexOf('Delete Works Order') != -1 || this.worksOrderUsrAccess.indexOf('Delete Works Order') != -1) {
          return true
        }

        if (this.worksOrderAccess.indexOf('Works Order Detail') != -1 || this.worksOrderUsrAccess.indexOf('Works Order Detail') != -1) {
          return true
        }

        return false;
      }
      return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    }

    return this.worksOrderUsrAccess.indexOf(menuName) != -1


    // if (menuName == "Works Orders Menu") {
    //   if(this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1){

    //   }
    //   return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf('Edit Works Order') != -1 || this.worksOrderUsrAccess.indexOf('Delete Works Order') != -1 || this.worksOrderUsrAccess.indexOf('Works Order Detail') != -1
    // }

  }


  openVariationList(item) {
    $('.worksOrderOverlay').addClass('ovrlay');
    this.selectedWorksOrder = item;
    this.openVariationListAll = true;

  }

  closeVariationAll(eve) {
    $('.worksOrderOverlay').removeClass('ovrlay');
    this.openVariationListAll = eve;
  }


  redirectToWoProgramManagmentInstructions(item) {


    //console.log('wo data '+ JSON.stringify(item));
    this.selectedWorksOrder = item;
    this.woProgramManagmentInstructionsWindow = true;


    $('.worksOrderOverlay').addClass('ovrlay');
  }

  closeWoProgramManagmentInstructionsWin(eve) {
    this.woProgramManagmentInstructionsWindow = eve;
    $('.worksOrderOverlay').removeClass('ovrlay');
  }

  openCompletionList(item) {
    $('.bgblur').addClass('ovrlay');
    this.tabWindow = true;
    this.completionList = true;
    this.workOrderId = item.wosequence;
  }

  closeTabWindow($event) {
    this.tabWindow = $event;
    $('.bgblur').removeClass('ovrlay');
  }

  closeCompletionList($event) {
    this.completionList = $event;
    $('.bgblur').removeClass('ovrlay');
  }

  WOCreateXportOutputReport(xPortId, reportName) {
    let params = {
      "intXportId": xPortId,
      "lstParamNameValue": ["Works Order Number", this.selectedWorksOrder.wosequence],
      "lngMaxRows": 40000
    };
    if(xPortId == 587 || xPortId == 588){
      params.lstParamNameValue = ["Master Works Order", this.selectedWorksOrder.wosequence];
    }
    this.worksOrderReportService.WOCreateXportOutput(params).subscribe(
      (data) => {

        const { columns, rows } = data[0];
        const tempCol = columns.map(x => x.columnName);
        const tempRow = rows.map(x => x.values);
        let result : any;
        let label : any;

        if(tempRow.length > 0){
          result = tempRow.map(x => x.reduce(function (result, field, index) {
            var fieldKey = tempCol[index].replace(new RegExp(" ", 'g'), "");
            result[fieldKey] = field;
            return result;
          }, {}));

          label = tempCol.reduce(function(result, field){
            var fieldKey = field.replace(new RegExp(" ", 'g'), "");
            result[fieldKey] = field;
            return result;
          }, {});

          let fileName = reportName+" "+this.selectedWorksOrder.wosequence;
          this.helperService.exportAsExcelFile(result, fileName, label);
        }else{
          this.alertService.error("No Record Found.");
        }
        this.chRef.detectChanges();
      },
      error => {
        this.alertService.error(error);

      }
    )

  }

  viewWOReportingAsset(reportLevel, dataItem:any = null){  

    const wprsequence = (dataItem != null) ? dataItem.wprsequence : 0;
    const wosequence = (dataItem != null) ? dataItem.wosequence : 0;
    const wopsequence = 0;
    let level = reportLevel;

    const label = {
      programme: "Programme",
      contractor: "Contractor",
      works_Order: "Work Order",
      phase: "Phase",
      asset: "Asset",
      asset_Type: "Asset Type",
      address: "Addess",
      asset_Status: "Asset Status",
      comment: "Comment",
      forecast: "Forecast",
      committed: "Committed",
      approved: "Approved",
      pending: "Pending",
      actual: "Actual",
      forecast_Fee: "Forecast Fee",
      committed_Fee: "Committed Fee",
      approved_Fee: "Approved Fee",
      pending_Fee: "Pending Fee",
      actual_Fee: "Actual Fee",
      payment: "Payment",
      updated_by: "Updated By",
      updated_On: "Updated On",
      variation_Count: "Variation Count",
      work_Count: "Work Count",
      fee_Count: "Fee Count",
      defect_Count: "Defect Count",
      doc_Count: "Doc Count",
      recharge_Count: "Recharge Count",
      refusal_Count: "Refusal Count",
      customer_Satisfaction: "Customer Satisfaction",
      derived_Status: "Derived Status",
      refusal_Status: "Refusal Status",
      issuedaterep: "Issue Date",
      targetcomdaterep: "Target Date",
      acceptdaterep: "Accept Date",
      planstartdaterep: "Plan Start Date",
      planenddaterep: "Plan End Date",
      startdaterep: "Actual start Date",
      enddaterep: "Actual End Date",
      handoverdaterep: "Handover Date",
      completiondaterep: "Completion Date",
      paymentdaterep: "Payment Date"        
    }

    this.worksOrderReportService.getWOReportingAsset(wprsequence, wosequence, wopsequence, level).subscribe(
      (data) => {
        if(data.isSuccess == true){          
          let tempData = [...data.data];
          if(tempData.length > 0){
            tempData.map((x: any) => {
              x.forecast = this.currencyPipe.transform(x.forecast,"GBP", "symbol");
              x.committed = this.currencyPipe.transform(x.committed,"GBP", "symbol");
              x.approved = this.currencyPipe.transform(x.approved,"GBP", "symbol");
              x.pending = this.currencyPipe.transform(x.pending,"GBP", "symbol");
              x.actual = this.currencyPipe.transform(x.actual,"GBP", "symbol");
              x.forecast_Fee = this.currencyPipe.transform(x.forecast_Fee,"GBP", "symbol");
              x.committed_Fee = this.currencyPipe.transform(x.committed_Fee,"GBP", "symbol");
              x.approved_Fee = this.currencyPipe.transform(x.approved_Fee,"GBP", "symbol");
              x.pending_Fee = this.currencyPipe.transform(x.pending_Fee,"GBP", "symbol");
              x.actual_Fee = this.currencyPipe.transform(x.actual_Fee,"GBP", "symbol");
              x.payment = this.currencyPipe.transform(x.payment,"GBP", "symbol");
              x.updated_On = (this.helperService.formatDateWithoutTime(x.updated_On) != null) ? this.helperService.formatDateTime(x.updated_On) : "";
              x.issuedaterep = (this.helperService.formatDateWithoutTime(x.issuedaterep) != null) ? this.helperService.formatDateWithoutTime(x.issuedaterep) : "";
              x.targetcomdaterep = (this.helperService.formatDateWithoutTime(x.targetcomdaterep) != null) ? this.helperService.formatDateWithoutTime(x.targetcomdaterep) : "";
              x.acceptdaterep = (this.helperService.formatDateWithoutTime(x.acceptdaterep) != null) ? this.helperService.formatDateWithoutTime(x.acceptdaterep) : "";
              x.planstartdaterep = (this.helperService.formatDateWithoutTime(x.planstartdaterep) != null) ? this.helperService.formatDateWithoutTime(x.planstartdaterep) : "";
              x.planenddaterep = (this.helperService.formatDateWithoutTime(x.planenddaterep) != null) ?this.helperService.formatDateWithoutTime(x.planenddaterep) : "";
              x.startdaterep = (this.helperService.formatDateWithoutTime(x.startdaterep) != null) ? this.helperService.formatDateWithoutTime(x.startdaterep) : "";
              x.enddaterep = (this.helperService.formatDateWithoutTime(x.enddaterep) != null) ? this.helperService.formatDateWithoutTime(x.enddaterep) : "";
              x.handoverdaterep = (this.helperService.formatDateWithoutTime(x.handoverdaterep) != null) ? this.helperService.formatDateWithoutTime(x.handoverdaterep) : "";
              x.completiondaterep = (this.helperService.formatDateWithoutTime(x.completiondaterep) != null) ? this.helperService.formatDateWithoutTime(x.completiondaterep) : "";
              x.paymentdaterep = (this.helperService.formatDateWithoutTime(x.paymentdaterep) != null) ? this.helperService.formatDateWithoutTime(x.paymentdaterep) : "";
            })
            let fileName = "WOReportChecklist_"+wosequence+"_"+wprsequence+"_"+level;
            this.helperService.exportAsExcelFile(tempData, fileName, label);
          }else{
            this.alertService.error("No Record Found.");            
          }
          this.chRef.detectChanges();
        }else{
          this.alertService.error(data.message);            
        } 
      },
      error => {
        this.alertService.error(error);
      }
    )

  }

  viewWOReportingProgSummaryTree(reportType, dataItem:any=null){ 

    const wprsequence = (dataItem != null) ? dataItem.wprsequence : 0;
    const wosequence = (dataItem != null) ? dataItem.wosequence : 0;
    let level = reportType;

    const label = {
      programme: "Programme",
      works_Order: "Works Order",
      phase:  "Phase",
      budget: "Budget",
      forecast: "Forecast",
      committed: "Committed",
      accepted: "Accepted",
      actual: "Actual",
      approved: "Approved",
      pending: "Pending",
      payments: "Payments",
      actual___Planned_Start_Date: "Start Date",
      actual___Planned_End_Date: "End Date",
      target_Date: "Target Date",
      new: "New Count",
      issued: "Issued Count",
      wip: "In Progress Count",
      handover: "Handover Count",
      pc: "Practical Comp Count",
      fc: "Final Comp Count",
      status: "Status",
      counts: "Counts"
    }

    this.worksOrderReportService.getWOReportingProgSummaryTree(wprsequence, wosequence, level).subscribe(
      (data) => {
        if(data.isSuccess == true){          
          let tempData = [...data.data];
          if(tempData.length > 0){
            tempData.map((x: any) => {
              x.budget = this.currencyPipe.transform(x.budget,"GBP", "symbol");
              x.forecast = this.currencyPipe.transform(x.forecast,"GBP", "symbol");
              x.committed = this.currencyPipe.transform(x.committed,"GBP", "symbol");
              x.accepted = this.currencyPipe.transform(x.accepted,"GBP", "symbol");
              x.actual = this.currencyPipe.transform(x.actual,"GBP", "symbol");
              x.approved = this.currencyPipe.transform(x.approved,"GBP", "symbol");
              x.pending = this.currencyPipe.transform(x.pending,"GBP", "symbol");
              x.payments = this.currencyPipe.transform(x.payments,"GBP", "symbol");
              x.actual___Planned_Start_Date = (this.helperService.formatDateWithoutTime(x.actual___Planned_Start_Date) != null) ? this.helperService.formatDateWithoutTime(x.actual___Planned_Start_Date) : "";
              x.actual___Planned_End_Date = (this.helperService.formatDateWithoutTime(x.actual___Planned_End_Date) != null) ? this.helperService.formatDateWithoutTime(x.actual___Planned_End_Date) : "";
              x.target_Date = (this.helperService.formatDateWithoutTime(x.target_Date) != null) ? this.helperService.formatDateWithoutTime(x.target_Date) : "";
            })
            let fileName = "WOReport_"+wosequence+"_"+wprsequence+"_"+level;
            this.helperService.exportAsExcelFile(tempData, fileName, label);
          }else{
            this.alertService.error("No Record Found.");
          }
          this.chRef.detectChanges();
        }else{
          this.alertService.error(data.message);            
        }
      },
      error => {
        this.alertService.error(error);
      }
    )

  }

  openManageMilestonePopup() {
    $('.worksOrderOverlay').addClass('ovrlay');
    this.openManageMilestone = true;
  }

  closeManageMilestone($event){
    $('.worksOrderOverlay').removeClass('ovrlay');
    this.openManageMilestone = $event;
  }


}
