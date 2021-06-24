import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, ReportingGroupService, HelperService, LoaderService, ConfirmationDialogService, WorksOrdersService, WorksorderManagementService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ShouldGreaterThanYesterday, isNumberCheck, OrderDateValidator, IsGreaterDateValidator, shouldNotZero, SimpleDateValidator, firstDateIsLower } from 'src/app/_helpers';

@Component({
  selector: 'app-wo-program-management-add-payment-schedule',
  templateUrl: './wo-pm-add-payment-schedule.component.html',
  styleUrls: ['./wo-pm-add-payment-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoProgramManagmentAddPaymentScheduleComponent implements OnInit {
  @Input() openWOAddPaymentScheduleWindow: boolean = false;
  @Output() closeAddPaymentScheduleWindowEvent = new EventEmitter<boolean>();
  @Input() worksOrderData : any;

  addScheduleForm : FormGroup;

  subs = new SubSink();
  title = 'Add Payment Schedule';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  loading = true;
  workProgrammesData : any;

  public readonlyRetentionPct:boolean = false;
  public readonlyRetentionValue:boolean = true;

  submitted : boolean = false;
  minDate: any;
  formErrors: any;
  periodStartDate = "2025-03-31T00:00:00";


  validationMessage = {
    'pStartDate': {
      'required': 'Period Start Date is required.',
    },
    'pEndDate': {
      'required': 'Period End Date is required.',
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
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
  ) { 
    
    const current = new Date(this.periodStartDate);
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnInit(): void {
    $(".wopmaddpaymentoverlay").addClass("ovrlay");
    this.addScheduleForm = this.fb.group({
      programme: [''],
      worksOrder: [''],
      pStartDate: ['', [Validators.required]],
      pEndDate: ['', [Validators.required]],
      paymentDate: ['', [Validators.required]],
      retentionType: [''],
      retentionPct: ['', [Validators.required, Validators.maxLength(3), shouldNotZero()]],
      retentionValue: ['']
    });
    this.subs.add(
      this.workOrderProgrammeService.getWorkProgrammesByWprsequence(this.worksOrderData.wprsequence).subscribe(
        data => {
          if (data.isSuccess) {
            this.workProgrammesData = [...data.data][0];
            this.setDefaultValue();
          } else {
            this.alertService.error(data.message);
          }
          this.chRef.detectChanges();
        },
        err => this.alertService.error(err)
      )
    )
  }

  setDefaultValue(){
    this.addScheduleForm.patchValue({programme: this.workProgrammesData.wprname, worksOrder:this.worksOrderData.woname,retentionPct:0, retentionValue:0, pStartDate: this.helperService.ngbDatepickerFormat(this.periodStartDate) });
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
      'retentionValue':''
    }
  }

  changeRetentionType(value){
    this.addScheduleForm.patchValue({retentionPct:0, retentionValue:0});
    if(value!==1){
      this.readonlyRetentionPct = true;
      this.readonlyRetentionValue = false;
      this.addScheduleForm.controls['retentionValue'].setValidators([Validators.required, shouldNotZero()]);
      this.addScheduleForm.controls["retentionPct"].setErrors(null);
      this.addScheduleForm.controls["retentionPct"].clearValidators();
    }else{
      this.readonlyRetentionPct = false;
      this.readonlyRetentionValue = true;
      this.addScheduleForm.controls['retentionPct'].setValidators([Validators.required, Validators.maxLength(3), shouldNotZero()]);      
      this.addScheduleForm.controls["retentionValue"].setErrors(null);
      this.addScheduleForm.controls["retentionValue"].clearValidators();
    }
    this.addScheduleForm.controls['retentionPct'].updateValueAndValidity();
    this.addScheduleForm.controls['retentionValue'].updateValueAndValidity();
  }

  onSubmit():void{
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.addScheduleForm);

    if (this.addScheduleForm.invalid) {
      return;
    }
    
    const params = {
      "WPRSEQUENCE":this.worksOrderData.wprsequence,
      "WOSEQUENCE":this.worksOrderData.wosequence,
      "WPSPAYMENTDATE":this.dateFormate(this.addScheduleForm.get('paymentDate').value),
      "WPSSTARTDATE":this.dateFormate(this.addScheduleForm.get('pStartDate').value),
      "WPSENDDATE":this.dateFormate(this.addScheduleForm.get('pEndDate').value),
      "strUser":this.currentUser.userId,
      "WPSRETENTIONPCT":parseInt(this.addScheduleForm.get('retentionPct').value),
      "WPSRETENTIONVALUE": parseInt(isNaN(parseInt(this.addScheduleForm.get('retentionValue').value)) ? this.addScheduleForm.get('retentionValue').value.replace("£", "").replace(",", "").replace(",", "") : this.addScheduleForm.get('retentionValue').value),
      // "WPSRETENTIONVALUE":this.addScheduleForm.get('retentionValue').value,
      "WPSFIXEDPAYMENTVALUE":0
    };

    this.subs.add(
      this.worksOrdersService.insertWebWorksOrdersPaymentSchedule(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.closeAddPaymentScheduleWin();
            this.alertService.success("New Payment Schedule Successfully Added.");
          } else {
            this.alertService.error(data.message);
          }
          this.chRef.detectChanges();
        },
        err => this.alertService.error(err)
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
    this.closeAddPaymentScheduleWindowEvent.emit(false);  }

}
