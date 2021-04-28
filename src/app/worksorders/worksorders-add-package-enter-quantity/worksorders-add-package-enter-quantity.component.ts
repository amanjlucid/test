import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AlertService, ConfirmationDialogService, HelperService, WorksorderManagementService } from 'src/app/_services';
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
  @Input() packageData: any;
  @Input() selectedWorkOrder: any;
  @Input() mode = "new";
  @Output() closePackageQuantiyEvent = new EventEmitter<boolean>();
  @Output() refreshPackageList = new EventEmitter<boolean>();

  title = '';
  readonly = true;
  displayHighestPkz: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  pakzQuantityForm: FormGroup;
  submitted = false;
  formErrors: any;


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
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    // console.log(this.packageData)
    if (this.mode == "new") {
      this.title = 'Add Package To Work List Details';
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
      comment: [''],
    })

    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorksOrderByWOsequence(this.selectedWorkOrder.wosequence),
        this.worksorderManagementService.getPlanYear(this.selectedWorkOrder.wosequence)
      ]).subscribe(
        data => {
          this.worksOrder = data[0].data;
          this.planYear = data[1].data;


          //set fortm after api call
          this.selectedPackages = this.packageData.filter(x => this.mySelection.includes(x.wphcode));
          this.displayHighestPkz = this.selectedPackages[this.selectedPackages.length - 1];
          this.applyCount = this.selectedPackages.length;

          if (this.mode == "new") {
            this.populateForm(this.displayHighestPkz);
          }


          this.pakzQuantityForm.get('quantity').valueChanges.subscribe(
            qty => {
              this.pakzQuantityForm.patchValue({
                workCost: qty * this.displayHighestPkz?.defaultcost,
                costOverride: qty * this.displayHighestPkz?.defaultcost,
              })
            }
          )

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

  closePackageQuantityWindow() {
    this.packageQuantityWindow = false;
    this.closePackageQuantiyEvent.emit(this.packageQuantityWindow);
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
    // this.quantity = 1;
    // this.setCost(this.quantity, '');
    this.pakzQuantityForm.patchValue({
      quantity: 1
    })

    setTimeout(() => {
      this.applyCost(1)
    }, 50);
  }

  openConfirmationDialog(type, msg) {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${msg}`)
      .then((confirmed) => (confirmed) ? this.applyCost(type, true) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }

  onSubmit() {
    if (this.pakzQuantityForm.invalid) {
      return;
    }

    this.applyCost(this.submitType);

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

    if (formRawVal.comment == "") {
      this.alertService.error("Comment must be entered.");
      return;
    }
    // if (this.quantity == 0 && confirmed == false) {
    //   this.openConfirmationDialog(type, "Are you sure you want to add a zero quantity?");
    //   return
    // }

    // if (this.comment == "") {
    //   this.alertService.error("Comment must be entered.");
    //   return;
    // }

    if (type == 1) {
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
        WOPSEQUENCE: this.worksOrder.wopsequence
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
              // this.quantity = 0;
              // this.comment = '';
              this.populateForm(this.displayHighestPkz)
                  this.chRef.detectChanges();
              if (this.applyCount == 0) {
                this.closePackageQuantityWindow();
                return
              }

            }
          )
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
          Cost: this.helperService.convertMoneyToFlatFormat(formRawVal.costOverride),
          CTTSURCDE: this.worksOrder.cttsurcde,
          Comment: formRawVal.comment,
          WPRSEQUENCE: this.worksOrder.wprsequence,
          WOSEQUENCE: this.worksOrder.wosequence,
          WOPSEQUENCE: this.worksOrder.wopsequence
        }

        req.push(this.worksorderManagementService.worksOrdersInsertIntoWorkList(params))
      }

      this.subs.add(
        forkJoin(req).subscribe(
          data => {
            this.closePackageQuantityWindow();
          }
        )
      )

    }
  }

}
