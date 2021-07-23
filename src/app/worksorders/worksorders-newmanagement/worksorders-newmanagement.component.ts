import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorksorderManagementService, AlertService, HelperService, LoaderService } from '../../_services'
import { ShouldGreaterThanYesterday, isNumberCheck, OrderDateValidator, IsGreaterDateValidator, checkFirstDateisLower, firstDateIsLower, SimpleDateValidator } from 'src/app/_helpers';
import { WorkordersAddManagementModel } from '../../_models';


@Component({
  selector: 'app-worksorders-newmanagement',
  templateUrl: './worksorders-newmanagement.component.html',
  styleUrls: ['./worksorders-newmanagement.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class WorksordersNewmanagementComponent implements OnInit {
  @Output() closeNewManagementEvent = new EventEmitter<boolean>();
  @Output() refreshManagementGrid = new EventEmitter<boolean>();
  @Input() openNewManagement: boolean = false;
  @Input() formMode: string = 'new';
  @Input() selectedProgramme: any;
  minDate: any;
  subs = new SubSink(); // to unsubscribe services
  workManagementForm: FormGroup;
  submitted = false;
  formErrors: any;
  title = "New Works Programme"
  validationMessage = {
    'WPRNAME': {
      'required': 'Name is required.',
      'maxlength': 'Name must be maximum 50 characters.',
    },
    'WPREXTREF': {
      'required': 'Ext Ref is required.',
      'maxlength': 'Ext Ref must be maximum 50 characters.',
    },
    'WPRDESC': {
      'required': 'Desc is required.',
    },
    'WPRSTATUS': {
      'required': 'Status is required.',
    },
    'WPRACTINACT': {
      'required': 'Active is required.',
    },
    'WPRPROGRAMMETYPE': {
      'required': 'Programme Type is required.',
      'maxlength': 'Programme Type must be maximum 50 characters.',
    },
    'WPRBUDGET': {
      'required': 'Budget is required.',
      'isNotNumber': 'Budget should be an integer value.',
      'maxlength': 'Budget must be maximum 9 digit.',
    },
    'WPRTARGETCOMPLETIONDATE': {
      'required': 'Target Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Target Date cannot be in the past.'
    },
    'WPRCONTRACTORISSUEDATE': {
      'required': 'Issue Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Issue Date cannot be in the past.'
    },
    'WPRPLANSTARTDATE': {
      'required': 'Planned Start Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Planned Start Date cannot be in the past.'
    },
    'WPRPLANENDDATE': {
      'required': 'Planned End Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Planned End Date cannot be in the past.',
      'isLower': 'Planned End Date must be on or after the Planned Start Date.',
      'isGreaterDate': 'Planned End Date cannot be later than the Target Completion Date.'
    },
    'WPRACTUALSTARTDATE': {
      'required': 'Actual Start Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Actual Start Date cannot be in the past.'
    },
    'WPRACTUALENDDATE': {
      'required': 'Actual End Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Actual End Date cannot be in the past.'
    },
    'WPRFORECAST': {
      'required': 'Work Forecast is required.',
    }



  };
  // managementModel: WorkordersAddManagementModel;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  readonly = true;
  mData: any;
  currentStatus: string;


  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
    private helperService: HelperService,
    private loaderService: LoaderService
  ) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };


  }

  ngAfterViewInit() {
    this.chRef.detectChanges();
  }

  ngOnInit(): void {
    let targetDateValidationArr = [Validators.required, ShouldGreaterThanYesterday(), SimpleDateValidator()];
    let planDateValidationArr: any = [ShouldGreaterThanYesterday(), SimpleDateValidator()];

    if (this.formMode == "edit") {
      targetDateValidationArr = [Validators.required, SimpleDateValidator()];
      planDateValidationArr = [SimpleDateValidator()];
    }

    this.workManagementForm = this.fb.group({
      WPRNAME: ['', [Validators.required, Validators.maxLength(50)]],
      WPREXTREF: ['', [Validators.maxLength(50)]],
      WPRDESC: ['', []],
      WPRSTATUS: [''],
      WPRACTINACT: [''],
      WPRPROGRAMMETYPE: ['', [Validators.maxLength(50)]],
      WPRBUDGET: ['', [Validators.required]], //isNumberCheck(), Validators.maxLength(9)
      WPRTARGETCOMPLETIONDATE: ['', targetDateValidationArr],

      WPRPLANSTARTDATE: ['', planDateValidationArr],
      WPRPLANENDDATE: ['', planDateValidationArr],

      WPRACTUALSTARTDATE: [''],
      WPRACTUALENDDATE: [''],
      WPRCONTRACTORISSUEDATE: [''],

      WPRFORECAST: [''],
      WPRCOMMITTED: [''],
      WPRAPPROVED: [''],
      WPRPENDING: [''],
      WPRACTUAL: [''],

      WPRFORECASTFEE: [''],
      WPRCOMMITTEDFEE: [''],
      WPRAPPROVEDFEE: [''],
      WPRPENDINGFEE: [''],
      WPRACTUALFEE: [''],

      WPRFORECASTCONFEE: [''],
      WPRCOMMITTEDCONFEE: [''],
      WPRAPPROVEDCONFEE: [''],
      WPRPENDINGCONFEE: [''],
      WPRACTUALCONFEE: [''],

    },
      {
        validator: [
          firstDateIsLower('WPRPLANENDDATE', 'WPRPLANSTARTDATE'),
          IsGreaterDateValidator('WPRPLANENDDATE', 'WPRTARGETCOMPLETIONDATE')
        ],
      }
    );

    this.chRef.detectChanges();


    const plnEndCtr = this.workManagementForm.get('WPRPLANENDDATE');
    const plnStartCtr = this.workManagementForm.get('WPRPLANSTARTDATE');

    this.subs.add(
      plnEndCtr.valueChanges.subscribe(
        data => {
          plnEndCtr.setValidators([SimpleDateValidator(), checkFirstDateisLower(plnEndCtr, plnStartCtr)])
        }
      )
    )

    this.subs.add(
      plnStartCtr.valueChanges.subscribe(
        data => {
          plnEndCtr.setValidators([SimpleDateValidator(), checkFirstDateisLower(plnEndCtr, plnStartCtr)])
        }
      )
    )


    this.populateForm()



  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  populateForm() {
    if (this.formMode == 'new') {
      this.currentStatus = 'New';
      this.workManagementForm.patchValue({ WPRSTATUS: 'New', WPRACTINACT: 'A' });
      this.workManagementForm.get('WPRSTATUS').disable();
      this.workManagementForm.get('WPRACTINACT').disable();
    } else {
      this.title = "Edit Works Programme"
      this.getWopmManagementData()
    }
  }

  getWopmManagementData() {
    this.subs.add(
      this.worksorderManagementService.getWorkProgrammesByWprsequence(this.selectedProgramme.wprsequence).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            const mData = this.mData = data.data[0];
            this.currentStatus = mData.wprstatus;
            this.workManagementForm.patchValue({
              WPRNAME: mData.wprname,
              WPREXTREF: mData.wprextref,
              WPRDESC: mData.wprdesc,
              WPRSTATUS: mData.wprstatus,
              WPRACTINACT: mData.wpractinact,

              WPRPROGRAMMETYPE: mData.wprprogrammetype,
              WPRBUDGET: mData.wprbudget,
              WPRTARGETCOMPLETIONDATE: this.helperService.ngbDatepickerFormat(mData.wprtargetcompletiondate),
              WPRPLANSTARTDATE: this.helperService.ngbDatepickerFormat(mData.wprplanstartdate),
              WPRPLANENDDATE: this.helperService.ngbDatepickerFormat(mData.wprplanenddate),

              WPRACTUALSTARTDATE: this.helperService.ngbDatepickerFormat(mData.wpractualstartdate),
              WPRACTUALENDDATE: this.helperService.ngbDatepickerFormat(mData.wpractualenddate),
              WPRCONTRACTORISSUEDATE: this.helperService.ngbDatepickerFormat(mData.wprcontractorissuedate),
              WPRFORECAST: mData.wprforecast,
              WPRCOMMITTED: mData.wprcommitted,
              WPRAPPROVED: mData.wprapproved,
              WPRPENDING: mData.wprpending,
              WPRACTUAL: mData.wpractual,

              WPRFORECASTFEE: mData.wprforecastfee,
              WPRCOMMITTEDFEE: mData.wprcommittedfee,
              WPRAPPROVEDFEE: mData.wprapprovedfee,
              WPRPENDINGFEE: mData.wprpendingfee,
              WPRACTUALFEE: mData.wpractualfee,

              WPRFORECASTCONFEE: mData.wprforecastconfee,
              WPRCOMMITTEDCONFEE: mData.wprcommittedconfee,
              WPRAPPROVEDCONFEE: mData.wprapprovedconfee,
              WPRPENDINGCONFEE: mData.wprpendingconfee,
              WPRACTUALCONFEE: mData.wpractualconfee,

            })

            setTimeout(() => {
              this.chRef.detectChanges();
            }, 100);
            this.workManagementForm.get('WPRCONTRACTORISSUEDATE').disable();
            this.workManagementForm.get('WPRACTUALSTARTDATE').disable();
            this.workManagementForm.get('WPRACTUALENDDATE').disable();


          } else {
            this.alertService.error(data.message)
          }


        }
      )
    )
  }

  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);

      // if (key == 'WPRACTUALENDDATE' || key == 'WPRACTUALSTARTDATE' || key == 'WPRCONTRACTORISSUEDATE') {
      //   abstractControl.setErrors(null)
      // }

      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid && abstractControl.errors != null) {

          if (abstractControl.errors.hasOwnProperty('ngbDate')) {
            delete abstractControl.errors['ngbDate'];

            if (Object.keys(abstractControl.errors).length == 0) {
              abstractControl.setErrors(null)
            }

          }

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
      'WPRNAME': '',
      'WPREXTREF': '',
      'WPRDESC': '',
      'WPRSTATUS': '',
      'WPRACTINACT': '',
      'WPRPROGRAMMETYPE': '',
      'WPRBUDGET': '',
      'WPRTARGETCOMPLETIONDATE': '',
      'WPRCONTRACTORISSUEDATE': '',
      'WPRPLANSTARTDATE': '',
      'WPRPLANENDDATE': '',
      'WPRACTUALSTARTDATE': '',
      'WPRACTUALENDDATE': '',
    }
  }

  get f() { return this.workManagementForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.workManagementForm);

    this.chRef.detectChanges();

    if (this.workManagementForm.invalid) {
      return;
    }

    let formRawVal = this.workManagementForm.getRawValue();
    let managementModel: WorkordersAddManagementModel = formRawVal;
    managementModel.WPRTARGETCOMPLETIONDATE = this.dateFormate(formRawVal.WPRTARGETCOMPLETIONDATE);
    managementModel.WPRPLANSTARTDATE = this.dateFormate(formRawVal.WPRPLANSTARTDATE);
    managementModel.WPRPLANENDDATE = this.dateFormate(formRawVal.WPRPLANENDDATE);
    managementModel.WPRCONTRACTORISSUEDATE = this.dateFormate(formRawVal.WPRCONTRACTORISSUEDATE);
    managementModel.WPRACTUALSTARTDATE = this.dateFormate(formRawVal.WPRACTUALSTARTDATE);
    managementModel.WPRACTUALENDDATE = this.dateFormate(formRawVal.WPRACTUALENDDATE);
    managementModel.WPRCONTRACTORACCEPTANCEDATE = this.dateFormate(formRawVal.WPRCONTRACTORACCEPTANCEDATE)
    managementModel.WPRBUDGET = this.helperService.convertMoneyToFlatFormat(formRawVal.WPRBUDGET)


    let apiToAddUpdate: any;
    let message = '';
    if (this.formMode == 'new') {
      managementModel.MPgpA = this.dateFormate(this.minDate)
      managementModel.MPgqA = this.dateFormate(this.minDate)
      managementModel.MPgsA = this.dateFormate(this.minDate)
      managementModel.MPgtA = this.dateFormate(this.minDate)

      managementModel.MPgoA = this.currentUser.userId
      managementModel.MPgrA = this.currentUser.userId

      apiToAddUpdate = this.worksorderManagementService.addWorkOrderManagement(managementModel);
      message = `New Programme "${managementModel.WPRNAME}" added successfully.`;

      this.subscribeToSubmitForm(apiToAddUpdate, message);

    } else {
      managementModel.MPgpA = this.mData.mPgpA
      managementModel.MPgqA = this.mData.mPgqA

      managementModel.MPgsA = this.dateFormate(this.minDate)
      managementModel.MPgtA = this.dateFormate(this.minDate)

      managementModel.MPgoA = this.mData.mPgoA
      managementModel.MPgrA = this.currentUser.userId
      managementModel.WPRSEQUENCE = this.mData.wprsequence;

      if (this.currentStatus == "New" && managementModel.WPRSTATUS == "In Progress") {
        this.alertService.error("The Work Programme Status cannot be changed from 'New' to 'In Progress'");
        return
      }

      if (this.currentStatus == "Closed" && managementModel.WPRSTATUS == "New") {
        this.alertService.error("The Work Programme Status cannot be changed from 'Closed' to 'New'");
        return
      }

      if (this.currentStatus == "In Progress" && managementModel.WPRSTATUS == "New") {
        this.alertService.error("The Work Programme Status cannot be changed from 'In Progress' to 'New'");
        return
      }

      apiToAddUpdate = this.worksorderManagementService.updateWorksProgramme(managementModel);
      message = `Programme "${managementModel.WPRNAME}" updated successfully.`;

      if (new Date(managementModel.WPRTARGETCOMPLETIONDATE) < new Date()) {
        this.alertService.warning("Warning - Target Completion Date is in the past!", false);
        this.loaderService.pageShow();
        setTimeout(() => {
          this.subscribeToSubmitForm(apiToAddUpdate, message);
        }, 2000);
      } else {
        this.subscribeToSubmitForm(apiToAddUpdate, message);
      }

    }

    // console.log(managementModel);

  }

  subscribeToSubmitForm(apiToAddUpdate, message) {
    this.subs.add(
      apiToAddUpdate.subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(message);
            this.refreshManagementGrid.emit(true);
            this.closeNewManagementWindow()
          } else {
            this.alertService.error(data.message);
          }
          this.loaderService.pageHide();
          // console.log(data)
        }
      )
    )
  }



  closeNewManagementWindow() {
    this.openNewManagement = false;
    this.closeNewManagementEvent.emit(this.openNewManagement);
  }

  openCalendar(obj, checkField = null) {
    obj.toggle()
  }

  dateFormate(value) {
    if (value == undefined || typeof value == 'undefined' || typeof value == 'string') {
      return new Date('1753-01-01').toJSON()
    }
    const dateStr = `${value.year}-${this.helperService.zeorBeforeSingleDigit(value.month)}-${this.helperService.zeorBeforeSingleDigit(value.day)}`;
    return new Date(dateStr).toJSON()
  }

}
