import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorksorderManagementService, AlertService, HelperService, LoaderService } from '../../_services'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-new',
  templateUrl: './variation-new.component.html',
  styleUrls: ['./variation-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class VariationNewComponent implements OnInit {
  @Input() openNewVariation: boolean = false;
  @Input() singleVariation: any;
  @Input() openedFrom = 'assetchecklist';
  @Input() formMode = 'new';
  @Input() selectedAsset: any = [];
  @Output() closeNewVariationEvent = new EventEmitter<boolean>();
  @Output() outputReason = new EventEmitter<string>();

  subs = new SubSink(); // to unsubscribe services
  title = 'New Variation';
  variationForm: FormGroup;
  submitted = false;
  formErrors: any;
  validationMessage = {
    'reason': {
      'required': 'Reason is required.',
      'maxlength': 'Reason must be maximum 250 characters.',
    },
  };
  worksOrderData: any;
  phaseData: any;
  assetDetails: any;
  // openVariationWorkList = false;

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {

    this.getVariationPageData();

    this.variationForm = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(250)]],
    });

    if (this.formMode == 'edit') {
      this.title = "Edit Variation";
      this.variationForm.patchValue({ reason: this.singleVariation?.woiissuereason })
    }

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getVariationPageData() {
    const { wosequence, assid, wopsequence } = this.selectedAsset;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
        this.workOrderProgrammeService.getPhase(wosequence, wopsequence),
        this.workOrderProgrammeService.getAssetAddressByAsset(assid),

      ]).subscribe(
        data => {
          // console.log(data)
          this.worksOrderData = data[0].data;
          this.phaseData = data[1].data;
          this.assetDetails = data[2].data[0];

          this.chRef.detectChanges();

        }
      )
    )
  }

  closeNewVariation() {
    this.openNewVariation = false;
    this.closeNewVariationEvent.emit(false);
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
    }
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.variationForm);

    this.chRef.detectChanges();

    if (this.variationForm.invalid) {
      return;
    }

    let formRawVal = this.variationForm.getRawValue();

    if (this.formMode == 'new') {
      this.closeNewVariation();
      this.outputReason.emit(formRawVal.reason);
    } else if (this.formMode == 'edit') {
      const { wosequence, woisequence, wopsequence } = this.singleVariation;
      this.workOrderProgrammeService.updateWorksOrderInstruction(wosequence, woisequence, wopsequence, formRawVal.reason).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(data.message);
            this.closeNewVariation();
            console.log(data);
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      );
    }

  }




}
