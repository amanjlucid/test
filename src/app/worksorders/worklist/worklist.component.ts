import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, RowClassArgs, GridDataResult } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, SharedService, WorksOrdersService, PropertySecurityGroupService, AuthenticationService, LoaderService, AssetAttributeService, ConfirmationDialogService } from '../../_services'
import { Subject, BehaviorSubject, forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkOrdersWorkListFilterModel, SurveyPortalXports } from '../../_models'
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { appConfig } from '../../app.config';

@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class WorklistComponent implements OnInit {
  subs = new SubSink();
  state: State = {
    skip: 0,
    take: 50,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }


  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public workListData: any;
  public query: any;
  loading = true;
  selectableSettings: SelectableSettings;
  woFormWindow = false;
  woFormDeleteWindow = false;
  selectedWorksOrder: any
  selectedWorkOrderAddEdit: any;
  woFormType = 'new';
  errorDeleteMsg = '';
  successDeleteMsg = '';
  deleteReasonMsgInput = false;
  wosequenceForDelete: any;
  worksOrderAccess = [];
  mySelection: any[] = [];
  filters: any = [];

  printHiearchy: any;
  visitedHierarchy: any[] = [];
  hiearchyTypeLists: any;
  selectedHiearchyType: any;
  hierarchyLevels: any;
  selectedhierarchyLevel: any;
  hiearchyWindow = false;
  dialogSetTag = false;
  planYear: any;
  assetTypes: any;
  phases: any;
  headerFilters: WorkOrdersWorkListFilterModel = new WorkOrdersWorkListFilterModel()
  private stateChange = new BehaviorSubject<any>(this.headerFilters);
  tagText: string = "";
  wopmSecurityList: any = [];
  SetTagStringArray: string[];
  dialogCancellationReason: boolean = false;
  cancellationText: string = "";
  detaching: boolean = false;

  asbestosPortalAccess: any = [];
  modulesEnabled = [];
  assetTabs = [];

  public openReports = false;
  public reportingAction = "";
  public selectedXport: SurveyPortalXports;


  constructor(
    private worksOrdersService: WorksOrdersService,
    private activeRoute: ActivatedRoute,
    private alertService: AlertService,
    private helperService: HelperService,
    private sharedService: SharedService,
    private router: Router,
    private helper: HelperService,
    private chRef: ChangeDetectorRef,
    private propSecGrpService: PropertySecurityGroupService,
    private loaderService: LoaderService,
    private assetAttributeService: AssetAttributeService,
    private confirmationDialogService: ConfirmationDialogService,
    private autService: AuthenticationService,
  ) {

    this.query = this.stateChange.pipe(
      tap(state => {
        this.state = state;
        this.loading = true;
      }),
      switchMap(state => worksOrdersService.GetWorkListPage(state)),
      tap(() => {
        this.loading = false;
        this.chRef.detectChanges();
        if (this.headerFilters.wosequence > 0) {
          this.GetWorksOrderPhases(this.headerFilters.wosequence);
        } else {
          this.phases = [];
        }
      })
    );


    this.setSelectableSettings();
  }

  ngOnInit(): void {
    //update notification on top
    this.helper.updateNotificationOnTop();

    this.subs.add(
      this.sharedService.worksOrdersAccess.subscribe(
        data => {
          this.worksOrderAccess = data;
        }
      )
    )

    this.subs.add(this.sharedService.realModulesEnabled.subscribe(data => {
      this.modulesEnabled = data;
    }));
    this.subs.add(this.sharedService.asbestosPortalAccess.subscribe(data => {
      this.asbestosPortalAccess = data;
    }));
    this.subs.add(this.assetAttributeService.getAssetTabsList(this.currentUser.userId).subscribe(
      tabData => {
        this.assetTabs = tabData.toString().split(',');
      }))


    this.subs.add(
      forkJoin([
        this.assetAttributeService.getAssetTypes(),
        // this.worksorderManagementService.getPhase(this.actualSelectedRow.wosequence, this.actualSelectedRow.wopsequence),
        // this.worksorderManagementService.getWorksOrderByWOsequence(this.actualSelectedRow.wosequence),
        // this.worksorderManagementService.getPlanYear(this.actualSelectedRow.wosequence)
      ]).subscribe(
        resp => {
          // console.log(resp);
          const assetType = resp[0];
          // const phase = resp[1];
          // const worksOrder = resp[2];
          // this.planYear = resp[3].data;

          if (assetType.isSuccess) this.assetTypes = assetType.data;
          // if (phase.isSuccess) this.phaseData = phase.data;

          // if (worksOrder.isSuccess) {
          //   this.worksOrder = worksOrder.data;
          //   this.headerFilters.cttsurcde = this.worksOrder.cttsurcde;
          // }

          this.chRef.detectChanges();
        }
      )
    )
  }



  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    this.subs.add(
      this.sharedService.worksOrdersAccess.subscribe(
        data => {
          if (data) {
            this.wopmSecurityList = data;
            this.chRef.detectChanges();
            if (this.wopmSecurityList.length > 0) {
              if (!(this.checkWorksOrdersAccess("Config Templates Tab") && this.checkWorksOrdersAccess("Works Order Portal Access"))) {
                this.router.navigate(['/dashboard']);
              }
            }

          }

        }
      )
    )
  }

  rowKey(dataItem) {
    let paddedAssid = "                    " + dataItem.wlassid;
    paddedAssid = paddedAssid.substr(paddedAssid.length - 20);
    let paddedwlcode = "          " + dataItem.wlcode;
    paddedwlcode = paddedwlcode.substr(paddedwlcode.length - 10);
    let paddedwlataid = "          " + dataItem.wlataid;
    paddedwlataid = paddedwlataid.substr(paddedwlataid.length - 10);
    let paddedwlplanyear = "    " + dataItem.wlplanyear;
    paddedwlplanyear = paddedwlplanyear.substr(paddedwlplanyear.length - 4);
    let paddedwosequence = "          " + dataItem.wosequence;
    paddedwosequence = paddedwosequence.substr(paddedwosequence.length - 10);
    let paddedwopsequence = "          " + dataItem.wopsequence;
    paddedwopsequence = paddedwopsequence.substr(paddedwopsequence.length - 10);
    return paddedAssid + paddedwlcode + paddedwlataid + paddedwlplanyear + paddedwosequence + paddedwopsequence;
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited, originalEvent }) {
    if (originalEvent.ctrlKey == false) {
      if (this.mySelection.length > 0) {
        this.mySelection = [this.rowKey(dataItem)];
        this.chRef.detectChanges();
      }
    }

    this.selectedWorksOrder = dataItem;

  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'multiple'
    };
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

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.mySelection = [];

    if (this.state.filter) {
      // this.headerFilters.isFilter = true;
      if (this.state.filter.filters.length > 0) {
        let distincFitler = this.changeFilterState(this.state.filter.filters);
        distincFitler.then(filter => {
          if (filter.length > 0) {
            this.resetGridFilter()
            for (let ob of filter) {
              this.setGridFilter(ob);
            }
            setTimeout(() => {
              this.searchGrid()
            }, 500);
          }
        })
      } else {
        // this.headerFilters.isFilter = false;
        this.resetGridFilter()
        this.searchGrid()
      }
    } else {
      // this.headerFilters.isFilter = false;
      this.resetGridFilter()
      this.searchGrid()
    }
  }


  changeFilterState(obj) {
    return Promise.resolve().then(x => {
      for (let f of obj) {
        if (f.hasOwnProperty("field")) {
          if (this.containsObject(f, this.filters) == false) {
            this.filters.push(f);
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


  setGridFilter(obj) {
    if (this.headerFilters[obj.field] != undefined) {
      this.headerFilters[obj.field] = obj.value
    }
  }

  resetGridFilter() {
    this.headerFilters.wildcrdaddress = '';
    this.headerFilters.workStatusNew = true;
    this.headerFilters.workStatusTransferred = true;
    this.headerFilters.workStatusCompleted = false;
    this.headerFilters.workStatusCancelled = false;
    this.headerFilters.wlassid = '';
    this.headerFilters.hittypecode = '';
    this.headerFilters.ownassid = '';
    this.headerFilters.astcode = '';
    this.headerFilters.wlttagcode = '';
    this.headerFilters.concode = '';
    this.headerFilters.cttsurcde = 0;
    this.headerFilters.wosequence = 0
    this.headerFilters.wopsequence = 0
  }

  pageChange(state: PageChangeEvent): void {
    this.headerFilters.skip = state.skip;
    this.stateChange.next(this.headerFilters);
  }

  searchGrid() {
    this.mySelection = [];
    this.headerFilters.skip = 0;
    this.state.skip = 0;
    this.stateChange.next(this.headerFilters);
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.searchGrid();
    }
  }

  mySelectionKey(context: RowArgs): any {
    var paddedAssid = "                    " + context.dataItem.wlassid;
    paddedAssid = paddedAssid.substr(paddedAssid.length - 20);
    var paddedwlcode = "          " + context.dataItem.wlcode;
    paddedwlcode = paddedwlcode.substr(paddedwlcode.length - 10);
    var paddedwlataid = "          " + context.dataItem.wlataid;
    paddedwlataid = paddedwlataid.substr(paddedwlataid.length - 10);
    var paddedwlplanyear = "    " + context.dataItem.wlplanyear;
    paddedwlplanyear = paddedwlplanyear.substr(paddedwlplanyear.length - 4);
    var paddedwosequence = "          " + context.dataItem.wosequence;
    paddedwosequence = paddedwosequence.substr(paddedwosequence.length - 10);
    var paddedwopsequence = "          " + context.dataItem.wopsequence;
    paddedwopsequence = paddedwopsequence.substr(paddedwopsequence.length - 10);
    return paddedAssid + paddedwlcode + paddedwlataid + paddedwlplanyear + paddedwosequence + paddedwopsequence;
  }

  // ASSID_WLCODE_WLATAID_WLPLANYEAR


  getYear(initialDate) {
    var properDate = new Date(initialDate);
    var yearValue = properDate.getFullYear();
    return yearValue;
  }

  GetWorksOrderPhases(WOSEQUENCE) {
    this.worksOrdersService.GetWorksOrderPhases(WOSEQUENCE).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.phases = data.data;
        }
      })
  }



  //####################### hierarchy function start ####################################//
  getHierarchyTypeList() {
    this.propSecGrpService.getHierarchyTypeList().subscribe(
      data => {
        if (data && data.isSuccess) {
          this.visitedHierarchy = [];
          this.hiearchyTypeLists = data.data;
          if (this.printHiearchy != undefined) {
            this.openHiearchyLiver(this.printHiearchy);
            this.chRef.detectChanges();
          }
        }
      }
    )
  }

  openHiearchyLiver(data) {
    if (data != undefined) {
      for (let item of data) {
        this.visitedHierarchy[item.assetId] = item.assetId;
        if (item.childLayers != undefined) {
          this.openHiearchyLiver(item.childLayers);
          this.chRef.detectChanges();
        }
      }
    }
  }


  setHiearchyValues() {
    if (this.selectedHiearchyType && this.selectedhierarchyLevel) {
      this.propSecGrpService.hierarchyStructureForAsset(this.selectedHiearchyType, this.selectedhierarchyLevel.assetId, this.selectedhierarchyLevel.actualParentId).subscribe(
        data => {
          this.loaderService.pageShow();
          this.printHiearchy = data;
          this.headerFilters.hittypecode = this.selectedHiearchyType;
          this.headerFilters.ownassid = this.selectedhierarchyLevel.assetId;
          this.searchGrid()
          this.closeHiearchyWindow();
          this.chRef.detectChanges();
        }
      )
    }

  }

  public openHiearchyWindow() {
    $('.workListOverlay').addClass('ovrlay');
    this.getHierarchyTypeList();
    this.hiearchyWindow = true;
    this.chRef.detectChanges();
  }

  public closeHiearchyWindow() {
    $('.workListOverlay').removeClass('ovrlay');
    this.hiearchyWindow = false;
    this.loaderService.pageHide();
    this.chRef.detectChanges();

  }

  getHiearchyTree(hiearchyType = null) {
    if (this.selectedHiearchyType) {
      this.hierarchyLevels = [];
      this.visitedHierarchy = [];
      this.subs.add(
        this.propSecGrpService.getHierarchyAllLevel(this.selectedHiearchyType).subscribe(
          data => {
            this.hierarchyLevels = data;
            this.chRef.detectChanges();
          }
        )
      )
    }
  }

  selectHiearchy(event: any, hiearchyLevel) {
    this.selectedhierarchyLevel = hiearchyLevel;
    let ancestorElm = this.findAncestor(event.target, 'tree');
    this.selectedhierarchyLevel.actualParentId = ancestorElm.className;
    this.chRef.detectChanges();

  }

  findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.parentElement.classList.contains(cls));
    return el;
  }

  clearPropSec() {
    this.printHiearchy = [];
    this.headerFilters.hittypecode = '';
    this.headerFilters.ownassid = '';
    this.searchGrid()
  }

  //##################### hierarchy function end ######################################//

  ShowReports(dataItem) {

  }


  openSetTag() {
    $('.workListOverlay').addClass('ovrlay');
    this.dialogSetTag = true;
    this.tagText = "";

  }

  closeSetTagWin() {
    $('.workListOverlay').removeClass('ovrlay');
    this.dialogSetTag = false;
  }

  setTag() {
    this.closeSetTagWin()
    const parms = {
      WorkListArray: this.SetTagStringArray,
      TagCode: this.tagText,
      UserID: this.currentUser.userId,
      CheckOrProcess: "C",
      ClearTag: false
    }
    this.subs.add(
      this.worksOrdersService.SetClearWorkListTag(parms).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data.returnStatus == "S") {
              this.confirmationDialogService.confirm('Please confirm..', data.data.returnMessage)
                .then((confirmed) => (confirmed) ? this.confirmSetTag() : console.log(confirmed))
                .catch(() => console.log('User dismissed the dialog.'));
            } else {
              this.alertService.error(data.data.returnMessage)
            }
          }
        },
        error => {
          this.alertService.error(error.Message)
        }
      )
    )
  }

  confirmSetTag() {
    const parms = {
      WorkListArray: this.SetTagStringArray,
      TagCode: this.tagText,
      UserID: this.currentUser.userId,
      CheckOrProcess: "P",
      ClearTag: false
    }
    this.subs.add(
      this.worksOrdersService.SetClearWorkListTag(parms).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data.returnStatus == "S") {
              this.alertService.success(data.data.returnMessage)
              this.searchGrid()
            } else {
              this.alertService.error(data.data.returnMessage)
            }
          }
        },
        error => {
          this.alertService.error(error.Message)
        }
      )
    )
  }

  IndividualSetTag(dataItem) {
    this.SetTagStringArray = [];
    this.SetTagStringArray.push(dataItem.wlassid);
    this.SetTagStringArray.push(dataItem.wlcode);
    this.SetTagStringArray.push(dataItem.wlataid);
    this.SetTagStringArray.push(dataItem.wlplanyear);
    this.openSetTag();
  }

  MultipleSetTag() {
    this.SetTagStringArray = [];
    this.mySelection.forEach(gridKey => {
      this.SetTagStringArray.push(gridKey.substr(0, 20).trim());
      this.SetTagStringArray.push(gridKey.substr(20, 10).trim());
      this.SetTagStringArray.push(gridKey.substr(30, 10).trim());
      this.SetTagStringArray.push(gridKey.substr(40, 4).trim());
    }
    );

    // console.log(this.mySelection)
    this.openSetTag();
  }


  IndividualClearTag(dataItem) {
    this.SetTagStringArray = [];
    this.SetTagStringArray.push(dataItem.wlassid);
    this.SetTagStringArray.push(dataItem.wlcode);
    this.SetTagStringArray.push(dataItem.wlataid);
    this.SetTagStringArray.push(dataItem.wlplanyear);
    this.clearTag();
  }

  MultipleClearTag() {
    this.SetTagStringArray = [];
    this.mySelection.forEach(gridKey => {
      this.SetTagStringArray.push(gridKey.substr(0, 20).trim());
      this.SetTagStringArray.push(gridKey.substr(20, 10).trim());
      this.SetTagStringArray.push(gridKey.substr(30, 10).trim());
      this.SetTagStringArray.push(gridKey.substr(40, 4).trim());
    }
    );
    this.clearTag();
  }


  clearTag() {
    this.closeSetTagWin()
    const parms = {
      WorkListArray: this.SetTagStringArray,
      TagCode: "",
      UserID: this.currentUser.userId,
      CheckOrProcess: "C",
      ClearTag: true
    }
    this.subs.add(
      this.worksOrdersService.SetClearWorkListTag(parms).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data.returnStatus == "S") {
              this.confirmationDialogService.confirm('Please confirm..', data.data.returnMessage)
                .then((confirmed) => (confirmed) ? this.confirmClearTag() : console.log(confirmed))
                .catch(() => console.log('User dismissed the dialog.'));
            } else {
              this.alertService.error(data.data.returnMessage)
            }
          }
        },
        error => {
          this.alertService.error(error.Message)
        }
      )
    )
  }


  confirmClearTag() {
    const parms = {
      WorkListArray: this.SetTagStringArray,
      TagCode: "",
      UserID: this.currentUser.userId,
      CheckOrProcess: "P",
      ClearTag: true
    }
    this.subs.add(
      this.worksOrdersService.SetClearWorkListTag(parms).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data.returnStatus == "S") {
              this.alertService.success(data.data.returnMessage)
              this.searchGrid()
            } else {
              this.alertService.error(data.data.returnMessage)
            }
          }
        },
        error => {
          this.alertService.error(error.Message)
        }
      )
    )
  }





  IndividualDetach(dataItem) {
    this.SetTagStringArray = [];
    this.SetTagStringArray.push(dataItem.wlassid);
    this.SetTagStringArray.push(dataItem.wlcode);
    this.SetTagStringArray.push(dataItem.wlataid);
    this.SetTagStringArray.push(dataItem.wlplanyear);
    this.detach();
  }

  MultipleDetach() {
    this.SetTagStringArray = [];
    this.mySelection.forEach(gridKey => {
      this.SetTagStringArray.push(gridKey.substr(0, 20).trim());
      this.SetTagStringArray.push(gridKey.substr(20, 10).trim());
      this.SetTagStringArray.push(gridKey.substr(30, 10).trim());
      this.SetTagStringArray.push(gridKey.substr(40, 4).trim());
    }
    );
    this.detach();
  }

  detach() {
    const parms = {
      WorkListArray: this.SetTagStringArray,
      Message: "",
      UserID: this.currentUser.userId,
      CancelItems: false,
      CheckOrProcess: "C"
    }
    this.subs.add(
      this.worksOrdersService.DetachWorkListItem(parms).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data.returnStatus == "S") {
              this.confirmationDialogService.confirm('Please confirm..', data.data.returnMessage)
                .then((confirmed) => (confirmed) ? this.confirmDetach() : console.log(confirmed))
                .catch(() => console.log('User dismissed the dialog.'));
            } else {
              this.alertService.error(data.data.returnMessage)
            }
          }
        },
        error => {
          this.alertService.error(error.Message)
        }
      )
    )
  }

  confirmDetach() {
    this.detaching = true;
    var boolCancel: boolean = false;
    this.confirmationDialogService.confirm('Please confirm..', "Cancel work items as well?", true, "Yes", "No")
      .then((confirmed) => (confirmed) ? this.openCancellationDialog() : this.detachWithoutCancelling())
      .catch(() => this.detaching = false);

  }

  detachWithoutCancelling() {
    this.detaching = false;
    const parms = {
      WorkListArray: this.SetTagStringArray,
      Message: "",
      UserID: this.currentUser.userId,
      CancelItems: false,
      CheckOrProcess: "P"
    }
    this.subs.add(
      this.worksOrdersService.DetachWorkListItem(parms).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data.returnStatus == "S") {
              this.alertService.success(data.data.returnMessage)
            } else {
              this.alertService.error(data.data.returnMessage)
            }
            this.searchGrid()
          }
        },
        error => {
          this.alertService.error(error.Message)
        }
      )
    )
  }


  openCancellationDialog() {
    $('.workListOverlay').addClass('ovrlay');
    this.dialogCancellationReason = true;
    this.cancellationText = "";
  }

  closeCancellationWin() {
    this.detaching = false;
    $('.workListOverlay').removeClass('ovrlay');
    this.dialogCancellationReason = false;
  }

  CancelWorkItem() {
    this.detaching = false;
    const parms = {
      WorkListArray: this.SetTagStringArray,
      Message: "",
      UserID: this.currentUser.userId,
      CheckOrProcess: "C",
    }
    this.subs.add(
      this.worksOrdersService.CancelWorkListItem(parms).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data.returnStatus == "S") {
              this.confirmationDialogService.confirm('Please confirm..', data.data.returnMessage)
                .then((confirmed) => (confirmed) ? this.openCancellationDialog() : console.log(confirmed))
                .catch(() => console.log('User dismissed the dialog.'));
            } else {
              this.alertService.error(data.data.returnMessage)
            }
          }
        },
        error => {
          this.alertService.error(error.Message)
        }
      )
    )
  }

  confirmCancelItems() {

    if (this.detaching) {
      this.closeCancellationWin();
      const parms = {
        WorkListArray: this.SetTagStringArray,
        Message: this.cancellationText,
        UserID: this.currentUser.userId,
        CancelItems: true,
        CheckOrProcess: "P"
      }
      this.subs.add(
        this.worksOrdersService.DetachWorkListItem(parms).subscribe(
          data => {
            if (data.isSuccess) {
              if (data.data.returnStatus == "S") {
                this.alertService.success(data.data.returnMessage)
              } else {
                this.alertService.error(data.data.returnMessage)
              }
              this.searchGrid()
            }
          },
          error => {
            this.alertService.error(error.Message)
          }
        )
      )
    } else {
      this.closeCancellationWin();
      const parms = {
        WorkListArray: this.SetTagStringArray,
        Message: this.cancellationText,
        UserID: this.currentUser.userId,
        CheckOrProcess: "P",
      }
      this.subs.add(
        this.worksOrdersService.CancelWorkListItem(parms).subscribe(
          data => {
            if (data.isSuccess) {
              if (data.data.returnStatus == "S") {
                this.alertService.success(data.data.returnMessage)
              } else {
                this.alertService.error(data.data.returnMessage)
              }
              this.searchGrid()
            }
          },
          error => {
            this.alertService.error(error.Message)
          }
        )
      )
    }


  }

  IndividualCancelWorkItem(dataItem) {
    this.SetTagStringArray = [];
    this.SetTagStringArray.push(dataItem.wlassid);
    this.SetTagStringArray.push(dataItem.wlcode);
    this.SetTagStringArray.push(dataItem.wlataid);
    this.SetTagStringArray.push(dataItem.wlplanyear);
    this.CancelWorkItem();
  }

  MultipleCancelWorkItem() {
    this.SetTagStringArray = [];
    this.mySelection.forEach(gridKey => {
      this.SetTagStringArray.push(gridKey.substr(0, 20).trim());
      this.SetTagStringArray.push(gridKey.substr(20, 10).trim());
      this.SetTagStringArray.push(gridKey.substr(30, 10).trim());
      this.SetTagStringArray.push(gridKey.substr(40, 4).trim());
    }
    );
    this.CancelWorkItem();
  }




  public openReport(XportID: number, ReportTitle: string) {
    $('.workListOverlay').addClass('ovrlay');
    var params = [];

    var NewStatus = ""
    var TransferStatus = ""
    var CancelledStatus = ""
    var CompleteStatus = ""
    if (this.headerFilters.workStatusNew) {
      NewStatus = "NEW"
    }
    if (this.headerFilters.workStatusTransferred) {
      TransferStatus = "TRANSFERRED"
    }
    if (this.headerFilters.workStatusCancelled) {
      CancelledStatus = "CANCELLED"
    }
    if (this.headerFilters.workStatusCancelled) {
      CompleteStatus = "COMPLETED"
    }

    var wosequence = 0
    if (this.headerFilters.wosequence != null) {
      wosequence = this.headerFilters.wosequence;
    }
    var wopsequence = 0
    if (this.headerFilters.wopsequence != null) {
      wopsequence = this.headerFilters.wopsequence;
    }

    params.push("Asset ID")
    params.push(this.headerFilters.wlassid)
    params.push("Asset Type")
    params.push(this.headerFilters.astcode)
    params.push("Contractor")
    params.push("")
    params.push("Contract")
    params.push("0")
    params.push("Hierarchy Type")
    params.push(this.headerFilters.hittypecode)
    params.push("Hierarchy Owner")
    params.push(this.headerFilters.ownassid)
    params.push("Recharge")
    params.push("")
    params.push("Refusal")
    params.push("")
    params.push("Address")
    params.push(this.headerFilters.wildcrdaddress)
    params.push("WorkList Status Complete")
    params.push(CompleteStatus)
    params.push("WorkList Status New")
    params.push(NewStatus)
    params.push("WorkList Status Cancelled")
    params.push(CancelledStatus)
    params.push("WorkList Status Transferred")
    params.push(TransferStatus)
    params.push("Works Order Asset Status")
    params.push("")
    params.push("Tag")
    params.push(this.headerFilters.wlttagcode)
    params.push("Works Order No")
    params.push(wosequence)
    params.push("Phase No")
    params.push(wopsequence)

    this.selectedXport = { 'XportID': XportID, 'ReportTitle': ReportTitle, 'Params': params }
    this.reportingAction = 'runExport';
    this.openReports = true;
  }

  public closeReportingWin() {
    $('.workListOverlay').removeClass('ovrlay');
    this.openReports = false;
  }


  checkWorksOrdersAccess(val: string): Boolean {
    if (this.wopmSecurityList != undefined) {
      return this.wopmSecurityList.includes(val);
    } else {
      return false;
    }
  }



  rowCallback(context: RowClassArgs) {
    if (context.dataItem.wlworkstatus == "NEW") {
      return { new: true, transferred: false, completed: false, cancelled: false }
    } else if (context.dataItem.wlworkstatus == "TRANSFERRED") {
      return { new: false, transferred: true, completed: false, cancelled: false }
    } else if (context.dataItem.wlworkstatus == "COMPLETED") {
      return { new: false, transferred: false, completed: true, cancelled: false }
    } else if (context.dataItem.wlworkstatus == "CANCELLED") {
      return { new: false, transferred: false, completed: false, cancelled: true }
    }

  }



  openAsbestosDetail(item) {

    this.autService.validateAssetIDDeepLinkParameters(this.currentUser.userId, item.wlassid).subscribe(
      data => {
        if (data.validated) {
          const siteUrl = `${appConfig.appUrl}/asset-list?assetid=${encodeURIComponent(item.wlassid)}&asbestos=Y`;
          // UAT  const siteUrl = `http://localhost:4200/asset-list?assetid=${item.wlassid}&asbestos=Y`;
          window.open(siteUrl, "_blank");

        } else {
          const errMsg = `${data.errorCode} : ${data.errorMessage}`
          this.alertService.error(errMsg);
        }
      }
    )

    // $('.worksOrderDetailOvrlay').addClass('ovrlay');
  }



  checkTabPermission(tab) {
    if (this.assetTabs != undefined) {
      return (this.assetTabs.includes("all") || this.assetTabs.includes(tab));
    }
    return false;
  }


  checkAsbestosTabAccess(): Boolean {
    return (this.checkModuleEnabled("Asbestos") && this.checkAsbestosSecurity("Asbestos Details") && this.checkAsbestosSecurity("Asbestos Portal Access") && this.checkTabPermission("Asbestos"));
  }

  checkModuleEnabled(val: string): Boolean {
    if (this.modulesEnabled != undefined) {
      return this.modulesEnabled.includes(val);
    }
    return false;
  }

  checkAsbestosSecurity(val: string): Boolean {
    if (this.asbestosPortalAccess != undefined) {
      return this.asbestosPortalAccess.includes(val);
    }
    return false;
  }

  setSeletedRow(item){

  }

}
