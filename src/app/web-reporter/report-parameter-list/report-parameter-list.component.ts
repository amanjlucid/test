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
  columnNames = [];
  loading: boolean = true;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  allowUnsort = true;
  multiple = false;
  totalCount: any = 0;
  query: any;
  allRows: any;
  headerFilters: ReportParameterList = new ReportParameterList();
  stateChange = new BehaviorSubject<any>(this.headerFilters);
  filters: any = [];
  public mode: any = 'single';
  public mySelection: number[] = [];
  public selectableSettings: SelectableSettings;
  touchtime = 0;

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

    this.loadGrid();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  loadGrid() {


    var loadParms = {
      intXportId: this.selectedReport.reportId,
      strXportIntField: this.selectedReportParam.intfield,
    }


    this.subs.add(
      this.reportService.getReportParamList(loadParms).subscribe(
        data => {
            this.allRows = data.data;
            this.query = this.allRows;
            this.columnNames = data.columns;
            this.loading = false;
            this.chRef.detectChanges();
        }
      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
      this.state.sort = sort;
    this.query = process(this.allRows, this.state);
    }

  public filterChange(filter: any): void {
    this.state.filter = filter;
    this.query = process(this.allRows, this.state);

  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: this.mode
    };
  }

  cellClickHandler(eve) {




    if (this.touchtime == 0) {
      // set first click
      this.touchtime = new Date().getTime();


    this.selectedParamListValue = eve.dataItem;
      let array = Object.getOwnPropertyNames(eve.dataItem)
      let keyobj = array.find(x => x.toLowerCase() == this.selectedReportParam.intfield.toLowerCase());
    if (!keyobj) {
        keyobj = array[0];
    }
      if (keyobj) this.parameterInpValue = this.selectedParamListValue[keyobj];
    else this.parameterInpValue = '';
    this.chRef.detectChanges();


    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - this.touchtime) < 400) {
        // double click occurred
        this.setReportParam();
        this.touchtime = 0;
      } else {
        // not a double click so set as a new first click
        this.touchtime = new Date().getTime();
      }
    }



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
