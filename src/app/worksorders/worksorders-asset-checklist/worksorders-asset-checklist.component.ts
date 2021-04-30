import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService } from '../../_services'
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-worksorders-asset-checklist',
  templateUrl: './worksorders-asset-checklist.component.html',
  styleUrls: ['./worksorders-asset-checklist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class WorksordersAssetChecklistComponent implements OnInit {
  @Input() assetchecklistWindow: boolean = false;
  @Input() selectedChildRow: any;
  @Output() closeAssetchecklistEvent = new EventEmitter<boolean>();
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
  assetCheckListData: any;
  gridView: DataResult;
  gridLoading = true
  pageSize = 25;
  title = 'Works Orders Asset Checklist';
  mySelection = [];
  selectedChecklist = [];
  selectedChecklistsingleItem: any;
  loading = true;

  programmeData: any;
  worksOrderData: any;
  phaseData: any;
  gridHeight = 680;
  filterToggle = false;
  readonly = true;

  checklistDocWindow = false;
  predecessors: boolean = false;
  predecessorsWindowFrom = 'assetchecklist';

  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  chooseDateWindow = false;
  chooseDateType = 'status';

  worksOrderAccess: any = [];
  selectedDate: any;
  workorderAsset: any

  assetDetailWindow: boolean = false;


  addAssetWorklistWindow: boolean = false;
  addWorkorderType = '';
  itemPassToWorkList: any;

  wodDetailType: string = 'all'
  worksOrderUsrAccess: any = [];
  touchtime = 0;

  constructor(
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {

    //subscribe for work order security access
    this.subs.add(
      combineLatest([
        this.sharedService.woUserSecObs,
        this.sharedService.worksOrdersAccess
      ]).subscribe(
        data => {
          this.worksOrderUsrAccess = data[0];
          this.worksOrderAccess = data[1];
        }
      )
    )

    this.worksOrderDetailPageData();

    // this.subs.add(
    //   this.sharedService.worksOrdersAccess.subscribe(
    //     data => {
    //       this.worksOrderAccess = data;

    //     }
    //   )
    // )

  }

  worksOrderDetailPageData() {
    const wprsequence = this.selectedChildRow.wprsequence;
    const intWOSEQUENCE = this.selectedChildRow.wosequence;

    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorkProgrammesByWprsequence(wprsequence),
        this.worksorderManagementService.getWorksOrderByWOsequence(intWOSEQUENCE),
        this.worksorderManagementService.getPhase(this.selectedChildRow.wosequence, this.selectedChildRow.wopsequence),
        this.worksorderManagementService.specificWorkOrderAssets(this.selectedChildRow.wosequence, this.selectedChildRow.assid, this.selectedChildRow.wopsequence),

      ]).subscribe(
        data => {
          // console.log(data)
          const programmeData = data[0];
          const worksOrderData = data[1];
          const phaseData = data[2];
          const workorderAsset = data[3];

          if (programmeData.isSuccess) this.programmeData = programmeData.data[0];
          if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;
          if (phaseData.isSuccess) this.phaseData = phaseData.data;
          if (workorderAsset.isSuccess) this.workorderAsset = workorderAsset.data[0];

          this.checkListGridData();

        }
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  checkListGridData() {
    this.subs.add(
      this.worksorderManagementService.assetChecklistGridData(this.selectedChildRow.wosequence, this.selectedChildRow.assid, this.selectedChildRow.wopsequence).subscribe(
        data => {
          // console.log(data)
          if (data.isSuccess) {
            this.assetCheckListData = data.data;
            this.gridView = process(this.assetCheckListData, this.state);
          } else {
            this.alertService.error(data.message);
          }
          this.loading = false
          this.resetSelections()
          this.chRef.detectChanges();
        }
      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.assetCheckListData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.assetCheckListData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.assetCheckListData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.assetCheckListData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedChecklistsingleItem = dataItem
    if (columnIndex > 0) {
      if (this.touchtime == 0) {
        this.touchtime = new Date().getTime();
      } else {

        if (((new Date().getTime()) - this.touchtime) < 400) {
          if (dataItem.wocheckspeciaL1 == 'WORK' && dataItem.detailCount > 0) {
            this.openAssetDetailChild('single', dataItem)
          }


          this.touchtime = 0;
        } else {
          // not a double click so set as a new first click
          this.touchtime = new Date().getTime();
        }

      }
    }
    // console.log(this.selectedChecklistsingleItem);
    this.chRef.detectChanges();
    // console.log(dataItem);
  }

  mySelectionKey(context: RowArgs): string {
    return context.dataItem.wochecksurcde;
    //return context.dataItem.wosequence + '_' + context.dataItem.wochecksurcde + '_' + context.dataItem.wostagesurcde;
  }

  closeAssetcheckListWindow() {
    this.assetchecklistWindow = false;
    this.closeAssetchecklistEvent.emit(this.assetchecklistWindow);
  }

  public slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-assetchecklist-header').slideToggle();
    if (this.filterToggle) this.gridHeight = 400;
    else this.gridHeight = 680;
    this.chRef.detectChanges();

  }

  openChecklistDoc() {
    if (this.mySelection.length != 1) return
    $('.checklistOverlay').addClass('ovrlay');
    // console.log(this.selectedChecklistsingleItem); debugger;
    this.checklistDocWindow = true;
  }

  closeChecklistDoc() {
    $('.checklistOverlay').removeClass('ovrlay');
    this.checklistDocWindow = false;
    this.worksOrderDetailPageData();
  }

  setSeletedRow(dataItem) {
    this.mySelection = [];
    this.selectedChecklist = [];
    // this.mySelection.push(dataItem.eventSequence)
    this.selectedChecklist.push(dataItem)
  }

  openPredecessors(item) {
    this.selectedChecklist = [];
    $('.checklistOverlay').addClass('ovrlay');
    this.predecessors = true;
    this.selectedChecklist.push(item)
  }

  closePredecessors(eve) {
    this.selectedChecklist = [];
    $('.checklistOverlay').removeClass('ovrlay');
    this.predecessors = false;
  }


  setStatus(type, item, checkOrProcess = 'C') {
    this.selectedChecklistsingleItem = item;
    this.chooseDateType = type;
    let apiName = '';
    let params: any = {}
    params.WOSEQUENCE = item.wosequence;
    params.WOPSEQUENCE = item.wopsequence;
    params.ASSID_STAGESURCDE_CHECKSURCDE = [item.assid, item.wostagesurcde, item.wochecksurcde]
    params.UserId = this.currentUser.userId;
    params.CHECKORPROCESS = checkOrProcess;


    if (type == 'NA') {
      apiName = 'SetWorksOrderCheckListStatusToNA'
    } else if (type == 'RESET') {
      apiName = 'ResetChecklistItem'
    } else if (type == 'NOT STARTED') {
      apiName = 'WorksOrderCheckListStatusToNotStarted'
    } else if (type == 'IPY') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.getDateString('Yesterday');
      params.CheckName = item.wocheckname
    } else if (type == 'IPT') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.getDateString('Today');
      params.CheckName = item.wocheckname
    } else if (type == 'IPD') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.dateFormate(this.selectedDate.selectedDate);
      params.CheckName = item.wocheckname
    }


    this.subs.add(
      this.worksorderManagementService.setStatus(apiName, params).subscribe(
        data => {

          if (data.isSuccess) {
            let resp: any;
            if (data.data[0] == undefined) {
              resp = data.data;
            } else {
              resp = data.data[0];
            }

            if (checkOrProcess == "C" && (resp.pRETURNSTATUS == "E" || resp.pRETURNSTATUS == "S")) {
              this.openConfirmationDialog(type, item, resp)
            } else {
              this.alertService.success(resp.pRETURNMESSAGE)
              this.worksOrderDetailPageData();
              // this.selectedChecklistsingleItem = undefined;
            }
          } else {
            this.alertService.error(data.message);
          }

        },
        err => this.alertService.error(err)
      )
    )
  }

  public openConfirmationDialog(type, item, res, apiType = 'status') {
    let checkstatus = "C";
    if (res.pRETURNSTATUS == 'S') {
      checkstatus = "P"
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => {
        if (confirmed) {
          if (res.pRETURNSTATUS == 'E') {
            return
          }

          if (apiType == 'status') {
            this.setStatus(type, item, checkstatus)
          } else if (apiType == 'dates') {
            this.setDates(type, item, checkstatus);
          } else if (apiType == 'complete') {
            this.setComplete(type, item, checkstatus);
          }

        }
        //(confirmed) ? this.setStatus(type, item, 'P') : console.log(confirmed)
      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }

  openChooseDate(type, item) {
    this.selectedChecklistsingleItem = item;
    this.chooseDateType = type;
    this.chooseDateWindow = true;
    this.chRef.detectChanges();
    $('.checklistOverlay').addClass('ovrlay');
  }


  setDates(type, item, checkOrProcess = 'C') {
    this.selectedChecklistsingleItem = item;
    this.chooseDateType = type;
    let apiName = '';

    let params: any = {}
    params.WOSEQUENCE = item.wosequence;
    params.WOPSEQUENCE = item.wopsequence;
    params.strASSID_STAGESURCDE_CHECKSURCDE = [item.assid, item.wostagesurcde, item.wochecksurcde]
    params.strUserId = this.currentUser.userId;
    params.strCheckOrProcess = checkOrProcess;


    if (type == 'SE') {
      apiName = 'SetWorksOrderCheckListPlannedDates'
      params.dtStartDate = this.dateFormate(this.selectedDate.start);
      params.dtEndDate = this.dateFormate(this.selectedDate.end);

    } else if (type == 'TCY') {
      apiName = 'SetWorksOrderCheckListTargetDate';
      params.dtDate = this.getDateString('Yesterday');
    } else if (type == 'TCTOD') {
      apiName = 'SetWorksOrderCheckListTargetDate';
      params.dtDate = this.getDateString('Today');
    } else if (type == 'TCTOM') {
      apiName = 'SetWorksOrderCheckListTargetDate';
      params.dtDate = this.getDateString('Tomorrow');
    } else if (type == 'TC7') {
      apiName = 'SetWorksOrderCheckListTargetDate';
      params.dtDate = this.getDateString('Next 7');
    } else if (type == 'TCPICK') {
      apiName = 'SetWorksOrderCheckListTargetDate'
      params.dtDate = this.dateFormate(this.selectedDate.selectedDate);
    }


    else if (type == 'CSDY') {
      apiName = 'UpdateChecklistStartDate'
      params = {};
      params.WOSEQUENCE = item.wosequence;
      params.WOPSEQUENCE = item.wopsequence;
      params.strASSID_STAGE_CHECK = [item.assid, item.wostagesurcde, item.wochecksurcde]
      params.strUserId = this.currentUser.userId;
      params.strCheckOrProcess = checkOrProcess;
      params.NewDate = this.getDateString('Yesterday');
    } else if (type == 'CSDT') {
      apiName = 'UpdateChecklistStartDate'
      params = {};
      params.WOSEQUENCE = item.wosequence;
      params.WOPSEQUENCE = item.wopsequence;
      params.strASSID_STAGE_CHECK = [item.assid, item.wostagesurcde, item.wochecksurcde]
      params.strUserId = this.currentUser.userId;
      params.strCheckOrProcess = checkOrProcess;
      params.NewDate = this.getDateString('Today');
    } else if (type == 'CSDPICK') {
      apiName = 'UpdateChecklistStartDate'
      params = {};
      params.WOSEQUENCE = item.wosequence;
      params.WOPSEQUENCE = item.wopsequence;
      params.strASSID_STAGE_CHECK = [item.assid, item.wostagesurcde, item.wochecksurcde]
      params.strUserId = this.currentUser.userId;
      params.strCheckOrProcess = checkOrProcess;
      params.NewDate = this.dateFormate(this.selectedDate.selectedDate);
    }

    else if (type == 'CCDY') {
      apiName = 'WorksOrderChangeCompletionDate';
      params.dtDate = this.getDateString('Yesterday');
    } else if (type == 'CCDT') {
      apiName = 'WorksOrderChangeCompletionDate';
      params.dtDate = this.getDateString('Today');
    } else if (type == 'CCDPICK') {
      apiName = 'WorksOrderChangeCompletionDate';
      params.dtDate = this.dateFormate(this.selectedDate.selectedDate);
    }

    this.subs.add(
      this.worksorderManagementService.setStatus(apiName, params).subscribe(
        data => {

          if (data.isSuccess) {
            let resp: any;
            if (data.data[0] == undefined) {
              resp = data.data;
            } else {
              resp = data.data[0];
            }

            if (checkOrProcess == "C" && (resp.pRETURNSTATUS == "E" || resp.pRETURNSTATUS == "S")) {
              this.openConfirmationDialog(type, item, resp, 'dates')
            } else {
              this.alertService.success(resp.pRETURNMESSAGE)
              this.worksOrderDetailPageData();
              // this.selectedChecklistsingleItem = undefined;
            }
          } else {
            this.alertService.error(data.message);
          }

        },
        err => this.alertService.error(err)
      )
    )


  }



  setComplete(type, item, checkOrProcess = 'C') {
    this.chooseDateType = type;
    this.selectedChecklistsingleItem = item;
    let apiName = 'WorksOrderCheckListCompleteItem';
    let params: any = {}
    params.WOSEQUENCE = item.wosequence;
    params.WOPSEQUENCE = item.wopsequence;
    params.ASSID_STAGESURCDE_CHECKSURCDE = [item.assid, item.wostagesurcde, item.wochecksurcde]
    params.UserId = this.currentUser.userId;
    params.CHECKORPROCESS = checkOrProcess;
    params.CheckName = item.wocheckname

    if (type == 'CIY') {
      params.dtDate = this.getDateString('Yesterday')
    } else if (type == 'CIT') {
      params.dtDate = this.getDateString('Today')
    } else if (type == 'CIPICK') {
      params.dtDate = this.dateFormate(this.selectedDate.selectedDate);
    }

    this.subs.add(
      this.worksorderManagementService.setStatus(apiName, params).subscribe(
        data => {

          if (!data.isSuccess) {
            this.alertService.error(data.message);
            return
          }

          let resp: any;
          if (data.data[0] == undefined) {
            resp = data.data;
          } else {
            resp = data.data[0];
          }

          if (checkOrProcess == "C" && (resp.pRETURNSTATUS == "E" || resp.pRETURNSTATUS == "S")) {
            this.openConfirmationDialog(type, item, resp, 'complete')
          } else {
            this.alertService.success(resp.pRETURNMESSAGE)
            this.worksOrderDetailPageData();
            this.selectedChecklistsingleItem = undefined
          }

        }, err => this.alertService.error(err)
      )
    )




  }

  getDateString(type = "Today") {
    let todayDateObj = new Date();

    if (type == "Tomorrow") {
      let tomDateObj = new Date(todayDateObj);
      tomDateObj.setDate(todayDateObj.getDate() + 1);
      return `${this.helperService.zeorBeforeSingleDigit(tomDateObj.getFullYear())}-${this.helperService.zeorBeforeSingleDigit(tomDateObj.getMonth() + 1)}-${this.helperService.zeorBeforeSingleDigit(tomDateObj.getDate())}`;
    }

    if (type == "Next 7") {
      let next7DateObj = new Date(todayDateObj);
      next7DateObj.setDate(todayDateObj.getDate() + 7);
      return `${this.helperService.zeorBeforeSingleDigit(next7DateObj.getFullYear())}-${this.helperService.zeorBeforeSingleDigit(next7DateObj.getMonth() + 1)}-${this.helperService.zeorBeforeSingleDigit(next7DateObj.getDate())}`;
    }

    if (type == "Yesterday") {
      let yesterdayDateObj = new Date(todayDateObj);
      yesterdayDateObj.setDate(todayDateObj.getDate() - 1);
      return `${this.helperService.zeorBeforeSingleDigit(yesterdayDateObj.getFullYear())}-${this.helperService.zeorBeforeSingleDigit(yesterdayDateObj.getMonth() + 1)}-${this.helperService.zeorBeforeSingleDigit(yesterdayDateObj.getDate())}`;
    }

    //Default Today
    return `${this.helperService.zeorBeforeSingleDigit(todayDateObj.getFullYear())}-${this.helperService.zeorBeforeSingleDigit(todayDateObj.getMonth() + 1)}-${this.helperService.zeorBeforeSingleDigit(todayDateObj.getDate())}`;



  }



  closeChooseDate(event) {
    this.chooseDateWindow = event;
    $('.checklistOverlay').removeClass('ovrlay');
  }

  selectedDateEvent(event) {

    this.selectedDate = event
    // console.log(this.selectedDate)
    // console.log(this.chooseDateType)
    // debugger;

    if (this.chooseDateType == "SE") {
      this.setDates(this.chooseDateType, this.selectedChecklistsingleItem, 'C')
    } else if (this.chooseDateType == "IPD") {
      this.setStatus(this.chooseDateType, this.selectedChecklistsingleItem, 'C')
    } else if (this.chooseDateType == "TCPICK") {
      this.setDates(this.chooseDateType, this.selectedChecklistsingleItem, 'C')
    } else if (this.chooseDateType == "CSDPICK") {
      this.setDates(this.chooseDateType, this.selectedChecklistsingleItem, 'C')
    } else if (this.chooseDateType == "CCDPICK") {
      this.setDates(this.chooseDateType, this.selectedChecklistsingleItem, 'C')
    } else if (this.chooseDateType == "CIPICK") {
      this.setComplete(this.chooseDateType, this.selectedChecklistsingleItem, 'C')
    } else if (this.chooseDateType == "IPDM") {
      this.setStatusMul(this.chooseDateType, "C")
    } else if (this.chooseDateType == "CIPICKM") {
      this.setStatusMul(this.chooseDateType, "C")
    }

  }

  setAsset(type, checkOrProcess = 'C') {
    let params: any = {};
    this.chooseDateType = type;
    let callApi: any;

    //this.selectedChecklistsingleItem = item;
    params.WOSEQUENCE = this.phaseData.wosequence;
    params.WOPSEQUENCE = this.phaseData.wopsequence;
    params.strASSID = [this.selectedChildRow.assid]
    params.strUserId = this.currentUser.userId;
    params.strCheckOrProcess = checkOrProcess;
    params.concateAddress = this.selectedChildRow.woname;

    if (type == "RELEASE") {
      callApi = this.worksorderManagementService.worksOrderReleaseAsset(params);
    } else if (type == "ACCEPT") {
      if (!this.selectedChecklistsingleItem || this.workorderAsset.woassstatus == "In Progress") {
        return
      }
      callApi = this.worksorderManagementService.worksOrderAcceptAsset(params);
    } else if (type == "ISSUE") {
      params.UserName = this.currentUser.userName;
      // if (!this.selectedChecklistsingleItem || this.workorderAsset.woassstatus != "Pending") {
      //   return
      // }
      callApi = this.worksorderManagementService.worksOrderIssueAsset(params);
    }


    this.subs.add(
      callApi.subscribe(
        data => {
          if (!data.isSuccess) {
            this.alertService.error(data.message);
            return
          }

          let resp: any;
          if (data.data[0] == undefined) {
            resp = data.data;
          } else {
            resp = data.data[0];
          }

          if (checkOrProcess == "C" && (resp.pRETURNSTATUS == "E" || resp.pRETURNSTATUS == "S")) {
            this.openConfirmationDialogAction(type, resp)
          } else {
            this.alertService.success(resp.pRETURNMESSAGE)
            this.worksOrderDetailPageData();

          }
        }
      )
    )


  }


  openConfirmationDialogAction(type, res, apiType = 'status') {
    let checkstatus = "C";
    if (res.pRETURNSTATUS == 'S') {
      checkstatus = "P"
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => {
        if (confirmed) {
          if (res.pRETURNSTATUS == 'E') {
            return
          }

          this.setAsset(type, checkstatus);


        }
        //(confirmed) ? this.setStatus(type, item, 'P') : console.log(confirmed)
      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }


  dateFormate(value) {
    if (value == undefined || typeof value == 'undefined' || typeof value == 'string') {
      return new Date('1753-01-01').toJSON()
    }

    const dateStr = `${value.year}-${this.helperService.zeorBeforeSingleDigit(value.month)}-${this.helperService.zeorBeforeSingleDigit(value.day)}`;
    return new Date(dateStr).toJSON()
  }


  openAssetDetailChild(detailType, item = null) {
    this.wodDetailType = detailType;

    if (detailType == "single") {
      if (!this.selectedChecklistsingleItem || this.selectedChecklistsingleItem.detailCount == 0) {
        return;
      }

      this.selectedChecklistsingleItem = item;
    }


    $('.checklistOverlay').addClass('ovrlay');
    this.assetDetailWindow = true;

    // this.selectedRow = this.selectedChildRow;
    // this.selectedChildRow = item;
    // this.selectedRow = item;
    // this.treelevel = 3;

    // this.selectedParentRow = JSON.parse(item.parentData);

  }

  closeAssetDetailWindow(eve) {
    this.assetDetailWindow = eve;
    $('.checklistOverlay').removeClass('ovrlay');
    // this.selectedChecklistsingleItem = undefined;
  }



  openAddAssetWorkOrdersList(item, addWorkorderType) {
    if (addWorkorderType != "all") {
      if ((this.selectedChildRow.treelevel == 3 && this.selectedChildRow.wostatus != "New") || (item.wocheckspeciaL1 != 'WORK')) {
        return
      }
      this.selectedChecklistsingleItem = item
    } else {
      this.resetSelections()
    }

    this.itemPassToWorkList = item;
    this.addWorkorderType = addWorkorderType;
    this.addAssetWorklistWindow = true;
    $('.checklistOverlay').addClass('ovrlay');
  }


  closeAddAssetWorkordersListWindow(eve) {
    this.addAssetWorklistWindow = eve;
    $('.checklistOverlay').removeClass('ovrlay');
  }

  refreshGrid(eve) {
    this.worksOrderDetailPageData();
  }

  resetSelections() {
    this.selectedChecklistsingleItem = undefined;
    this.mySelection = [];
  }

  removeOrDeletework(type, checkOrProcess = "C") {
    if (!this.selectedChecklistsingleItem || this.selectedChecklistsingleItem.detailCount == 0) {
      return;
    }

    let params: any = {}

    if (type == "remove") params.RemoveWorkList = false;
    else if (type == "delete") params.RemoveWorkList = true;

    params.WOSEQUENCE = this.selectedChecklistsingleItem.wosequence;
    params.WOPSEQUENCE = this.selectedChecklistsingleItem.wopsequence;
    params.ASSID_STAGESURCDE_CHECKSURCDE = [this.selectedChecklistsingleItem.assid, this.selectedChecklistsingleItem.wostagesurcde, this.selectedChecklistsingleItem.wochecksurcde];
    params.strUserId = this.currentUser.userId;
    params.strCheckOrProcess = checkOrProcess;

    this.subs.add(
      this.worksorderManagementService.worksOrderRemoveAllWork(params).subscribe(
        data => {

          let resp: any;
          if (data.data[0] == undefined) {
            resp = data.data;
          } else {
            resp = data.data[0];
          }

          if (checkOrProcess == "C" && (resp.pRETURNSTATUS == "E" || resp.pRETURNSTATUS == "S")) {
            this.confirmationForDeleteOrRemoveWork(type, resp)
          } else {
            this.alertService.success(resp.pRETURNMESSAGE)
            this.worksOrderDetailPageData();
            this.selectedChecklistsingleItem = undefined
          }
        }
      )
    )

  }

  confirmationForDeleteOrRemoveWork(type, res) {
    let checkstatus = "C";
    if (res.pRETURNSTATUS == 'S') {
      checkstatus = "P"
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => {
        if (confirmed) {
          if (res.pRETURNSTATUS == 'E') {
            return
          }

          this.removeOrDeletework(type, checkstatus);
        }

      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }



  setStatusMul(type, checkOrProcess = 'C') {

    if (this.mySelection.length == 0) {
      return
    }

    let filterChecklist = this.assetCheckListData.filter(x => this.mySelection.includes(x.wochecksurcde))

    if (filterChecklist.length == 0) {
      return
    }

    let ASSID_STAGESURCDE_CHECKSURCDE = [];
    for (const checklist of filterChecklist) {
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.assid)
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wostagesurcde)
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wochecksurcde)
    }
    // console.log(filterChecklist)


    this.chooseDateType = type;
    let apiName = '';
    let params: any = {}
    params.WOSEQUENCE = filterChecklist[0].wosequence;
    params.WOPSEQUENCE = filterChecklist[0].wopsequence;
    params.ASSID_STAGESURCDE_CHECKSURCDE = ASSID_STAGESURCDE_CHECKSURCDE;
    params.UserId = this.currentUser.userId;
    params.CHECKORPROCESS = checkOrProcess;
    params.RecordCount = this.mySelection.length
    params.CheckName = this.mySelection.length == 1 ? filterChecklist[0].wocheckname : ''

    if (type == 'NA') {
      apiName = 'SetWorksOrderCheckListStatusToNA'
    } else if (type == 'RESET') {
      apiName = 'ResetChecklistItem'
    } else if (type == 'NOT STARTED') {
      apiName = 'WorksOrderCheckListStatusToNotStarted'
    } else if (type == 'IPY') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.getDateString('Yesterday');
      // params.CheckName = ''

    } else if (type == 'IPT') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.getDateString('Today');
      // params.CheckName = '';

    } else if (type == 'IPDM') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.dateFormate(this.selectedDate.selectedDate);
      // params.CheckName = ''



    } else if (type == 'CIY') {
      apiName = "WorksOrderCheckListCompleteItem"
      params.dtDate = this.getDateString('Yesterday')
    } else if (type == 'CIT') {
      apiName = "WorksOrderCheckListCompleteItem"
      params.dtDate = this.getDateString('Today')
    } else if (type == 'CIPICKM') {
      apiName = "WorksOrderCheckListCompleteItem"
      params.dtDate = this.dateFormate(this.selectedDate.selectedDate);
    }


    this.subs.add(
      this.worksorderManagementService.setStatus(apiName, params).subscribe(
        data => {

          if (data.isSuccess) {
            let resp: any;
            if (data.data[0] == undefined) {
              resp = data.data;
            } else {
              resp = data.data[0];
            }

            if (checkOrProcess == "C" && (resp.pRETURNSTATUS == "E" || resp.pRETURNSTATUS == "S")) {
              this.confirmationForMultipleStatus(type, resp)
            } else {
              this.alertService.success(resp.pRETURNMESSAGE)
              this.worksOrderDetailPageData();
              // this.selectedChecklistsingleItem = undefined;
            }
          } else {
            this.alertService.error(data.message);
          }

        },
        err => this.alertService.error(err)
      )
    )


  }



  confirmationForMultipleStatus(type, res, apiType = 'status') {
    let checkstatus = "C";
    if (res.pRETURNSTATUS == 'S') {
      checkstatus = "P"
    }

    $('.k-window').css({ 'z-index': 1000 });

    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => {
        if (confirmed) {
          if (res.pRETURNSTATUS == 'E') {
            return
          }

          this.setStatusMul(type, checkstatus);

        }

      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }


  disableBtnsIndividualMenu(name, item) {
    // this.selectedChecklistsingleItem = item

    if (name == "status") {
      return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued'
    }

    if (name == "SE") {
      return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Final Completion'
    }

    if (name == "STCD") {
      return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued' || this.workorderAsset?.woassstatus == 'Final Completion'
    }

    if (name == "CSD") {
      return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued' || this.workorderAsset?.woassstatus == 'Final Completion'
    }

    if (name == "CCD") {
      return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued'
    }

    if (name == "CMP") {
      return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued'
    }

    if (name == "WOADD") {
      return this.selectedChildRow.wostatus != 'New' || item.wocheckspeciaL1 != 'WORK'
    }

    if (name == "WODETAIL") {
      return item?.detailCount == 0
    }


    return false
  }

  disableMainActions(type) {
    if (type == "woremoveAll" || type == "wodeleteAll") {
      return !this.selectedChecklistsingleItem || this.selectedChecklistsingleItem.detailCount == 0
    }

    if (type == "woAdd") {
      return this.workorderAsset?.woassstatus != 'New'
    }

    if (type == "release") {
      return !this.selectedChecklistsingleItem || this.workorderAsset?.woassstatus != 'New'
    }

    if (type == "issue") {
      return !this.selectedChecklistsingleItem || this.workorderAsset?.woassstatus != 'Pending'
    }

    if (type == "accept") {
      return !this.selectedChecklistsingleItem || this.workorderAsset?.woassstatus != 'Issued'
    }

    if (type == "na" || type == "STIP" || type == "NS" || type == "RCI" || type == "COMP") {
      return this.mySelection.length == 0 || this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued'
    }



  }



  woMenuBtnSecurityAccess(menuName) {
    if (this.currentUser.admin == "Y") {
      return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    } else {
      return this.worksOrderUsrAccess.indexOf(menuName) != -1
    }
  }

}
