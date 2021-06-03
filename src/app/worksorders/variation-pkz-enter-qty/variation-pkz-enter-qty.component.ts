import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AlertService, ConfirmationDialogService, HelperService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-variation-pkz-enter-qty',
  templateUrl: './variation-pkz-enter-qty.component.html',
  styleUrls: ['./variation-pkz-enter-qty.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class VariationPkzEnterQtyComponent implements OnInit {
  subs = new SubSink();
  @Input() pkzQtyWindow = false;
  @Input() mode = 'edit';
  @Input() openedFrom = 'worksorder';
  @Input() parentComp = '';
  @Input() singleVariationInp: any;
  @Input() selectedSingleVariationAssetInp: any;
  @Input() assetDetailInp: any;
  @Input() selectedPkzs: any;
  @Output() closePkzQtyEvent = new EventEmitter<boolean>();

  title = '';
  readonly = true;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  pakzQuantityForm: FormGroup;
  submitted = false;
  formErrors: any;
  validationMessage = {
    'comment': {
      'required': 'Comment must be entered.',
    },
  }
  worksOrder: any;
  planYear: any;
  // selectedPackages: any;
  applyCount = 0
  submitType = 1 // apply one
  displayHighestPkz: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private worksorderManagementService: WorksorderManagementService,
    private confirmationDialogService: ConfirmationDialogService,
    private fb: FormBuilder,
    private helperService: HelperService,
    private worksOrdersService: WorksOrdersService,
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeVariatioPkzQty() {
    this.pkzQtyWindow = false;
    this.closePkzQtyEvent.emit(false)
  }

  ngOnInit(): void {
    console.log({ mode: this.mode, parnetcomp: this.parentComp, openedFrom: this.openedFrom, variation: this.singleVariationInp, assetDetail: this.assetDetailInp, asset: this.selectedSingleVariationAssetInp })
    console.log({ selection: this.selectedPkzs })

    if (this.parentComp == 'worklist') {
      this.title = 'Variation Cost/Qantity';
    } else if (this.parentComp == 'additional') {
      this.title = 'Add Package Enter Quantity';
    }

    this.pakzQuantityForm = this.fb.group({
      code: [''],
      name: [''],
      desc: [''],
      quantity: [''],
      uom: [''],
      sorRate: [''],
      contractorRate: [''],
      workCost: [''],
      costOverride: [''],
      comment: ['', [Validators.required]],
    });

    //disable some fields
    this.pakzQuantityForm.get('code').disable();
    this.pakzQuantityForm.get('name').disable();
    this.pakzQuantityForm.get('desc').disable();
    this.pakzQuantityForm.get('uom').disable();
    this.pakzQuantityForm.get('sorRate').disable();
    this.pakzQuantityForm.get('contractorRate').disable();
    this.pakzQuantityForm.get('workCost').disable();


    //set work cost on change of quantity field
    this.subs.add(
      this.pakzQuantityForm.get('quantity').valueChanges.subscribe(
        qty => {
          let formRawVal = this.pakzQuantityForm.getRawValue();
          this.pakzQuantityForm.patchValue({
            workCost: qty * this.helperService.convertMoneyToFlatFormat(formRawVal?.sorRate),
            costOverride: qty * this.helperService.convertMoneyToFlatFormat(formRawVal?.sorRate),
          });
        }
      )
    )


    //get page required data
    this.getRequiredPageData();


  }


  getRequiredPageData() {
    const { wosequence, wopsequence, assid } = this.selectedSingleVariationAssetInp;

    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorksOrderByWOsequence(wosequence),
        this.worksorderManagementService.getPlanYear(wosequence),
        // this.worksorderManagementService.getWEBWorksOrdersAssetDetailAndVariation(wosequence, wopsequence, assid)
      ]).subscribe(
        data => {
          console.log(data);
          this.worksOrder = data[0].data;
          this.planYear = data[1].data;

          if (this.mode == "new") {

            this.displayHighestPkz = this.selectedPkzs[this.selectedPkzs.length - 1];
            this.applyCount = this.selectedPkzs.length;
            this.populateForm(this.displayHighestPkz);
            
          }

          if (this.mode == 'edit') {
            this.getPkzQtyDataForAssetDetail();
          }

        }
      )
    )
  }

  populateForm(displayHighestPkz) {
    this.pakzQuantityForm.patchValue({
      code: displayHighestPkz?.wphcode,
      name: displayHighestPkz?.wphname,
      desc: displayHighestPkz?.atadescription,
      quantity: displayHighestPkz?.asaquantity,
      uom: displayHighestPkz?.uom,
      sorRate: displayHighestPkz?.defaultcost,
      contractorRate: displayHighestPkz?.contractrate,
      workCost: displayHighestPkz?.asaquantity * displayHighestPkz?.defaultcost,
      costOverride: displayHighestPkz?.asaquantity * displayHighestPkz?.defaultcost,
      comment: '',
    })
  }


  getPkzQtyDataForAssetDetail() {
    let cttsurcde;

    if (this.parentComp == 'worklist' && this.openedFrom == 'worksorder') {
      cttsurcde = this.singleVariationInp.cttsurcde;
    } else if (this.parentComp == 'worklist' && this.openedFrom == 'assetchecklist') {
      cttsurcde = this.selectedSingleVariationAssetInp.cttsurcde;
    }

    const { wlataid, assid, wosequence } = this.assetDetailInp;

    this.subs.add(
      this.worksorderManagementService.getContractCostsForAssetAndAttribute(cttsurcde, wlataid, assid, wosequence).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            const pkz = data.data;

            this.pakzQuantityForm.patchValue({
              code: this.assetDetailInp?.wlcomppackage,
              name: this.assetDetailInp?.wphname,
              desc: this.assetDetailInp?.atadescription,
              quantity: this.assetDetailInp?.asaquantity,
              uom: this.assetDetailInp?.asauom,
              comment: this.assetDetailInp?.woadcomment,
              sorRate: pkz?.soR_RATE,
              contractorRate: pkz?.soR_RATE,
              workCost: pkz?.cost,
              costOverride: pkz?.cost//pkz?.overridE_COST == null ? 0 : pkz?.overridE_COST,
            });

            this.chRef.detectChanges();
          }
        }
      )
    )



  }


  validate(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
  }



  defaultToOne() {
    this.pakzQuantityForm.patchValue({
      quantity: 1
    });

    this.chRef.detectChanges();
  }


  formErrorObject() {
    this.formErrors = {
      'comment': '',
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

  selectApply(type) {
    this.submitType = type;
    this.onSubmit();
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.pakzQuantityForm);
    this.chRef.detectChanges();
    // console.log(this.pakzQuantityForm)
    if (this.pakzQuantityForm.invalid) {
      return;
    }

    this.applyCost(this.submitType);

  }

  applyCost(type, confirmed = false) {
    let formRawVal = this.pakzQuantityForm.getRawValue();

    if (formRawVal.quantity == 0 && confirmed == false) {
      this.openConfirmationDialog(type, "Are you sure you want to add this item with a zero quantity?");
      return
    }

    if (type == 1) {
      if (this.parentComp == 'additional' && this.mode == "new") {

        const params = this.createPkzVariationParam(this.selectedSingleVariationAssetInp, this.displayHighestPkz, formRawVal, type);

        // console.log(params);
        if (this.applyCount > 0) {
          this.subs.add(
            this.worksorderManagementService.worksOrdersCreateVariationForAddWOAD(params).subscribe(
              async data => {
                // console.log(data)
                if (data.isSuccess == false) {
                  this.alertService.error(data.message)
                  return
                }

                //reset form value for next record
                this.applyCount--
                this.displayHighestPkz = this.selectedPkzs[this.applyCount - 1];
                if (this.applyCount == 0) {
                  this.closeVariatioPkzQty();
                  return
                }

                this.populateForm(this.displayHighestPkz)
                this.chRef.detectChanges();


              }
            )
          )
        }
      }



      if (this.parentComp == 'worklist' && this.mode == 'edit') {
        let params = {
          WOSEQUENCE: this.assetDetailInp.wosequence,
          WOPSEQUENCE: this.assetDetailInp.wopsequence,
          WOISEQUENCE: this.assetDetailInp.woisequence,
          ASSID: this.assetDetailInp.assid,
          WLCODE: this.assetDetailInp.wlcode,
          WLATAID: this.assetDetailInp.wlataid,
          WLPLANYEAR: this.assetDetailInp.wlplanyear,
          WOSTAGESURCDE: this.assetDetailInp.wostagesurcde,
          WOCHECKSURCDE: this.assetDetailInp.wochecksurcde,
          User: this.assetDetailInp.userName,
          WOIADWORKCOST: this.helperService.convertMoneyToFlatFormat(formRawVal.workCost),//
          WOIADFEECOST: this.assetDetailInp.woadcommitted,//
          WOIADCOMMENT: formRawVal.comment,
          ASAQUANTITY: formRawVal.quantity,
          ASAUOM: this.assetDetailInp.asauom,
          Recharge: this.assetDetailInp.woadrechargeyn,
          Refusal: this.assetDetailInp.woadrefusal,
          UserID: this.currentUser.userId,
          WPHCODE: this.assetDetailInp.wlcomppackage
        };

        this.worksorderManagementService.worksOrdersUpdateWorksOrderInstructionAssetDetail(params).subscribe(
          data => {
            if (data.isSuccess) {
              let success_msg = "Work Updated Successfully";
              this.alertService.success(success_msg);
              this.closeVariatioPkzQty();
            } else {
              this.alertService.error(data.message);
            }
          }, err => this.alertService.error(err)
        )


      }

    }


    if (type == 2) {
      if (this.parentComp == 'additional' && this.mode == "new") {
        let req: any = [];
        for (let pkz of this.selectedPkzs) {
          const params = this.createPkzVariationParam(this.selectedSingleVariationAssetInp, pkz, formRawVal, type);
          req.push(this.worksorderManagementService.worksOrdersCreateVariationForAddWOAD(params));
        }

        this.subs.add(
          forkJoin(req).subscribe(
            data => {
              this.closeVariatioPkzQty();
            },
            err => this.alertService.error(err)
          )
        )
      }
    }



  }

  createPkzVariationParam(variation, pkz, formRawVal, type = 1) {
    const { wosequence, wopsequence, assid, woisequence } = variation;
    const { ataid, wphcode, wostagesurcde, wochecksurcde, woifeecost, uom, defaultcost } = pkz;

    return {
      WOSEQUENCE: wosequence,
      WOPSEQUENCE: wopsequence,
      ASSID: assid,
      WOISEQUENCE: woisequence,
      WLATAID: ataid,
      WLPLANYEAR: this.planYear,
      WOSTAGESURCDE: wostagesurcde,
      WOCHECKSURCDE: wochecksurcde,
      User: this.currentUser.userId,
      WOIADWORKCOST: type == 1 ? this.helperService.convertMoneyToFlatFormat(formRawVal.workCost) : defaultcost,
      WOIADFEECOST: woifeecost,
      WOIADCOMMENT: formRawVal.comment,
      ASAQUANTITY: formRawVal.quantity,
      ASAUOM: uom,
      WPHCODE: wphcode,
      Recharge: "N",
      WLCODE: 0,
    }
  }


  // createAssetDetailParam(variation, pkz, formRawVal) {
  //   const { wosequence, wopsequence, assid, woisequence, woirequesttype, woiissueuser, woiissuestatus, woiissuedate, woiacceptuser, cttsurcde, woiworkcost } = variation;
  //   const { ataid, wphcode, wostagesurcde, wochecksurcde, woifeecost, uom, defaultcost } = pkz;

  //   return {
  //     WOSEQUENCE: wosequence,
  //     WOPSEQUENCE: wopsequence,
  //     WOISEQUENCE: woisequence,
  //     WOIAWORKCOST: this.helperService.convertMoneyToFlatFormat(defaultcost),
  //     WOIREQUESTTYPE: woirequesttype,
  //     WOIISSUEUSER: woiissueuser,
  //     WOIISSUESTATUS: woiissuestatus,
  //     ASSID: assid,
  //     WOIFEECOST: woifeecost,
  //     WOIISSUEDATE: this.helperService.dateObjToString(woiissuedate),
  //     WOIACCEPTUSER: woiacceptuser,
  //     WLCODE: 0,
  //     WLATAID: ataid,
  //     WLPLANYEAR: this.planYear,
  //     WOSTAGESURCDE: wostagesurcde,
  //     WOCHECKSURCDE: wochecksurcde,
  //     WOIADISSUESTATUS: 'New',
  //     WOIISSUEREASON: 'Adding Work',
  //     WOIWORKCOST: this.helperService.convertMoneyToFlatFormat(defaultcost),
  //     WOIADCOMMENT: formRawVal.comment,
  //     WPHCODE: wphcode,
  //     CTTSURCDE: cttsurcde,
  //     ASAQUANTITY: formRawVal.quantity,
  //     ASAUOM: uom,
  //     WOIADRECHARGEYN: 'N',
  //     WOIADREFUSAL: 'WORC000000',
  //     WOIADPREREFUSALCOST: 0.00,
  //   }
  // }



  openConfirmationDialog(type, msg) {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${msg}`)
      .then((confirmed) => (confirmed) ? this.applyCost(type, true) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }


}
