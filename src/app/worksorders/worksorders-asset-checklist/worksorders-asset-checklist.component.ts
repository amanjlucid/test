import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService } from '../../_services'
import { forkJoin } from 'rxjs';


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

  constructor(
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    // console.log(this.selectedChildRow);
    this.worksOrderDetailPageData();

    this.subs.add(
      this.sharedService.worksOrdersAccess.subscribe(
        data => {
          this.worksOrderAccess = data;
        }
      )
    )

  }

  worksOrderDetailPageData() {
    const wprsequence = this.selectedChildRow.wprsequence;
    const intWOSEQUENCE = this.selectedChildRow.wosequence;

    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorkProgrammesByWprsequence(wprsequence),
        this.worksorderManagementService.getWorksOrderByWOsequence(intWOSEQUENCE),
        this.worksorderManagementService.getPhase(this.selectedChildRow.wosequence, this.selectedChildRow.wopsequence),

      ]).subscribe(
        data => {
          console.log(data)
          const programmeData = data[0];
          const worksOrderData = data[1];
          const phaseData = data[2];

          if (programmeData.isSuccess) this.programmeData = programmeData.data[0];
          if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;
          if (phaseData.isSuccess) this.phaseData = phaseData.data;

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
          console.log(data)
          if (data.isSuccess) {
            this.assetCheckListData = data.data;
            this.gridView = process(this.assetCheckListData, this.state);
          } else {
            this.alertService.error(data.message);
          }
          this.loading = false
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
    // this.selectedDefinition = dataItem;
    // if (columnIndex > 1) {
    //   this.openDefinitionDetailPopUp(dataItem)
    // }
    // console.log(this.mySelection)
  }

  mySelectionKey(context: RowArgs): string {
    return context.dataItem.wosequence + '' + context.dataItem.wochecksurcde + '' + context.dataItem.wostagesurcde;
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

    //set selected checklist data according to selection
    this.selectedChecklist = this.assetCheckListData.filter(x => {
      const key = `${x.wosequence}${x.wochecksurcde}${x.wostagesurcde}`;
      return this.mySelection.includes(key);
    });

    // console.log(this.selectedChecklist)
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
      params.dtDate = this.getDateString('Yesterday')
    } else if (type == 'IPT') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.getDateString('Today');
    } else if (type == 'IPD') {
      this.openChooseDate()
      return
    }


    this.subs.add(
      this.worksorderManagementService.setStatus(apiName, params).subscribe(
        data => {
          console.log(data)
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




  setDates(type, item, checkOrProcess = 'C') {
    this.chooseDateType = type;
    const apiName = 'WorksOrderChangeCompletionDate';
    console.log(apiName)
    let params: any = {}
    params.WOSEQUENCE = item.wosequence;
    params.WOPSEQUENCE = item.wopsequence;
    params.strASSID_STAGESURCDE_CHECKSURCDE = [item.assid, item.wostagesurcde, item.wochecksurcde]
    params.strUserId = this.currentUser.userId;
    params.strCheckOrProcess = checkOrProcess;
    // params.dtDate = ''

    console.log(type);
    if (type == 'SE') {
      console.log(type);
      this.openChooseDate()
      return
    } else if (type == 'TCY') {
      params.dtDate = this.getDateString('Yesterday');
    } else if (type == 'TCTOD') {
      params.dtDate = this.getDateString('Today');
    } else if (type == 'TCTOM') {
      params.dtDate = this.getDateString('Tomorrow');
    } else if (type == 'TC7') {
      params.dtDate = this.getDateString('Next 7');
    } else if (type == 'TCPICK') {
      this.openChooseDate()
      return

    } else if (type == 'CSDY') {
      params.dtDate = this.getDateString('Yesterday');
    } else if (type == 'CSDT') {
      params.dtDate = this.getDateString('Today');
    } else if (type == 'CSDPICK') {
      this.openChooseDate()
      return
    } else if (type == 'CCDY') {
      params.dtDate = this.getDateString('Yesterday');
    } else if (type == 'CCDT') {
      params.dtDate = this.getDateString('Today');
    } else if (type == 'CCDPICK') {
      this.openChooseDate()
      return
    }


    this.subs.add(
      this.worksorderManagementService.setStatus(apiName, params).subscribe(
        data => {
          console.log(data)

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
            this.worksOrderDetailPageData();
          }

        }, err => this.alertService.error(err)
      )
    )


  }



  setComplete(type, item, checkOrProcess = 'C') {
    this.chooseDateType = type;
    let apiName = 'WorksOrderCheckListCompleteItem';
    let params: any = {}
    params.WOSEQUENCE = item.wosequence;
    params.WOPSEQUENCE = item.wopsequence;
    params.ASSID_STAGESURCDE_CHECKSURCDE = [item.assid, item.wostagesurcde, item.wochecksurcde]
    params.UserId = this.currentUser.userId;
    params.CHECKORPROCESS = checkOrProcess;

    if (type == 'CIY') {
      params.dtDate = this.getDateString('Yesterday')
    } else if (type == 'CIT') {
      params.dtDate = this.getDateString('Today')
    } else if (type == 'CIPICK') {
      this.openChooseDate()
      return
    }

    this.subs.add(
      this.worksorderManagementService.setStatus(apiName, params).subscribe(
        data => {
          console.log(data)

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
            this.worksOrderDetailPageData();
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

  openChooseDate() {
    this.chooseDateWindow = true;
    this.chRef.detectChanges();
    $('.checklistOverlay').addClass('ovrlay');
  }

  closeChooseDate(event) {
    this.chooseDateWindow = event;
    $('.checklistOverlay').removeClass('ovrlay');
    // console.log(this.model)
  }

  selectedDateEvent(event) {
    console.log(event)
    if (this.chooseDateType == "SE") {

    } else if (this.chooseDateType == "SE") {

    } else if (this.chooseDateType == "CSDPICK") {

    } else if (this.chooseDateType == "CCDPICK") {

    } else if (this.chooseDateType == "CIPICK") {

    }

  }



  // selectToday() {
  //   this.model = this.calendar.getToday();
  // }



}
