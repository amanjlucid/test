import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService, WorksorderReportService } from '../../_services'
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
  actionType = 'single'
  userType: any = [];
  noaccessWindow: boolean = false;
  noaccessHistory: boolean = false;
  openAssetRemoveReason = false;
  reason: string = '';
  openVariationList: boolean = false;
  variationNewOrIssue = false;
  openDefectsList = false;
  diplayResInfoMenu: boolean = false;
  ProgrammeLogWindow = false;
  programmeLogFor = 'assetchecklist';

  showCustomerSurveyWindow: boolean = false;
  showEditCommentWindow: boolean = false;
  commentMode: string;
  commentParms;
  commentChecklist;
  assetID: string;
  displayResidentDetails: boolean = false;

  constructor(
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
    private sharedService: SharedService,
    private worksOrderReportService: WorksorderReportService,
  ) { }

  ngOnInit(): void {
    //subscribe for work order security access
    this.subs.add(
      combineLatest([
        this.sharedService.woUserSecObs,
        this.sharedService.worksOrdersAccess,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          this.worksOrderUsrAccess = data[0];
          this.worksOrderAccess = data[1];
          this.userType = data[2][0];
        }
      )
    )

    let v = this.selectedChildRow
    this.diplayResInfoMenu = (this.selectedChildRow.residentriskcode > 0);
    this.worksOrderDetailPageData();


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
          const programmeData = data[0];
          const worksOrderData = data[1];
          const phaseData = data[2];
          const workorderAsset = data[3];

          if (programmeData.isSuccess) this.programmeData = programmeData.data[0];
          if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;
          if (phaseData.isSuccess) this.phaseData = phaseData.data;
          if (workorderAsset.isSuccess) this.workorderAsset = workorderAsset.data[0];

          this.checkListGridData();
          this.getVariationIndicator();

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

  getVariationIndicator() {
    const { wosequence, assid, wopsequence } = this.selectedChildRow;
    this.subs.add(
      this.worksorderManagementService.getVariationIndicator(wosequence, wopsequence, assid).subscribe(
        data => {
          if (data.isSuccess) this.variationNewOrIssue = data.data;
          else this.alertService.error(data.message);
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

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited, originalEvent }) {
    this.selectedChecklistsingleItem = dataItem;
    if (originalEvent.ctrlKey == false) {
      if (this.mySelection.length > 0) {
        this.mySelection = [dataItem.wochecksurcde];
      }
    }

    if (columnIndex > 0) {
      if (this.touchtime == 0) {
        this.touchtime = new Date().getTime();
      } else {

        if (((new Date().getTime()) - this.touchtime) < 400) {
          if (dataItem.wocheckspeciaL1 == 'WORK' && dataItem.detailCount > 0) {
            this.openAssetDetailChild('single', dataItem)
          }

          if (dataItem.wocheckspeciaL1 == 'ACCESS') {
            this.openNoAccessHistory()
          }


          this.touchtime = 0;
        } else {
          // not a double click so set as a new first click
          this.touchtime = new Date().getTime();
        }

      }
    }

    this.chRef.detectChanges();

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
    this.actionType = "single";
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

      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }

  openChooseDate(type, item) {
    this.actionType = 'single';
    this.selectedChecklistsingleItem = item;
    this.chooseDateType = type;
    this.chooseDateWindow = true;
    this.chRef.detectChanges();
    $('.checklistOverlay').addClass('ovrlay');
  }

  openChooseDateMul(type) {
    this.actionType = 'multiple';
    this.chooseDateType = type;
    this.chooseDateWindow = true;
    this.chRef.detectChanges();
    $('.checklistOverlay').addClass('ovrlay');
  }

  selectDate(type) {
    this.chooseDateType = type;
    this.chooseDateWindow = true;
    this.chRef.detectChanges();
    $('.checklistOverlay').addClass('ovrlay');
  }



  setDatesMul(type, checkOrProcess = 'C') {
    this.actionType = 'multiple';
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

    this.chooseDateType = type;
    let apiName = '';
    let params: any = {}

    params.WOSEQUENCE = filterChecklist[0].wosequence;
    params.WOPSEQUENCE = filterChecklist[0].wopsequence;
    params.strASSID_STAGESURCDE_CHECKSURCDE = ASSID_STAGESURCDE_CHECKSURCDE;
    params.strUserId = this.currentUser.userId;
    params.strCheckOrProcess = checkOrProcess;
    params.RecordCount = this.mySelection.length
    params.CheckName = this.mySelection.length == 1 ? filterChecklist[0].wocheckname : ''

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
    } else if (type == 'CSDY') {
      apiName = 'UpdateChecklistStartDate';
      delete params.strASSID_STAGESURCDE_CHECKSURCDE;
      params.strASSID_STAGE_CHECK = ASSID_STAGESURCDE_CHECKSURCDE
      params.NewDate = this.getDateString('Yesterday');
    } else if (type == 'CSDT') {
      apiName = 'UpdateChecklistStartDate'
      delete params.strASSID_STAGESURCDE_CHECKSURCDE;
      params.strASSID_STAGE_CHECK = ASSID_STAGESURCDE_CHECKSURCDE
      params.NewDate = this.getDateString('Today');
    } else if (type == 'CSDPICK') {
      apiName = 'UpdateChecklistStartDate'
      delete params.strASSID_STAGESURCDE_CHECKSURCDE;
      params.strASSID_STAGE_CHECK = ASSID_STAGESURCDE_CHECKSURCDE
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
              this.confirmationForMultipleDate(type, resp)
            } else {
              this.alertService.success(resp.pRETURNMESSAGE)
              this.worksOrderDetailPageData();
            }
          } else {
            this.alertService.error(data.message);
          }

        },
        err => this.alertService.error(err)
      )
    )


  }



  setDates(type, item, checkOrProcess = 'C') {
    this.actionType = "single"
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
    this.actionType = 'single';
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

    if (this.chooseDateType == "HCD" || this.chooseDateType == "SOCD") {
      this.setAsset(this.chooseDateType, "C");
      return;
    }

    if (this.actionType == "single") {
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
      }
    }


    if (this.actionType == "multiple") {
      if (this.chooseDateType == "IPDM") {
        this.setStatusMul(this.chooseDateType, "C")
      } else if (this.chooseDateType == "CIPICKM") {
        this.setStatusMul(this.chooseDateType, "C")
      }

      else if (this.chooseDateType == "SE" || this.chooseDateType == "TCPICK" || this.chooseDateType == "CSDPICK" || this.chooseDateType == "CCDPICK") {
        this.setDatesMul(this.chooseDateType, "C")
      }
    }


  }


  setAsset(type, checkOrProcess = 'C') {
    let params: any = {};
    this.chooseDateType = type;
    let callApi: any;

    params.WOSEQUENCE = this.phaseData.wosequence;
    params.WOPSEQUENCE = this.phaseData.wopsequence;
    params.strASSID = [this.selectedChildRow.assid]
    params.strUserId = this.currentUser.userId;
    params.strCheckOrProcess = checkOrProcess;

    if (type == "RELEASE" || type == "ACCEPT" || type == "ISSUE") {
      params.concateAddress = this.selectedChildRow.woname;
    }

    if (type == "RELEASE") {
      callApi = this.worksorderManagementService.worksOrderReleaseAsset(params);
    } else if (type == "ACCEPT") {

      callApi = this.worksorderManagementService.worksOrderAcceptAsset(params);
    } else if (type == "ISSUE") {
      params.UserName = this.currentUser.userName;
      callApi = this.worksorderManagementService.worksOrderIssueAsset(params);
    }

    //#################
    else if (type == "HY") {
      params.dtDate = this.helperService.getDateString('Yesterday')
      callApi = this.worksorderManagementService.worksOrderHandoverAsset(params);
    }

    else if (type == "HT") {
      params.dtDate = this.helperService.getDateString('Today')
      callApi = this.worksorderManagementService.worksOrderHandoverAsset(params);
    }

    else if (type == "HCD") {
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
      callApi = this.worksorderManagementService.worksOrderHandoverAsset(params);
    }

    else if (type == "SOY") {
      params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.getDateString('Yesterday')
      callApi = this.worksorderManagementService.worksOrderAssetSignOff(params);
    }

    else if (type == "SOT") {
      params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.getDateString('Today')
      callApi = this.worksorderManagementService.worksOrderAssetSignOff(params);
    }

    else if (type == "SOCD") {
      params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
      callApi = this.worksorderManagementService.worksOrderAssetSignOff(params);
    }

    else if (type == "CANCEL") {
      params.strRefusalReason = this.reason;
      callApi = this.worksorderManagementService.worksOrderCancelAsset(params);
    }

    //###################


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
      }).catch(() => console.log('Attribute dismissed the dialog.'));
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

  }

  closeAssetDetailWindow(eve) {
    this.assetDetailWindow = eve;
    $('.checklistOverlay').removeClass('ovrlay');
    this.worksOrderDetailPageData();
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
    if (this.mySelection.length == 0) {
      return
    }

    let filterChecklist = this.assetCheckListData.filter(x => this.mySelection.includes(x.wochecksurcde));

    if (filterChecklist.length == 0) {
      return
    }

    let checkWork = filterChecklist.some(x => x.detailCount != 0);

    if (!checkWork) {
      this.alertService.error("There is no work to " + type)
      return
    }


    let params: any = {}
    let ASSID_STAGESURCDE_CHECKSURCDE = [];
    for (const checklist of filterChecklist) {
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.assid)
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wostagesurcde)
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wochecksurcde)
    }



    if (type == "remove") params.RemoveWorkList = false;
    else if (type == "delete") params.RemoveWorkList = true;

    params.WOSEQUENCE = this.selectedChecklistsingleItem.wosequence;
    params.WOPSEQUENCE = this.selectedChecklistsingleItem.wopsequence;
    params.ASSID_STAGESURCDE_CHECKSURCDE = ASSID_STAGESURCDE_CHECKSURCDE;
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

      }).catch(() => console.log('Attribute dismissed the dialog.'));
  }



  setStatusMul(type, checkOrProcess = 'C') {
    this.actionType = 'multiple';
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

    this.chooseDateType = type;
    let apiName = '';
    let params: any = {}
    params.WOSEQUENCE = filterChecklist[0].wosequence;
    params.WOPSEQUENCE = filterChecklist[0].wopsequence;
    params.ASSID_STAGESURCDE_CHECKSURCDE = ASSID_STAGESURCDE_CHECKSURCDE;
    params.UserId = this.currentUser.userId;
    params.CHECKORPROCESS = checkOrProcess;
    params.RecordCount = this.mySelection.length;
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

    } else if (type == 'IPT') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.getDateString('Today');

    } else if (type == 'IPDM') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.dateFormate(this.selectedDate.selectedDate);

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
            }
          } else {
            this.alertService.error(data.message);
          }

        },
        err => this.alertService.error(err)
      )
    )


  }


  confirmationForMultipleDate(type, res, apiType = 'status') {
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

          this.setDatesMul(type, checkstatus);

        }

      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
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

      }).catch(() => console.log('Attribute dismissed the dialog.'));
  }


  disableBtnsIndividualMenu(name, item) {
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

    if (name == "customerSurvey") {
      if (this.workorderAsset?.woassstatus == "Handover" || this.workorderAsset?.woassstatus == "Practical Completion" || this.workorderAsset?.woassstatus == "Final Completion") {
        return false;
      } else {
        return true;
      }
    }

    return false
  }


  disableMainActions(type) {
    if (type == "woremoveAll" || type == "wodeleteAll") {
      if (!this.selectedChecklistsingleItem) {
        return true;
      }

      let filterChecklist = this.assetCheckListData.filter(x => this.mySelection.includes(x.wochecksurcde));

      let checkWork = filterChecklist.some(x => x.detailCount != 0);
      if (checkWork == false) {
        return true
      } else {
        return false
      }

    }

    if (type == "woAdd") {
      return this.workorderAsset?.woassstatus != 'New'
    }

    if (type == "release") {
      return this.workorderAsset?.woassstatus != 'New'
    }

    if (type == "issue") {
      return this.workorderAsset?.woassstatus != 'Pending'
    }

    if (type == "accept") {
      return this.workorderAsset?.woassstatus != 'Issued'
    }

    if (type == "CANCEL") {
      return this.workorderAsset?.woassstatus != 'Issued' && this.workorderAsset?.woassstatus != "Accepted"
    }

    if (type == "na" || type == "STIP" || type == "NS" || type == "RCI" || type == "COMP") {
      return this.mySelection.length == 0 || this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued'
    }


    if (type == "handover") {
      if (this.workorderAsset != undefined) {
        const { woassstatus } = this.workorderAsset;
        if (woassstatus == "In Progress") return false;
      }

      return true;
    }

    if (type == "signoff") {
      if (this.workorderAsset != undefined) {
        const { woassstatus } = this.workorderAsset;
        if (woassstatus == "Handover") return false;
      }

      return true;
    }

    if (type == "LETTER") {
      if (this.assetCheckListData) {
        let filterChecklist = this.assetCheckListData.filter(x => this.mySelection.includes(x.wochecksurcde));
        return this.mySelection.length == 0 || filterChecklist.some(x => x.wocheckspeciaL1 != "LETTER");
      } else {
        return true;
      }

    }

    if (type == "comments") {
      return (this.mySelection.length == 0)
    }

  }



  woMenuBtnSecurityAccess(menuName) {
    return this.helperService.checkWorkOrderAreaAccess(this.userType, this.worksOrderAccess, this.worksOrderUsrAccess, menuName)
  }


  woGlobalSecurityAccess(menuName) {
    return this.worksOrderAccess.indexOf(menuName) != -1

  }


  openNoAccessWindow(item) {
    this.selectedChecklistsingleItem = item
    $('.checklistOverlay').addClass('ovrlay');
    this.noaccessWindow = true;
  }


  closeNoAccessWin(eve) {
    this.noaccessWindow = eve;
    $('.checklistOverlay').removeClass('ovrlay');
    this.worksOrderDetailPageData()
  }

  openNoAccessHistory() {
    this.noaccessHistory = true;
    $('.checklistOverlay').addClass('ovrlay');
  }

  closeNoAccessHistory(eve) {
    this.noaccessHistory = eve;
    $('.checklistOverlay').removeClass('ovrlay');
    this.worksOrderDetailPageData()
  }


  openRemoveReasonPanel(action = "single", type, item = null) {
    this.chooseDateType = type;
    this.openAssetRemoveReason = true;
    $('.checklistOverlay').addClass('ovrlay');
  }

  closeReasonPanel(eve) {
    this.openAssetRemoveReason = false;
    $('.checklistOverlay').removeClass('ovrlay');
  }

  getReason(reason) {
    if (reason != "") {
      this.reason = reason;
      this.setAsset(this.chooseDateType, "C")
    }
  }

  openVariationFun() {
    this.openVariationList = true;
    $('.checklistOverlay').addClass('ovrlay');
  }

  closeVariation(eve) {
    this.openVariationList = eve;
    $('.checklistOverlay').removeClass('ovrlay');
    this.worksOrderDetailPageData()
  }


  openDefectsMethod() {
    $('.checklistOverlay').addClass('ovrlay');
    this.openDefectsList = true;
  }

  closeDefectList(eve) {
    this.openDefectsList = eve;
    $('.checklistOverlay').removeClass('ovrlay');
    this.worksOrderDetailPageData();
  }

  viewCheckListOrderReport(reportLevel) {
    if (this.selectedChildRow == undefined) return
    const { wprsequence, wosequence, wopsequence, assid } = this.selectedChildRow;
    const label = {
      programme: "Programme",
      contractor: "Contractor",
      works_Order: "Works Order",
      phase: "Phase",
      incomplete_Dependencies: "Dependencies",
      complete: "Complete Status",
      doc_Count: "Doc Count",
      stage: "Stage",
      name: "Checklist",
      responsibility: "Responsibility",
      special_Items: "Special Items",
      attachment_Required: "Attachments",
      work_Count: "Work Count",
      asset: "Asset",
      address: "Address",
      checklist_Status: "Checklist Status",
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
      issue_Date: "Issue Date",
      target_Date: "Target Date",
      acceptance_Date: "Acceptance Date",
      plan_Start_Date: "Plan Start Date",
      plan_End_Date: "Plan End Date",
      actual_Start_Date: "Actual Start Date",
      actual_End_Date: "Actual End Date",
      updated_by: "Updated By",
      updated_On: "Updated On"
    }

    const fieldsToFormat = {
      forecast: 'money',
      committed: 'money',
      approved: 'money',
      pending: 'money',
      actual: 'money',
      forecast_Fee: 'money',
      committed_Fee: 'money',
      approved_Fee: 'money',
      pending_Fee: 'money',
      actual_Fee: 'money',
      issue_Date: 'date',
      target_Date: 'date',
      acceptance_Date: 'date',
      plan_Start_Date: 'date',
      plan_End_Date: 'date',
      actual_Start_Date: 'date',
      actual_End_Date: 'date',
      updated_On: 'date',
    }

    this.worksOrderReportService.getChecklistReportForOrder(wprsequence, wosequence, wopsequence, reportLevel, assid).subscribe(
      (data) => {
        if (data.isSuccess == true) {
          if (data.data.length == 0) {
            this.alertService.error("No Record Found.");
            return
          }
          let fileName = "Asset_Checklist_Report_" + wosequence + "_" + wopsequence + "_" + reportLevel;
          this.helperService.exportAsExcelFileWithCustomiseFields(data.data, fileName, label, fieldsToFormat)

        } else this.alertService.error(data.message);
      }, error => this.alertService.error(error)
    )

  }


  openProgrammeLog(openFor) {
    this.programmeLogFor = openFor;
    $('.checklistOverlay').addClass('ovrlay');
    this.ProgrammeLogWindow = true;
  }

  closeProgrammeLogWindow(eve) {
    this.ProgrammeLogWindow = eve;
  }

  openCustomerSurvey() {
    this.showCustomerSurveyWindow = true;
    $('.checklistOverlay').addClass('ovrlay');
  }

  closeCustomerSurveyWindow(eve) {
    this.showCustomerSurveyWindow = eve;
    $('.checklistOverlay').removeClass('ovrlay');
  }


  mergeMailMultiple() {
    let filterChecklist = this.assetCheckListData.filter(x => this.mySelection.includes(x.wochecksurcde));
    const mailParms = {
      wosequence: this.selectedChildRow.wosequence,
      wopsequence: this.selectedChildRow.wopsequence,
      mergelist: filterChecklist,
      user: this.currentUser.userId,
    }


    let wostagesurcde;
    let wochecksurcde;
    for (const key of filterChecklist) {
      wostagesurcde = key.wostagesurcde;
      wochecksurcde = key.wochecksurcde;
      break;
    }
    let differentChecklistType = false;
    for (const key of filterChecklist) {
      if (wostagesurcde != key.wostagesurcde || wochecksurcde != key.wochecksurcde) {
        differentChecklistType = true;
        break;
      }
    }
    if (differentChecklistType) {
      this.alertService.error("You cannot perform a mail merge on different checklist type items!  Please select items of the same checklist type first.");
      return;
    }

    this.processMailMerge(mailParms);
  }

  mergeMailSingle(dataItem: any) {
    let filterChecklist = this.assetCheckListData.filter(x => x.wochecksurcde == dataItem.wochecksurcde);
    const mailParms = {
      wosequence: this.selectedChildRow.wosequence,
      wopsequence: this.selectedChildRow.wopsequence,
      mergelist: filterChecklist,
      user: this.currentUser.userId,
    }

    this.processMailMerge(mailParms);
  }

  processMailMerge(mailParms) {
    this.worksorderManagementService.getMergeMailLetter(mailParms).subscribe(
      data => {
        if (data && data.isSuccess) {
          var byteCharacters = atob(data.data);
          var byteNumbers = new Array(byteCharacters.length);
          for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          var byteArray = new Uint8Array(byteNumbers);
          var file = new Blob([byteArray], { type: 'application/pdf;base64' });
          var fileURL = URL.createObjectURL(file);
          let newPdfWindow = window.open(fileURL);

          this.alertService.success("Mail-merge document created successfully.");
          this.worksOrderDetailPageData();
        } else {
          this.alertService.error(data.message);
        }
      },
      error => {
        this.alertService.error(error);
      }
    )
  }

  setComment(type: string) {
    this.commentMode = type;
    this.commentChecklist = this.assetCheckListData.filter(x => this.mySelection.includes(x.wochecksurcde));

    if (this.commentChecklist.length == 0) {
      return
    }

    let ASSID_STAGESURCDE_CHECKSURCDE = [];
    for (const checklist of this.commentChecklist) {
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.assid)
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wostagesurcde)
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wochecksurcde)
    }

    let csvKeys: string = ASSID_STAGESURCDE_CHECKSURCDE.join(",");
    this.commentParms = {
      wosequence: this.selectedChildRow.wosequence,
      wopsequence: this.selectedChildRow.wopsequence,
      csvKeys: csvKeys,
      subtitle: this.selectedChildRow.woname,
    }

    this.showEditCommentWindow = true;
    $('.checklistOverlay').addClass('ovrlay');
  }

  setSingleComment(type: string, dataItem: any) {
    this.commentMode = type;
    this.commentChecklist = this.assetCheckListData.filter(x => x.wochecksurcde == dataItem.wochecksurcde);

    if (this.commentChecklist.length == 0) {
      return
    }

    let ASSID_STAGESURCDE_CHECKSURCDE = [];
    for (const checklist of this.commentChecklist) {
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.assid)
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wostagesurcde)
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wochecksurcde)
    }

    let csvKeys: string = ASSID_STAGESURCDE_CHECKSURCDE.join(",");
    this.commentParms = {
      wosequence: this.selectedChildRow.wosequence,
      wopsequence: this.selectedChildRow.wopsequence,
      csvKeys: csvKeys,
      subtitle: this.selectedChildRow.woname,
    }

    this.showEditCommentWindow = true;
    $('.checklistOverlay').addClass('ovrlay');

  }


  closeCommentPanel(eve) {
    this.showEditCommentWindow = false;
    if (eve != null) {
      if (this.commentMode == "replace") {
        for (const checklist of this.commentChecklist) {
          checklist.woasscheckcomment = eve;
        }
      }
      if (this.commentMode == "add") {
        for (const checklist of this.commentChecklist) {
          checklist.woasscheckcomment += " " + eve;
        }
      }
    }
    $('.checklistOverlay').removeClass('ovrlay');


  }



  openResidentDetails() {
    this.assetID = this.selectedChildRow.assid;
    this.displayResidentDetails = true;
    $('.checklistOverlay').addClass('ovrlay');
  }

  closeResidentInfoDetailsWindow(eve) {
    this.displayResidentDetails = false;
    $('.checklistOverlay').removeClass('ovrlay');
  }
}
