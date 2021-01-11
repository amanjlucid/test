import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, WebReporterService } from '../../_services'


@Component({
  selector: 'app-report-parameter',
  templateUrl: './report-parameter.component.html',
  styleUrls: ['./report-parameter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportParameterComponent implements OnInit {
  subs = new SubSink();
  @Input() openReportParameter: boolean = false;
  @Input() selectedReport: any;
  @Output() closeRportparamWindow = new EventEmitter<boolean>();
  title = 'Report Parameters';
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  gridView: DataResult;
  allowUnsort = true;
  multiple = false;
  reportParameters: any;
  reportParamHeading = '';
  parameterData: any;
  openReportParamlist: boolean = false;
  selectedReportParam: any;

  constructor(
    private reportService: WebReporterService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.reportParamHeading = this.selectedReport.reportId + " " + this.selectedReport.reportName;
    this.getReportParameter(this.selectedReport.reportId);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getReportParameter(reportId) {
    this.subs.add(
      this.reportService.getListOfScheduledParameters(reportId).subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            this.parameterData = data.data;
            this.renderGrid();
          } else this.alertService.error(data.message);
        },
        err => this.alertService.error(err)
      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.renderGrid();
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.renderGrid();
  }

  onStateChange(state: State) {
    this.state = state;
    this.renderGrid();
  }

  renderGrid() {
    this.gridView = process(this.parameterData, this.state);
    this.chRef.detectChanges();
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // this.closeEditor(sender, rowIndex);
    // this.selectedParam = dataItem;
    // this.rowIndex = rowIndex
    // // console.log(this.selectedParam)
    // if (columnIndex == 2) {
    //   if (!isEdited && this.selectedParam.eventTypeParamType == 'N') {
    //     sender.editCell(rowIndex, columnIndex);
    //   }
    // }
  }

  restoreAndClearParams(type) {
    if (type == 'clear') {
      this.parameterData = this.parameterData.map(x => {
        x.paramvalue = '';
        return x;
      });
      this.renderGrid();
    } else this.getReportParameter(this.selectedReport.reportId);
  }

  closeReportParameter() {
    this.openReportParameter = false;
    this.closeRportparamWindow.emit(this.openReportParameter);
  }

  openReportParameterList(item) {
    this.selectedReportParam = item;
    this.openReportParamlist = true;
    $('.reportParamList').addClass('ovrlay');
  }

  closeReportParamListWindow(eve) {
    this.openReportParamlist = eve;
    $('.reportParamList').removeClass('ovrlay');

  }
}
