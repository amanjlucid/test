import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent, FilterService, BaseFilterCellComponent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, LoaderService, SharedService, WorksorderManagementService } from '../../_services'
import { combineLatest, forkJoin, BehaviorSubject, of, from } from 'rxjs';
import { WorkordersPhaseChecklistModel } from '../../_models';
import { tap, switchMap, distinct } from 'rxjs/operators';


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
  // workorderAsset: any = [];
  // gridHeight = 680;
  filterToggle = false;
  actionType: string = 'single';
  actionName: string = '';
  selectedDate: any;
  // selectedChecklistList = [];
  singlePhaseChecklist: any;
  chooseDateWindow: boolean = false;
  reason: string = '';
  openAssetRemoveReason = false;
  checkNames: any;
  mulitSelectDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    enableCheckAll: true,
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    allowSearchFilter: true,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 157,
    itemsShowLimit: 3,
    searchPlaceholderText: '',
    noDataAvailablePlaceholderText: 'No Record',
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false
  }
  selectedCheckList = [];
  @ViewChild('stagesMultiSelect') stagesMultiSelect;
  predecessors: boolean = false;
  showEditCommentWindow: boolean = false;
  commentMode: string;
  commentParms;
  commentChecklist;


  constructor(
    private sharedService: SharedService,
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private loaderService: LoaderService
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
    // console.log(this.selectedPhase)
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
        // console.log(res);
        this.totalCount = (res.total != undefined) ? res.total : 0;
        this.loading = false;
        setTimeout(() => {
          this.grid.autoFitColumns();
          this.chRef.detectChanges();
        }, 500);

      })
    );
    // console.log(this.selectedPhase)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getProgrammeAndWo() {
    this.loaderService.pageShow();
    const { wosequence, assid, wopsequence } = this.selectedPhase;
    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getCheckListName(wosequence),
        this.worksorderManagementService.getWorksOrderByWOsequence(wosequence),
        this.worksorderManagementService.getPhaseCheckListFiltersList(wosequence, false),
        // this.worksorderManagementService.specificWorkOrderAssets(wosequence, assid, wopsequence),

      ]).subscribe(
        data => {
          // console.log(data)
          const wo = data[1];
          const colFilters = data[2];
          // const workorderAsset = data[2];
          const checkList = data[0];

          if (wo.isSuccess) this.worksOrderData = wo.data;
          else this.alertService.error(wo.message)

          if (colFilters.isSuccess) this.colFilters = colFilters.data;
          else this.alertService.error(colFilters.message)

          // if (workorderAsset.isSuccess) this.workorderAsset = workorderAsset.data[0];

          if (checkList.isSuccess) {
            this.checkNames = checkList.data.map((x: any) => {
              return { item_id: x, item_text: x }
            });
          }

          this.loaderService.pageHide();
          this.chRef.detectChanges();

        },
        err => this.alertService.error(err)
      )
    )

  }

  onStagesSingleSelectionChange(item: any) {
    this.headerFilters.CheckListCategory = this.selectedCheckList.map(x => x.item_id).toString();
    this.stateChange.next(this.headerFilters);
  }

  onStagesSelectionAllChange(items: any) {
    this.selectedCheckList = items;
    this.headerFilters.CheckListCategory = this.selectedCheckList.map(x => x.item_id).toString();
    this.stateChange.next(this.headerFilters);
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
            // console.log(filter)
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
    return `${context.dataItem.assid}_${context.dataItem.wostagesurcde}_${context.dataItem.wochecksurcde}_${context.dataItem.wocheckspeciaL1}`;
  }

  keyChange(eve) {
    // console.log(eve)
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited, originalEvent }) {
    if (originalEvent.ctrlKey == false) {
      if (this.mySelection.length > 0) {
        this.mySelection = [`${dataItem.assid}_${dataItem.wostagesurcde}_${dataItem.wochecksurcde}_${dataItem.wocheckspeciaL1}`];
        this.chRef.detectChanges();
      }
    }

    this.singlePhaseChecklist = dataItem;
    this.chRef.detectChanges();

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
    return this.helperService.checkWorkOrderAreaAccess(this.userType, this.worksOrderAccess, this.worksOrderUsrAccess, menuName)
    // if (this.userType?.wourroletype == "Dual Role") {
    //   return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    // } else {
    //   // if(menuName == "Release Asset"){
    //   //   console.log(this.worksOrderUsrAccess.indexOf(menuName) != -1)
    //   // }
    //   return this.worksOrderUsrAccess.indexOf(menuName) != -1
    // }
  }


  disableButtons(name) {
    if (name == "status") {
      return this.singlePhaseChecklist?.woassstatus == 'Pending' || this.singlePhaseChecklist?.woassstatus == 'Issued'
    }

    if (name == "SE") {
      return this.singlePhaseChecklist?.woassstatus == 'Pending' || this.singlePhaseChecklist?.woassstatus == 'Final Completion'
    }

    if (name == "STCD") {
      return this.singlePhaseChecklist?.woassstatus == 'Pending' || this.singlePhaseChecklist?.woassstatus == 'Issued' || this.singlePhaseChecklist?.woassstatus == 'Final Completion'
    }

    if (name == "CSD") {
      return this.singlePhaseChecklist?.woassstatus == 'Pending' || this.singlePhaseChecklist?.woassstatus == 'Issued' || this.singlePhaseChecklist?.woassstatus == 'Final Completion'
    }

    if (name == "CCD") {
      return this.singlePhaseChecklist?.woassstatus == 'Pending' || this.singlePhaseChecklist?.woassstatus == 'Issued'
    }

    if (name == "CMP") {
      return this.singlePhaseChecklist?.woassstatus == 'Pending' || this.singlePhaseChecklist?.woassstatus == 'Issued'
    }


    if (name == "woAdd") {
      return this.singlePhaseChecklist?.woassstatus != 'New'
    }

    if (name == "release") {
      return this.singlePhaseChecklist?.woassstatus != 'New'
    }

    if (name == "issue") {
      return this.singlePhaseChecklist?.woassstatus != 'Pending'
    }

    if (name == "accept") {
      return this.singlePhaseChecklist?.woassstatus != 'Issued'
    }

    if (this.actionType == 'single') {
      if (name == "na" || name == "STIP" || name == "NS" || name == "RCI" || name == "COMP") {
        return this.singlePhaseChecklist?.woassstatus == 'Pending' || this.singlePhaseChecklist?.woassstatus == 'Issued'
      }

      if (name == "DATES") {
        return this.singlePhaseChecklist?.woassstatus == 'Pending'
      }
    } else {
      if (name == "na" || name == "STIP" || name == "NS" || name == "RCI" || name == "COMP") {
        return this.mySelection.length == 0 || this.singlePhaseChecklist?.woassstatus == 'Pending' || this.singlePhaseChecklist?.woassstatus == 'Issued'
      }

      if (name == "DATES") {
        return this.mySelection.length == 0 || this.singlePhaseChecklist?.woassstatus == 'Pending'
      }

    }



    return false
  }


  openChooseDate(type, actionType, item = null, checkOrProcess = "C") {
    if (actionType == 'multiple') {
      if (this.mySelection.length == 0) {
        this.alertService.error("Please select atleast one record from phase checklist.")
        return
      }
    }
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


      //Status & Complete action condition
      if (type == "CIY" || type == "CIT" || type == "CIPICK" || type == 'IPY' || type == 'IPT' || type == 'IPD') {
        params.CheckName = item.wocheckname
      }

      if (type == "CSDY" || type == "CSDT" || type == "CSDPICK") {
        delete params.UserId;
        delete params.CHECKORPROCESS;
        delete params.ASSID_STAGESURCDE_CHECKSURCDE;

        params.strUserId = this.currentUser.userId;
        params.strCheckOrProcess = checkOrProcess;
        params.strASSID_STAGE_CHECK = [item.assid, item.wostagesurcde, item.wochecksurcde]
      }



    } else if (this.actionType == "multiple") {
      //check if no item is selected  
      if (this.mySelection.length == 0) {
        this.alertService.error("Please select atleast one record from phase checklist.")
        return
      }

      // let phaseChecklist = this.selectedChecklistList.filter(x => this.mySelection.includes(`${x.wochecksurcde}_${x.assid}`));

      // if (phaseChecklist.length == 0) {
      //   return
      // }

      let ASSID_STAGESURCDE_CHECKSURCDE = [];
      let assetIdArr = [];

      for (const checklist of this.mySelection) {
        const splitSelection = checklist.split('_');
        ASSID_STAGESURCDE_CHECKSURCDE.push(splitSelection[0])
        ASSID_STAGESURCDE_CHECKSURCDE.push(splitSelection[1])
        ASSID_STAGESURCDE_CHECKSURCDE.push(splitSelection[2])
        // ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.assid)
        // ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wostagesurcde)
        // ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wochecksurcde)

        assetIdArr.push(splitSelection[0])
      }

      const { wosequence, wopsequence, wocheckname } = this.singlePhaseChecklist
      params.WOSEQUENCE = wosequence;
      params.WOPSEQUENCE = wopsequence;



      if (type == "RELEASE" || type == "ACCEPT" || type == "ISSUE" || type == "HY" || type == "HT" || type == "HCD" || type == "SOY" || type == "SOT" || type == "SOCD" || type == "CANCEL") {
        params.strASSID = assetIdArr;
        params.strUserId = this.currentUser.userId;
        params.strCheckOrProcess = checkOrProcess;

      } else {

        params.ASSID_STAGESURCDE_CHECKSURCDE = ASSID_STAGESURCDE_CHECKSURCDE
        params.UserId = this.currentUser.userId;
        params.CHECKORPROCESS = checkOrProcess;

        params.RecordCount = this.mySelection.length;
        params.CheckName = this.mySelection.length == 1 ? wocheckname : ''

        //Status condition
        // if(type == 'NA' || type == 'RESET' || type == 'NOT STARTED' || type == 'IPY' || type == 'IPT' || type == 'IPDM' || type == 'CIY' || type == 'CIT' || type == 'CIPICKM'){
        //   params.RecordCount = this.mySelection.length;
        //   params.CheckName = this.mySelection.length == 1 ? phaseChecklist[0].wocheckname : ''
        // }

        //
        if (type == 'SE' || type == 'TCY' || type == 'TCTOD' || type == 'TCTOM' || type == 'TC7' || type == 'TCPICK' || type == 'CSDY' || type == 'CSDT' || type == 'CSDPICK' || type == 'CCDY' || type == 'CCDT' || type == 'CCDPICK') {
          delete params.UserId;
          delete params.CHECKORPROCESS;
          delete params.ASSID_STAGESURCDE_CHECKSURCDE;

          params.strUserId = this.currentUser.userId;
          params.strCheckOrProcess = checkOrProcess;
          params.strASSID_STAGESURCDE_CHECKSURCDE = ASSID_STAGESURCDE_CHECKSURCDE;
        }

        if (type == "CSDY" || type == "CSDT" || type == "CSDPICK") {
          delete params.UserId;
          delete params.CHECKORPROCESS;
          delete params.ASSID_STAGESURCDE_CHECKSURCDE;

          params.strUserId = this.currentUser.userId;
          params.strCheckOrProcess = checkOrProcess;
          params.strASSID_STAGE_CHECK = ASSID_STAGESURCDE_CHECKSURCDE
        }


      }

    } else {
      this.alertService.error("Please select a record.")
      return;
    }

    //Set phase asset action
    if (type == "RELEASE") {
      apiName = 'WorksOrderReleaseAsset'
    } else if (type == "ACCEPT") {
      apiName = 'WorksOrderAcceptAsset';
    } else if (type == "ISSUE") {
      apiName = 'WorksOrderIssueAsset'
      params.UserName = this.currentUser.userName;
    }

    //####################
    else if (type == "HY") {
      apiName = 'WorksOrderHandoverAsset'
      params.dtDate = this.helperService.getDateString('Yesterday')
    }

    else if (type == "HT") {
      apiName = 'WorksOrderHandoverAsset'
      params.dtDate = this.helperService.getDateString('Today')
    }

    else if (type == "HCD") {
      apiName = 'WorksOrderHandoverAsset'
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
    }

    else if (type == "SOY") {
      apiName = 'WorksOrderAssetSignOff'
      params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.getDateString('Yesterday')
    }

    else if (type == "SOT") {
      apiName = 'WorksOrderAssetSignOff'
      params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.getDateString('Today')
    }

    else if (type == "SOCD") {
      apiName = 'WorksOrderAssetSignOff'
      params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
    }

    else if (type == "CANCEL") {
      apiName = 'WorksOrderCancelAsset'
      params.strRefusalReason = this.reason;
    }
    //############


    // Set Status
    else if (type == 'NA') {
      apiName = 'SetWorksOrderCheckListStatusToNA'
    } else if (type == 'RESET') {
      apiName = 'ResetChecklistItem'
    } else if (type == 'NOT STARTED') {
      apiName = 'WorksOrderCheckListStatusToNotStarted'
    } else if (type == 'IPY') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.helperService.getDateString('Yesterday');
    } else if (type == 'IPT') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.helperService.getDateString('Today');
    } else if (type == 'IPD') {
      apiName = 'SetWorksOrderCheckListStatusToInProgress'
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
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
      params.NewDate = this.helperService.getDateString('Yesterday');
    } else if (type == 'CSDT') {
      apiName = 'UpdateChecklistStartDate'
      params.NewDate = this.helperService.getDateString('Today');
    } else if (type == 'CSDPICK') {
      apiName = 'UpdateChecklistStartDate'
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


    // console.log(this.mySelection)
    // console.log(params);
    this.subs.add(
      this.worksorderManagementService.setStatus(apiName, params).subscribe(
        data => {
          // console.log(data)
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

  openRemoveReasonPanel(actionName, actionType = "single", item = null) {
    if (this.mySelection.length == 0) {
      this.alertService.error("Please select atleast one record from phase checklist.")
      return
    }
    this.actionName = actionName;
    this.actionType = actionType;
    this.openAssetRemoveReason = true;
    // this.actualSelectedRow = item;
    $('.phaseChecklistovrlay').addClass('ovrlay');
  }

  closeReasonPanel(eve) {
    this.openAssetRemoveReason = false;
    $('.phaseChecklistovrlay').removeClass('ovrlay');
  }

  getReason(reason) {
    if (reason != "") {
      this.reason = reason;
      this.assetActions(this.actionName, this.actionType, null, "C")
    }
  }



  setSeletedRow(dataItem) {
    this.mySelection = [];
    // this.selectedChecklistList = [];
    this.actionType = 'single';
    this.mySelection.push(dataItem.eventSequence)
    // this.selectedChecklistList.push(dataItem)
  }


  openPredecessors(item) {
    // this.selectedChecklistList = [];
    $('.phaseChecklistovrlay').addClass('ovrlay');
    this.predecessors = true;
    // this.selectedChecklistList.push(item)
  }

  closePredecessors(eve) {
    // this.selectedChecklistList = [];
    $('.phaseChecklistovrlay').removeClass('ovrlay');
    this.predecessors = false;
  }


  woGlobalSecurityAccess(menuName) {
    return this.worksOrderAccess.indexOf(menuName) != -1 

}


  mergeMailMultiple() {
    var keyArray : any[] = [];
    for (const checklist of this.mySelection) {
      const splitSelection = checklist.split('_');
      const keys = {
        assid : splitSelection[0],
        wostagesurcde : splitSelection[1],
        wochecksurcde : splitSelection[2],
      }
      keyArray.push(keys);
    }

    let wostagesurcde;
    let wochecksurcde;
    for (const key of keyArray) {
      wostagesurcde = key.wostagesurcde;
      wochecksurcde = key.wochecksurcde;
      break;
    }
    let differentChecklistType = false;
    for (const key of keyArray) {
      if (wostagesurcde != key.wostagesurcde ||  wochecksurcde != key.wochecksurcde) {
        differentChecklistType = true;
        break;
      }
    }
    if (differentChecklistType) {
      this.alertService.error("You cannot perform a mail merge on different checklist type items!  Please select items of the same checklist type first.");
      return;
    }


    const mailParms = {
      wosequence : this.selectedPhase.wosequence, 
      wopsequence : this.selectedPhase.wopsequence,
      mergelist : keyArray,
      user : this.currentUser.userId,
    }

    this.processMailMerge(mailParms);
  }

  mergeMailSingle(dataItem : any) {
    var keyArray : any[] = [];


      const keys = {
        assid : dataItem.assid,
        wostagesurcde : dataItem.wostagesurcde,
        wochecksurcde : dataItem.wochecksurcde,
      }
      keyArray.push(keys);


    const mailParms = {
      wosequence : this.selectedPhase.wosequence, 
      wopsequence : this.selectedPhase.wopsequence,
      mergelist : keyArray,
      user : this.currentUser.userId,
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
          let newPdfWindow =window.open(fileURL);




          this.alertService.success("Mail-merge document created successfully.");
          this.searchGrid();

        } else {
          this.alertService.error(data.message);
        }
      },
      error => {
        this.alertService.error(error);
      }
    )
  }

  disableMenuMultiple(type) {
    if (type == "LETTER") {

      if (this.mySelection.length > 0) {
        let letterRecs = 0;
        let nonletterRecs = 0;
        for (const checklist of this.mySelection) {
          if (checklist) {
          const splitSelection = checklist.split('_');
          let specialchar = splitSelection[3];
          if (specialchar == "LETTER") {
            letterRecs += 1;
          } else {
            nonletterRecs += 1;
          }
        }
        }
        if (letterRecs > 0 && nonletterRecs == 0){
          return false;
        } else {
          return true;      
        }

      } else {
        return true; 
      }
    }

    if (type == "comments") {
      return (this.mySelection.length == 0 )
    }

    return false; 
  }


  setComment(type: string) {
    this.commentMode = type;
    var keyArray : any[] = [];
    for (const checklist of this.mySelection) {
      const splitSelection = checklist.split('_');
      const keys = {
        assid : splitSelection[0],
        wostagesurcde : splitSelection[1],
        wochecksurcde : splitSelection[2],
      }
      keyArray.push(keys);
    }

    if (keyArray.length == 0) {
      return
    }

    let ASSID_STAGESURCDE_CHECKSURCDE = [];
    for (const checklist of keyArray) {
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.assid)
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wostagesurcde)
      ASSID_STAGESURCDE_CHECKSURCDE.push(checklist.wochecksurcde)
    }
    
    let csvKeys : string = ASSID_STAGESURCDE_CHECKSURCDE.join(",");
    this.commentParms = {
      wosequence : this.selectedPhase.wosequence, 
      wopsequence : this.selectedPhase.wopsequence,
      csvKeys : csvKeys,
      subtitle : this.selectedPhase.woname, 
      phase: true,
      }

      this.showEditCommentWindow = true;
  }

  setSingleComment(type: string, dataItem : any) {
    this.commentMode = type;
    let ASSID_STAGESURCDE_CHECKSURCDE = [];
    ASSID_STAGESURCDE_CHECKSURCDE.push(dataItem.assid)
    ASSID_STAGESURCDE_CHECKSURCDE.push(dataItem.wostagesurcde)
    ASSID_STAGESURCDE_CHECKSURCDE.push(dataItem.wochecksurcde)

    
    let csvKeys : string = ASSID_STAGESURCDE_CHECKSURCDE.join(",");
    this.commentParms = {
      wosequence : this.selectedPhase.wosequence, 
      wopsequence : this.selectedPhase.wopsequence,
      csvKeys : csvKeys,
      subtitle : dataItem.assid + " - " + dataItem.astconcataddress, 
      }

    this.showEditCommentWindow = true;

    $('.phaseChecklistovrlay').addClass('ovrlay');

  }


  closeCommentPanel(eve) {
    this.showEditCommentWindow = false;
    if (eve != null) {
      this.searchGrid();  
    }
    $('.phaseChecklistovrlay').removeClass('ovrlay');


  }

}
