import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, HelperService, WorksOrdersService, WorksorderManagementService } from 'src/app/_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { shouldNotZero, SimpleDateValidator } from 'src/app/_helpers';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-wo-program-management-add-payment-schedule',
  templateUrl: './wo-pm-add-payment-schedule.component.html',
  styleUrls: ['./wo-pm-add-payment-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class WoProgramManagmentAddPaymentScheduleComponent implements OnInit {
  @Output() closeAddPaymentScheduleWindowEvent = new EventEmitter<boolean>();
  @Input() openWOAddPaymentScheduleWindow: boolean = false;
  @Input() worksOrderData: any;
  @Input() paymentScheduleExist: boolean;
  addScheduleForm: FormGroup;
  subs = new SubSink();
  title = 'Add Payment Schedule';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  loading = true;
  workProgrammesData: any;
  nextScheduleDate;
  submitted: boolean = false;
  minDate: any;
  formErrors: any;
  validationMessage = {
    'pStartDate': {
      'required': 'Period Start Date is required.',
      'invalidDate': 'Period Start Date in dd/mm/yyyy format.',
    },
    'pEndDate': {
      'required': 'Period End Date is required.',
      'invalidDate': 'Period End Date in dd/mm/yyyy format.',
    },
    'paymentDate': {
      'required': 'Payment Date is required.',
    },
    'retentionPct': {
      'required': 'Retention % is required.',
      'maxlength': 'Retention % must be maximum 3 digit.',
      'shouldNotZero': 'Retention % cannot be 0 and blank'
    },
    'retentionValue': {
      'required': 'Retention Value is required.',
      'shouldNotZero': 'Retention Value cannot be 0 and blank'
    }

  };

  constructor(
    private worksOrdersService: WorksOrdersService,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private helperService: HelperService,

  ) {
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    // console.log(this.worksOrderData);
    // console.log(this.paymentScheduleExist);

    this.addScheduleForm = this.fb.group({
      pStartDate: ['', [Validators.required, SimpleDateValidator()]],
      pEndDate: ['', [Validators.required, SimpleDateValidator()]],
      paymentDate: ['', [Validators.required, SimpleDateValidator()]],
      retentionType: [''],
      retentionPct: ['', [Validators.required, Validators.maxLength(3), shouldNotZero()]],
      retentionValue: ['']
    });

    const retentionValueCtr = this.addScheduleForm.get('retentionValue');
    const retentionPctCtr = this.addScheduleForm.get('retentionPct');
    const retentionTypeCtr = this.addScheduleForm.get('retentionType');

    this.subs.add(
      retentionTypeCtr.valueChanges.subscribe(
        val => {
          retentionValueCtr.setErrors(null);
          retentionPctCtr.setErrors(null);
          retentionValueCtr.clearValidators();
          retentionPctCtr.clearValidators();

          if (val == "P") {
            this.addScheduleForm.patchValue({ retentionValue: '' });
            retentionPctCtr.enable();
            retentionValueCtr.disable();
            retentionPctCtr.setValidators([Validators.required, shouldNotZero()]);
          } else if (val == "V") {
            this.addScheduleForm.patchValue({ retentionPct: '' });
            retentionPctCtr.disable();
            retentionValueCtr.enable();
            retentionValueCtr.setValidators([Validators.required, Validators.maxLength(3), shouldNotZero()]);
          }

          retentionValueCtr.updateValueAndValidity();
          retentionPctCtr.updateValueAndValidity();
        }
      )
    )

    this.requiredPageData();

  }


  requiredPageData() {
    const { wprsequence, wosequence } = this.worksOrderData;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getWorkProgrammesByWprsequence(wprsequence),
        this.workOrderProgrammeService.GetPaymentScheduleDate(wosequence, wprsequence),
      ]).subscribe(
        data => {
          const programmeData: any = data[0];
          const nextScheduleDate = data[1]
          if (programmeData.isSuccess) this.workProgrammesData = programmeData.data[0];
          if (nextScheduleDate.isSuccess && this.paymentScheduleExist) {
            this.nextScheduleDate = nextScheduleDate.data;
          }
          this.patchFormValue();
        }
      )
    )

  }


  patchFormValue() {
    this.nextScheduleDate = (this.paymentScheduleExist) ? this.nextScheduleDate : this.helperService.getDateString();
    this.addScheduleForm.patchValue({
      pStartDate: this.helperService.ngbDatepickerFormat(this.nextScheduleDate),
      pEndDate: this.helperService.ngbDatepickerFormat(this.nextScheduleDate),
      retentionType: 'P',
    });

    this.minDate = this.helperService.ngbDatepickerFormat(this.nextScheduleDate);
    this.addScheduleForm.get('pStartDate').disable();
    this.chRef.detectChanges();
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

  formErrorObject() {
    this.formErrors = {
      'pStartDate': '',
      'pEndDate': '',
      'paymentDate': '',
      'retentionPct': '',
      'retentionValue': ''
    }
  }


  onSubmit(): void {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.addScheduleForm);

    if (this.addScheduleForm.invalid) {
      return;
    }


    let formRawVal = this.addScheduleForm.getRawValue();
    const { wosequence, wprsequence } = this.worksOrderData;
    const { paymentDate, pStartDate, pEndDate, retentionPct, retentionValue } = formRawVal;

    if (new Date(this.helperService.dateObjToString(pEndDate)) < new Date(this.helperService.dateObjToString(pStartDate))) {
      this.alertService.error('Payment End date cannot be lower then the Payment start date.')
      return
    }
  
    // const params = {
    //   "WOSEQUENCE": wosequence,
    //   "WPRSEQUENCE": wprsequence,
    //   "WPSPAYMENTDATE": this.helperService.dateObjToString(paymentDate),
    //   "WPSSTARTDATE": this.helperService.dateObjToString(pStartDate),
    //   "WPSENDDATE": pEndDate,
    //   "WPSRETENTIONPCT": parseInt(retentionPct),
    //   "WPSRETENTIONVALUE": parseInt(this.helperService.convertMoneyToFlatFormat(retentionValue)),
    //   'WPSFIXEDPAYMENTVALUE': 0,
    //   "strUser": this.currentUser.userId,

    // }

    const params = {
      "WPRSEQUENCE": this.worksOrderData.wprsequence,
      "WOSEQUENCE": this.worksOrderData.wosequence,
      "WPSPAYMENTDATE": this.dateFormate(this.addScheduleForm.get('paymentDate').value),
      "WPSSTARTDATE": this.dateFormate(this.addScheduleForm.get('pStartDate').value),
      "WPSENDDATE": this.dateFormate(this.addScheduleForm.get('pEndDate').value),
      "strUser": this.currentUser.userId,
      "WPSRETENTIONPCT": parseInt(this.addScheduleForm.get('retentionPct').value),
      "WPSRETENTIONVALUE": parseInt(isNaN(parseInt(this.addScheduleForm.get('retentionValue').value)) ? this.addScheduleForm.get('retentionValue').value.replace("£", "").replace(",", "").replace(",", "") : this.addScheduleForm.get('retentionValue').value),
      // "WPSRETENTIONVALUE":this.addScheduleForm.get('retentionValue').value,
      "WPSFIXEDPAYMENTVALUE": 0
    };

    this.subs.add(
      this.worksOrdersService.insertWebWorksOrdersPaymentSchedule(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.closeAddPaymentScheduleWin();
            this.alertService.success("New Payment Schedule Successfully Added.");
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


  closeAddPaymentScheduleWin() {
    this.openWOAddPaymentScheduleWindow = false;
    this.closeAddPaymentScheduleWindowEvent.emit(false);
  }


}
