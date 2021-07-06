import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, WorksorderReportService, ConfirmationDialogService, WorksOrdersService, SharedService } from 'src/app/_services';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DateFormatPipe } from 'src/app/_pipes/date-format.pipe';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-wo-program-management-payment-schedule',
  templateUrl: './wo-pm-payment-schedule.component.html',
  styleUrls: ['./wo-pm-payment-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class WoProgramManagmentPaymentScheduleComponent implements OnInit {
  @Output() closePaymentScheduleWindowEvent = new EventEmitter<boolean>();
  @Input() openWOPaymentScheduleWindow: boolean = false;
  @Input() worksOrderData: any;
  subs = new SubSink();
  title = 'Payment Schedule';
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  gridView: DataResult;
  selectableSettings: SelectableSettings;
  gridLoading = true;
  mySelection: any[] = [];
  gridData: any = [];
  pageSize = 25;
  openWOEditPaymentScheduleWindow = false;
  WOPaymentsWindow = false;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  openWOAddPaymentScheduleWindow: boolean;
  openWOCreatePaymentScheduleWindow: boolean;
  //valuation
  openValuationWindow = false;
  valuationBtnAccess: boolean = false;
  paymentScheduleExist = false;




  public allowUnsort = true;
  public multiple = false;

  disabled = false;
  ShowFilter = false;
  GridData: any;

  loading = false;
  selectedItem: any;
  AssetValuationTotal: any;
  enterValuationWindow = false;
  valuation_state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  ValuationGridData: any;
  ValuationgridView: DataResult;
  selectedValuationItem: any;
  DisplayPaymentAssetsWindow = false;
  display_payment_asset_state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  DisplayPaymentAssetsData: any;
  DisplayPaymentAssetsView: DataResult;

  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];


  constructor(
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
    private worksOrderReportService: WorksorderReportService,
  ) {
    this.setSelectableSettings();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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

    this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
  }

  //am
  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  GetWEBWorksOrdersPaymentScheduleForWorksOrder() {
    const { wprsequence, wosequence } = this.worksOrderData;
    this.subs.add(
      this.worksOrdersService.getWEBWorksOrdersPaymentScheduleForWorksOrder(wprsequence, wosequence).subscribe(
        data => {
          if (data.isSuccess) {
            this.gridData = data.data;
            if (this.gridData.length > 0) this.paymentScheduleExist = true;
            else this.paymentScheduleExist = false;
            this.gridView = process(this.gridData, this.state);
          } else this.alertService.error(data.message);

          this.gridLoading = false;
          this.chRef.detectChanges();

        }, err => this.alertService.error(err)
      )
    )

  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.gridData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.gridData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.gridData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.gridData.length
    };
  }

  cellClickHandler({ dataItem }) {
    //check valuation btn visibility
    this.setSelectedRow(dataItem);
  }

  async openValuationWindowMehhod(item, checkProcess = "C") {
    if (item.wpspaymentstatus == "Unpaid" && checkProcess == "C") {
      const refresh = await this.checkBeforeValuation(item);
      if (!refresh.isSuccess) this.alertService.error(refresh.message);
      if (refresh.data.validYN == "N") this.alertService.error(refresh.data.validationMessage);
      if (refresh.data.validYN == "Y") this.valuationConfirmation(refresh.data, item);
      return;
    }

    this.selectedItem = item;
    $(".wopmpaymentoverlay").addClass("ovrlay");
    this.openValuationWindow = true;
    this.chRef.detectChanges();
  }


  closeValuationWindow(event) {
    this.openValuationWindow = event;
    $(".wopmpaymentoverlay").removeClass("ovrlay");
    this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
  }


  async checkBeforeValuation(item) {
    const { wpspaymentdate, wosequence } = item;
    const startDate = this.helperService.getMDY(wpspaymentdate);
    const params = {
      "WOSEQUENCE": wosequence,
      "WPSPAYMENTDATE": startDate,
      "strUser": this.currentUser.userId
    };

    return await this.worksOrdersService.WorksOrderRefreshAssetValuation(params).toPromise();

  }


  valuationConfirmation(resp, item) {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('', `${resp.validationMessage}`, false)
      .then((confirmed) => this.openValuationWindowMehhod(item, "P"))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }


  disableEnterValuationBtn(item) {
    if (this.worksOrderData.wocontracttype != 'VALUATION') return true
    if (this.valuationBtnAccess) return false;
    return true;
  }


  async setSelectedRow(item) {
    const { wosequence, wpspaymentdate, wpspaymentstatus, miN_PAYMENTDATE } = item;
    const paydate = this.helperService.getMDY(wpspaymentdate);
    const minPayDate = this.helperService.getMDY(miN_PAYMENTDATE);
    const checkValuaionVisibility = await this.worksOrdersService.checkEnterValuationButtonVisibility(wosequence, paydate, wpspaymentstatus, minPayDate).toPromise();
    this.valuationBtnAccess = checkValuaionVisibility.data;
    this.chRef.detectChanges();
  }


  openWOPMPayments() {
    $('.wopmpaymentoverlay').addClass('ovrlay');
    this.WOPaymentsWindow = true;
  }

  closeWOPMPaymentsWindow($event) {
    $('.wopmpaymentoverlay').removeClass('ovrlay');
    this.WOPaymentsWindow = $event;
  }


  openWOAddPaymentSchedule() {
    $('.wopmpaymentoverlay').addClass('ovrlay');
    this.openWOAddPaymentScheduleWindow = true;
  }

  closeAddPaymentScheduleWindow(eve) {
    $('.wopmpaymentoverlay').removeClass('ovrlay');
    this.openWOAddPaymentScheduleWindow = eve;
    this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
  }

  openWOCreatePaymentSchedule() {
    if(this.paymentScheduleExist){
      this.alertService.error("Works Order already has a Payment Schedule.")
      return
    }
    $('.wopmpaymentoverlay').addClass('ovrlay');
    this.openWOCreatePaymentScheduleWindow = true;
  }

  closeCreatePaymentScheduleWindow(eve) {
    $('.wopmpaymentoverlay').removeClass('ovrlay');
    this.openWOCreatePaymentScheduleWindow = eve;
    this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
  }


  rquestPayment(item) {
    const { wosequence, wprsequence, wpspaymentdate } = item;
    const params = {
      "wosequence": wosequence,
      "wprsequence": wprsequence,
      "wpspaymentdate": this.helperService.getMDY(wpspaymentdate),
      "strUser": this.currentUser.userId
    };

    this.subs.add(
      this.worksOrdersService.WorksOrdersValidateInsertPayment(params).subscribe(
        data => {
          if (data.isSuccess) {
            const resultData = data.data;
            if (resultData.validYN == 'N') {
              this.alertService.error(resultData.validationMessage);
              return;
            }
            this.createPaymentScheduleConfirm(resultData, item);
          } else this.alertService.error(data.message);
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )

  }


  createPaymentScheduleConfirm(resp, item) {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${resp.validationMessage}`)
      .then((confirmed) => (confirmed) ? this.WebWorksOrdersInsertPayment(item) : console.log(confirmed))
      .catch((err) => console.log(err));
  }

  WebWorksOrdersInsertPayment(item) {
    const { wosequence, wprsequence, wpspaymentdate } = item;
    const params = {
      "wosequence": wosequence,
      "wprsequence": wprsequence,
      "wpspaymentdate": this.helperService.getMDY(wpspaymentdate),
      "strUser": this.currentUser.userId
    };


    this.subs.add(
      this.worksOrdersService.WebWorksOrdersInsertPayment(params).subscribe(
        data => {
          if (data.isSuccess) {
            let resultData = data.data;
            if (resultData.validYN == 'Y') {
              this.alertService.success('Payment Requested');
              this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
            } else this.alertService.error(resultData.validationMessage);
          } else this.alertService.error(data.message);
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )

  }

  
  woMenuAccess(menuName) {
    return this.helperService.checkWorkOrderAreaAccess(this.userType, this.worksOrderAccess, this.worksOrderUsrAccess, menuName)
  }

  //am





  openWOEditPaymentSchedule() {
    $(".wopmpaymentoverlay").addClass("ovrlay");
    this.openWOEditPaymentScheduleWindow = true;
  }

  closeEditPaymentScheduleWindow(event) {
    this.openWOEditPaymentScheduleWindow = event;
    $(".wopmpaymentoverlay").removeClass("ovrlay");
  }










  display_payment_asset__sortChange(sort: SortDescriptor[]): void {
    this.display_payment_asset_state.sort = sort;
    this.DisplayPaymentAssetsView = process(this.DisplayPaymentAssetsData, this.display_payment_asset_state);
    this.chRef.detectChanges();
  }

  display_payment_asset_filterChange(filter: any): void {
    this.display_payment_asset_state.filter = filter;
    this.DisplayPaymentAssetsView = process(this.DisplayPaymentAssetsData, this.display_payment_asset_state);
    this.chRef.detectChanges();
  }




  valuation_sortChange(sort: SortDescriptor[]): void {
    this.valuation_state.sort = sort;
    this.ValuationgridView = process(this.ValuationGridData, this.valuation_state);
    this.chRef.detectChanges();
  }

  valuation_filterChange(filter: any): void {
    this.valuation_state.filter = filter;
    this.ValuationgridView = process(this.ValuationGridData, this.valuation_state);
    this.chRef.detectChanges();
  }


  valuation_cellClickHandler({
    sender,
    column,
    rowIndex,
    columnIndex,
    dataItem,
    isEditedselectedInstructionRow
  }) {
    this.selectedValuationItem = dataItem;
  }


  closGetWebWorksOrderPaymentScheduleDetailsWindow() {
    this.DisplayPaymentAssetsWindow = false;
  }

  GetWebWorksOrderPaymentScheduleDetailsClick(item) {

    this.DisplayPaymentAssetsWindow = true;

    this.selectedItem = item;

    var date = new Date(this.selectedItem.wpspaymentdate);
    let startdate = (((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());


    const params = {
      "wosequence": this.selectedItem.wosequence,
      "paymentdate": startdate,
    };

    const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');



    this.subs.add(
      this.worksOrdersService.GetWebWorksOrderPaymentScheduleDetails(qs).subscribe(
        data => {

          if (data.isSuccess) {

            let resultData = data.data;


            this.DisplayPaymentAssetsData = resultData;


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


  WorksResetPendingScheduleCall(item) {
    const { wpspaymentstatus = '' } = item;
    if (wpspaymentstatus.toLowerCase() == 'paid' || wpspaymentstatus.toLowerCase() == 'unpaid') {
      return
    }

    this.selectedItem = item;

    var date = new Date(this.selectedItem.wpspaymentdate);
    let startdate = (((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());


    const params = {
      "WPRSEQUENCE": this.selectedItem.wprsequence,
      "WOSEQUENCE": this.selectedItem.wosequence,
      "WPSPAYMENTDATE": startdate,
      "strUser": this.currentUser.userId,

    };


    this.subs.add(
      this.worksOrdersService.WorksResetPendingSchedule(params).subscribe(
        data => {
          if (data.isSuccess) {
            let resultData = data.data;
            if (resultData.validYN == 'Y') {
              this.alertService.success(resultData.validationMessage);
              this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
            } else {
              this.alertService.error(resultData.validationMessage);
            }
          } else {
            this.alertService.error(data.message);
            this.loading = false
          }

          this.chRef.detectChanges();

          // console.log('WorkOrderRefusalCodes api reponse' + JSON.stringify(data));
        },
        err => this.alertService.error(err)
      )
    )




  }


  PaymentReconcillationClick(item, xPortId, reportName) {

    this.selectedItem = item;

    this.chRef.detectChanges();


    let start_date = DateFormatPipe.prototype.transform(this.selectedItem.wpsstartdate, 'YYYYMMDD');
    let end_date = DateFormatPipe.prototype.transform(this.selectedItem.wpsenddate, 'YYYYMMDD');

    console.log('start_date is ' + start_date);
    console.log('end_date is ' + end_date);


    this.selectedItem.wpsstartdate_YYYYMMDD = start_date
    this.selectedItem.wpsenddate_YYYYMMDD = end_date

    this.chRef.detectChanges();


    console.log('selectedItem new  ' + JSON.stringify(this.selectedItem));

    this.WOCreateXportOutputReport(xPortId, reportName);

  }

  WOCreateXportOutputReport(xPortId, reportName) {



    let params = {
      "intXportId": xPortId,
      "lstParamNameValue": ["Works Order Number", this.worksOrderData.wosequence],
      "lngMaxRows": 40000
    };
    if (xPortId == 587 || xPortId == 588) {
      params.lstParamNameValue = ["Master Works Order", this.worksOrderData.wosequence];
    }
    if (xPortId == 523) {
      params.lstParamNameValue = ["Work Programme", this.worksOrderData.wosequence];
    }


    if (xPortId == 529) {
      params.lstParamNameValue = ["Payment Rec to YYYYMMDD", this.selectedItem.wpsenddate_YYYYMMDD, "Payment Rec from YYYYMMDD", this.selectedItem.wpsstartdate_YYYYMMDD, "Works Order Number", this.worksOrderData.wosequence];




    }



    this.worksOrderReportService.WOCreateXportOutput(params).subscribe(
      (data) => {

        const { columns, rows } = data[0];
        const tempCol = columns.map(x => x.columnName);
        const tempRow = rows.map(x => x.values);
        let result: any;
        let label: any;

        if (tempRow.length > 0) {
          result = tempRow.map(x => x.reduce(function (result, field, index) {
            var fieldKey = tempCol[index].replace(new RegExp(" ", 'g'), "");
            result[fieldKey] = field;
            return result;
          }, {}));

          label = tempCol.reduce(function (result, field) {
            var fieldKey = field.replace(new RegExp(" ", 'g'), "");
            result[fieldKey] = field;
            return result;
          }, {});

          let fileName = reportName + " " + this.worksOrderData.wosequence;
          this.helperService.exportAsExcelFile(result, fileName, label);
        } else {
          this.alertService.error("No Record Found.");
        }
        this.chRef.detectChanges();
      },
      error => {
        this.alertService.error(error);

      }
    )
  }


  SetValuationToZeroPaymentClick(item) {

    this.selectedValuationItem = item;

    console.log('valuation selected Ite, ' + JSON.stringify(this.selectedValuationItem));


    var date = new Date(this.selectedValuationItem.wpspaymentdate);
    let startdate = (((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());



    let model = [{
      "wopsequence": this.selectedValuationItem.wopsequence,
      "wosequence": this.selectedValuationItem.wosequence,
      "wpspaymentdate": startdate,
      "assid": this.selectedValuationItem.assid,


    }];

    const params = {
      "struserid": this.currentUser.userId,
      "model": model,
    };



    this.subs.add(
      this.worksOrdersService.SetValuationToZeroPayment(params).subscribe(
        data => {


          if (data.isSuccess) {

            let resultData = data.data;
            if (resultData.validYN == 'Y') {

              this.alertService.success(resultData.validationMessage);

              this.GetWebWorksOrdersAssetValuationTotal();
              this.GetWebWorksOrdersAssetValuation();

            } else {
              this.alertService.error(resultData.validationMessage);

            }


          } else {
            this.alertService.error(data.message);
            this.loading = false
          }




          this.chRef.detectChanges();

          // console.log('WorkOrderRefusalCodes api reponse' + JSON.stringify(data));
        },
        err => this.alertService.error(err)
      )
    )
  }



  GetWebWorksOrdersAssetValuationTotal() {
    var date = new Date(this.selectedItem.wpspaymentdate);
    let startdate = (((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());


    const params = {
      "wosequence": this.selectedItem.wosequence,
      "paymentdate": startdate,
    };

    const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');



    this.subs.add(
      this.worksOrdersService.GetWebWorksOrdersAssetValuationTotal(qs).subscribe(
        data => {


          ///  console.log('GetWebWorksOrdersAssetValuationTotal api response ' + JSON.stringify(data));

          if (data.isSuccess) {

            let resultData = data.data;


            this.AssetValuationTotal = resultData[0];


          } else {
            this.alertService.error(data.message);
            this.loading = false
          }

          this.chRef.detectChanges();

          // console.log('WorkOrderRefusalCodes api reponse' + JSON.stringify(data));
        },
        err => this.alertService.error(err)
      )
    )


  }

  GetWebWorksOrdersAssetValuation() {


    var date = new Date(this.selectedItem.wpspaymentdate);
    let startdate = (((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());


    const params = {
      "wosequence": this.selectedItem.wosequence,
      "paymentdate": startdate,
    };

    const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');



    this.subs.add(
      this.worksOrdersService.GetWebWorksOrdersAssetValuation(qs).subscribe(
        data => {


          //  console.log('GetWebWorksOrdersAssetValuation api response ' + JSON.stringify(data));

          if (data.isSuccess) {


            this.ValuationGridData = data.data;



          } else {
            this.alertService.error(data.message);
            this.loading = false
          }

          this.chRef.detectChanges();

          // console.log('WorkOrderRefusalCodes api reponse' + JSON.stringify(data));
        },
        err => this.alertService.error(err)
      )
    )


  }




  WorksRefreshPaymentSchedule() {
    const { wosequence, wprsequence } = this.worksOrderData
    this.subs.add(
      this.worksOrdersService.WorksRefreshPaymentSchedule(wosequence, wprsequence).subscribe(
        data => {
          if (data.isSuccess) {
            let resultData = data.data;
            if (resultData.validYN == 'Y') this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
          } else this.alertService.error(data.message);
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )
  }






  closePaymentScheduleWin() {
    this.openWOPaymentScheduleWindow = false;
    this.closePaymentScheduleWindowEvent.emit(false);
  }








  enterValuation(item) {

    this.selectedItem = item;
    this.enterValuationWindow = true;


    var date = new Date(this.selectedItem.wpspaymentdate);
    let startdate = (((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());


    //alert(startdate);



    const params = {
      "WOSEQUENCE": this.selectedItem.wosequence,
      "WPSPAYMENTDATE": startdate,
      "strUser": this.currentUser.userId
    };



    this.subs.add(
      this.worksOrdersService.WorksOrderRefreshAssetValuation(params).subscribe(
        data => {


          // console.log('WorksOrderRefreshAssetValuation api response ' + JSON.stringify(data));

          if (data.isSuccess) {

            let resultData = data.data;

            // alert(resultData.validYN);

            if (resultData.validYN == 'Y') {


              this.alertService.warning(resultData.validationMessage);
              // this.alertService.success('Payment Requested');

              this.GetWebWorksOrdersAssetValuationTotal();
              this.GetWebWorksOrdersAssetValuation();

            } else {
              this.alertService.error(resultData.validationMessage);

            }


          } else {
            this.alertService.error(data.message);
            this.loading = false
          }

          this.chRef.detectChanges();

          // console.log('WorkOrderRefusalCodes api reponse' + JSON.stringify(data));
        },
        err => this.alertService.error(err)
      )
    )


  }


}
