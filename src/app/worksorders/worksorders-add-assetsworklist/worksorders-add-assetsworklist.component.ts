import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, AssetAttributeService, ConfirmationDialogService, HelperService, LoaderService, PropertySecurityGroupService, WorksorderManagementService } from 'src/app/_services';
import { WorkordersAddAssetModel } from '../../_models'
import { tap, switchMap} from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-worksorders-add-assetsworklist',
  templateUrl: './worksorders-add-assetsworklist.component.html',
  styleUrls: ['./worksorders-add-assetsworklist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class WorksordersAddAssetsworklistComponent implements OnInit {
  //hierarchy
  printHiearchy: any;
  visitedHierarchy: any[] = [];
  hiearchyTypeLists: any;
  selectedHiearchyType: any;
  hierarchyLevels: any;
  selectedhierarchyLevel: any;
  hiearchyWindow = false;
  //hierarchy variable ends here

  @Input() addAssetWorklistWindow: boolean = false;
  @Output() closeAddAssetWorkListEvent = new EventEmitter<boolean>();
  @Output() refreshWorkOrderDetails = new EventEmitter<boolean>();
  @Input() actualSelectedRow: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  subs = new SubSink();

  readonly = true;
  assetTypes: any;
  title = 'Add Assets from Work List';
  headerFilters: WorkordersAddAssetModel = new WorkordersAddAssetModel()
  public query: any;
  private stateChange = new BehaviorSubject<any>(this.headerFilters);
  loading = true
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  filters: any = [];
  totalCount: any = 0;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  zero = 0;

  constructor(
    private propSecGrpService: PropertySecurityGroupService,
    private loaderService: LoaderService,
    private helperService: HelperService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private assetAttributeService: AssetAttributeService,
    private worksorderManagementService: WorksorderManagementService,
    private confirmationDialogService: ConfirmationDialogService
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    // console.log(this.actualSelectedRow)
    this.headerFilters.wopsequence = this.actualSelectedRow.wopsequence;
    this.headerFilters.wosequence = this.actualSelectedRow.wosequence;

    this.getAssetType();

    this.query = this.stateChange.pipe(
      tap(state => {
        this.headerFilters = state;
        this.loading = true;
      }),
      switchMap(state => this.worksorderManagementService.getWorkOrderAsset(state)),
      tap((res) => {
        this.totalCount = (res.total != undefined) ? res.total : 0;
        this.loading = false;
        this.chRef.detectChanges();
      })
    );


  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getAssetType() {
    this.subs.add(
      this.assetAttributeService.getAssetTypes().subscribe(
        data => {
          if (data.isSuccess) {
            this.assetTypes = data.data;
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  closeAddAssetWindow() {
    this.addAssetWorklistWindow = false;
    this.closeAddAssetWorkListEvent.emit(this.addAssetWorklistWindow);
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'multiple'
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // console.log(this.mySelection)
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
    this.headerFilters.wildcardaddress = '';
    this.headerFilters.hittypecode = '';
    this.headerFilters.astcode = '';
    this.headerFilters.ownassid = '';
    this.headerFilters.assid = '';
    this.headerFilters.propertyStatus = '';
    this.headerFilters.astconcataddress = '';
    this.headerFilters.rightToBuy = '';

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
    return encodeURIComponent(context.dataItem.assid);
  }

  addTickedToWorksOrder(strCheckOrProcess = "C") {
    if (strCheckOrProcess != "C" && strCheckOrProcess != "P") {
      return
    }

    let params = {
      strCheckOrProcess: strCheckOrProcess,
      assidlist: this.mySelection,
      strUserId: this.currentUser.userId,
      wopsequence: this.actualSelectedRow.wopsequence,
      wosequence: this.actualSelectedRow.wosequence,
    }

    this.subs.add(
      this.worksorderManagementService.addWorksOrderAssets(params).subscribe(
        data => {
          if (!data.isSuccess) {
            this.alertService.error(data.message)
            return
          }
          if (strCheckOrProcess == "C" && data.data[0].pRETURNSTATUS == "S") {
            this.openConfirmationDialog(data.data)
          } else if (strCheckOrProcess == "P" && data.data[0].pRETURNSTATUS == "S") {
            this.alertService.success(data.data[0].pRETURNMESSAGE);
            this.refreshWorkOrderDetails.emit(true);
            this.searchGrid();
          } else if (data.data[0].pRETURNSTATUS != "S") {
            this.alertService.error(data.data[0].pRETURNMESSAGE)
          }
        },
        err => this.alertService.error(err)
      )
    )
  }

  openConfirmationDialog(resp) {
    let strCheckOrProcess = "N";
    let res = resp[0]
    if (res.pRETURNSTATUS == "S" && res.pWPLSEQUENCE == 0 && res.pWPRSEQUENCE == 0) {
      strCheckOrProcess = "P"
    }
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => (confirmed) ? this.addTickedToWorksOrder(strCheckOrProcess) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }

   selectionChange(item) {
    if (this.mySelection.includes(item.assid)) {
      this.mySelection = this.mySelection.filter(x => x != item.assid);
    } else {
      this.mySelection.push(item.assid);
    }
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
    $('.worksOrderAddAssetOverlay').addClass('ovrlay');
    this.getHierarchyTypeList();
    this.hiearchyWindow = true;
    this.chRef.detectChanges();
  }

  public closeHiearchyWindow() {
    $('.worksOrderAddAssetOverlay').removeClass('ovrlay');
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


}
