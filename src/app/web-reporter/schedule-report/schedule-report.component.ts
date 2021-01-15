import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, WebReporterService } from '../../_services'

@Component({
  selector: 'app-schedule-report',
  templateUrl: './schedule-report.component.html',
  styleUrls: ['./schedule-report.component.css']
})
export class ScheduleReportComponent implements OnInit {
  subs = new SubSink();
  @Input() openScheduleReport: boolean = false;
  @Input() selectedReport: any;
  @Output() closeScheduleReportWindow = new EventEmitter<boolean>();
  currentUser: any;
  title = 'Report Schedule';

  constructor() { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeScheduleReport(){
    this.openScheduleReport = false;
    this.closeScheduleReportWindow.emit(this.openScheduleReport);
  }

}
