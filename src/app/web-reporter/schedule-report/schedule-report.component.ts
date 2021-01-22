import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, WebReporterService } from '../../_services'

@Component({
  selector: 'app-schedule-report',
  templateUrl: './schedule-report.component.html',
  styleUrls: ['./schedule-report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ScheduleReportComponent implements OnInit {
  subs = new SubSink();
  @Input() openScheduleReport: boolean = false;
  @Input() selectedReport: any;
  @Output() closeScheduleReportWindow = new EventEmitter<boolean>();
  currentUser: any;
  title = 'Report Schedule';
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
  loading = false;
  selectableSettings: SelectableSettings;
  mySelection: number[] = [];
  reportScheduleList: any;
  openAddScheduleReport: boolean = false;
  mode = 'new';
  selectedScheduleReport: any;

  constructor(
    private alertService: AlertService,
    private reporterService: WebReporterService
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getScheduleReport();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getScheduleReport() {
    this.subs.add(
      this.reporterService.getAllSchedulingDataByReportId(this.selectedReport.reportId).subscribe(
        data => {
          console.log(data);
        }
      )
    )
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.reportScheduleList, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.reportScheduleList, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedScheduleReport = dataItem;
  }

  closeScheduleReport() {
    this.openScheduleReport = false;
    this.closeScheduleReportWindow.emit(this.openScheduleReport);
  }

  openAddSchedule(mode) {
    this.mode = mode;
    if (this.mode == 'edit') {
      if (!this.selectedScheduleReport) return;
    }

    this.openAddScheduleReport = true;
    $('.addScheduleOvrlay').addClass('ovrlay');
  }

  closeAddScheduleReport(eve) {
    this.openAddScheduleReport = eve;
    $('.addScheduleOvrlay').removeClass('ovrlay');
  }



}
