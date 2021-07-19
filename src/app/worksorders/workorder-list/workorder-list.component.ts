import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowClassArgs, RowArgs, PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, SharedService, WorksOrdersService, WorksorderReportService, ReportingGroupService } from '../../_services'
import { combineLatest, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkordersListFilterModel } from '../../_models';
import { debounceTime } from 'rxjs/operators';
import { CurrencyPipe } from '@angular/common';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { appConfig } from '../../app.config';

@Component({
  selector: 'app-workorder-list',
  templateUrl: './workorder-list.component.html',
  styleUrls: ['./workorder-list.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class WorkorderListComponent implements OnInit, AfterViewInit {
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
  completionList = false;
  workOrderId: number;

  woProgramManagmentInstructionsWindow = false;
  documentWindow = false;
  ProgrammeLogWindow = false;
  WoAssociationsManageWindow = false;
  openManageMilestone: boolean;
  openDefectsList = false;
  openMilestoneFor = "checklist";
  menuData: any;
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  @HostListener('click', ['$event']) onClick(event) {
    const element = event.target as HTMLElement;
    if (element.className.indexOf('fas fa-bars') == -1) {
      this.hideMenu();
    }
  }
  openWOPaymentScheduleWindow: boolean;

  disabledMilestone: boolean = true;
  showChecklist = false;

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
    private reportingGrpService: ReportingGroupService,
  ) {
    this.setSelectableSettings();
    this.setInitialFilterValue();
  }

  ngOnInit(): void {
    //update notification on top
    this.helper.updateNotificationOnTop();

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
              this.router.navigate(['login']);
            }
          }

        }
      )
    )


    this.getUserWorksOrdersList(this.filterObject, "menuOpen");

    // Filter grid from header filter area
    this.subs.add(
      this.searchInGrid$
        .pipe(debounceTime(100))
        .subscribe(obj => this.getUserWorksOrdersList(obj))
    )


  }



  ngOnDestroy() {
    this.subs.unsubscribe();
    const elements = document.querySelectorAll('.menuDiv .dropdown-item');
    elements.forEach(element => {
      element.removeEventListener("click", (e) => { this.hideMenu() });
    });
  }


  ngAfterViewInit() {
    document.querySelector('.k-grid .k-grid-content').addEventListener('scroll', (e) => {
      this.tooltipDir.hide();
    });
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
          if (data.isSuccess) {
            this.worksorderTempData = [...data.data]
            this.worksOrderData = [...data.data];
            this.gridView = process(this.worksOrderData, this.state);
            this.chRef.detectChanges();
          } else {
            this.alertService.error(data.message);
          }

          this.loading = false;
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


  cellClickHandler({ columnIndex, dataItem }) {
    //get work order user access when row is changed
    if (this.selectedWorksOrder?.wosequence != dataItem.wosequence) {
      this.helperService.getWorkOrderSecurity(dataItem.wosequence);
      this.helperService.getUserTypeWithWOAndWp(dataItem.wosequence, dataItem.wprsequence);
    }

    this.selectedWorksOrder = dataItem;

    if (columnIndex > 0) {
      if (this.selectedWorksOrder.wosequence)
        if (this.touchtime == 0) {
          this.touchtime = new Date().getTime();
        } else {
          if (((new Date().getTime()) - this.touchtime) < 400) {
            //open work order detail window
            setTimeout(() => { this.redirectToWorksOrder(dataItem) }, 200);
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
    // this.mousePositioin = { x: eve.pageX, y: eve.pageY };
  }

  getTopMargin() {
    if (this.mousePositioin == undefined) return;

    const { y } = this.mousePositioin;
    if (y <= 454) return "-133px"
    if (y > 455 && y <= 563) return "-163px";
    if (y > 563 && y <= 640) return "-243px";
    if (y > 640 && y <= 745) return "-358px";
    if (y > 745 && y <= 797) return "-414px";
    if (y > 797 && y <= 900) return "-491px";
  }

  openMenu(e, dataItem) {
    this.menuData = undefined // reset menu
    if (dataItem != undefined) {
      this.mousePositioin = { x: e.pageX, y: e.pageY };
      if (this.selectedWorksOrder?.wosequence != dataItem.wosequence) {
        this.helperService.getWorkOrderSecurity(dataItem.wosequence);
        this.helperService.getUserTypeWithWOAndWp(dataItem.wosequence, dataItem.wprsequence);
      }

      this.selectedWorksOrder = dataItem;
      this.mySelection = [this.selectedWorksOrder.wosequence];

      const element = e.target as HTMLElement;
      this.menuData = dataItem;
      this.tooltipDir.toggle(element);

      const elements = document.querySelectorAll('.menuDiv .dropdown-item');
      elements.forEach(element => {
        element.addEventListener("click", (e) => { this.hideMenu() });
      });
    }

  }

  hideMenu() {
    this.tooltipDir.hide();
    this.menuData = undefined;
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
    localStorage.setItem('worksOrderSingleData', JSON.stringify(item)); // clear storage from logout service as well
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

          } else if (data.data.pRETURNSTATUS == 'S') {
            this.errorDeleteMsg = '';
            this.deleteReasonMsgInput = true;
            this.woFormDeleteWindow = true;
          }

        }

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
    } else {
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

        },
        error => {
          this.alertService.error(error);

        }
      )

    }

  }


  closeWoFormWin($event) {
    this.woFormWindow = $event;
    $('.bgblur').removeClass('ovrlay');
    this.getUserWorksOrdersList(this.filterObject);
  }

  export() {
    if (this.gridView.total > 0 && this.gridView.data) {
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
    this.selectedWorksOrder = item;
    this.woProgramManagmentInstructionsWindow = true;
    $('.worksOrderOverlay').addClass('ovrlay');
  }

  closeWoProgramManagmentInstructionsWin(eve) {
    this.woProgramManagmentInstructionsWindow = eve;
    $('.worksOrderOverlay').removeClass('ovrlay');
  }

  openCompletionList(item) {
    $('.worksOrderOverlay').addClass('ovrlay');
    this.selectedWorksOrder = item;
    this.completionList = true;
  }

  closeCompletionList($event) {
    this.completionList = $event;
    $('.worksOrderOverlay').removeClass('ovrlay');
  }


  openDocumentMethod(item) {
    if (item.worksOrderFileCount == 0) return;
    this.selectedWorksOrder = item;
    $('.worksOrderOverlay').addClass('ovrlay');
    this.documentWindow = true;
  }

  openProgrammeLog(item) {
    this.selectedWorksOrder = item;
    this.ProgrammeLogWindow = true;
    $('.worksOrderOverlay').addClass('ovrlay');
  }

  closeProgrammeLogWindow(eve) {
    this.ProgrammeLogWindow = eve;
    $('.worksOrderOverlay').removeClass('ovrlay');
  }


  openWoAssociationsManage(item) {
    this.selectedWorksOrder = item;
    this.WoAssociationsManageWindow = true;
    $('.worksOrderOverlay').addClass('ovrlay');
  }

  closeWoAssociationsManageWindowMain(eve) {
    this.WoAssociationsManageWindow = eve;
    $('.worksOrderOverlay').removeClass('ovrlay');
  }

  closeDocumentWindow(eve) {
    this.documentWindow = eve;
    $('.worksOrderOverlay').removeClass('ovrlay');
  }

  viewWOReportingAsset(reportLevel, dataItem: any = null) {

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

    const fieldsToFormat = {
      'budget': 'money',
      'forecast': 'money',
      'committed': 'money',
      'accepted': 'money',
      'actual': 'money',
      'approved': 'money',
      'pending': 'money',
      'forecast_Fee': 'money',
      'committed_Fee': 'money',
      'approved_Fee': 'money',
      'pending_Fee': 'money',
      'actual_Fee': 'money',
      'payment': 'money',
      'updated_On': 'date',
      'issuedaterep': 'date',
      'targetcomdaterep': 'date',
      'acceptdaterep': 'date',
      'planstartdaterep': 'date',
      'planenddaterep': 'date',
      'startdaterep': 'date',
      'enddaterep': 'date',
      'handoverdaterep': 'date',
      'completiondaterep': 'date',
      'paymentdaterep': 'date',
    }

    this.worksOrderReportService.getWOReportingAsset(wprsequence, wosequence, wopsequence, level).subscribe(
      (data) => {
        if (data.isSuccess == true) {
          if (data.data.length == 0) {
            this.alertService.error("No Record Found.");
            return
          }
          let fileName = "WOReportAsset_" + wosequence + "_" + wprsequence + "_" + level;
          this.helperService.exportAsExcelFileWithCustomiseFields(data.data, fileName, label, fieldsToFormat)
        } else {
          this.alertService.error(data.message);
        }
      },
      error => {
        this.alertService.error(error);
      }
    )

  }

  viewWOReportingProgSummaryTree(reportType, dataItem: any = null) {
    const wprsequence = (dataItem != null) ? dataItem.wprsequence : 0;
    const wosequence = (dataItem != null) ? dataItem.wosequence : 0;
    let level = reportType;

    const label = {
      programme: "Programme",
      works_Order: "Works Order",
      phase: "Phase",
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

    const fieldsToFormat = {
      'actual___Planned_Start_Date': 'date',
      'actual___Planned_End_Date': 'date',
      'budget': 'money',
      'forecast': 'money',
      'committed': 'money',
      'accepted': 'money',
      'actual': 'money',
      'approved': 'money',
      'pending': 'money',
      'payments': 'money',
    }

    this.worksOrderReportService.getWOReportingProgSummaryTree(wprsequence, wosequence, level).subscribe(
      (data) => {
        if (data.isSuccess == true) {
          if (data.data.length == 0) {
            this.alertService.error("No Record Found.");
            return
          }
          let fileName = "WOReport_" + wosequence + "_" + wprsequence + "_" + level;
          this.helperService.exportAsExcelFileWithCustomiseFields(data.data, fileName, label, fieldsToFormat)
        } else {
          this.alertService.error(data.message);
        }
      },
      error => {
        this.alertService.error(error);
      }
    )

  }

  openManageMilestonePopup(item, openFor) {
    this.openMilestoneFor = openFor;
    this.selectedWorksOrder = item;
    this.openManageMilestone = true;
    $('.worksOrderOverlay').addClass('ovrlay');

  }

  closeManageMilestone($event) {
    $('.worksOrderOverlay').removeClass('ovrlay');
    this.openManageMilestone = $event;
  }

  openDefectsMethod(item) {
    this.selectedWorksOrder = item;
    $('.worksOrderOverlay').addClass('ovrlay');
    this.openDefectsList = true;
  }

  closeDefectList(eve) {
    this.openDefectsList = eve;
    $('.worksOrderOverlay').removeClass('ovrlay');
  }


  WOCreateXportOutputReport(xPortId, reportName) {
    let params = {
      "intXportId": xPortId,
      "lstParamNameValue": ["Works Order Number", this.selectedWorksOrder.wosequence],
      "lngMaxRows": 40000
    };
    if (xPortId == 587 || xPortId == 588) {
      params.lstParamNameValue = ["Master Works Order", this.selectedWorksOrder.wosequence];
    }

    this.subs.add(
      this.reportingGrpService.runReport(xPortId, params.lstParamNameValue, this.currentUser.userId, "EXCEL", false, true).subscribe(
        data => {
          const linkSource = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + data;
          const downloadLink = document.createElement("a");
          const fileName = `${reportName}_${xPortId}.xlsx`;
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }
      )
    )
  }


  disableMilestoneBtn(menuData) {
    if (menuData.wottemplatetype == "Works Order Milestone" || menuData.wottemplatetype == "Phase Milestone") {
      return false
    }

    return true;
  }


  openWOPMPaymentSchedule(item) {
    this.selectedWorksOrder = item;
    $('.worksOrderOverlay').addClass('ovrlay');
    this.openWOPaymentScheduleWindow = true;
  }

  closePaymentScheduleWindow($event) {
    $('.worksOrderOverlay').removeClass('ovrlay');
    this.openWOPaymentScheduleWindow = $event;
  }



  openChecklist(dataItem) {
    this.selectedWorksOrder = dataItem;
    $('.bgblur').addClass('ovrlay');
    this.showChecklist = true;

  }
  closeChecklistWindow($event) {
    this.showChecklist = $event;
    $('.bgblur').removeClass('ovrlay');
}

  ShowWorkList(type:string, dataItem) {
    let querystring : string = "";
    switch (type) {
      case "Contractor":
        querystring = `?Contractor=true`;
        const worklistcontractor = {
          concode : dataItem.concode,
          contractorName : dataItem.contractorName
        };
        localStorage.setItem('worklistcontractor', JSON.stringify(worklistcontractor));
        break;

      case "Contract":
        querystring = `?Contract=true`;
        const worklistcontract = {
          concode : dataItem.concode,
          contractorName : dataItem.contractorName,
          cttsurcde : dataItem.cttsurcde,
          contractName : dataItem.contractName
        };
        localStorage.setItem('worklistcontract', JSON.stringify(worklistcontract));
        break;

      case "WorksOrder":
        querystring = `?WorksOrder=true`;
        localStorage.setItem('worklistwosequence', JSON.stringify(dataItem.wosequence));
        break;

      default:
        break;
    }

    let siteUrl = `${appConfig.appUrl}/worksorders/worklist${querystring}`
    window.open(siteUrl, "_blank");

  }
}
