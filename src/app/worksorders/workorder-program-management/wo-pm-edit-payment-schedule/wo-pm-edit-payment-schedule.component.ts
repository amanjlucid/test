import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, WorksOrdersService, EditPaymentScheduleService } from 'src/app/_services';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { WorkOrdersPaymentScheduleModel } from '../../../_models'

@Component({
  selector: 'app-wo-program-management-edit-payment-schedule',
  templateUrl: './wo-pm-edit-payment-schedule.component.html',
  styleUrls: ['./wo-pm-edit-payment-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoProgramManagmentEditPaymentScheduleComponent implements OnInit {
  @Output() closeEditPaymentScheduleWindowEvent = new EventEmitter<boolean>();
  @Input() openWOEditPaymentScheduleWindow: boolean = false;
  @Input() worksOrderData: any;
  subs = new SubSink();
  title = 'Edit Payment Schedule';
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

  constructor(
    private formBuilder: FormBuilder,
    public editService: EditPaymentScheduleService,
  ) {
    this.createFormGroup = this.createFormGroup.bind(this);
  }

  ngOnInit(): void {
    this.view = this.editService.pipe(map(data => process(data, this.gridState)));
    this.editService.read(this.worksOrderData);
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
      'wpsstartdate': dataItem.wpsstartdate,
      'wpsenddate': dataItem.wpsenddate,
      'wpspaymentdate': dataItem.wpspaymentdate,
      'wpspaymentstatus': dataItem.wpspaymentstatus,
      'wpsfixedpaymentvalue': dataItem.wpsfixedpaymentvalue,
      'wpsretentionpct': [dataItem.wpsretentionpct, [Validators.required, Validators.pattern("^[0-9.]*$"), Validators.maxLength(5)]],
      'wpsretentionvalue': [dataItem.wpsretentionvalue, [Validators.required, Validators.pattern("^[0-9.]*$"), Validators.maxLength(15)]],
    });
  }


  cellClickHandler({ sender, rowIndex, column, columnIndex, dataItem, isEdited }) {
    if (!isEdited && !this.isReadOnly(column.field)) {
      let scheduleForm: FormGroup = this.createFormGroup(dataItem)
      sender.editCell(rowIndex, columnIndex, scheduleForm);

      //set  0 if retention or retention value changes
      const retentionCtr = scheduleForm.get('wpsretentionpct');
      const retentionValueCtr = scheduleForm.get('wpsretentionvalue');
      this.subs.add(
        retentionCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
          if (val == null) return;
          dataItem.wpsretentionvalue = 0;
          scheduleForm.patchValue({ wpsretentionvalue: 0 }, { emitEvent: false });
          retentionCtr.updateValueAndValidity({ emitEvent: false });
        }),

        retentionValueCtr.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
          if (val == null) return;
          dataItem.wpsretentionpct = 0
          scheduleForm.patchValue({ wpsretentionpct: 0 }, { emitEvent: false });
          retentionValueCtr.updateValueAndValidity({ emitEvent: false });
        }),
      )
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
    sender.addRow(this.createFormGroup(new WorkOrdersPaymentScheduleModel()));
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
    const readOnlyColumns = ['wpsstartdate', 'wpsenddate', 'wpspaymentdate', 'wpspaymentstatus', 'wpsfixedpaymentvalue'];
    return readOnlyColumns.indexOf(field) > -1;
  }


  closeEditPaymentScheduleWin() {
    this.openWOEditPaymentScheduleWindow = false;
    this.closeEditPaymentScheduleWindowEvent.emit(false);
    this.editService.reset();
  }


}
