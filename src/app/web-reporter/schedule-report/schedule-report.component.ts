import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SettingsService, WebReporterService } from '../../_services'
import { forkJoin, from } from 'rxjs';
import { map, toArray } from 'rxjs/operators';

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
  loading = true;
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
    private confirmationDialogService: ConfirmationDialogService,
    private settingService: SettingsService
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
      forkJoin([this.reporterService.getSchedulingDataByReportId(reportId), this.settingService.getNotificationList()]).subscribe(
        res => {
          this.reportScheduleList = []; // reset reportScheduleList
          let savedScheduleData = res[0];
          //let scheduleData = res[1]; //this.reporterService.getSchedulingList(reportId), 
          let allNotificationUsrGrp = res[1];

          if (savedScheduleData.isSuccess) {
            const { parametersViewModels, scheduledNotifications, xportScheduleViewModel } = savedScheduleData.data[0];
            if (xportScheduleViewModel.length != undefined && xportScheduleViewModel.length > 0) {
              const filterByReportIdAndSchedulId = (currentObj, objToMatch) => currentObj.scheduleId == objToMatch.scheduleId && currentObj.reportId == objToMatch.reportId;
              const findInAllNotifyUser = (currentObj) => allNotificationUsrGrp.data.find(x => x.groupId == currentObj.notifyUserGroup);

              const scheduleRprtListSrc$ = from(xportScheduleViewModel);
              const modifySchedulRprtList = scheduleRprtListSrc$.pipe(
                map((scheduleObj: any) => {
                  const filterParamByRprtAndScheduleId = parametersViewModels
                    .filter(paramObj => filterByReportIdAndSchedulId(paramObj, scheduleObj))
                    .map(afterfilterParam => afterfilterParam.paramvalue);

                  const filterNotifyGrpByRprtAndSchdeduleId = scheduledNotifications
                    .filter(paramObj => filterByReportIdAndSchedulId(paramObj, scheduleObj))
                    .map(savedGrp => findInAllNotifyUser(savedGrp).groupDesc)

                  return {
                    xport_identifier: scheduleObj.reportId,
                    xport_last_run_date: scheduleObj.lastRunDate,
                    xport_next_run_date: scheduleObj.nextRunDate,
                    xport_period: scheduleObj.period,
                    xport_period_type: scheduleObj.periodType,
                    xport_pivot: scheduleObj.pivot,
                    xport_schedule_id: scheduleObj.scheduleId,
                    params: filterParamByRprtAndScheduleId.toString(),
                    userGroups: filterNotifyGrpByRprtAndSchdeduleId.toString()
                  }
                }),
                toArray()
              );
              modifySchedulRprtList.subscribe(sechduleList => this.reportScheduleList = sechduleList);
            }

            this.gridView = process(this.reportScheduleList, this.state);
            this.loading = false;
            this.chRef.detectChanges();
          } else this.alertService.error(savedScheduleData.message)
        },
        err => this.alertService.error(err)
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

  reloadScheduleGrid(eve) {
    if (eve) {
      this.selectedScheduleReport = undefined;
      this.getScheduleReport(this.selectedReport.reportId);
    }
  }

  onSelectedKeysChange($event) {
    // console.log(this.mySelection)
  }

  openConfirmationDialog() {
    if (this.selectedScheduleReport == undefined) {
      this.alertService.error('Please select one attachment');
      return;
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.deleteScheduleReport() : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }

  deleteScheduleReport() {
    const { xport_schedule_id, xport_identifier } = this.selectedScheduleReport;
    this.subs.add(
      this.reporterService.deleteSchedulingReport(xport_identifier, xport_schedule_id).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Record deleted successfully.")
            this.reloadScheduleGrid(true);
          }
          else this.alertService.error(data.message);
        },
        err => this.alertService.error(err)
      )
    )
  }



}
