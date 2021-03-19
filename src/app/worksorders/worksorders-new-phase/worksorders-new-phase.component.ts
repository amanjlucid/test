import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { WorkordersAddPhaseModel } from '../../_models';

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
  @Input() worksOrderData:any;
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

    // 'WPRTARGETCOMPLETIONDATE': {
    //   'required': 'Target Date is required.',
    //   'invalidDate': 'Please insert date in dd/mm/yyyy format.',
    //   'pastDate': 'Target Date cannot be in the past.'
    // },
    // 'WPRCONTRACTORISSUEDATE': {
    //   'required': 'Issue Date is required.',
    //   'invalidDate': 'Please insert date in dd/mm/yyyy format.',
    //   'pastDate': 'Issue Date cannot be in the past.'
    // },
    // 'WPRPLANSTARTDATE': {
    //   'required': 'Planned Start Date is required.',
    //   'invalidDate': 'Please insert date in dd/mm/yyyy format.',
    //   'pastDate': 'Planned Start Date cannot be in the past.'
    // },
    // 'WPRPLANENDDATE': {
    //   'required': 'Planned End Date is required.',
    //   'invalidDate': 'Please insert date in dd/mm/yyyy format.',
    //   'pastDate': 'Planned End Date cannot be in the past.',
    //   'isLower': 'Planned End Date must be on or after the Planned Start Date.',
    //   'isGreaterDate': 'Planned End Date cannot be later than the Target Completion Date.'
    // },
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

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private helperService: HelperService,
    private alertService : AlertService,
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
      //WPREXTREF: ['', [Validators.required]],
      WOPDESC: ['', [Validators.required]],
      WOPSTATUS: ['', [Validators.required]],
      WOPACTINACT: ['', [Validators.required]],

      WOPBUDGET: ['', [Validators.required]],

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

      WOPTARGETCOMPLETIONDATE: [''],
      WOPCONTRACTORACCEPTANCEDATE: [''],
      WOPPLANSTARTDATE: [''],
      WOPPLANENDDATE: [''],
      WOPACTUALSTARTDATE: [''],
      WOPACTUALENDDATE: [''],

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
      // this.getWopmManagementData()
    }
  }

  closeNewphaseWindow() {
    this.newPhasewindow = false;
    this.closeNewphaseEvent.emit(this.newPhasewindow);
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
          }

          const messages = this.validationMessage[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              console.log(this.formErrors[key])
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
      'WOPBUDGET': ''

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

    if(!this.worksOrderData){
      this.alertService.error("Work Order is not selected.");
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
    phaseModel.WOPSEQUENCE = this.worksOrderData.wprsequence
    phaseModel.WOPDISPSEQ = 0
    phaseModel.WOPFINALACCOUNT = 0
    phaseModel.WOPBUDGETASSET = 0
    phaseModel.WOPINITIALCONTRACTSUM = 0
    phaseModel.WOPCURRENTCONTRACTSUM = 0
    phaseModel.WOPACCEPTEDVALUE = 0



    let apiToAddUpdate: any;
    let message = '';
    if (this.phaseFormMode == 'new') {
      // apiToAddUpdate = this.worksorderService.addWorkOrderManagement(managementModel);
      // message = `New Programme "${managementModel.WPRNAME}" added successfully.`;
    } else {
      // managementModel.WPRSEQUENCE = this.mData.wprsequence;
      // apiToAddUpdate = this.worksorderService.updateWorksProgramme(managementModel);
      // message = `Programme "${managementModel.WPRNAME}" updated successfully.`;
    }

    // console.log(managementModel);
    // apiToAddUpdate.subscribe(
    //   data => {
    //     if (data.isSuccess) {
    //       this.alertService.success(message);
    //       this.refreshManagementGrid.emit(true);
    //       this.closeNewManagementWindow()
    //     } else {
    //       this.alertService.error(data.message);
    //     }
    //     // console.log(data)
    //   }
    // )
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
