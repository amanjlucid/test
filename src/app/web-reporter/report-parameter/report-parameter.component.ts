import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerService, HelperService } from '../../_services'
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
  reportParameters: any;
  reportParamHeading = '';

  constructor() { }

  ngOnInit(): void {
    this.reportParamHeading = this.selectedReport.reportId+" "+this.selectedReport.reportName;
  }

  closeReportParameter() {
    this.openReportParameter = false;
    this.closeRportparamWindow.emit(this.openReportParameter);
  }
}
