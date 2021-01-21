import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SettingsService, SharedService, WebReporterService } from '../../_services'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustbeTodayOrGreater } from 'src/app/_helpers';

@Component({
  selector: 'app-add-schedule-report',
  templateUrl: './add-schedule-report.component.html',
  styleUrls: ['./add-schedule-report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddScheduleReportComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedReport: any;
  @Input() openAddScheduleReport = false
  @Output() closeAddScheduleReport = new EventEmitter<boolean>();
  title = 'Schedule';
  editEvform: FormGroup;
  formErrors: any;
  validationMessage = {
    'periodType': {
      'required': 'Period type is required.',
    },
    'periodInterval': {
      'required': 'Period interval is required.',
    },
    'nextRunDate': {
      'required': 'Next run date is required.',
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
  notificationState: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  gridView: DataResult;
  notificationGridView:DataResult;
  selectableSettings: SelectableSettings;
  notificationList: any;
  allowUnsort = true;
  multiple = false;
  parameterData: any;
  actualParamData: any;
  openReportParamlist: boolean = false;
  selectedReportParam: any;
  currentUser: any;
  submitted = false;
  reporterPortalPermission = [];
  notificationLoading = true;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private reportService: WebReporterService,
    private sharedService: SharedService,
    private settingService: SettingsService,
  ) { 
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.editEvform = this.fb.group({
      periodType: ['', [Validators.required]],
      periodInterval: ['', [Validators.required]],
      nextRunDate: ['', [Validators.required, MustbeTodayOrGreater()]],
    });

    this.getReportParameter(this.selectedReport.reportId);
    this.getNotificationList();
    this.subs.add(
      this.sharedService.webReporterObs.subscribe(
        data => this.reporterPortalPermission = data
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  getNotificationList() {
    this.subs.add(
      this.settingService.getNotificationList().subscribe(
        data => {
          if (data.isSuccess) {
            this.notificationList = data.data
            this.notificationGridView = process(this.notificationList, this.notificationState);
          }
          this.notificationLoading = false;
        }
      )
    )
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
            if (errorKey) {
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

    }
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.editEvform);
    if (this.editEvform.invalid) {
      return;
    }
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


}
