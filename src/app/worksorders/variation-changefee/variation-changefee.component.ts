import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorksorderManagementService, AlertService, HelperService, LoaderService } from '../../_services'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-changefee',
  templateUrl: './variation-changefee.component.html',
  styleUrls: ['./variation-changefee.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VariationChangefeeComponent implements OnInit {
  @Input() openChangeFee: boolean = false;
  @Input() selectedSingleFees: any;
  @Input() selectedVariationInp: any;
  @Input() selectedSingleVariationAssetInp: any;
  @Output() closeChangeFeeEvent = new EventEmitter<boolean>();


  subs = new SubSink(); // to unsubscribe services
  title = 'Variation Fee';
  variationFeeForm: FormGroup;
  submitted = false;
  formErrors: any;
  validationMessage = {
    'comment': {
      'required': 'comment is required.',
      'maxlength': 'Reason must be maximum 250 characters.',
    },

    'feecostoverride': {
      'required': 'Fee Cost Override is required.',

    },
  };
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private workOrderProgrammeService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    // console.log({ fees: this.selectedSingleFees, variation: this.selectedVariationInp, asset: this.selectedSingleVariationAssetInp })

    const { wostagename, wocheckname, woaccommittedfee, woacpendingfee, woiadcomment } = this.selectedSingleFees;

    this.variationFeeForm = this.fb.group({
      stage: [{ value: wostagename, disabled: true }, [Validators.required, Validators.maxLength(250)]],
      name: [{ value: wocheckname, disabled: true }, [Validators.required, Validators.maxLength(250)]],
      feecost: [{ value: woaccommittedfee, disabled: true }, [Validators.required, Validators.maxLength(250)]],
      feecostoverride: [woacpendingfee, [Validators.required, Validators.maxLength(250)]],
      comment: [woiadcomment, [Validators.required, Validators.maxLength(250)]],
    });

    setTimeout(() => {
      this.variationFeeForm.patchValue({
        feecost: woaccommittedfee,
        feecostoverride: woacpendingfee,
      })
    }, 100);


    this.chRef.detectChanges();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeChangeFee() {
    this.openChangeFee = false;
    this.closeChangeFeeEvent.emit(false);
  }

  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid && abstractControl.errors != null) {
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
      'comment': '',
      'feecostoverride': ''
    }
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.variationFeeForm);

    this.chRef.detectChanges();

    if (this.variationFeeForm.invalid) {
      return;
    }


    let formRawVal = this.variationFeeForm.getRawValue();
    const { wosequence, wopsequence, assid, wostagesurcde, wochecksurcde } = this.selectedSingleFees;
    const { woisequence } = this.selectedSingleVariationAssetInp;

    let params = {
      WOSEQUENCE: wosequence,
      WOPSEQUENCE: wopsequence,
      ASSID: assid,
      WOISEQUENCE: woisequence,
      WOSTAGESURCDE: wostagesurcde,
      WOCHECKSURCDE: wochecksurcde,
      UserID: this.currentUser.userId,
      WOIADFEECOST: this.helperService.convertMoneyToFlatFormat(formRawVal.feecostoverride),
      WOIADCOMMENT: formRawVal.comment,
      Recharge: 'N'
    }

    // debugger;
    // return;
    this.subs.add(
      this.workOrderProgrammeService.worksOrdersCreateVariationForChangeFee(params).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            this.alertService.success("Fee updated successfully");
            this.closeChangeFee();
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )

  }


}
