import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator, OrderDateValidator, SimpleDateValidator } from 'src/app/_helpers';
import { SubSink } from 'subsink';
import { AsbestosService, SharedService, AlertService } from 'src/app/_services';


@Component({
  selector: 'app-work-status',
  templateUrl: './work-status.component.html',
  styleUrls: ['./work-status.component.css']
})
export class WorkStatusComponent implements OnInit {
  @Input() openWorkStatus: boolean = false;
  @Output() closeWorkStatus = new EventEmitter();
  workStatusForm: FormGroup;
  submitted: boolean = false;
  validationMessage = {
    'workStatus': {
      'required': 'Work Status is required.',
      'invalidFormValue': 'If Work Status is None then all fields below must be blank'
    },
    'woc': {
      'required': 'Work Order Code is required.',
    },
    'wob': {
      'required': 'Work Ordered By is required.',
    },
    'workContractor': {
      'required': 'Work Contractor is required.',
    },
    'workOrdered': {
      'required': 'Work Ordered is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'futureDate': 'Work Ordered cannot be in the future.'
    },
    'workDue': {
      'required': 'Work Due is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'isLower': 'Work Due Date must be on or after the Work Ordered Date.',
      'futureDate': 'Work Due Date cannot be in the future.'
    },
    'workCompleted': {
      'required': 'Work Completed is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'isLower': 'The Work Complete Date must be on or after the Work Ordered Date.',
    },
    'comments': {
      'required': 'Comments is required.',
    }

  };
  formErrors: any;
  subs = new SubSink(); // to unsubscribe services
  readonly = false;
  completeDateReadOnly: boolean = true;
  selectedAsset: any;
  initialWorkStatusData: any;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private asbestosService: AsbestosService,
    private shareDataService: SharedService,
    private alertService: AlertService
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.shareDataService.sharedAsset.subscribe(data => this.selectedAsset = data)

    this.workStatusForm = this.fb.group({
      workStatus: ['Pending', [Validators.required]],
      woc: ['', [Validators.required]],
      wob: ['', [Validators.required]],
      workContractor: ['', [Validators.required]],
      workOrdered: ['', [Validators.required, DateValidator()]],
      workDue: ['', [Validators.required, SimpleDateValidator()]],
      workCompleted: ['', []],
      comments: ['', []],
    },
      {
        validator: [OrderDateValidator('workDue', 'workOrdered'), OrderDateValidator('workCompleted', 'workOrdered')],
      })

    this.getAssetsAsbestosWorkStatus();
    this.validationOnValueChange();

  }

  validationOnValueChange() {
    const workOrderedControl = this.workStatusForm.get('workOrdered');
    const workCompletedControl = this.workStatusForm.get('workCompleted');
    const workContractorControl = this.workStatusForm.get('workContractor');
    const wobControl = this.workStatusForm.get('wob');
    const commentsControl = this.workStatusForm.get('comments');

    this.subs.add(
      this.workStatusForm.get('workStatus').valueChanges.subscribe(
        val => {
          if (val == 'None') {
            this.workStatusForm.patchValue({
              woc: '',
              wob: '',
              workContractor: '',
              workOrdered: '',
              workDue: '',
              workCompleted: '',
              comments: '',
            })
            this.readonly = true;
            // if (this.formErrors != undefined) {
            //   this.formErrors = undefined;
            // }
          } else {
            this.readonly = false;
            //this.workStatusForm.patchValue({ workOrdered: this.todayDate() });
            if (wobControl.pristine && wobControl.value == '') {
              this.workStatusForm.patchValue({ wob: this.initialWorkStatusData != undefined ? this.initialWorkStatusData.aawsorderedby : '' });
            } else if (wobControl.pristine == false && wobControl.value == '') {
              this.workStatusForm.patchValue({ wob: this.initialWorkStatusData != undefined ? this.initialWorkStatusData.aawsorderedby : '' });
            }
            if (workContractorControl.pristine && workContractorControl.value == '') {
              this.workStatusForm.patchValue({ workContractor: this.initialWorkStatusData != undefined ? this.initialWorkStatusData.aawsordercontractor : '' });
            } else if (workContractorControl.pristine == false && workContractorControl.value == '') {
              this.workStatusForm.patchValue({ workContractor: this.initialWorkStatusData != undefined ? this.initialWorkStatusData.aawsordercontractor : '' });
            }
            if (workOrderedControl.pristine && workOrderedControl.value == '') {
              this.workStatusForm.patchValue({ workOrdered: this.todayDate() });
            } else if (workOrderedControl.pristine == false && workOrderedControl.value == '') {
              this.workStatusForm.patchValue({ workOrdered: this.todayDate() });
            }
            if (commentsControl.pristine && commentsControl.value == '') {
              this.workStatusForm.patchValue({ comments: this.initialWorkStatusData != undefined ? this.initialWorkStatusData.aawscomment : '' });
            } else if (commentsControl.pristine == false && commentsControl.value == '') {
              this.workStatusForm.patchValue({ comments: this.initialWorkStatusData != undefined ? this.initialWorkStatusData.aawscomment : '' });
            }

            if (val == "Complete") {
              this.completeDateReadOnly = false;
              workCompletedControl.setValidators([Validators.required]);
            } else {
              workCompletedControl.setErrors(null);
              workCompletedControl.clearValidators();
              if (this.formErrors != undefined) {
                this.formErrors.workCompleted = '';
              }
              this.completeDateReadOnly = true;
              this.workStatusForm.patchValue({ workCompleted: '' })
            }
            workCompletedControl.updateValueAndValidity();
          }
        }
      )
    )
  }

  closeWorkStatusWin() {
    this.openWorkStatus = false;
    this.closeWorkStatus.emit(this.openWorkStatus);
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.workStatusForm);

    if (this.workStatusForm.invalid) {
      return;
    }

    let workdetails = {
      assid: encodeURIComponent(this.selectedAsset.assetId),
      aawsworkstatus: this.workStatusForm.value.workStatus,
      aawsworkorderdate: this.dateFormate(this.workStatusForm.value.workOrdered),
      aawsworkduedate: this.dateFormate(this.workStatusForm.value.workDue),
      aawsworkcompdate: this.workStatusForm.value.workCompleted != '' ? this.dateFormate(this.workStatusForm.value.workCompleted) : '',
      aawsorderedby: this.workStatusForm.value.wob,
      aawsordercontractor: this.workStatusForm.value.workContractor,
      aawsordercode: this.workStatusForm.value.woc,
      aawscomment: this.workStatusForm.value.comments,
      UserId: this.currentUser.userId
    };

    this.subs.add(
      this.asbestosService.updateAssetsAsbestosWorkStatus(workdetails).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.alertService.success('Work status updated successfully.');
            this.closeWorkStatusWin();
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

  }

  dateFormate(value) {
    return `${value.month}-${value.day}-${value.year}`
  }

  get f() { return this.workStatusForm.controls; }

  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid) {
          if (abstractControl.errors.hasOwnProperty('ngbDate')) {
            delete abstractControl.errors['ngbDate'];
          }
          if (key == 'workCompleted' && this.completeDateReadOnly) {
            abstractControl.setErrors(null);
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
      'workStatus': '',
      'woc': '',
      'wob': '',
      'workContractor': '',
      'workOrdered': '',
      'workDue': '',
      'workCompleted': '',
      'comments': '',
    }
  }

  populateWorkStatusForm(initialWorkStatusData) {
    return this.workStatusForm.patchValue({
      workStatus: initialWorkStatusData != undefined ? initialWorkStatusData.aawsworkstatus : 'Pending',
      woc: initialWorkStatusData != undefined ? initialWorkStatusData.aawsordercode : '',
      wob: initialWorkStatusData != undefined ? initialWorkStatusData.aawsorderedby : '',
      workContractor: initialWorkStatusData != undefined ? initialWorkStatusData.aawsordercontractor : '',
      workOrdered: initialWorkStatusData != undefined ? this.todayDate(initialWorkStatusData.aawsworkorderdate) : this.todayDate(),
      workDue: initialWorkStatusData != undefined ? this.todayDate(initialWorkStatusData.aawsworkduedate) : this.todayDate(),
      workCompleted: initialWorkStatusData != undefined ? this.getDate(initialWorkStatusData.aawsworkcompdate) : '',
      comments: initialWorkStatusData != undefined ? initialWorkStatusData.aawscomment : '',

    })
  }

  resetForm() {
    this.submitted = false;
    this.workStatusForm.patchValue({ workStatus: 'None' });
  }

  todayDate(givenDate = null) {
    const date = givenDate == null ? new Date() : new Date(givenDate);
    return {
      "day": date.getDate(),
      "year": date.getFullYear(),
      "month": date.getMonth() + 1
    }
  }

  getDate(givenDate = null) {
    if(givenDate == null || givenDate == ''){
      return '';
    }
    const date = new Date(givenDate);
    return {
      "day": date.getDate(),
      "year": date.getFullYear(),
      "month": date.getMonth() + 1
    }
  }

  openCalendar(obj, checkField = null) {
    if (!this.readonly && checkField == null) {
      obj.toggle()
    } else {
      if (!this.readonly && !this.completeDateReadOnly) {
        obj.toggle()
      }
    }
  }

  getAssetsAsbestosWorkStatus() {
    this.subs.add(
      this.asbestosService.getAssetsAsbestosWorkStatus(this.selectedAsset.assetId).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.initialWorkStatusData = data.data[0];
          }
          this.populateWorkStatusForm(this.initialWorkStatusData);
        }
      )

    )
  }



}
