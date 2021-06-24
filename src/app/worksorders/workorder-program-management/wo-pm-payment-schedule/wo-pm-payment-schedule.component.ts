import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ReportingGroupService, HelperService, LoaderService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-wo-program-management-payment-schedule',
  templateUrl: './wo-pm-payment-schedule.component.html',
  styleUrls: ['./wo-pm-payment-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoProgramManagmentPaymentScheduleComponent implements OnInit {
  @Input() openWOPaymentScheduleWindow: boolean = false;
  @Output() closePaymentScheduleWindowEvent = new EventEmitter<boolean>();
  @Input() worksOrderData: any;

  subs = new SubSink();

  state: State = {
    skip: 0,
    sort: [{ field: 'woname', dir: 'asc' }],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  public allowUnsort = true;
  public multiple = false;
  public mySelection: any[] = [];

  disabled = false;
  ShowFilter = false;
  gridView: DataResult;
  gridLoading = true
  title = 'Payment Schedule';
  GridData: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  loading = false;

  public dropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  public paymentScheduleData;
  openWOEditPaymentScheduleWindow : boolean;
  openWOAddPaymentScheduleWindow : boolean;
  openWOCreatePaymentScheduleWindow : boolean;

  constructor(
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit(): void {
    $('.wopmpaymentoverlay').addClass('ovrlay');
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
            this.paymentScheduleData = data.data;
            this.gridView = process(this.paymentScheduleData, this.state);
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


  closePaymentScheduleWin() {
    this.openWOPaymentScheduleWindow = false;
    this.closePaymentScheduleWindowEvent.emit(false);
  }

  openWOEditPaymentSchedule(){
    this.openWOEditPaymentScheduleWindow = true;
  }

  closeEditPaymentScheduleWindow($event){
    this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
    this.openWOEditPaymentScheduleWindow = $event;
    $(".wopmeditpaymentoverlay").removeClass("ovrlay");
  }

  openWOAddPaymentSchedule(){
    this.openWOAddPaymentScheduleWindow = true;
  }

  closeAddPaymentScheduleWindow($event){
    this.openWOAddPaymentScheduleWindow = $event;
    $(".wopmaddpaymentoverlay").removeClass("ovrlay");
    this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
  }

  openWOCreatePaymentSchedule(){
    if(this.paymentScheduleData.length > 0){
      this.alertService.warning("Works Order already has a Payment Schedule.");
      return;
    }
    this.openWOCreatePaymentScheduleWindow = true;
  }

  closeCreatePaymentScheduleWindow($event){
    this.openWOCreatePaymentScheduleWindow = $event;
    $(".wopmcreatepaymentoverlay").removeClass("ovrlay");
    this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
  }

}
