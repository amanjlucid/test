import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, HelperService, WorksOrdersService } from 'src/app/_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { shouldNotZero, SimpleDateValidator, firstDateIsLower } from 'src/app/_helpers';

@Component({
  selector: 'app-wo-program-management-create-payment-schedule',
  templateUrl: './wo-pm-create-payment-schedule.component.html',
  styleUrls: ['./wo-pm-create-payment-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoProgramManagmentCreatePaymentScheduleComponent implements OnInit {
  @Input() openWOCreatePaymentScheduleWindow: boolean = false;
  @Output() closeCreatePaymentScheduleWindowEvent = new EventEmitter<boolean>();
  @Input() worksOrderData: any;
  createScheduleForm: FormGroup;
  subs = new SubSink();
  title = 'Create Schedule';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  loading = true;
  readonlyRetentionPct: boolean = false;
  readonlyRetentionValue: boolean = true;
  submitted: boolean = false;
  minDate: any;
  formErrors: any;

  validationMessage = {
    'pStartDate': {
      'required': 'Period Start Date is required.',
      'pastDate': 'Period Start Date cannot be in the past.',
      'invalidDate': 'Period Start Date in dd/mm/yyyy format.',
    },
    'pEndDate': {
      'required': 'Period End Date is required.',
      'isLower': 'Period End Date must be on or after the Period Start Date.',
      'invalidDate': 'Period End Date in dd/mm/yyyy format.',
      'pastDate': 'Period End Date cannot be in the past.'
    },
    'pFrequency': {
      'required': 'Payment Frequency is required.',
    },
    'pType': {
      'required': 'Payment Type is required.',
    },
    'specificDays': {
      'required': 'Payment Days is required.',
      'shouldNotZero': 'Payment Days cannot be 0 and blank'
    },
    'retentionPct': {
      'required': 'Retention % is required.',
      'maxlength': 'Retention % must be maximum 3 digit.',
      'shouldNotZero': 'Retention % cannot be 0 and blank'
    },
    'retentionValue': {
      'required': 'Retention Value is required.',
      'shouldNotZero': 'Retention Value cannot be 0 and blank'
    },
    'stagePayment': {
      'required': 'Stage Payment is required.',
    }

  };

  constructor(
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private helperService: HelperService,

  ) { }

  ngOnInit(): void {
    console.log(this.worksOrderData);
    if (this.worksOrderData.wocontracttype == "STAGE") {
      this.createScheduleForm = this.fb.group({
        pStartDate: ['', [SimpleDateValidator()]],
        pEndDate: ['', [SimpleDateValidator()]],
        pFrequency: ['', [Validators.required]],
        pType: ['', [Validators.required]],
        specificDays: [0],
        stagePayment: ['', Validators.required]
      },
        {
          validator: [
            firstDateIsLower('pEndDate', 'pStartDate')
          ],
        });
    } else {
      this.createScheduleForm = this.fb.group({
        worksOrder: [''],
        pStartDate: ['', [SimpleDateValidator()]],
        pEndDate: ['', [SimpleDateValidator()]],
        pFrequency: ['', [Validators.required]],
        pType: ['', [Validators.required]],
        specificDays: [0],
        retentionType: [''],
        retentionPct: ['', [Validators.required, Validators.maxLength(3), shouldNotZero()]],
        retentionValue: ['']
      },
        {
          validator: [
            firstDateIsLower('pEndDate', 'pStartDate')
          ],
        });
    }

    this.patchFormValue();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  patchFormValue() {
    const { mPgsA, wotargetcompletiondate } = this.worksOrderData;
    this.createScheduleForm.patchValue({
      pStartDate: this.helperService.ngbDatepickerFormat(mPgsA),
      pEndDate: this.helperService.ngbDatepickerFormat(wotargetcompletiondate)
    });

    this.chRef.detectChanges();
  }


  formErrorObject() {
    this.formErrors = {
      'pStartDate': '',
      'pEndDate': '',
      'pFrequency': '',
      'pType': '',
      'specificDays': '',
      'retentionPct': '',
      'retentionValue': '',
      'stagePayment': ''
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

  changePaymentType(e) {
    let selectedValue = this.createScheduleForm.get('pType').value;
    if (selectedValue == "Days") {
      this.createScheduleForm.controls['specificDays'].setValidators([Validators.required, shouldNotZero()]);
    } else {
      this.createScheduleForm.controls["specificDays"].setErrors(null);
      this.createScheduleForm.controls["specificDays"].clearValidators();
    }
    this.createScheduleForm.controls['specificDays'].updateValueAndValidity();
  }


  changeRetentionType(value) {
    this.createScheduleForm.patchValue({ retentionPct: 0, retentionValue: 0 });
    if (value !== 1) {
      this.readonlyRetentionPct = true;
      this.readonlyRetentionValue = false;
      this.createScheduleForm.controls['retentionValue'].setValidators([Validators.required, shouldNotZero()]);
      this.createScheduleForm.controls["retentionPct"].setErrors(null);
      this.createScheduleForm.controls["retentionPct"].clearValidators();
    } else {
      this.readonlyRetentionPct = false;
      this.readonlyRetentionValue = true;
      this.createScheduleForm.controls['retentionPct'].setValidators([Validators.required, Validators.maxLength(3), shouldNotZero()]);
      this.createScheduleForm.controls["retentionValue"].setErrors(null);
      this.createScheduleForm.controls["retentionValue"].clearValidators();
    }
    this.createScheduleForm.controls['retentionPct'].updateValueAndValidity();
    this.createScheduleForm.controls['retentionValue'].updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.createScheduleForm);

    if (this.createScheduleForm.invalid) {
      return;
    }

    let formRawVal = this.createScheduleForm.getRawValue();
    const { wosequence, wprsequence } = this.worksOrderData;
    const { pStartDate, pEndDate, pFrequency, pType, specificDays = 0, stagePayment = 0, retentionPct = 0, retentionValue = 0 } = formRawVal;

    const params = {
      "WOSEQUENCE": wosequence,
      "WPRSEQUENCE": wprsequence,
      "dtStartDate": this.helperService.dateObjToString(pStartDate),
      "dtEndDate": this.helperService.dateObjToString(pEndDate),
      "strPaymentFrequency": pFrequency,
      "strPaymentType": pType,
      "intPaymentDays": parseInt(specificDays),
      "WPSRETENTIONPCT": parseInt(retentionPct),
      //"WPSRETENTIONVALUE": parseInt(this.helperService.convertMoneyToFlatFormat(retentionValue)),
      "WPSRETENTIONVALUE": parseInt(isNaN(parseInt(retentionValue)) ? retentionValue.replace("£", "").replace(",", "").replace(",", "") : retentionValue),
      "strUser": this.currentUser.userId,
      "WPSFIXEDPAYMENTVALUE": stagePayment
    }

    // const params = {
    //   "WOSEQUENCE": this.worksOrderData.wosequence,
    //   "WPRSEQUENCE": this.worksOrderData.wprsequence,
    //   "dtStartDate": this.dateFormate(this.createScheduleForm.get('pStartDate').value),
    //   "dtEndDate": this.dateFormate(this.createScheduleForm.get('pEndDate').value),
    //   "strPaymentFrequency": this.createScheduleForm.get('pFrequency').value,
    //   "strPaymentType": this.createScheduleForm.get('pType').value,
    //   "intPaymentDays": parseInt(this.createScheduleForm.get('specificDays').value),
    //   "strUser": this.currentUser.userId,
    //   "WPSRETENTIONPCT": parseInt(this.createScheduleForm.get('retentionPct').value),
    //   "WPSRETENTIONVALUE": parseInt(isNaN(parseInt(this.createScheduleForm.get('retentionValue').value)) ? this.createScheduleForm.get('retentionValue').value.replace("£", "").replace(",", "").replace(",", "") : this.createScheduleForm.get('retentionValue').value),
    //   "WPSFIXEDPAYMENTVALUE": stagePayment
    // };

    this.subs.add(
      this.worksOrdersService.createWebWorksOrdersPaymentSchedule(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.closeCreatePaymentScheduleWin();
            this.alertService.success("New Payment Schedule Successfully Created.");
          } else this.alertService.error(data.message);
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )

  }


  openCalendar(obj) {
    obj.toggle()
  }

  dateFormate(value) {
    if (value == undefined || typeof value == 'undefined' || typeof value == 'string') {
      return new Date('1753-01-01').toJSON()
    }
    const dateStr = `${value.year}-${this.helperService.zeorBeforeSingleDigit(value.month)}-${this.helperService.zeorBeforeSingleDigit(value.day)}`;
    return new Date(dateStr).toJSON()
  }


  closeCreatePaymentScheduleWin() {
    this.openWOCreatePaymentScheduleWindow = false;
    this.closeCreatePaymentScheduleWindowEvent.emit(false);
  }

}
