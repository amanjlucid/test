import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ReportingGroupService, SharedService, WebReporterService } from '../../_services'
import { forkJoin } from 'rxjs';


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
  // reportParameters: any;
  reportParamHeading = '';
  parameterData: any;
  actualParamData: any;
  openReportParamlist: boolean = false;
  selectedReportParam: any;
  currentUser: any;
  reporterPortalPermission = [];

  constructor(
    private reportService: WebReporterService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private reportingGrpService: ReportingGroupService,
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.reportParamHeading = this.selectedReport.reportId + " " + this.selectedReport.reportName;
    this.getReportParameter(this.selectedReport.reportId);

    this.subs.add(
      this.sharedService.webReporterObs.subscribe(
        data => this.reporterPortalPermission = data
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getReportParameter(reportId) {
    this.subs.add(
      this.reportService.getListOfScheduledParameters(reportId).subscribe(
        data => {
          if (data.isSuccess) {
            this.parameterData = data.data;
            this.renderGrid();
          } else this.alertService.error(data.message);
        },
        err => this.alertService.error(err)
      )
    )

    // set actual parameter value
    this.subs.add(
      this.reportService.getListOfScheduledParameters(reportId).subscribe(
        data => {
          if (data.isSuccess) this.actualParamData = [...data.data];
        }
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
    this.selectedReportParam = dataItem;
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

  changeSelectedParam(eve) {
    if (this.selectedReportParam.paramvalue != eve.string) {
      this.selectedReportParam.paramvalue = eve.string;
      this.selectedReportParam.changed = true;
    }
  }

  saveParameters() {
    if (JSON.stringify(this.actualParamData) == JSON.stringify(this.parameterData)) {
      this.alertService.error("There is no change to update.");
      return
    }

    let req = [];
    for (let griddata of this.parameterData) {
      if (griddata.changed != undefined) {
        const params = { userName: this.currentUser.userId, xportId: this.selectedReport.reportId, xportParameterDefinitions: [{ xport_ext_field: '', xport_int_field: griddata.intfield, SavedValue: griddata.paramvalue }] }
        req.push(this.reportService.updateReportParameter(params));
      }
    }

    if (req.length > 0) {
      this.subs.add(
        forkJoin(req).subscribe(
          data => {
            this.alertService.success("Parameter updated successfully.");
            this.getReportParameter(this.selectedReport.reportId);
          },
          err => this.alertService.error(err)
        )
      )
    }

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

  runReport() {
    if (this.parameterData != undefined && this.parameterData.length > 0) {
      let parameters = [...this.parameterData];
      let lstParamNameValue: string[] = [''];
      let paramArr: string[] = [];
      let checkValueSet = '';
      parameters.forEach(element => {
        if (checkValueSet == '' && element.paramvalue == "") {
          checkValueSet = element.extfield;
        }
        paramArr.push(element.extfield)
        paramArr.push(element.paramvalue)
      });
      lstParamNameValue = [paramArr.toString()];
      if (checkValueSet != '') {
        this.alertService.error(`Missing Parameters: ${checkValueSet}`);
        return;
      }

      // run report 
      const exportId = this.selectedReport.reportId
      this.reportingGrpService.runReport(exportId, lstParamNameValue, this.currentUser.userId, "EXCEL", false).subscribe(
        data => {
          const linkSource = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + data;
          const downloadLink = document.createElement("a");
          const fileName = `Xport_${exportId}.xlsx`;
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        },
        err => this.alertService.error(err)
      )
    }

  }

}
