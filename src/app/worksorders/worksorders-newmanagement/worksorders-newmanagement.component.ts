import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorksorderManagementService } from '../../_services'
import { ShouldGreaterThanYesterday, isNumberCheck } from 'src/app/_helpers';

@Component({
  selector: 'app-worksorders-newmanagement',
  templateUrl: './worksorders-newmanagement.component.html',
  styleUrls: ['./worksorders-newmanagement.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersNewmanagementComponent implements OnInit {
  @Output() closeNewManagementEvent = new EventEmitter<boolean>();
  @Input() openNewManagement: boolean = false;
  @Input() formMode: string = 'new';
  minDate: any;
  subs = new SubSink(); // to unsubscribe services
  workManagementForm: FormGroup;
  submitted = false;
  formErrors: any;
  validationMessage = {
    'name': {
      'required': 'Name is required.',
    },
    'extRef': {
      'required': 'Ext Ref is required.',
    },
    'desc': {
      'required': 'Desc is required.',
    },
    'status': {
      'required': 'Status is required.',
    },
    'active': {
      'required': 'Active is required.',
    },
    'programmeType': {
      'required': 'Programme type is required.',
    },
    'budget': {
      'required': 'Budget is required.',
      'isNotNumber': 'Budget should be an integer value.'
    },
    'targetDate': {
      'required': 'Target date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Target date cannot be in the past.'
    },
    'issuedDate': {
      'required': 'Issue date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Issue date cannot be in the past.'
    },
    'plannedStartDate': {
      'required': 'Planned start date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Planned start date cannot be in the past.'
    },
    'plannedEndDate': {
      'required': 'Planned end date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Planned end date cannot be in the past.'
    },
    'actualStartDate': {
      'required': 'Actual start date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Actual start date cannot be in the past.'
    },
    'actualEndDate': {
      'required': 'Actual end date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Actual end date cannot be in the past.'
    },
    'workForecast': {
      'required': 'Work Forecast is required.',
    }



  };




  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private worksorderManagementService: WorksorderManagementService
  ) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnInit(): void {
    this.workManagementForm = this.fb.group({
      name: ['', [Validators.required]],
      extRef: ['', [Validators.required]],
      desc: ['', [Validators.required]],
      status: [''],
      active: [''],
      programmeType: ['', [Validators.required]],
      budget: ['', [Validators.required, isNumberCheck()]],
      targetDate: ['', [Validators.required, ShouldGreaterThanYesterday()]],
      plannedStartDate: ['', [Validators.required, ShouldGreaterThanYesterday()]],
      plannedEndDate: ['', [Validators.required, ShouldGreaterThanYesterday()]],
      actualStartDate: [''],
      actualEndDate: [''],
      issuedDate: [''],

      workForecast: [''],
      workCommited: [''],
      workApproved: [''],
      workPending: [''],
      workActual: [''],

      workFeesForecast: [''],
      workFeesCommited: [''],
      workFeesApproved: [''],
      workFeesPending: [''],
      workFeesActual: [''],

      contractFeesForecast: [''],
      contractFeesCommited: [''],
      contractFeesApproved: [''],
      contractFeesPending: [''],
      contractFeesActual: [''],


    });

    this.populateForm()

    this.chRef.detectChanges();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  populateForm() {
    if (this.formMode == 'new') {
      this.workManagementForm.patchValue({ status: 'N', active: 'A' });
      this.workManagementForm.get('status').disable();
      this.workManagementForm.get('active').disable();
    } else {

    }
  }


  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
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
      'name': '',
      'extRef': '',
      'desc': '',
      'status': '',
      'active': '',
      'programmeType': '',
      'budget': '',
      'targetDate': '',
      'issuedDate': '',
      'plannedStartDate': '',
      'plannedEndDate': '',
      'actualStartDate': '',
      'actualEndDate': '',
    }
  }

  get f() { return this.workManagementForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.workManagementForm);
    if (this.workManagementForm.invalid) {
      return;
    }
    let formRawVal = this.workManagementForm.getRawValue();
  }

  closeNewManagementWindow() {
    this.openNewManagement = false;
    this.closeNewManagementEvent.emit(this.openNewManagement);
  }

  openCalendar(obj, checkField = null) {
    obj.toggle()
  }
}
