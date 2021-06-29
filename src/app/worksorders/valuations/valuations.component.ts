import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { process, State } from '@progress/kendo-data-query';
import { AlertService, EditPaymentScheduleService } from 'src/app/_services';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { WorkOrdersValuationModel } from '../../_models'

@Component({
  selector: 'app-valuations',
  templateUrl: './valuations.component.html',
  styleUrls: ['./valuations.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ValuationsComponent implements OnInit {
  @Output() closeValuationWindow = new EventEmitter<boolean>();
  @Input() openValuationWindow = false;
  @Input() worksOrderData: any;
  @Input() paymentScheduleInp: any;
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


  constructor(
    private formBuilder: FormBuilder,
    public editService: EditPaymentScheduleService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService
  ) {
    this.createFormGroup = this.createFormGroup.bind(this);
    this.editService.setServiceFor('valuation');
  }

  ngOnInit(): void {
    console.log({ ps: this.paymentScheduleInp, wo: this.worksOrderData })
    this.getAssetValuationTotal();
    this.view = this.editService.pipe(map(data => process(data, this.gridState)));
    this.editService.read(this.paymentScheduleInp);
    this.gridLoading = false;
    
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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
      woavagreedvaluation: dataItem.woavagreedvaluation,
      woavagreedvaluationpct: dataItem.woavagreedvaluationpct,
      woavcalcpaymentvalue: dataItem.woavcalcpaymentvalue,
      woavcommittedvalue: dataItem.woavcommittedvalue,
      woavcontractorvaluation: dataItem.woavcontractorvaluation,
      woavcontractorvaluationpct: dataItem.woavcontractorvaluationpct,
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


  cellClickHandler({ sender, rowIndex, column, columnIndex, dataItem, isEdited }) {
    if (!isEdited && !this.isReadOnly(column.field)) {
      let scheduleForm: FormGroup = this.createFormGroup(dataItem)
      sender.editCell(rowIndex, columnIndex, scheduleForm);

      //set  0 if retention or retention value changes
      // const retentionCtr = scheduleForm.get('wpsretentionpct');
      // const retentionValueCtr = scheduleForm.get('wpsretentionvalue');
      // this.subs.add(
      //   retentionCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      //     if (val == null) return;
      //     dataItem.wpsretentionvalue = 0;
      //     scheduleForm.patchValue({ wpsretentionvalue: 0 }, { emitEvent: false });
      //     retentionCtr.updateValueAndValidity({ emitEvent: false });
      //   }),

      //   retentionValueCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      //     if (val == null) return;
      //     dataItem.wpsretentionpct = 0
      //     scheduleForm.patchValue({ wpsretentionpct: 0 }, { emitEvent: false });
      //     retentionValueCtr.updateValueAndValidity({ emitEvent: false });
      //   }),
      // )
    }

  }


  cellCloseHandler(args: any) {
    const { formGroup, dataItem } = args;
    // console.log({ args: args })
    if (!formGroup.valid) {
      // prevent closing the edited cell if there are invalid values.
      args.preventDefault();
    } else if (formGroup.dirty) {
      this.editService.assignValues(dataItem, formGroup.value);
      this.editService.update(dataItem);
    }
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
    grid.closeCell();
    grid.cancelCell();
    this.editService.saveChanges();
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
    return readOnlyColumns.indexOf(field) > -1;
  }


  closeValuation() {
    this.openValuationWindow = false;
    this.closeValuationWindow.emit(false);
    this.editService.reset();
  }

  getAssetValuationTotal() {
    this.subs.add(
      this.editService.getAssetValuationTotal(this.paymentScheduleInp).subscribe(
        (data: any) => {
          console.log(data)
          if (data.isSuccess) {
            this.AssetValuationTotal = data.data[0] ?? [];
            this.chRef.detectChanges();
          } else this.alertService.error(data.message);
        }, err => this.alertService.error(err)
      )
    )
  }

}
