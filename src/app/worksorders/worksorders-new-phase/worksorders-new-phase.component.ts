import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { WorkordersAddPhaseModel } from '../../_models';
import { ShouldGreaterThanYesterday, isNumberCheck, OrderDateValidator, IsGreaterDateValidator } from 'src/app/_helpers';

@Component({
  selector: 'app-worksorders-new-phase',
  templateUrl: './worksorders-new-phase.component.html',
  styleUrls: ['./worksorders-new-phase.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersNewPhaseComponent implements OnInit {
  @Input() newPhasewindow: boolean = false;
  @Input() phaseFormMode: string = 'new';
  @Input() selectedParentRow: any;
  @Input() worksOrderData: any;
  @Output() closeNewphaseEvent = new EventEmitter<boolean>();
  subs = new SubSink();
  nePhaseForm: FormGroup;
  submitted = false;
  formErrors: any;
  validationMessage = {
    'WOPNAME': {
      'required': 'Name is required.',
    },

    'WOPDESC': {
      'required': 'Desc is required.',
    },
    'WOPSTATUS': {
      'required': 'Status is required.',
    },
    'WOPACTINACT': {
      'required': 'Active is required.',
    },
    'WOPBUDGET': {
      'required': 'Budget is required.',
      'isNotNumber': 'Budget should be an integer value.',
      'maxlength': 'Budget must be maximum 9 digit.',
    },


    // 'WPRPROGRAMMETYPE': {
    //   'required': 'Programme Type is required.',
    // },

    'WOPTARGETCOMPLETIONDATE': {
      'required': 'Target Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Target Date cannot be in the past.'
    },
    'WOPCONTRACTORISSUEDATE': {
      'required': 'Issue Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Issue Date cannot be in the past.'
    },
    'WOPPLANSTARTDATE': {
      'required': 'Planned Start Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Planned Start Date cannot be in the past.'
    },
    'WOPPLANENDDATE': {
      'required': 'Planned End Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Planned End Date cannot be in the past.',
      'isLower': 'Planned End Date must be on or after the Planned Start Date.',
      'isGreaterDate': 'Planned End Date cannot be later than the Target Completion Date.'
    },
    // 'WPRACTUALSTARTDATE': {
    //   'required': 'Actual Start Date is required.',
    //   'invalidDate': 'Please insert date in dd/mm/yyyy format.',
    //   'pastDate': 'Actual Start Date cannot be in the past.'
    // },
    // 'WPRACTUALENDDATE': {
    //   'required': 'Actual End Date is required.',
    //   'invalidDate': 'Please insert date in dd/mm/yyyy format.',
    //   'pastDate': 'Actual End Date cannot be in the past.'
    // },
    // 'WPRFORECAST': {
    //   'required': 'Work Forecast is required.',
    // }



  };
  readonly = true;
  title = 'New Phase';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  minDate: any;
  disableFields = ['WOPCONTRACTORACCEPTANCEDATE', 'WOPCONTRACTORISSUEDATE', 'WOPACTUALSTARTDATE', 'WOPACTUALENDDATE']
  @Output() refreshWorkOrderDetails = new EventEmitter<boolean>();
  phaseData: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private helperService: HelperService,
    private alertService: AlertService,
    private worksorderService: WorksorderManagementService
  ) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnInit(): void {
    this.nePhaseForm = this.fb.group({
      WOPNAME: ['', [Validators.required]],
      WOPDESC: ['', [Validators.required]],
      WOPSTATUS: ['', [Validators.required]],
      WOPACTINACT: ['', [Validators.required]],
      WOPBUDGET: ['', [Validators.required, isNumberCheck(), Validators.maxLength(9)]],
      WOPFORECAST: [''],
      WOPCOMMITTED: [''],
      WOPAPPROVED: [''],
      WOPPENDING: [''],
      WOPACTUAL: [''],
      WOPFORECASTFEE: [''],
      WOPCOMMITTEDFEE: [''],
      WOPAPPROVEDFEE: [''],
      WOPPENDINGFEE: [''],
      WOPACTUALFEE: [''],

      WOPCONTRACTORISSUEDATE: [''],
      WOPTARGETCOMPLETIONDATE: ['', [Validators.required, ShouldGreaterThanYesterday()]],
      WOPCONTRACTORACCEPTANCEDATE: [''],
      WOPPLANSTARTDATE: ['', [ShouldGreaterThanYesterday()]],
      WOPPLANENDDATE: ['', [ShouldGreaterThanYesterday()]],
      WOPACTUALSTARTDATE: [''],
      WOPACTUALENDDATE: [''],

    }, {
      validator: [OrderDateValidator('WOPPLANENDDATE', 'WOPPLANSTARTDATE'), IsGreaterDateValidator('WOPPLANENDDATE', 'WOPTARGETCOMPLETIONDATE')],
    });

    this.populateForm()

    this.chRef.detectChanges();

    

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  populateForm() {
    if (this.phaseFormMode == 'new') {
      this.nePhaseForm.patchValue({ WOPSTATUS: 'New', WOPACTINACT: 'A' });
      this.nePhaseForm.get('WOPSTATUS').disable();
      this.nePhaseForm.get('WOPACTINACT').disable();
    } else {
      this.getPhase()
    }
  }

  getPhase() {
    this.subs.add(
      this.worksorderService.getPhase(this.selectedParentRow.wosequence, this.selectedParentRow.wopsequence).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            const phaseData = data.data;
            this.phaseData = data.data;
            this.nePhaseForm.patchValue({
              WOPNAME: phaseData.wopname,
              WOPDESC: phaseData.wopdesc,
              WOPSTATUS: phaseData.wopstatus,
              WOPACTINACT: phaseData.wopactinact,
              WOPBUDGET: phaseData.wopbudget,
              WOPFORECAST: phaseData.wopforecast,
              WOPCOMMITTED: phaseData.wopcommitted,
              WOPAPPROVED: phaseData.wopapproved,
              WOPPENDING: phaseData.woppending,
              WOPACTUAL: phaseData.wopactual,
              WOPFORECASTFEE: phaseData.wopforecastfee,
              WOPCOMMITTEDFEE: phaseData.wopcommittedfee,
              WOPAPPROVEDFEE: phaseData.wopapprovedfee,
              WOPPENDINGFEE: phaseData.woppendingfee,
              WOPACTUALFEE: phaseData.wopactualfee,

              WOPCONTRACTORISSUEDATE: this.helperService.ngbDatepickerFormat(phaseData.wopcontractorissuedate),
              WOPTARGETCOMPLETIONDATE: this.helperService.ngbDatepickerFormat(phaseData.woptargetcompletiondate),
              WOPCONTRACTORACCEPTANCEDATE: this.helperService.ngbDatepickerFormat(phaseData.wopcontractoracceptancedate),
              WOPPLANSTARTDATE: this.helperService.ngbDatepickerFormat(phaseData.wopplanstartdate),
              WOPPLANENDDATE: this.helperService.ngbDatepickerFormat(phaseData.wopplanenddate),
              WOPACTUALSTARTDATE: this.helperService.ngbDatepickerFormat(phaseData.wopactualstartdate),
              WOPACTUALENDDATE: this.helperService.ngbDatepickerFormat(phaseData.wopactualenddate),
            })
          }
          // debugger;
        }
      )
    )
  }

  closeNewphaseWindow() {
    this.newPhasewindow = false;
    this.closeNewphaseEvent.emit(this.newPhasewindow);
  }


  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);

      if (key == 'WOPACTUALENDDATE' || key == 'WOPACTUALSTARTDATE' || key == 'WOPCONTRACTORISSUEDATE' || key == 'WOPCONTRACTORACCEPTANCEDATE' || key == 'WOPPLANSTARTDATE' || key == 'WOPPLANENDDATE') {
        abstractControl.setErrors(null)
      }

      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid && abstractControl.errors != null) {

          if (abstractControl.errors.hasOwnProperty('ngbDate')) {
            delete abstractControl.errors['ngbDate'];
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
      'WOPNAME': '',
      'WOPDESC': '',
      'WOPSTATUS': '',
      'WOPACTINACT': '',
      'WOPTARGETCOMPLETIONDATE': '',
      'WOPBUDGET': '',
      'WOPPLANSTARTDATE': '',
      'WOPCONTRACTORISSUEDATE': '',
      'WOPPLANENDDATE': ''
    }

  }

  get f() { return this.nePhaseForm.controls; }


  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.nePhaseForm);

    if (this.nePhaseForm.invalid) {
      return;
    }

    if (!this.worksOrderData) {
      this.alertService.error("Work Order Phase is not selected.");
      return
    }

    let formRawVal = this.nePhaseForm.getRawValue();
    let phaseModel: WorkordersAddPhaseModel = formRawVal;

    phaseModel.WOPTARGETCOMPLETIONDATE = this.dateFormate(formRawVal.WOPTARGETCOMPLETIONDATE);
    phaseModel.WOPPLANSTARTDATE = this.dateFormate(formRawVal.WOPPLANSTARTDATE);
    phaseModel.WOPPLANENDDATE = this.dateFormate(formRawVal.WOPPLANENDDATE);

    phaseModel.WOPCONTRACTORISSUEDATE = this.dateFormate(formRawVal.WOPCONTRACTORISSUEDATE);
    phaseModel.WOPACTUALSTARTDATE = this.dateFormate(formRawVal.WOPACTUALSTARTDATE);
    phaseModel.WOPACTUALENDDATE = this.dateFormate(formRawVal.WOPACTUALENDDATE);

    phaseModel.WOPCONTRACTORACCEPTANCEDATE = this.dateFormate(formRawVal.WOPCONTRACTORACCEPTANCEDATE)

    phaseModel.MPgpA = this.dateFormate(formRawVal.MPgpA)
    phaseModel.MPgqA = this.dateFormate(formRawVal.MPgqA)
    phaseModel.MPgsA = this.dateFormate(formRawVal.MPgsA)
    phaseModel.MPgtA = this.dateFormate(formRawVal.MPgtA)
    phaseModel.MPgoA = this.currentUser.userId
    phaseModel.MPgrA = this.currentUser.userId

    // Common fields
    phaseModel.WOSEQUENCE = this.worksOrderData.wosequence;

    let apiToAddUpdate: any;
    let message = '';
    if (this.phaseFormMode == 'new') {
      phaseModel.WOPSEQUENCE = 0;
      phaseModel.WOPDISPSEQ = 0;
      phaseModel.WOPFINALACCOUNT = 0;
      phaseModel.WOPBUDGETASSET = 0;
      phaseModel.WOPINITIALCONTRACTSUM = 0;
      phaseModel.WOPCURRENTCONTRACTSUM = 0;
      phaseModel.WOPACCEPTEDVALUE = 0;

      apiToAddUpdate = this.worksorderService.addWorksOrderPhase(phaseModel);
      message = `New Works Order Phase "${phaseModel.WOPNAME}" added successfully.`;
    } else {
      phaseModel.WOPSEQUENCE = this.phaseData.wopsequence;
      phaseModel.WOPDISPSEQ = this.phaseData.wopdispseq;
      phaseModel.WOPFINALACCOUNT = this.phaseData.wopfinalaccount;
      phaseModel.WOPBUDGETASSET = this.phaseData.wopbudgetasset;
      phaseModel.WOPINITIALCONTRACTSUM = this.phaseData.wopinitialcontractsum;
      phaseModel.WOPCURRENTCONTRACTSUM = this.phaseData.wopcurrentcontractsum;
      phaseModel.WOPACCEPTEDVALUE = this.phaseData.wopacceptedvalue;

      apiToAddUpdate = this.worksorderService.updateWorksOrderPhase(phaseModel);
      message = `Works Order Phase "${phaseModel.WOPNAME}" updated successfully.`;
    }

    apiToAddUpdate.subscribe(
      data => {
        if (data.isSuccess) {
          this.alertService.success(message);
          this.refreshWorkOrderDetails.emit(true);
          this.closeNewphaseWindow()
        } else this.alertService.error(data.message);
      },
      err => this.alertService.error(err)
    )
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
