import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AlertService, ConfirmationDialogService, HelperService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-worksorders-add-package-enter-quantity',
  templateUrl: './worksorders-add-package-enter-quantity.component.html',
  styleUrls: ['./worksorders-add-package-enter-quantity.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersAddPackageEnterQuantityComponent implements OnInit {
  subs = new SubSink();
  @Input() packageQuantityWindow: any;
  @Input() mySelection: any;
  @Input() packageData: any = [];
  @Input() selectedWorkOrder: any;
  @Input() mode = "new";
  @Output() closePackageQuantiyEvent = new EventEmitter<boolean>();
  @Output() refreshPackageList = new EventEmitter<boolean>();
  @Input() swapPkz: any = false;

  title = '';
  readonly = true;
  displayHighestPkz: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  pakzQuantityForm: FormGroup;
  submitted = false;
  formErrors: any;
  validationMessage = {
    'comment': {
      'required': 'Comment must be entered.',
    },
  }

  // quantity: any = 0;
  // costOverride = 0;
  // comment = '';

  worksOrder: any;
  planYear: any;
  selectedPackages: any;
  applyCount = 0
  submitType = 1 // apply one

  constructor(
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private worksorderManagementService: WorksorderManagementService,
    private confirmationDialogService: ConfirmationDialogService,
    private fb: FormBuilder,
    private helperService: HelperService,
    private worksOrdersService: WorksOrdersService,
  ) { }

  ngOnInit(): void {
    // console.log(this.swapPkz)

    if (this.mode == "new") {
      this.title = 'Add Package To Work List Details';
    } else {
      this.title = 'Edit Package Quantity and/or Cost';
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
    })

    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorksOrderByWOsequence(this.selectedWorkOrder.wosequence),
        this.worksorderManagementService.getPlanYear(this.selectedWorkOrder.wosequence)
      ]).subscribe(
        data => {
          // console.log(data)
          this.worksOrder = data[0].data;
          this.planYear = data[1].data;

          if (this.mode == "new") {
            //set fortm after api call
            this.selectedPackages = this.packageData.filter(x => this.mySelection.includes(x.wphcode));
            this.displayHighestPkz = this.selectedPackages[this.selectedPackages.length - 1];
            this.applyCount = this.selectedPackages.length;

            this.populateForm(this.displayHighestPkz);


            this.pakzQuantityForm.get('quantity').valueChanges.subscribe(
              qty => {
                this.pakzQuantityForm.patchValue({
                  workCost: qty * this.displayHighestPkz?.defaultcost,
                  costOverride: qty * this.displayHighestPkz?.defaultcost,
                })
              }
            )
          } else {
            let params = {
              "WLCode": this.packageData.wlcode,
              "WLATAId": this.packageData.wlataid,
              "WLAssid": this.packageData.assid,
              "WLPlanYear": this.packageData.wlplanyear,
              "WOSequence": this.packageData.wosequence
            };

            this.subs.add(
              this.worksOrdersService.GetDefaultCostForAssetWork(params).subscribe(
                data => {
                  // console.log(data);
                  if (data.isSuccess) {
                    const pkz = data.data[0];
                    this.selectedPackages = [...this.packageData];
                    this.displayHighestPkz = this.packageData
                    this.applyCount = this.selectedPackages.length;
                    // this.populateForm(this.displayHighestPkz);
                    this.pakzQuantityForm.patchValue({
                      code: this.displayHighestPkz?.wlcomppackage,
                      name: this.displayHighestPkz?.wphname,
                      desc: this.displayHighestPkz?.atadescription,
                      quantity: this.displayHighestPkz?.asaquantity,
                      uom: this.displayHighestPkz?.asauom,

                      sorRate: pkz?.soR_RATE,
                      contractorRate: pkz?.soR_RATE,
                      workCost: pkz?.cost,
                      costOverride: pkz?.overridE_COST,

                      comment: this.displayHighestPkz?.woadcomment,
                    });

                    this.pakzQuantityForm.get('quantity').valueChanges.subscribe(
                      qty => {
                        let formRawVal = this.pakzQuantityForm.getRawValue();
                        this.pakzQuantityForm.patchValue({
                          workCost: qty * this.helperService.convertMoneyToFlatFormat(formRawVal?.sorRate),
                          costOverride: qty * this.helperService.convertMoneyToFlatFormat(formRawVal?.sorRate),
                        });

                        // if (this.displayHighestPkz.woadstatus == "New") {
                        //   this.pakzQuantityForm.get('comment').setValidators([Validators.required])
                        // }
                      }
                    )

                    // console.log(this.selectedPackages)
                    // console.log(this.displayHighestPkz)
                  }
                }
              )
            )




          }


          this.pakzQuantityForm.get('code').disable();
          this.pakzQuantityForm.get('name').disable();
          this.pakzQuantityForm.get('desc').disable();
          this.pakzQuantityForm.get('uom').disable();
          this.pakzQuantityForm.get('sorRate').disable();
          this.pakzQuantityForm.get('contractorRate').disable();
          this.pakzQuantityForm.get('workCost').disable();



        }
      ))



    // if (selectedPackage.length > 1) {
    //   let sortSelectedPkz = selectedPackage.sort(function (a, b) {
    //     return a.defaultcost - b.defaultcost
    //   })
    //   this.displayHighestPkz = sortSelectedPkz[sortSelectedPkz.length - 1];
    // } else {
    //   this.displayHighestPkz = selectedPackage[0];
    // }


    this.chRef.detectChanges();
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closePackageQuantityWindow(res) {
    this.packageQuantityWindow = false;
    this.closePackageQuantiyEvent.emit(res);
    this.refreshPackageList.emit(true);
  }

  validate(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
  }

  setCost(event, field) {

    // const checkDecimal = /^[-+]?[0-9]+\.[0-9]+$/;
    // const checkDecimalVal = String(event).match(checkDecimal);

    // if (checkDecimalVal != null && checkDecimalVal) {
    //   const deciLength = event.split(".")[1].length || 0;

    //   if (deciLength > 2 || isNaN(event)) {
    //     setTimeout(() => {
    //       this.quantity = event.slice(0, 8)
    //       this.chRef.detectChanges();
    //       return false;
    //     }, 5);
    //   } else if (deciLength <= 2 && event.split(".")[0].length > 5) {
    //     setTimeout(() => {
    //       this.quantity = event.slice(0, 5)
    //       this.chRef.detectChanges();
    //       return false;
    //     }, 5);
    //   }

    // } else {
    //   if (this.quantity.length > 5) {
    //     const deciLength = event.includes(".");
    //     if (!deciLength) {
    //       setTimeout(() => {
    //         this.quantity = event.slice(0, 5)
    //         this.chRef.detectChanges();
    //         return false;
    //       }, 5);
    //     } else {

    //     }

    //   }
    // }


    // this.displayHighestPkz.cost = this.costOverride = this.quantity * this.displayHighestPkz.defaultcost;
    // this.chRef.detectChanges();
  }

  defaultToOne() {
    this.pakzQuantityForm.patchValue({
      quantity: 1
    })

    setTimeout(() => {
      this.selectApply(1)
    }, 50);
  }

  openConfirmationDialog(type, msg) {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${msg}`)
      .then((confirmed) => (confirmed) ? this.applyCost(type, true) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
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


  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.pakzQuantityForm);
    this.chRef.detectChanges();
    // console.log(this.pakzQuantityForm)
    if (this.pakzQuantityForm.invalid) {
      return;
    }

    if (this.swapPkz == "true") {
      this.swapPackaze(this.submitType)
    } else {
      this.applyCost(this.submitType);
    }


  }

  selectApply(type) {
    this.submitType = type;
    this.onSubmit();
    // this.pakzQuantityForm.
  }



  applyCost(type, confirmed = false) {
    let formRawVal = this.pakzQuantityForm.getRawValue();

    if (formRawVal.quantity == 0 && confirmed == false) {
      this.openConfirmationDialog(type, "Are you sure you want to add this item with a zero quantity?");
      return
    }

    // if (formRawVal.comment == "") {
    //   this.alertService.error("Comment must be entered.");
    //   return;
    // }
    // if (this.quantity == 0 && confirmed == false) {
    //   this.openConfirmationDialog(type, "Are you sure you want to add a zero quantity?");
    //   return
    // }

    // if (this.comment == "") {
    //   this.alertService.error("Comment must be entered.");
    //   return;
    // }

    if (type == 1) {
      if (this.mode == "new") {
        let params = {
          WLATAID: this.displayHighestPkz.ataid,
          WPHCODE: this.displayHighestPkz.wphcode,
          Quantity: formRawVal.quantity,
          ASSID: this.selectedWorkOrder.assid,
          UserId: this.currentUser.userId,
          Cost: this.helperService.convertMoneyToFlatFormat(formRawVal.costOverride),
          CTTSURCDE: this.worksOrder.cttsurcde,
          Comment: formRawVal.comment,
          WPRSEQUENCE: this.worksOrder.wprsequence,
          WOSEQUENCE: this.worksOrder.wosequence,
          WOPSEQUENCE: this.selectedWorkOrder.wopsequence
        }

        // console.log(params);
        if (this.applyCount > 0) {

          this.subs.add(
            this.worksorderManagementService.worksOrdersInsertIntoWorkList(params).subscribe(
              data => {
                if (data.isSuccess == false) {
                  this.alertService.error(data.message)
                  return
                }

                this.applyCount--
                this.displayHighestPkz = this.selectedPackages[this.applyCount - 1];
                this.populateForm(this.displayHighestPkz)
                this.chRef.detectChanges();
                if (this.applyCount == 0) {
                  this.closePackageQuantityWindow(true);
                  return
                }

              }
            )
          )
        }
      } else {

        let params = {
          "PWOSEQUENCE": this.packageData.wosequence,
          "PWOPSEQUENCE": this.packageData.wopsequence,
          "PASSID": this.packageData.assid,
          "PWLCODE": this.packageData.wlcode,
          "PATAID": this.packageData.wlataid,
          "PWLPLANYEAR": this.packageData.wlplanyear,
          "PASAQUANTITY": formRawVal.quantity,
          "PWORKCOST": this.helperService.convertMoneyToFlatFormat(formRawVal.costOverride),
          "PWOIADCOMMENT": formRawVal.comment,
          "RECHARGE": this.packageData.woadrechargeyn,
          "PREFUSAL": this.packageData.woadrefusal,
          "PUSERID": this.currentUser.userId,
        };

        this.worksOrdersService.WOEditWorkPackageTablet(params).subscribe(
          data => {
            if (data.isSuccess) {
              let success_msg = "Work Updated Successfully";
              this.alertService.success(success_msg);
              this.closePackageQuantityWindow(true);

            } else {
              this.alertService.error(data.message);
            }
          }, err => this.alertService.error(err)
        )


      }


    } else {
      let req: any = [];
      for (let pkz of this.selectedPackages) {
        let params = {
          WLATAID: pkz.ataid,
          WPHCODE: pkz.wphcode,
          Quantity: formRawVal.quantity,
          ASSID: this.selectedWorkOrder.assid,
          UserId: this.currentUser.userId,
          Cost: pkz.defaultcost,//this.helperService.convertMoneyToFlatFormat(formRawVal.costOverride),
          CTTSURCDE: this.worksOrder.cttsurcde,
          Comment: formRawVal.comment,
          WPRSEQUENCE: this.worksOrder.wprsequence,
          WOSEQUENCE: this.worksOrder.wosequence,
          WOPSEQUENCE: this.selectedWorkOrder.wopsequence
        }

        req.push(this.worksorderManagementService.worksOrdersInsertIntoWorkList(params))
        //req.push(params);
      }

      //console.log(req)
      this.subs.add(
          forkJoin(req).subscribe(
          data => {
            this.closePackageQuantityWindow(true);
          }
        )
      )

    }
  }


  swapPackaze(type, confirmed = false) {
    let formRawVal = this.pakzQuantityForm.getRawValue();

    if (formRawVal.quantity == 0 && confirmed == false) {
      this.openConfirmationDialog(type, "Are you sure you want to add this item with a zero quantity?");
      return
    }

    if (type == 1) {
      if (this.mode == "new") {
        let params = {
          ATAID: this.displayHighestPkz.ataid,

          WLPLANYEAR: this.planYear,
          WLCODE: this.selectedWorkOrder.wlcode,

          ASSID: this.selectedWorkOrder.assid,

          WPHCODE: this.displayHighestPkz.wphcode,
          QTY: formRawVal.quantity,
          UserId: this.currentUser.userId,
          COST: this.helperService.convertMoneyToFlatFormat(formRawVal.costOverride),

          CTTCode: this.worksOrder.cttsurcde,
          COMMENT: formRawVal.comment,
          WPRSEQUENCE: this.worksOrder.wprsequence,
          WOSEQUENCE: this.worksOrder.wosequence,
          WOPSEQUENCE: this.selectedWorkOrder.wopsequence
        }


        if (this.applyCount > 0) {

          this.subs.add(
            this.worksorderManagementService.SwapPackage(params).subscribe(
              data => {


                if (data.data != undefined) {
                  const res = data.data[0];

                  if (res.pRETURNSTATUS == "E") {
                    this.alertService.error(res.pRETURNMESSAGE);
                    return;

                  } else {
                    this.alertService.success(res.pRETURNMESSAGE);
                    this.closePackageQuantityWindow(true);
                  }
                } else {
                  this.alertService.success("Something went wrong.");

                }


              }
            )
          )
        }
      }


    }


    // else {
    //   let req: any = [];
    //   for (let pkz of this.selectedPackages) {
    //     let params = {
    //       WLATAID: pkz.ataid,
    //       WPHCODE: pkz.wphcode,
    //       Quantity: formRawVal.quantity,
    //       ASSID: this.selectedWorkOrder.assid,
    //       UserId: this.currentUser.userId,
    //       Cost: pkz.defaultcost,//this.helperService.convertMoneyToFlatFormat(formRawVal.costOverride),
    //       CTTSURCDE: this.worksOrder.cttsurcde,
    //       Comment: formRawVal.comment,
    //       WPRSEQUENCE: this.worksOrder.wprsequence,
    //       WOSEQUENCE: this.worksOrder.wosequence,
    //       WOPSEQUENCE: this.selectedWorkOrder.wopsequence
    //     }

    //     req.push(this.worksorderManagementService.SwapPackage(params))
    //     //req.push(params);
    //   }

    //   //console.log(req)
    //   this.subs.add(
    //     forkJoin(req).subscribe(
    //       data => {
    //         this.closePackageQuantityWindow();
    //       }
    //     )
    //   )

    // }
  }


  // confirmationOnSwap(type, res) {
  //   let checkstatus = "C";
  //   if (res.pRETURNSTATUS == 'S') {
  //     checkstatus = "P"
  //   }

  //   $('.k-window').css({ 'z-index': 1000 });

  //   this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
  //     .then((confirmed) => {
  //       if (confirmed) {
  //         if (res.pRETURNSTATUS == 'E') {
  //           return
  //         }

  //         // this.swapPackaze(type, checkstatus);

  //       }

  //     })
  //     .catch(() => console.log('Attribute dismissed the dialog.'));
  // }


  checkApplyAllDisable() {
    if (this.swapPkz == 'true') {
      return true
      // return this.mySelection.length <= 1;
    }

    return false;
  }

}
