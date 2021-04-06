import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService } from '../../_services'
import { forkJoin } from 'rxjs';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

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

  model: NgbDateStruct;
  date: { year: number, month: number };
  maxDate: any;


  constructor(
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
    private calendar: NgbCalendar

  ) {
    const current = new Date();
    this.maxDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnInit(): void {
    // console.log(this.selectedChildRow);
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

      ]).subscribe(
        data => {
          // console.log(data)
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
          // console.log(data)
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
      let today = new Date();
      let dateObj = new Date(today);
      dateObj.setDate(today.getDate() - 1);
      let yesterday = `${this.helperService.zeorBeforeSingleDigit(dateObj.getFullYear())}-${this.helperService.zeorBeforeSingleDigit(dateObj.getMonth() + 1)}-${this.helperService.zeorBeforeSingleDigit(dateObj.getDate())}`;
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      // console.log(yesterday);

      params.dtDate = yesterday
    } else if (type == 'IPT') {
      let dateObj = new Date();
      let today = `${this.helperService.zeorBeforeSingleDigit(dateObj.getMonth() + 1)}/${this.helperService.zeorBeforeSingleDigit(dateObj.getDate())}/${this.helperService.zeorBeforeSingleDigit(dateObj.getFullYear())}`;
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = today
      // console.log(today);
    } else if (type == 'IPD') {
      this.chooseDateWindow = true;
      this.chRef.detectChanges();
      $('.checklistOverlay').addClass('ovrlay');
      return
    }


    this.subs.add(
      this.worksorderManagementService.setStatus(apiName, params).subscribe(
        data => {
          console.log(data)
          if (data.isSuccess) {

            if (checkOrProcess == "C" && (data.data[0].pRETURNSTATUS == "E" || data.data[0].pRETURNSTATUS == "S")) {
              this.openConfirmationDialog(type, item, data.data[0])
            } else {
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

  public openConfirmationDialog(type, item, res) {
    let checkstatus = "C";
    if (res.pRETURNSTATUS == 'S') {
      checkstatus = "P"
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => {
        if (confirmed) {
          this.setStatus(type, item, checkstatus)
        }
        //(confirmed) ? this.setStatus(type, item, 'P') : console.log(confirmed)
      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }

  closeChooseDate() {
    this.chooseDateWindow = false;
    $('.checklistOverlay').removeClass('ovrlay');
    // console.log(this.model)
  }

  selectDate() {
    this.closeChooseDate()
  }


  setDates(type, item, checkOrProcess = 'C') {
    let apiName = '';
    let params: any = {}
    params.WOSEQUENCE = item.wosequence;
    params.WOPSEQUENCE = item.wopsequence;
    params.ASSID_STAGESURCDE_CHECKSURCDE = [item.assid, item.wostagesurcde, item.wochecksurcde]
    params.UserId = this.currentUser.userId;
    params.CHECKORPROCESS = checkOrProcess;

    if (type == 'SE') {
     
    } else if (type == 'TCY') {
     
    } else if (type == 'TCTOD') {
     
    } else if (type == 'TCTOM') {
     
    } else if (type == 'TC7') {

    } else if (type == 'TCPICK') {

    } else if (type == 'CSDY') {

    } else if (type == 'CSDT') {

    } else if (type == 'CSDPICK') {

    } else if (type == 'CCDY') {

    } else if (type == 'CCDT') {

    } else if (type == 'CCDPICK') {

    }


  }



  setComplete(type, item, checkOrProcess = 'C') {
    let apiName = '';
    let params: any = {}
    params.WOSEQUENCE = item.wosequence;
    params.WOPSEQUENCE = item.wopsequence;
    params.ASSID_STAGESURCDE_CHECKSURCDE = [item.assid, item.wostagesurcde, item.wochecksurcde]
    params.UserId = this.currentUser.userId;
    params.CHECKORPROCESS = checkOrProcess;

    if (type == 'CIY') {

    } else if (type == 'CIT') {

    } else if (type == 'CIPICK') {

    }


  }

  // selectToday() {
  //   this.model = this.calendar.getToday();
  // }



}
