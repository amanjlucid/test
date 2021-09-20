import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorksorderManagementService, AlertService, HelperService } from '../../_services'


@Component({
  selector: 'app-blank-variation',
  templateUrl: './blank-variation.component.html',
  styleUrls: ['./blank-variation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class BlankVariationComponent implements OnInit {
  @Input() opneBlankVariation: boolean = false;
  @Input() singleWorksOrder: any;
  @Input() openedFrom;
  @Input() formMode = 'new';
  @Output() closeBlankVariation = new EventEmitter<boolean>();
  @Input() selectedSingleVariationInp: any;

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
  phaseData: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    this.getPhase()
    this.variationForm = this.fb.group({
      worksorder: [{ value: this.singleWorksOrder.woname, disabled: true }, [Validators.required]],
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


  getPhase() {
    const { wosequence } = this.singleWorksOrder;
    this.subs.add(
      this.workOrderProgrammeService.getWorksOrderPhaseLevelTwo(wosequence).subscribe(
        data => {
          if (data.isSuccess) this.phaseData = data.data;
          else this.alertService.error(data.message)
          this.chRef.detectChanges();
        }
      )
    )

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

    if (this.variationForm.invalid) {
      return;
    }

    let formRawVal = this.variationForm.getRawValue();

    const { phase, reason } = formRawVal;
    const { cttsurcde, wosequence } = this.singleWorksOrder;
    // const { woisequence, woiworkcost } = this.selectedSingleVariationInp;

    let params = {
      CTTSURCDE: cttsurcde,
      WOIACCEPTREASON: '',
      WOIACCEPTSTATUS: '',
      WOIACCEPTUSER: '',
      WOICURRENTCONTRACTSUM: 0,
      WOIFEECOST: 0,
      WOIINITIALCONTRACTSUM: 0,
      WOIISSUEDATE: this.helperService.dateObjToString(undefined),
      WOIACCEPTDATE: this.helperService.dateObjToString(undefined),
      WOIISSUEREASON: reason,
      WOIISSUESTATUS: 'New',
      WOIISSUEUSER: '',
      WOIISSUEUSERTYPE: 'Customer',
      WOIREQUESTDATE: this.helperService.getDateString('Today'),
      WOIREQUESTTYPE: 'Variation',
      WOIREQUESTUSER: this.currentUser.userId,
      WOISEQUENCE: '',
      WOIWORKCOST: 0,
      WOPSEQUENCE: parseInt(phase),
      WOSEQUENCE: wosequence,
      BlankVariation: true
    }

    this.subs.add(
      this.workOrderProgrammeService.insertWorksOrderInstruction(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(data.message);
            this.closeBlankVariationMethod();
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )


  }




}
