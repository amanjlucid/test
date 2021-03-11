import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorksorderManagementService } from '../../_services'

@Component({
  selector: 'app-worksorders-newmanagement',
  templateUrl: './worksorders-newmanagement.component.html',
  styleUrls: ['./worksorders-newmanagement.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersNewmanagementComponent implements OnInit {
  @Output() closeNewManagementEvent = new EventEmitter<boolean>();
  @Input() openNewManagement: boolean = false;
  minDate: any;
  subs = new SubSink(); // to unsubscribe services
  workManagementForm: FormGroup;
  submitted = false;
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
    'targetDate': {
      'required': 'Target date is required.',
    },
    'plannedStartDate': {
      'required': 'Planned start date is required.',
    },
    'plannedEndDate': {
      'required': 'Planned end date is required.',
    },



  };

  formErrors: any;


  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private worksorderManagementService : WorksorderManagementService
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
      status: ['', [Validators.required]],
      active: ['', [Validators.required]],
      programmeType: ['', [Validators.required]],
      targetDate: ['', [Validators.required]],
      plannedStartDate: ['', [Validators.required]],
      plannedEndDate: ['', [Validators.required]],
    });




    this.chRef.detectChanges();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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
      'name': '',
      'extRef': '',
      // 'extRef': '',
      // 'extRef': '',
      // 'extRef': '',
      // 'extRef': '',
      // 'extRef': '',
      // 'extRef': '',
      // 'extRef': '',
      // 'extRef': '',
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
