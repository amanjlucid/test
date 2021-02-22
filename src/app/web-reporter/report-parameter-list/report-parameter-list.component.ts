import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, SelectAllCheckboxState, PageChangeEvent, GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, WebReporterService } from '../../_services'
import { BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { ReportParameterList } from '../../_models'


@Component({
  selector: 'app-report-parameter-list',
  templateUrl: './report-parameter-list.component.html',
  styleUrls: ['./report-parameter-list.component.css']
})

export class ReportParameterListComponent implements OnInit {
  subs = new SubSink();
  @Input() openReportParamlist: boolean = false;
  @Input() selectedReportParam: any;
  @Input() selectedReport: any;
  @Output() closeReportParamListWindow = new EventEmitter<boolean>();
  @Output() changeSelectedParam = new EventEmitter<any>();
  title = 'Report Parameter';
  reportParamListHeading = '';
  parameterInpValue: any;
  selectedParamListValue: any;
  columnName = [];
  loading: boolean = true;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  allowUnsort = true;
  multiple = false;
  totalCount: any = 0;
  query: any;
  headerFilters: ReportParameterList = new ReportParameterList();
  stateChange = new BehaviorSubject<any>(this.headerFilters);
  filters: any = [];
  public checkboxOnly = true;
  public mode: any = 'single';
  public mySelection: number[] = [];
  public selectableSettings: SelectableSettings;
  public selectAllState: SelectAllCheckboxState = 'unchecked';

  constructor(
    private reportService: WebReporterService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.reportParamListHeading = `Select Value for '${this.selectedReportParam.extfield}'`;
    this.headerFilters.intXportId = this.selectedReport.reportId;
    this.headerFilters.strXportIntField = this.selectedReportParam.intfield;
    this.parameterInpValue = this.selectedReportParam.paramvalue;

    // console.log(this.selectedReportParam);

    this.query = this.stateChange.pipe(
      debounceTime(20),
      tap(state => {
        this.headerFilters = state;
        this.loading = true;
      }),
      switchMap(state => this.reportService.getReportParamList(state)),
      tap((res) => {
        if (res.total > 0) {
          if (this.columnName.length == 0) {
            let columnName = Object.keys(res.data[0]);
            for (let col of columnName) {
              if (col == 'ataid') {
                this.columnName.push({ col: col, width: 20 });
              } else if (col == 'atadescription') {
                this.columnName.push({ col: col, width: 140 });
              } else {
                this.columnName.push({ col: col, width: 120 });
              }
            }
          }
          this.totalCount = (res.total != undefined) ? res.total : 0
        }
        this.loading = false;
        this.chRef.detectChanges();
      })
    );

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  sortChange(sort: SortDescriptor[]): void {
    if (sort.length > 0) {
      if (sort[0].dir == undefined) sort[0].dir = "asc";

      if (sort[0].dir == "asc") this.headerFilters.OrderType = "Ascending";
      else this.headerFilters.OrderType = "descending";

      this.headerFilters.OrderBy = sort[0].field;
      this.state.sort = sort;
      this.searchGrid()
    }
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.filters = [];
    this.headerFilters.Fields = [];
    if (this.state.filter) {
      this.headerFilters.IsFilter = true;
      if (this.state.filter.filters.length > 0) {
        let distincFitler = this.changeFilterState(this.state.filter.filters);
        // console.log(distincFitler)
        distincFitler.then(filter => {
          if (filter.length > 0) {
            this.headerFilters.Fields = [];
            for (let ob of filter) {
              this.setGridFilter(ob);
            }
            setTimeout(() => {
              this.searchGrid()
            }, 500);
          }
        })
      } else {
        this.headerFilters.IsFilter = false;
        this.searchGrid()
      }
    } else {
      this.headerFilters.IsFilter = false;
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

  containsObject(obj, list) {
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === obj) {
        return true;
      }
    }

    return false;
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

  setGridFilter(obj) {
    this.headerFilters.Fields.push({ colunmname: obj.field, value: obj.value });
  }

  searchGrid() {
    this.headerFilters.CurrentPage = 0;
    this.state.skip = 0;
    this.stateChange.next(this.headerFilters);
  }

  pageChange(state: PageChangeEvent): void {
    this.headerFilters.CurrentPage = state.skip;
    this.headerFilters.PageSize = state.take;
    this.stateChange.next(this.headerFilters);
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: this.mode
    };
  }

  cellClickHandler(eve) {
    this.selectedParamListValue = eve.dataItem;
   
    let keyobj;
    if (this.columnName.length > 1) {
      keyobj = this.columnName.find(x => x.col.toLowerCase() == this.selectedReportParam.intfield.toLowerCase())
    } else {
      keyobj = this.columnName.find(x => x.col.toLowerCase() == this.selectedReportParam.intfield.toLowerCase())
      if (!keyobj) {
        keyobj = this.columnName[0];
      }
    }
   
    if (keyobj) this.parameterInpValue = this.selectedParamListValue[keyobj.col];
    else this.parameterInpValue = '';
    this.chRef.detectChanges();

  }

  closeReportParamList() {
    this.openReportParamlist = false
    this.closeReportParamListWindow.emit(this.openReportParamlist);
  }

  setReportParam() {
    if (this.parameterInpValue) {
      this.changeSelectedParam.emit({ selectedParamList: this.selectedParamListValue, string: this.parameterInpValue.toString() });
    };
    this.closeReportParamList();
  }

}
