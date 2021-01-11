import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, SelectAllCheckboxState, PageChangeEvent, GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, WebReporterService } from '../../_services'
import { BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';


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
  title = 'Report Parameter';
  reportParamListHeading = '';
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
  headerFilters = {
    currentPage: 0,
    pageSize: 50,
    intXportId: '',
    strXportIntField: ''
  }
  stateChange = new BehaviorSubject<any>(this.headerFilters);
  filters: any = [];
  public checkboxOnly = true;
  public mode: any = 'multiple';
  public mySelection: number[] = [];
  public selectableSettings: SelectableSettings;
  public selectAllState: SelectAllCheckboxState = 'unchecked';
  @ViewChild(GridComponent) public grid: GridComponent;


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

    this.query = this.stateChange.pipe(
      debounceTime(20),
      tap(state => {
        this.headerFilters = state;
        this.loading = true;
      }),
      switchMap(state => this.reportService.getReportParamList(state)),
      tap((res) => {
        console.log(res)
        // this.totalCount = (res.total != undefined) ? res.total : 0;
        this.loading = false;
        // this.setDefaultSelectedValues(this.selectedParam.eventTypeParamSqlValue);
        this.chRef.detectChanges();
      })
    );
    // this.getReportParamList(this.selectedReport.reportId, this.selectedReportParam.intfield)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // getReportParamList(reportId, intField) {
  //   this.subs.add(
  //     this.reportService.getReportParamList().subscribe(
  //       data => {
  //         console.log(data);
  //         if (data.isSuccess) {
  //           if (data.data.length == 1) {
  //             this.chRef.detectChanges();
  //           }
  //         } else this.alertService.error(data.message);
  //       },
  //       err => this.alertService.error(err)
  //     )
  //   )
  // }

  // sortChange(sort: SortDescriptor[]): void {
  //   this.state.sort = sort;
  //   this.gridView = process(this.parameterList, this.state);
  // }

  // filterChange(filter: any): void {
  //   this.state.filter = filter;
  //   this.gridView = process(this.parameterList, this.state);
  // }

  pageChange(state: PageChangeEvent): void {
    // console.log(state);
    this.headerFilters.currentPage = state.skip;
    this.headerFilters.pageSize = state.take;
    this.stateChange.next(this.headerFilters);
  }


  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'single'
    };
  }

  closeReportParamList() {
    this.openReportParamlist = false
    this.closeReportParamListWindow.emit(this.openReportParamlist);
  }

}
