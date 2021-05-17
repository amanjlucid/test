import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorksorderManagementService, AlertService, HelperService, LoaderService } from '../../_services'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-blank-variation',
  templateUrl: './blank-variation.component.html',
  styleUrls: ['./blank-variation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class BlankVariationComponent implements OnInit {
  @Input() opneBlankVariation: boolean = false;
  @Input() openedFrom;
  @Input() formMode = 'new';
  @Output() closeBlankVariation = new EventEmitter<boolean>();

  subs = new SubSink(); // to unsubscribe services
  title = 'Create Blank Variation';
  variationForm: FormGroup;
  submitted = false;
  formErrors: any;
  validationMessage = {
    'reason': {
      'required': 'Reason is required.',
      'maxlength': 'Reason must be maximum 250 characters.',
    },
    'worksorder': {
      'required': 'Works Order is required.',
    },
    'phase': {
      'required': 'Phase is required.',
    },
  };


  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.variationForm = this.fb.group({
      worksorder: ['', [Validators.required]],
      phase: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeBlankVariationMethod() {
    this.opneBlankVariation = false;
    this.closeBlankVariation.emit(false);
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
      'reason': '',
      'worksorder': '',
      'phase': ''
    }
  }


  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.variationForm);

    // this.chRef.detectChanges();

    if (this.variationForm.invalid) {
      return;
    }

  }

}
