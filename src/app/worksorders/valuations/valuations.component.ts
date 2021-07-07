import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { process, State } from '@progress/kendo-data-query';
import { AlertService, ConfirmationDialogService, EditPaymentScheduleService, HelperService, SharedService, WorksorderManagementService } from 'src/app/_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { GridComponent, GridDataResult, RowArgs, RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { WorkOrdersValuationModel } from '../../_models'

@Component({
  selector: 'app-valuations',
  templateUrl: './valuations.component.html',
  styleUrls: ['./valuations.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class ValuationsComponent implements OnInit {
  @Output() closeValuationWindow = new EventEmitter<boolean>();
  @Input() openValuationWindow = false;
  @Input() worksOrderData: any;
  @Input() paymentScheduleInp: any;
  worksOrderNew:any;
  subs = new SubSink();
  title = 'Enter Valuations';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  view: Observable<GridDataResult>;
  gridState: State = {
    sort: [],
    skip: 0,
    take: 20
  };
  changes: any = {};
  formGroup: FormGroup;
  gridLoading = true;
  AssetValuationTotal: any;
  selectedValuation: any;
  @ViewChild('grid') grid: GridComponent;
  selectableSettings: SelectableSettings;
  gridFormStatus = false;
  mySelection: number[] = [];
  kendoRowDetail: any;

  //global valuation form
  openGlobalValuation = false;
  globalvaluationForm: FormGroup;
  submitted = false;
  formErrors: any;
  validationMessage = {};
  setToZero = false;

  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];

  constructor(
    private formBuilder: FormBuilder,
    public editService: EditPaymentScheduleService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private helperService: HelperService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService,
    private workOrderProgrammeService: WorksorderManagementService,
  ) {
    this.setSelectableSettings();
    this.createFormGroup = this.createFormGroup.bind(this);
    this.editService.setServiceFor('valuation');
  }


  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }


  ngOnInit(): void {
    this.subs.add(
      combineLatest([
        this.sharedService.worksOrdersAccess,
        this.sharedService.woUserSecObs,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          this.worksOrderAccess = data[0];
          this.worksOrderUsrAccess = data[1];
          this.userType = data[2][0];
        }
      )
    )

    this.requiredPageData();
    this.view = this.editService.pipe(map(data => process(data, this.gridState)));
    this.editService.read(this.paymentScheduleInp);
    this.gridLoading = false;


    // setTimeout(() => {
    //   console.log(this.grid);
    // }, 5000);
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  rowCallback(context: RowClassArgs) {
    const { woavvaluationstatus = '' } = context.dataItem;
    if (woavvaluationstatus.toLowerCase() == "completion") {
      return { notEditableRow: true }
    } else {
      return { editableRow: true }
    }

  }


  mySelectionKey(context: RowArgs): any {
    // JSON.stringify(context.dataItem);
    return 'dds';
  }


  onStateChange(state: State) {
    this.gridState = state;
    this.editService.read(this.worksOrderData);
  }


  createFormGroup(dataItem: any): FormGroup {
    return this.formBuilder.group({
      assid: dataItem.assid,
      astconcataddress: dataItem.astconcataddress,
      outstandingpaymentvalue: dataItem.outstandingpaymentvalue,
      settozero: dataItem.settozero,
      woassstatus: dataItem.woassstatus,
      woavagreedupdatedate: dataItem.woavagreedupdatedate,
      woavagreedupdateuser: dataItem.woavagreedupdateuser,
      woavagreedvaluation: [dataItem.woavagreedvaluation, [Validators.required, Validators.pattern("^[0-9.]*$"), Validators.maxLength(5)]],
      woavagreedvaluationpct: [dataItem.woavagreedvaluationpct, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern("^[0-9.]*$"), Validators.maxLength(3)]],
      woavcalcpaymentvalue: dataItem.woavcalcpaymentvalue,
      woavcommittedvalue: dataItem.woavcommittedvalue,
      woavcontractorvaluation: [dataItem.woavcontractorvaluation, [Validators.required, Validators.pattern("^[0-9.]*$"), Validators.maxLength(5)]],
      woavcontractorvaluationpct: [dataItem.woavcontractorvaluationpct, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern("^[0-9.]*$"), Validators.maxLength(3)]],
      woavcontractupdatedate: dataItem.woavcontractupdatedate,
      woavcontractupdateuser: dataItem.woavcontractupdateuser,
      woavcreatedate: dataItem.woavcreatedate,
      woavcreateuser: dataItem.woavcreateuser,
      woavnotes: dataItem.woavnotes,
      woavpaymentpcttodate: dataItem.woavpaymentpcttodate,
      woavpaymenttodate: dataItem.woavpaymenttodate,
      woavpendingvalue: dataItem.woavpendingvalue,
      woavretentionvaluetodate: dataItem.woavretentionvaluetodate,
      woavupdatedate: dataItem.woavupdatedate,
      woavupdateuser: dataItem.woavupdateuser,
      woavvaluationstatus: dataItem.woavvaluationstatus,
      wopname: dataItem.wopname,
      wopsequence: dataItem.wopsequence,
      wosequence: dataItem.wosequence,
      wpspaymentdate: dataItem.wpspaymentdate,
    });
  }


  toFix(val, place) {
    return parseFloat(val).toFixed(place)
  }


  applyHundredPercentVlaue(val, val2, perc) {
    if (perc == 100) {
      if (val == val2) {
        return perc;
      } else {
        return 99.99;
      }
    } else return perc;
  }

  cellClickHandler({ sender, rowIndex, column, columnIndex, dataItem, isEdited }) {
    this.selectedValuation = dataItem;
    this.kendoRowDetail = { rowIndex, dataItem }

    if (!isEdited && !this.isReadOnly(column.field) && dataItem.woavvaluationstatus.toLowerCase() != "completion") {
      this.setToZero = false;
      this.selectedValuation.woavvaluationstatus = 'Valuation Agreed';
      let valuationForm: FormGroup = this.createFormGroup(dataItem)
      sender.editCell(rowIndex, columnIndex, valuationForm);

      const conValCtr = valuationForm.get('woavcontractorvaluation');
      const conValPctCtr = valuationForm.get('woavcontractorvaluationpct');
      const agValCtr = valuationForm.get('woavagreedvaluation');
      const agValPctCtr = valuationForm.get('woavagreedvaluationpct');

      const { woavcommittedvalue } = dataItem;
      this.subs.add(
        conValCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(
          val => {
            if (val > 0 && woavcommittedvalue > 0) {
              const perc = this.toFix((val / woavcommittedvalue) * 100, 2);
              const conPct = this.applyHundredPercentVlaue(val, woavcommittedvalue, perc);
              if (this.toFix(conValPctCtr.value, 2) != conPct) {
                valuationForm.patchValue({ woavcontractorvaluationpct: parseFloat(conPct) }, { emitEvent: false });
              }
            } else if (val == 0) {
              valuationForm.patchValue({ woavcontractorvaluationpct: 0 }, { emitEvent: false });
            }
            conValCtr.updateValueAndValidity({ emitEvent: false });
          }
        )
      )


      this.subs.add(
        conValPctCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(
          val => {
            const conVal = this.toFix((woavcommittedvalue * val) / 100, 2);
            if (this.toFix(conValCtr.value, 2) != conVal) {
              valuationForm.patchValue({ woavcontractorvaluation: parseFloat(conVal) }, { emitEvent: false });
            }
            conValPctCtr.updateValueAndValidity({ emitEvent: false });
          }
        )
      )

      //agreed
      this.subs.add(
        agValCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(
          val => {
            if (val > 0 && woavcommittedvalue > 0) {
              const perc = this.toFix((val / woavcommittedvalue) * 100, 2);
              const agPct = this.applyHundredPercentVlaue(val, woavcommittedvalue, perc);
              if (this.toFix(agValPctCtr.value, 2) != agPct) {
                valuationForm.patchValue({ woavagreedvaluationpct: parseFloat(agPct) }, { emitEvent: false });
              }
            } else if (val == 0) {
              valuationForm.patchValue({ woavagreedvaluationpct: 0 }, { emitEvent: false });
            }
            agValCtr.updateValueAndValidity({ emitEvent: false });
          }
        )
      )

      this.subs.add(
        agValPctCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(
          val => {
            const agVal = this.toFix((woavcommittedvalue * val) / 100, 2);
            if (this.toFix(agValCtr.value, 2) != agVal) {
              valuationForm.patchValue({ woavagreedvaluation: parseFloat(agVal) }, { emitEvent: false });
            }
            agValPctCtr.updateValueAndValidity({ emitEvent: false });
          }
        )
      )


      this.chRef.detectChanges();
    }

  }


  cellCloseHandler(args: any) {
    const { formGroup, dataItem } = args;
    this.gridFormStatus = formGroup.valid

    if (!formGroup.valid) {
      // prevent closing the edited cell if there are invalid values.
      args.preventDefault();
    } else if (formGroup.dirty) {
      this.editService.assignValues(dataItem, formGroup.value);
      this.editService.update(dataItem);
    }

    this.chRef.detectChanges();
  }

  // add row 
  addHandler({ sender }) {
    sender.addRow(this.createFormGroup(new WorkOrdersValuationModel()));
  }


  cancelHandler({ sender, rowIndex }) {
    sender.closeRow(rowIndex);
  }

  saveHandler({ sender, formGroup, rowIndex }) {
    if (formGroup.valid) {
      this.editService.create(formGroup.value);
      sender.closeRow(rowIndex);
    }
  }

  removeHandler({ sender, dataItem }) {
    this.editService.remove(dataItem);
    sender.cancelCell();
  }

  saveChanges(grid: any): void {
    if (!this.gridFormStatus) {
      this.alertService.error("There are some invalid fields");
      return;
    }

    grid.closeCell();
    grid.cancelCell();
    this.confirmValuation();

  }

  confirmValuation() {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `Do you really want to apply these changes ?`)
      .then((confirmed) => (confirmed) ? this.applyValuationChange() : console.log(confirmed))
      .catch((err) => console.log(err));
  }

  applyValuationChange() {
    const { userId } = this.currentUser
    this.editService.updateChanges(this.setToZero, { userId, ps: this.paymentScheduleInp });
  }

  cancelChanges(grid: any): void {
    grid.cancelCell();
    this.editService.cancelChanges();
  }

  private isReadOnly(field: string): boolean {
    let readOnlyColumns = ['assid', 'astconcataddress', 'outstandingpaymentvalue', 'settozero', 'woassstatus',
      'woavagreedupdatedate', 'woavagreedupdateuser', 'woavagreedvaluation', 'woavagreedvaluationpct', 'woavcalcpaymentvalue',
      'woavcommittedvalue', 'woavcontractorvaluation', 'woavcontractorvaluationpct', 'woavcontractupdatedate', 'woavcontractupdateuser', 'woavcreatedate', 'woavcreateuser', 'woavnotes', 'woavpaymentpcttodate', 'woavpaymenttodate',
      'woavpendingvalue', 'woavretentionvaluetodate', 'woavupdatedate', 'woavupdateuser', 'woavvaluationstatus',
      'wopname', 'wopsequence', 'wosequence', 'wpspaymentdate'
    ];

    if (this.paymentScheduleInp.wpspaymentstatus == "Unpaid") {
      readOnlyColumns = ['assid', 'astconcataddress', 'outstandingpaymentvalue', 'settozero', 'woassstatus',
        'woavagreedupdatedate', 'woavagreedupdateuser', 'woavcalcpaymentvalue', 'woavcommittedvalue', 'woavcontractupdatedate', 'woavcontractupdateuser', 'woavcreatedate', 'woavcreateuser', 'woavnotes', 'woavpaymentpcttodate', 'woavpaymenttodate', 'woavpendingvalue', 'woavretentionvaluetodate', 'woavupdatedate', 'woavupdateuser', 'woavvaluationstatus', 'wopname', 'wopsequence', 'wosequence', 'wpspaymentdate'
      ];
    }

    if (!this.woMenuAccess('Enter Contractor Valuations') || this.worksOrderNew?.wocodE2 == "N") {
      readOnlyColumns.push('woavcontractorvaluation');
      readOnlyColumns.push('woavcontractorvaluationpct')
    }

    if (!this.woMenuAccess('Enter Agreed Valuations')) {
      readOnlyColumns.push('woavagreedvaluation');
      readOnlyColumns.push('woavagreedvaluationpct')
    }

    return readOnlyColumns.indexOf(field) > -1;
  }


  closeValuation() {
    this.openValuationWindow = false;
    this.closeValuationWindow.emit(false);
    this.editService.reset();
  }


  requiredPageData() {
    const { wosequence } = this.worksOrderData;
    this.subs.add(
      forkJoin([
        this.editService.getAssetValuationTotal(this.paymentScheduleInp),
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
      ]).subscribe(
        data => {
          console.log(data);
          const assetValuationTotal: any = data[0];
          this.AssetValuationTotal = assetValuationTotal.data[0] ?? [];
          const worksOrderNew = data[1];
          if (worksOrderNew.isSuccess) this.worksOrderNew = worksOrderNew.data;
          this.chRef.detectChanges();
        }
      )
    )
  }

  // getAssetValuationTotal() {
  //   this.subs.add(
  //     this.editService.getAssetValuationTotal(this.paymentScheduleInp).subscribe(
  //       (data: any) => {
  //         if (data.isSuccess) {
  //           this.AssetValuationTotal = data.data[0] ?? [];
  //           this.chRef.detectChanges();
  //         } else this.alertService.error(data.message);
  //       }, err => this.alertService.error(err)
  //     )
  //   )
  // }


  openGloabalValuation() {
    this.initializeGlobalValuationForm();
    $(".valuationOverlay").addClass("ovrlay");
    this.openGlobalValuation = true;
    this.chRef.detectChanges();
  }

  closeGlobalValuation() {
    this.openGlobalValuation = false;
    $(".valuationOverlay").removeClass("ovrlay");
  }

  initializeGlobalValuationForm() {
    this.globalvaluationForm = this.formBuilder.group({
      cvt: ['N'],
      cvv: [''],
      cvp: [''],
      avt: ['N'],
      avv: [''],
      avp: [''],
      addNotes: ['N'],
      notes: [''],
    });

    const disableFields = ['cvv', 'cvp', 'avv', 'avp', 'notes'];
    for (const disableField of disableFields) {
      this.globalvaluationForm.get(disableField).disable();
    }

    const cvtCtr = this.globalvaluationForm.get('cvt');
    const avtCtr = this.globalvaluationForm.get('avt');
    const addNotesCtr = this.globalvaluationForm.get('addNotes');

    this.subs.add(
      cvtCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(
        val => {
          if (val == "P") {
            this.globalvaluationForm.get('cvp').enable();
            this.globalvaluationForm.get('cvv').disable();
            this.globalvaluationForm.patchValue({ cvv: '' }, { emitEvent: false })
          }

          if (val == "V") {
            this.globalvaluationForm.get('cvv').enable();
            this.globalvaluationForm.get('cvp').disable();
            this.globalvaluationForm.patchValue({ cvp: '' }, { emitEvent: false })
          }

          if (val == "N") {
            this.globalvaluationForm.get('cvp').disable();
            this.globalvaluationForm.get('cvv').disable();
            this.globalvaluationForm.patchValue({ cvv: '' }, { emitEvent: false })
            this.globalvaluationForm.patchValue({ cvp: '' }, { emitEvent: false })
          }

          this.globalvaluationForm.get('cvp').updateValueAndValidity({ emitEvent: false });
          this.globalvaluationForm.get('cvv').updateValueAndValidity({ emitEvent: false });
        }
      ),


      avtCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(
        val => {
          if (val == "P") {
            this.globalvaluationForm.get('avp').enable();
            this.globalvaluationForm.get('avv').disable();
            this.globalvaluationForm.patchValue({ avv: '' }, { emitEvent: false })
          }

          if (val == "V") {
            this.globalvaluationForm.get('avv').enable();
            this.globalvaluationForm.get('avp').disable();
            this.globalvaluationForm.patchValue({ avp: '' }, { emitEvent: false })
          }

          if (val == "N") {
            this.globalvaluationForm.get('avp').disable();
            this.globalvaluationForm.get('avv').disable();
            this.globalvaluationForm.patchValue({ avv: '' }, { emitEvent: false })
            this.globalvaluationForm.patchValue({ avp: '' }, { emitEvent: false })
          }

          this.globalvaluationForm.get('avp').updateValueAndValidity({ emitEvent: false });
          this.globalvaluationForm.get('avv').updateValueAndValidity({ emitEvent: false });
        }
      ),


      addNotesCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(
        val => {
          if (val == "A") {
            this.globalvaluationForm.get('notes').enable();
          }

          if (val == "N") {
            this.globalvaluationForm.get('notes').disable();
            this.globalvaluationForm.patchValue({ notes: '' }, { emitEvent: false })
          }

          this.globalvaluationForm.get('notes').updateValueAndValidity({ emitEvent: false });
        }
      )

    )

  }

  formErrorObject() {
    this.formErrors = {
      cvt: '',
      cvv: '',
      cvp: '',
      avt: '',
      avv: '',
      avp: '',
      addNotes: '',
      notes: '',
    }
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


  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error or reinistialize 

    let formRawVal = this.globalvaluationForm.getRawValue();
    const { cvv, cvp, avv, avp, notes } = formRawVal;
    const { rowIndex, dataItem } = this.kendoRowDetail;
    const { woavcommittedvalue, woavcontractorvaluation, woavcontractorvaluationpct, woavagreedvaluation, woavagreedvaluationpct } = dataItem;

    if (cvv) {
      const val = dataItem.woavcontractorvaluation = parseFloat(this.helperService.convertMoneyToFlatFormat(cvv))
      if (val > 0 && woavcommittedvalue > 0) {
        const perc = this.toFix((val / woavcommittedvalue) * 100, 2);
        const conPct = this.applyHundredPercentVlaue(val, woavcommittedvalue, perc);
        if (this.toFix(woavcontractorvaluationpct, 2) != conPct) {
          dataItem.woavcontractorvaluationpct = parseFloat(conPct);
        }
      } else if (val == 0) {
        dataItem.woavcontractorvaluationpct = 0;
      }
    };

    if (cvp) {
      const val = dataItem.woavcontractorvaluationpct = parseFloat(cvp);
      const conVal = this.toFix((woavcommittedvalue * val) / 100, 2);
      if (this.toFix(woavcontractorvaluation.value, 2) != conVal) {
        dataItem.woavcontractorvaluation = parseFloat(conVal);
      }
    }

    if (avv) {
      const val = dataItem.woavagreedvaluation = parseFloat(this.helperService.convertMoneyToFlatFormat(avv));
      if (val > 0 && woavcommittedvalue > 0) {
        const perc = this.toFix((val / woavcommittedvalue) * 100, 2);
        const agPct = this.applyHundredPercentVlaue(val, woavcommittedvalue, perc);
        if (this.toFix(woavagreedvaluationpct, 2) != agPct) {
          dataItem.woavagreedvaluationpct = parseFloat(agPct);
        }
      } else if (val == 0) {
        dataItem.woavagreedvaluationpct = 0;
      }
    }

    if (avp) {
      const val = dataItem.woavagreedvaluationpct = parseFloat(avp);
      const agVal = this.toFix((woavcommittedvalue * val) / 100, 2);
      if (this.toFix(woavagreedvaluation, 2) != agVal) {
        dataItem.woavagreedvaluation = parseFloat(agVal);
      }
    }

    if (notes) dataItem.woavnotes = notes;

    this.editService.update(dataItem);
    this.closeGlobalValuation()


  }



  setValutionToZero() {
    if (this.selectedValuation) {
      this.selectedValuation.woavagreedvaluation = 0;
      this.selectedValuation.woavagreedvaluationpct = 0;
      this.selectedValuation.woavvaluationstatus = 'Set to Zero';
      this.setToZero = true;
    }
  }


  woMenuAccess(menuName) {
    return this.helperService.checkWorkOrderAreaAccess(this.userType, this.worksOrderAccess, this.worksOrderUsrAccess, menuName)
  }

}
