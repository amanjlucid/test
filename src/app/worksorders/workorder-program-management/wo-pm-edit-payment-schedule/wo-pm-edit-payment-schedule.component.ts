import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ReportingGroupService, HelperService, LoaderService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-wo-program-management-edit-payment-schedule',
  templateUrl: './wo-pm-edit-payment-schedule.component.html',
  styleUrls: ['./wo-pm-edit-payment-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoProgramManagmentEditPaymentScheduleComponent implements OnInit {
  @Input() openWOEditPaymentScheduleWindow: boolean = false;
  @Output() closeEditPaymentScheduleWindowEvent = new EventEmitter<boolean>();
  @Input() worksOrderData : any;

  editPaymentForm : FormGroup;

  public editPaymentScheduleData;

  subs = new SubSink();

  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  public multiple = false;
  public mySelection: any[] = [];

  gridView: DataResult;
  gridLoading = true;
  title = 'Edit Payment Schedule';
  GridData: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  loading = true;

  constructor(
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit(): void {
    $(".wopmeditpaymentoverlay").addClass("ovrlay");
    this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  GetWEBWorksOrdersPaymentScheduleForWorksOrder() {
    const wprsequence = this.worksOrderData.wprsequence;
    const wosequence = this.worksOrderData.wosequence;

    this.subs.add(
      this.worksOrdersService.GetWEBWorksOrdersPaymentScheduleForWorksOrder(wprsequence, wosequence).subscribe(
        data => {
          if (data.isSuccess) {
            this.editPaymentScheduleData = data.data;
            this.gridView = process(this.editPaymentScheduleData, this.state);
            this.loading = false;
          } else {
            this.alertService.error(data.message);
            this.loading = false
          }
          this.chRef.detectChanges();
        },
        err => this.alertService.error(err)
      )
    )
  }

  public createFormGroup(dataItem: any): FormGroup {
    return this.fb.group({
      wpsretentionpct: [dataItem.wpsretentionpct, [Validators.required, Validators.pattern("^[0-9.]*$"), Validators.maxLength(5)]],
      wpsretentionvalue: [dataItem.wpsretentionvalue, [Validators.required, Validators.pattern("^[0-9.]*$"), Validators.maxLength(15)]],
    });
  }

  public cellClickHandler({
    sender,
    column,
    rowIndex,
    columnIndex,
    dataItem,
    isEdited,
  }) {
    let rowStatus = dataItem.wpspaymentstatus.toLowerCase();
    if (!isEdited &&  rowStatus!=="pending") {
      sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
    }
  }

  public cellCloseHandler(args: any) {
    const { formGroup, dataItem } = args;
    if (!formGroup.valid) {
      // prevent closing the edited cell if there are invalid values.
      args.preventDefault();
    } else if (formGroup.dirty) {
      this.assignValues(dataItem, formGroup.value);
    }
  }

  public assignValues(target: any, source: any): void {
    Object.assign(target, source);
  }
  

  submitPaymentData(gridData: any): void {

    console.log(gridData);

    const dataList = gridData.data.data;
    if(dataList.length > 0){
      this.loading = true;
      let dataListArray = dataList.map(x => ({wprsequence: x.wprsequence,wosequence:x.wosequence, wpspaymentdate:x.wpspaymentdate, wpsretentionpct:parseInt(x.wpsretentionpct), wpsretentionvalue:parseInt(x.wpsretentionvalue), wpsfixedpaymentvalue:x.wpsfixedpaymentvalue}));
      this.subs.add(
        this.worksOrdersService.bulkUpdateWorksOrderPaymentSchedule(dataListArray).subscribe(
          data => {
            if (data.isSuccess) {
              this.loading = true;
              this.closeEditPaymentScheduleWin();
              this.alertService.success("Payment Schedule Successfully Updated.");
            } else {
              this.loading = true;
              this.alertService.error(data.message);
            }
            this.chRef.detectChanges();
          },
          err => this.alertService.error(err)
        )
      )
    }
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.editPaymentScheduleData, this.state);
  }


  closeEditPaymentScheduleWin() {
    this.openWOEditPaymentScheduleWindow = false;
    this.closeEditPaymentScheduleWindowEvent.emit(false);
  }

}
