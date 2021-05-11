import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent, FilterService, BaseFilterCellComponent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService } from '../../_services'
import { combineLatest, forkJoin, BehaviorSubject } from 'rxjs';
import { WorkordersPhaseChecklistModel } from '../../_models';
import { tap, switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-phase-checklist',
  templateUrl: './phase-checklist.component.html',
  styleUrls: ['./phase-checklist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class PhaseChecklistComponent implements OnInit {
  @Input() phaseChecklist: boolean = false;
  @Input() selectedPhase: any;
  @Output() closePhaseChecklistEvent = new EventEmitter<boolean>();
  subs = new SubSink();
  title = "Phase checklist";
  worksOrderData: any;
  // programmeData: any;
  phaseFromApi: any;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  phaseCheckListData: any;
  public query: any;
  headerFilters: WorkordersPhaseChecklistModel = new WorkordersPhaseChecklistModel()
  private stateChange = new BehaviorSubject<any>(this.headerFilters);
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  loading = true
  selectableSettings: SelectableSettings;
  totalCount: any = 0;
  mySelection: any = [];
  filters: any = [];
  colFilters: any;
  fieldMap = { assid: 'AssId', woassstatus: 'AssetStatus', astconcataddress: 'Address', wostagename: 'StageName', wocheckname: 'ChecKName', wocheckresp: 'CheckResp', wocheckspeciaL1: 'CheckSpecial', itemIsCompleted: 'CheckStatus', woacactualstartdate: 'FromStartDate', woactargetcompletiondate: 'FromTargetDate', woaccontractorissuedate: 'FromIssueDate', woacactualenddate: 'FromCompletionDate' }
  @ViewChild(GridComponent) grid: GridComponent;
  worksOrderUsrAccess: any = [];
  worksOrderAccess: any = [];
  userType: any = [];
  workorderAsset: any = [];
  // gridHeight = 680;
  filterToggle = false;
  actionType: string = 'single';
  actionName: string = '';
  selectedDate: any;
  selectedChecklistList = [];
  singlePhaseChecklist: any;
  chooseDateWindow: boolean = false;


  constructor(
    private sharedService: SharedService,
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    this.setSelectableSettings();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'multiple'
    };
  }

  ngOnInit(): void {
    console.log(this.selectedPhase)
    this.phaseFromApi = this.selectedPhase;

    const { wopsequence, wosequence } = this.phaseFromApi;
    this.headerFilters.WOPSEQUENCE = wopsequence;
    this.headerFilters.WOSEQUENCE = wosequence;

    //get works order data
    this.getProgrammeAndWo();


    //subscribe for work order security access
    this.subs.add(
      combineLatest([
        this.sharedService.woUserSecObs,
        this.sharedService.worksOrdersAccess,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          // console.log(data);
          this.worksOrderUsrAccess = data[0];
          this.worksOrderAccess = data[1];
          this.userType = data[2][0];
        }
      )
    )

    // get phase asset data
    this.query = this.stateChange.pipe(
      tap(state => {
        this.headerFilters = state;
        this.loading = true;
      }),
      switchMap(state => this.worksorderManagementService.workOrderPhaseCheckList(state)),
      tap((res) => {
        console.log(res);
        this.totalCount = (res.total != undefined) ? res.total : 0;
        this.loading = false;
        setTimeout(() => {
          this.grid.autoFitColumns();
          this.chRef.detectChanges();
        }, 500);

      })
    );
    console.log(this.selectedPhase)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getProgrammeAndWo() {
    const { wosequence, assid, wopsequence } = this.selectedPhase;
    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorksOrderByWOsequence(wosequence),
        this.worksorderManagementService.getPhaseCheckListFiltersList(wosequence, false),
        this.worksorderManagementService.specificWorkOrderAssets(wosequence, assid, wopsequence),
      ]).subscribe(
        data => {
          console.log(data)
          const wo = data[0];
          const colFilters = data[1];
          const workorderAsset = data[2];

          if (wo.isSuccess) this.worksOrderData = wo.data;
          else this.alertService.error(wo.message)

          if (colFilters.isSuccess) this.colFilters = colFilters.data;
          else this.alertService.error(colFilters.message)

          if (workorderAsset.isSuccess) this.workorderAsset = workorderAsset.data[0];

          this.chRef.detectChanges();

        },
        err => this.alertService.error(err)
      )
    )

  }

  sortChange(sort: SortDescriptor[]): void {
    this.mySelection = [];
    if (sort.length > 0) {
      if (sort[0].dir == undefined) {
        sort[0].dir = "asc";
      }

      this.headerFilters.OrderType = "Ascending";

      if (sort[0].dir != "asc") {
        this.headerFilters.OrderType = "descending";
      }

      this.headerFilters.OrderBy = sort[0].field;
      this.state.sort = sort;
      this.searchGrid()
    }
  }

  public filterChange(filter: any): void {
    this.state.filter = filter;
    this.filters = [];

    if (filter) {
      if (this.state.filter) {
        if (this.state.filter.filters.length > 0) {
          let distincFitler = this.changeFilterState(this.state.filter.filters);
          distincFitler.then(filter => {
            console.log(filter)
            if (filter.length > 0) {
              this.resetGridFilter()
              for (let ob of filter) {
                this.setGridFilter(ob);
              }

              this.removeLastCommaFromString()// remove comma from some filters
              setTimeout(() => {
                this.searchGrid()
              }, 500);
              return
            }
          })
        }
      }
      this.resetGridFilter()
      this.searchGrid()

      setTimeout(() => {
        $('.k-clear-button-visible').hide();
      }, 10);
    }


  }


  changeFilterState(obj) {
    return Promise.resolve().then(x => {
      for (let f of obj) {
        if (f.hasOwnProperty("field")) {
          if (f.field == "wostagename") {
            this.filters.push(f);
          } else if (f.field == "woacactualstartdate") {
            if (this.containsFilterObject(f, this.filters) == false) {
              this.filters.push(f);
            }
          } else {
            if (this.containsObject(f, this.filters) == false) {
              this.filters.push(f);
            }
          }

        } else if (f.hasOwnProperty("filters")) {
          this.changeFilterState(f.filters)
        }
      }
      return this.filters
    })
  }



  containsFilterObject(obj, list) {
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i].field === obj.field && list[i].operator === obj.operator) {
        return true;
      }
    }

    return false;
  }

  containsObject(obj, list) {
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === obj) {
        return true;
      }
    }

    return false;
  }

  removeLastCommaFromString() {
    if (this.headerFilters.AssetStatus != "") {
      this.headerFilters.AssetStatus = this.headerFilters.AssetStatus.replace(/,\s*$/, "");
    }
    if (this.headerFilters.StageName != "") {
      this.headerFilters.StageName = this.headerFilters.StageName.replace(/,\s*$/, "");
    }
    if (this.headerFilters.ChecKName != "") {
      this.headerFilters.ChecKName = this.headerFilters.ChecKName.replace(/,\s*$/, "");
    }
    if (this.headerFilters.CheckSpecial != "") {
      this.headerFilters.CheckSpecial = this.headerFilters.CheckSpecial.replace(/,\s*$/, "");
    }
    if (this.headerFilters.CheckStatus != "") {
      this.headerFilters.CheckStatus = this.headerFilters.CheckStatus.replace(/,\s*$/, "");
    }
    if (this.headerFilters.AssetStatus != "") {
      this.headerFilters.AssetStatus = this.headerFilters.AssetStatus.replace(/,\s*$/, "");
    }
  }

  setGridFilter(obj) {

    const field = this.fieldMap[obj.field];

    if (this.headerFilters[field] != undefined) {
      if (field == 'AssetStatus' || field == 'ChecKName' || field == 'StageName' || field == 'CheckSpecial' || field == 'CheckStatus' || field == 'CheckResp') {
        this.headerFilters[field] += obj.value + ',';
      } else if (obj.field == "woacactualstartdate") {
        let findObj = this.filters.filter(x => x.field == obj.field);
        if (findObj.length == 1) {
          if (findObj[0].operator == "lte") {
            this.headerFilters.ToStartDate = findObj[0].value;
          } else {
            this.headerFilters.FromStartDate = findObj[0].value;
          }
        } else {
          this.headerFilters.FromStartDate = findObj[0].value;
          this.headerFilters.ToStartDate = findObj[1].value;
        }
      } else if (obj.field == "woactargetcompletiondate") {
        let findObj = this.filters.filter(x => x.field == obj.field);
        if (findObj.length == 1) {
          if (findObj[0].operator == "lte") {
            this.headerFilters.ToTargetDate = findObj[0].value;
          } else {
            this.headerFilters.FromTargetDate = findObj[0].value;
          }
        } else {
          this.headerFilters.FromTargetDate = findObj[0].value;
          this.headerFilters.ToTargetDate = findObj[1].value;
        }
      } else if (obj.field == "woaccontractorissuedate") {
        let findObj = this.filters.filter(x => x.field == obj.field);
        if (findObj.length == 1) {
          if (findObj[0].operator == "lte") {
            this.headerFilters.ToIssueDate = findObj[0].value;
          } else {
            this.headerFilters.FromIssueDate = findObj[0].value;
          }
        } else {
          this.headerFilters.FromIssueDate = findObj[0].value;
          this.headerFilters.ToIssueDate = findObj[1].value;
        }
      } else if (obj.field == "woacactualenddate") {
        let findObj = this.filters.filter(x => x.field == obj.field);
        if (findObj.length == 1) {
          if (findObj[0].operator == "lte") {
            this.headerFilters.ToCompletionDate = findObj[0].value;
          } else {
            this.headerFilters.FromCompletionDate = findObj[0].value;
          }
        } else {
          this.headerFilters.FromCompletionDate = findObj[0].value;
          this.headerFilters.ToCompletionDate = findObj[1].value;
        }
      }
      else {
        this.headerFilters[field] = obj.value;
      }

    }
  }

  resetGridFilter() {
    this.headerFilters.AssId = '';
    this.headerFilters.Address = '';
    this.headerFilters.Contractor = false;
    this.headerFilters.AssetStatus = '';
    this.headerFilters.StageName = '';
    this.headerFilters.ChecKName = '';
    this.headerFilters.CheckResp = '';
    this.headerFilters.CheckSpecial = '';

    this.headerFilters.CheckStatus = '';
    this.headerFilters.Address = '';
    this.headerFilters.FromStartDate = '';
    this.headerFilters.ToStartDate = '';
    this.headerFilters.FromTargetDate = '';
    this.headerFilters.ToTargetDate = '';
    this.headerFilters.FromIssueDate = '';
    this.headerFilters.ToIssueDate = '';
    this.headerFilters.FromCompletionDate = '';
    this.headerFilters.ToCompletionDate = '';


  }

  pageChange(state: PageChangeEvent): void {
    this.headerFilters.CurrentPage = state.skip;
    this.stateChange.next(this.headerFilters);
  }

  searchGrid() {
    this.headerFilters.CurrentPage = 0;
    this.state.skip = 0;
    this.stateChange.next(this.headerFilters);
  }

  mySelectionKey(context: RowArgs): string {
    return encodeURIComponent(`${context.dataItem.wochecksurcde}_${context.dataItem.assid}`);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // console.log(this.mySelection)
  }

  closePhaseChecklist() {
    this.phaseChecklist = false;
    this.closePhaseChecklistEvent.emit(false);
  }


  clearFilters() {
    this.state.filter = {
      logic: 'and',
      filters: []
    };

    this.filterChange(this.state.filter)

  }

  public slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-assetchecklist-header').slideToggle();
    // if (this.filterToggle) this.gridHeight = 400;
    // else this.gridHeight = 680;
    this.chRef.detectChanges();

  }


  woMenuBtnSecurityAccess(menuName) {
    if (this.userType?.wourroletype == "Dual Role") {
      return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    } else {
      // if(menuName == "Release Asset"){
      //   console.log(this.worksOrderUsrAccess.indexOf(menuName) != -1)
      // }
      return this.worksOrderUsrAccess.indexOf(menuName) != -1
    }
  }


  disableButtons(name) {
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


    if (name == "woAdd") {
      return this.workorderAsset?.woassstatus != 'New'
    }

    if (name == "release") {
      return this.workorderAsset?.woassstatus != 'New'
    }

    if (name == "issue") {
      return this.workorderAsset?.woassstatus != 'Pending'
    }

    if (name == "accept") {
      return this.workorderAsset?.woassstatus != 'Issued'
    }

    if (name == "na" || name == "STIP" || name == "NS" || name == "RCI" || name == "COMP") {
      return this.mySelection.length == 0 || this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued'
    }

    return false
  }


  openChooseDate(type, actionType, item = null, checkOrProcess = "C") {
    this.actionName = type;
    this.actionType = actionType;
    this.singlePhaseChecklist = item;
    this.chooseDateWindow = true;
    this.chRef.detectChanges();
    $('.phaseChecklistovrlay').addClass('ovrlay');
  }

  closeChooseDate(event) {
    this.chooseDateWindow = event;
    $('.phaseChecklistovrlay').removeClass('ovrlay');
  }

  selectedDateEvent(event) {
    this.selectedDate = event;
    this.assetActions(this.actionName, this.actionType, this.singlePhaseChecklist, "C")
  }

  assetActions(type, actionType, item = null, checkOrProcess = "C") {
    this.actionName = type;
    this.actionType = actionType;

    let apiName = '';
    let params: any = {}

    if (this.actionType == "single") {

      params.WOSEQUENCE = item?.wosequence;
      params.WOPSEQUENCE = item?.wopsequence;
      params.ASSID_STAGESURCDE_CHECKSURCDE = [item?.assid, item?.wostagesurcde, item?.wochecksurcde]
      params.UserId = this.currentUser.userId;
      params.CHECKORPROCESS = checkOrProcess;

      //Date action condition
      if (type == 'SE' || type == 'TCY' || type == 'TCTOD' || type == 'TCTOM' || type == 'TC7' || type == 'TCPICK' || type == 'CSDY' || type == 'CSDT' || type == 'CSDPICK' || type == 'CCDY' || type == 'CCDT' || type == 'CCDPICK') {
        delete params.UserId;
        delete params.CHECKORPROCESS;
        delete params.ASSID_STAGESURCDE_CHECKSURCDE;

        params.strUserId = this.currentUser.userId;
        params.strCheckOrProcess = checkOrProcess;
        params.strASSID_STAGESURCDE_CHECKSURCDE = [item?.assid, item?.wostagesurcde, item?.wochecksurcde];
      }

      //Complete action condition
      if (type == "CIY" || type == "CIT" || type == "CIPICK") {
        params.CheckName = item.wocheckname
      }



    } else if (this.actionType == "multiple") {
      //check if no item is selected  
      if (this.mySelection.length == 0) {
        this.alertService.error("Please select atleast one record from phase checklist.")
        return
      }

      // let filterChecklist = this.assetCheckListData.filter(x => this.mySelection.includes(x.wochecksurcde))

    } else {
      return;
    }

    // Set Status
    if (type == 'NA') {
      apiName = 'SetWorksOrderCheckListStatusToNA'
    } else if (type == 'RESET') {
      apiName = 'ResetChecklistItem'
    } else if (type == 'NOT STARTED') {
      apiName = 'WorksOrderCheckListStatusToNotStarted'
    } else if (type == 'IPY') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.helperService.getDateString('Yesterday');
      params.CheckName = item.wocheckname
    } else if (type == 'IPT') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.helperService.getDateString('Today');
      params.CheckName = item.wocheckname
    } else if (type == 'IPD') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
      params.CheckName = item.wocheckname
    }


    // Set Dates
    if (type == 'SE') {
      apiName = 'SetWorksOrderCheckListPlannedDates'
      params.dtStartDate = this.helperService.dateObjToString(this.selectedDate.start);
      params.dtEndDate = this.helperService.dateObjToString(this.selectedDate.end);
    } else if (type == 'TCY') {
      apiName = 'SetWorksOrderCheckListTargetDate';
      params.dtDate = this.helperService.getDateString('Yesterday');
    } else if (type == 'TCTOD') {
      apiName = 'SetWorksOrderCheckListTargetDate';
      params.dtDate = this.helperService.getDateString('Today');
    } else if (type == 'TCTOM') {
      apiName = 'SetWorksOrderCheckListTargetDate';
      params.dtDate = this.helperService.getDateString('Tomorrow');
    } else if (type == 'TC7') {
      apiName = 'SetWorksOrderCheckListTargetDate';
      params.dtDate = this.helperService.getDateString('Next 7');
    } else if (type == 'TCPICK') {
      apiName = 'SetWorksOrderCheckListTargetDate'
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);

    }

    // Reset params for some date action
    else if (type == 'CSDY') {
      apiName = 'UpdateChecklistStartDate'
      params = {};
      params.WOSEQUENCE = item.wosequence;
      params.WOPSEQUENCE = item.wopsequence;
      params.strASSID_STAGE_CHECK = [item.assid, item.wostagesurcde, item.wochecksurcde]
      params.strUserId = this.currentUser.userId;
      params.strCheckOrProcess = checkOrProcess;
      params.NewDate = this.helperService.getDateString('Yesterday');
    } else if (type == 'CSDT') {
      apiName = 'UpdateChecklistStartDate'
      params = {};
      params.WOSEQUENCE = item.wosequence;
      params.WOPSEQUENCE = item.wopsequence;
      params.strASSID_STAGE_CHECK = [item.assid, item.wostagesurcde, item.wochecksurcde]
      params.strUserId = this.currentUser.userId;
      params.strCheckOrProcess = checkOrProcess;
      params.NewDate = this.helperService.getDateString('Today');
    } else if (type == 'CSDPICK') {
      apiName = 'UpdateChecklistStartDate'
      params = {};
      params.WOSEQUENCE = item.wosequence;
      params.WOPSEQUENCE = item.wopsequence;
      params.strASSID_STAGE_CHECK = [item.assid, item.wostagesurcde, item.wochecksurcde]
      params.strUserId = this.currentUser.userId;
      params.strCheckOrProcess = checkOrProcess;
      params.NewDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
    }

    else if (type == 'CCDY') {
      apiName = 'WorksOrderChangeCompletionDate';
      params.dtDate = this.helperService.getDateString('Yesterday');
    } else if (type == 'CCDT') {
      apiName = 'WorksOrderChangeCompletionDate';
      params.dtDate = this.helperService.getDateString('Today');
    } else if (type == 'CCDPICK') {
      apiName = 'WorksOrderChangeCompletionDate';
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
    }


    // Set complete
    else if (type == 'CIY') {
      apiName = 'WorksOrderCheckListCompleteItem';
      params.dtDate = this.helperService.getDateString('Yesterday')
    } else if (type == 'CIT') {
      apiName = 'WorksOrderCheckListCompleteItem';
      params.dtDate = this.helperService.getDateString('Today')
    } else if (type == 'CIPICK') {
      apiName = 'WorksOrderCheckListCompleteItem';
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
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
              this.openConfirmationDialog(type, actionType, item, resp)
            } else {
              this.alertService.success(resp.pRETURNMESSAGE)
              this.getProgrammeAndWo();
              this.searchGrid();
            }

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )



  }


  public openConfirmationDialog(type, actionType, item, res) {
    let checkstatus = "C";
    if (res.pRETURNSTATUS == 'S') {
      checkstatus = "P"
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => {
        if (confirmed) {
          if (res.pRETURNSTATUS == 'E') return
          this.assetActions(type, actionType, item, checkstatus)
        }
      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }



  setSeletedRow(dataItem) {
    this.mySelection = [];
    this.selectedChecklistList = [];
    // this.mySelection.push(dataItem.eventSequence)
    this.selectedChecklistList.push(dataItem)
  }



  // disableMainActions(type) {
  //   if (type == "woAdd") {
  //     return this.workorderAsset?.woassstatus != 'New'
  //   }

  //   if (type == "release") {
  //     return this.workorderAsset?.woassstatus != 'New'
  //   }

  //   if (type == "issue") {
  //     return this.workorderAsset?.woassstatus != 'Pending'
  //   }

  //   if (type == "accept") {
  //     return this.workorderAsset?.woassstatus != 'Issued'
  //   }

  //   if (type == "na" || type == "STIP" || type == "NS" || type == "RCI" || type == "COMP") {
  //     return this.mySelection.length == 0 || this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued'
  //   }

  // }



  // disableBtnsIndividualMenu(name) {

  //   if (name == "status") {
  //     return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued'
  //   }

  //   if (name == "SE") {
  //     return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Final Completion'
  //   }

  //   if (name == "STCD") {
  //     return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued' || this.workorderAsset?.woassstatus == 'Final Completion'
  //   }

  //   if (name == "CSD") {
  //     return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued' || this.workorderAsset?.woassstatus == 'Final Completion'
  //   }

  //   if (name == "CCD") {
  //     return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued'
  //   }

  //   if (name == "CMP") {
  //     return this.workorderAsset?.woassstatus == 'Pending' || this.workorderAsset?.woassstatus == 'Issued'
  //   }


  //   return false
  // }

}
