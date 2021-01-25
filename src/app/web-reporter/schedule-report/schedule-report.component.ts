import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, WebReporterService } from '../../_services'
import { forkJoin } from 'rxjs';

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
    private reporterService: WebReporterService,
    private chRef: ChangeDetectorRef,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.getScheduleReport(this.selectedReport.reportId);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getScheduleReport(reportId) {
    this.subs.add(
      forkJoin([this.reporterService.getSchedulingDataByReportId(reportId), this.reporterService.getSchedulingList(reportId)]).subscribe(
        res => {
          console.log(res);
          let savedScheduleData = res[0];
          let parameters = [];
          let userGroups = [];
          if (savedScheduleData.isSuccess) {
            for (let pr of savedScheduleData.data[0].parametersViewModels) {
              if (parameters[pr.scheduleId] == undefined) {
                parameters[pr.scheduleId] = [];
              }
              parameters[pr.scheduleId].push(pr.intfield)
            }

            for (let pr of savedScheduleData.data[0].scheduledNotifications) {
              if (userGroups[pr.scheduleId] == undefined) {
                userGroups[pr.scheduleId] = [];
              }
              userGroups[pr.scheduleId].push(pr.notifyUserGroup)
            }
          }


          let tempScheduleData = [];
          let scheduleData = res[1];
          if (scheduleData.isSuccess) {
            if (scheduleData.data.length > 0) {
              tempScheduleData = scheduleData.data.map(x => {
                // let parameters = savedScheduleData.data.parametersViewModels.filter(s => )
                x.params = (parameters[x.xport_schedule_id] != undefined) ? parameters[x.xport_schedule_id] : [];
                x.userGroups = (userGroups[x.xport_schedule_id] != undefined) ? userGroups[x.xport_schedule_id] : [];
                return x;
              });

            }


            this.reportScheduleList = tempScheduleData;
            this.gridView = process(this.reportScheduleList, this.state);
            this.chRef.detectChanges();
          }
        }
      )
    )
    // this.subs.add(
    //   this.reporterService.getSchedulingList(reportId).subscribe(
    //     data => {
    //       console.log(data);
    //       if (data.isSuccess) {
    //         this.reportScheduleList = data.data;
    //         this.gridView = process(this.reportScheduleList, this.state);
    //         this.chRef.detectChanges();
    //       }
    //     }
    //   )
    // )
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

  reloadScheduleGrid(eve) {
    if (eve) {
      this.getScheduleReport(this.selectedReport.reportId);
    }
  }



}
