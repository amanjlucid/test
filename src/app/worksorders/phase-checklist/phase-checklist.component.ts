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
    const { wosequence } = this.selectedPhase;
    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorksOrderByWOsequence(wosequence),
        this.worksorderManagementService.getPhaseCheckListFiltersList(wosequence, false),
      ]).subscribe(
        data => {
          console.log(data)
          const wo = data[0];
          const colFilters = data[1];

          if (wo.isSuccess) this.worksOrderData = wo.data;
          else this.alertService.error(wo.message)

          if (colFilters.isSuccess) this.colFilters = colFilters.data;
          else this.alertService.error(colFilters.message)

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
    return encodeURIComponent(context.dataItem.wochecksurcde);
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

}
