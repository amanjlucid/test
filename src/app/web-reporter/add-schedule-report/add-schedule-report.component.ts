import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SettingsService, SharedService, WebReporterService } from '../../_services'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustbeTodayOrGreater, SimpleDateValidator, DateMustbeTodayOrGreater, DateMustbeInFuture, ChangedDateMustbeInFuture } from 'src/app/_helpers';
import { forkJoin, from } from 'rxjs';
import { filter, map, toArray } from 'rxjs/operators';

@Component({
  selector: 'app-add-schedule-report',
  templateUrl: './add-schedule-report.component.html',
  styleUrls: ['./add-schedule-report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddScheduleReportComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedReport: any;
  @Input() selectedScheduleReport: any;
  @Input() mode: any;
  @Input() openAddScheduleReport = false
  @Output() closeAddScheduleReport = new EventEmitter<boolean>();
  @Output() reloadScheduleGrid = new EventEmitter<boolean>();
  originalRunDate;
  title = 'Schedule';
  editEvform: FormGroup;
  formErrors: any;
  validationMessage = {
    'periodType': {
      'required': 'Period type is required.',
    },
    'periodInterval': {
      'required': 'Period interval is required.',
      'min': 'Period interval must be greater than zero.',
    },
    'nextRunDate': {
      'required': 'Next run date is required.',
      'invalidDate': 'The next run date must be a valid date.',
      'pastdate': 'The next run date must be in the future.'
    },

  };
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
  parameterData: any;
  actualParamData: any;
  notificationState: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  notificationGridView: DataResult;
  selectableSettings: SelectableSettings;
  notificationList: any;
  allowUnsort = true;
  multiple = false;
  openReportParamlist: boolean = false;
  selectedReportParam: any;
  currentUser: any;
  submitted = false;
  reporterPortalPermission = [];
  notificationLoading = true;
  mySelection: number[] = [];
  templateHeading = '';

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private reportService: WebReporterService,
    private sharedService: SharedService,
    private settingService: SettingsService,
    private helperService: HelperService
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    if (this.selectedScheduleReport &&  this.selectedScheduleReport.xport_next_run_date) {
      this.originalRunDate = this.helperService.ngbDatepickerFormatFromDate(this.selectedScheduleReport.xport_next_run_date);      
    }
    this.templateHeading = this.selectedReport.reportId + " " + this.selectedReport.reportName;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.editEvform = this.fb.group({
      periodType: ['', [Validators.required]],
      periodInterval: ['', [Validators.required, Validators.min(1)]],
      nextRunDate: ['', [Validators.required, SimpleDateValidator(), ChangedDateMustbeInFuture(this.originalRunDate), ]],
      pivot: ['']
    });

    this.setGridValues(this.selectedReport.reportId)

    this.subs.add(
      this.sharedService.webReporterObs.subscribe(
        data => this.reporterPortalPermission = data
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setGridValues(reportId) {
    this.subs.add(
      forkJoin([this.reportService.getSchedulingDataByReportId(reportId), this.reportService.getListOfScheduledParameters(reportId), this.settingService.getNotificationList()]).subscribe(
        res => {
          const savedScheduleData = res[0];
          const scheduleParam = res[1];
          const notificationUser = res[2];

          // set value if form is being edited
          if (this.mode == "edit") {
            this.editEvform.patchValue({
              periodType: JSON.stringify(this.selectedScheduleReport.xport_period_type),
              periodInterval: this.selectedScheduleReport.xport_period,
              nextRunDate: this.helperService.ngbDatepickerFormatFromDate(this.selectedScheduleReport.xport_next_run_date),
              pivot: this.selectedScheduleReport.xport_pivot,
            });

          }

          // set parameter grid
          if (scheduleParam.isSuccess) {
            this.parameterData = [...scheduleParam.data];
            if (this.mode == "new") {
              if (this.parameterData.length > 0) {
                this.parameterData = this.clearParameterValue();
              }
            } else {
              if (savedScheduleData.isSuccess) {
                const { xport_identifier, xport_schedule_id } = this.selectedScheduleReport;
                // find and set saved schedule parameter value
                const savedParameterSrc$ = from(savedScheduleData.data[0].parametersViewModels);
                savedParameterSrc$.pipe(
                  filter((findParam: any) => findParam.reportId == xport_identifier && findParam.scheduleId == xport_schedule_id),
                  map(x => {
                    const extfield = this.parameterData.find(y => y.intfield == x.intfield);
                    return { extfield: extfield.extfield, intfield: x.intfield, paramvalue: x.paramvalue, parmset: extfield.parmset };
                  }),
                  toArray()
                ).subscribe(x => this.parameterData = x);
              }
            }
            this.gridView = process(this.parameterData, this.state);
          } else this.alertService.error(scheduleParam.message);

          // set notification grid
          if (notificationUser.isSuccess) {
            if (this.mode == "edit") {
              if (savedScheduleData.isSuccess) {
                const { xport_identifier, xport_schedule_id } = this.selectedScheduleReport;
                // find and set saved notification user group
                const savedNoficationGrp$ = from(savedScheduleData.data[0].scheduledNotifications);
                savedNoficationGrp$.pipe(
                  filter((x: any) => x.reportId === xport_identifier && x.scheduleId === xport_schedule_id),
                  map(filterUserGrp => filterUserGrp.notifyUserGroup),
                ).subscribe(grpId => this.mySelection.push(grpId))
              }
            }

            this.notificationList = notificationUser.data
            this.notificationGridView = process(this.notificationList, this.notificationState);
          } else this.alertService.error(notificationUser.message)

          this.notificationLoading = false;
          this.chRef.detectChanges();

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

  notificationSortChange(sort: SortDescriptor[]): void {
    this.notificationState.sort = sort;
    this.notificationGridView = process(this.notificationList, this.notificationState);
  }

  notificationFilterChange(filter: any): void {
    this.notificationState.filter = filter;
    this.notificationGridView = process(this.notificationList, this.notificationState);
  }

  notificationCellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // this.selectedReportParam = dataItem;
  }

  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid) {
          const messages = this.validationMessage[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey && errorKey != "ngbDate") {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    })
  }

  formErrorObject() {
    this.formErrors = {
      'periodType': '',
      'periodInterval': '',
      'nextRunDate': '',
      'pivot': ''
    }
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.editEvform);
    if (this.editEvform.invalid) {
      return;
    }

    if (this.parameterData && this.parameterData.length > 0) {
      const checkParamValueNotSet = this.parameterData.every(prm => prm.paramvalue != "");
      if (!checkParamValueNotSet) {
        this.alertService.error("Please select values of all required parameters.");
        return
      }
    }

    if (this.mySelection.length == 0) {
      this.alertService.error("Please select at least one recipient.");
      return
    }

    let formRawVal = this.editEvform.getRawValue();
    const modifiedParameter = this.parameterData.map(x => {
      return { intfield: x.intfield, paramvalue: x.paramvalue }
    });

    const userGroup = this.mySelection.map(x => {
      return { NotifyUserGroup: x }
    });

    let params = {
      reportId: this.selectedReport.reportId,
      period: formRawVal.periodInterval,
      periodType: formRawVal.periodType,
      pivot: formRawVal.pivot == '' ? 0 : 1,
      nextRunDate: this.dateFormate2(formRawVal.nextRunDate),
      parameters: modifiedParameter,
      notification: userGroup
    }

    let saveReportSchedule;
    let successMsg = 'Schedule report created successfully';
    if (this.mode == 'new') {
      saveReportSchedule = this.reportService.insertSchedulingReport(params);
    } else {
      successMsg = 'Schedule report updated successfully';
      const scheduleId = { ScheduleId: this.selectedScheduleReport.xport_schedule_id }
      params = { ...params, ...scheduleId }
      saveReportSchedule = this.reportService.updateSchedulingReport(params);
    }

    saveReportSchedule.subscribe(
      data => {
        if (data.isSuccess) {
          this.reloadScheduleGrid.emit(true);
          this.alertService.success(successMsg);
          this.close();
        } else this.alertService.error(data.message)
      },
      err => this.alertService.error(err)
    )



  }

  dateFormate2(value) {
    if (value) {
      return `${value.year}-${value.month}-${value.day}`
    } else {
      return '1753-01-01 00:00:00.000';
    }
  }

  openCalendar(obj) {
    obj.toggle()
  }

  close() {
    this.openAddScheduleReport = false;
    this.closeAddScheduleReport.emit(this.openAddScheduleReport);
  }

  onSelectedKeysChange($event) {
    // console.log(this.mySelection)
  }

  openReportParameterList(item) {
    this.selectedReportParam = item;
    this.openReportParamlist = true;
    $('.reportSchedule').addClass('ovrlay');
  }

  closeReportParamListWindow(eve) {
    this.openReportParamlist = eve;
    $('.reportSchedule').removeClass('ovrlay');
  }

  changeSelectedParam(eve) {
    if (this.selectedReportParam.paramvalue != eve.string) {
      this.selectedReportParam.paramvalue = eve.string;
      this.selectedReportParam.changed = true;
    }
  }

  clearParameterValue() {
    return this.parameterData.map(prm => {
      prm.paramvalue = "";
      return prm
    })
  }

}
