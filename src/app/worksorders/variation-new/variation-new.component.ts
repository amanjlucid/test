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
  @Output() outputVariation = new EventEmitter<any>();

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
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  // openVariationWorkList = false;

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    // console.log(this.selectedAsset);

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
          // console.log(data);
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
    const { wopsequence, wosequence } = this.phaseData

    if (this.formMode == 'new') {
      let params = {
        // ASSID: this.assetDetails.assid,
        // WLCODE: '',
        // WLATAID: '',
        // WLPLANYEAR: '',
        // WOSTAGESURCDE: '',
        // WOCHECKSURCDE: '',
        // WOIADISSUESTATUS: '',
        // WOIADCOMMENT: '',
        // WPHCODE: '',
        // ASAQUANTITY: '',
        // ASAUOM: '',
        // WOIADRECHARGEYN: '',
        // WOIADREFUSAL: '',



        WOPSEQUENCE: wopsequence,
        CTTSURCDE: this.worksOrderData.cttsurcde,
        WOIACCEPTREASON: '',
        WOIACCEPTDATE: this.helperService.dateObjToString(undefined),
        WOIACCEPTUSER: '',
        WOIACCEPTSTATUS: '',
        WOICURRENTCONTRACTSUM: 0,
        WOIINITIALCONTRACTSUM: 0,
        WOIWORKCOST: 0,
        WOIFEECOST: 0,
        WOIISSUEUSERTYPE: 'Customer',
        WOIISSUEREASON: formRawVal.reason,
        WOIISSUEDATE: this.helperService.dateObjToString(undefined),
        WOIISSUEUSER: '',
        WOIISSUESTATUS: 'New',
        WOIREQUESTDATE: this.helperService.getDateString('Today'),
        WOIREQUESTUSER: this.currentUser.userId,
        WOIREQUESTTYPE: 'Variation',
        WOISEQUENCE: '',
        WOSEQUENCE: wosequence
      }

      this.subs.add(
        this.workOrderProgrammeService.insertWorksOrderInstruction(params).subscribe(
          data => {

            if (data.isSuccess) {
              this.workOrderProgrammeService.getLatestVariationData(wosequence, wopsequence, formRawVal.reason).subscribe(
                variation => {
                  if (variation.isSuccess) {
                    this.closeNewVariation();
                    this.outputVariation.emit(variation.data);
                  }
                }
              )

            } else this.alertService.error(data.message)
          }, err => this.alertService.error(err)
        )
      )


    } else if (this.formMode == 'edit') {
      const { wosequence, woisequence, wopsequence } = this.singleVariation;
      this.workOrderProgrammeService.updateWorksOrderInstruction(wosequence, woisequence, wopsequence, formRawVal.reason).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(data.message);
            this.closeNewVariation();

          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      );
    }

  }




}
