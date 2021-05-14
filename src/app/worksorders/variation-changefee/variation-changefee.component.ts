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
  };

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.variationFeeForm = this.fb.group({
      comment: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeChangeFee(){
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

  }


}
