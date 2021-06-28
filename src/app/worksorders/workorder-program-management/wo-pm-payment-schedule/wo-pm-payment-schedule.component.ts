import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ReportingGroupService, HelperService,WorksorderReportService, LoaderService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { DateFormatPipe } from 'src/app/_pipes/date-format.pipe';


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
  selectedItem: any;
  AssetValuationTotal :any;


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

  ValuationGridData :any;
  ValuationgridView : DataResult;
   selectedValuationItem :any;



  DisplayPaymentAssetsWindow  = false;
  display_payment_asset_state: State = {
       skip: 0,
       sort: [],
       group: [],
       filter: {
           logic: "or",
           filters: []
       }
   }

   DisplayPaymentAssetsData :any;
   DisplayPaymentAssetsView : DataResult;



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

  constructor(
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
    private worksOrderReportService: WorksorderReportService,
  ) { }

  ngOnInit(): void {

        this.AssetValuationTotal = {
            "wosequence": '',
            "wpspaymentdate": '',
            "totalcommittedvalue": '',
            "totalpendingvalue": 0,
            "totalpaymenttodate": 0,
            "totalpaymentpcttodate": 0,
            "totalcontractorvaluation": 0,
            "totalcontractorvaluationpct": 0,
            "totalagreedvaluation": 0,
            "totalagreedvaluationpct": 0,
            "totalcalcpaymentvalue": 0,
            "totaloutstandingpaymentvalue": 0
        };

    //  console.log('worksOrderData ' + JSON.stringify(this.worksOrderData) );

        this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();
  }


 todayDate(){

       var today = new Date();
       var dd = String(today.getDate()).padStart(2, '0');
       var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
       var yyyy = today.getFullYear();

       let today2 = mm + '/' + dd + '/' + yyyy;

       return today2;

 }
  ngOnDestroy() {
    this.subs.unsubscribe();
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


  closGetWebWorksOrderPaymentScheduleDetailsWindow(){

    this.DisplayPaymentAssetsWindow = false;
  }

  GetWebWorksOrderPaymentScheduleDetailsClick(item){

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


                ///  console.log('GetWebWorksOrdersAssetValuationTotal api response ' + JSON.stringify(data));

                if (data.isSuccess) {

                   let resultData = data.data;


                   this.DisplayPaymentAssetsData =resultData;


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
 WorksResetPendingScheduleCall(item){

      this.selectedItem = item;

       var date = new Date(this.selectedItem.wpspaymentdate);
           let startdate = (((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());


      const params = {
      "WPRSEQUENCE":this.selectedItem.wprsequence,
      "WOSEQUENCE":this.selectedItem.wosequence,
      "WPSPAYMENTDATE":startdate,
      "strUser":this.currentUser.userId,

      };


       this.subs.add(
           this.worksOrdersService.WorksResetPendingSchedule(params).subscribe(
               data => {


                 if (data.isSuccess) {

                    let resultData = data.data;
                     if(resultData.validYN == 'Y'){

                         this.alertService.success(resultData.validationMessage);

                         this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();

                     }else{
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


PaymentReconcillationClick(item,xPortId, reportName){

     this.selectedItem = item;

     this.chRef.detectChanges();


   let start_date   = DateFormatPipe.prototype.transform(this.selectedItem.wpsstartdate, 'YYYYMMDD');
   let end_date   = DateFormatPipe.prototype.transform(this.selectedItem.wpsenddate, 'YYYYMMDD');

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
      params.lstParamNameValue = ["Payment Rec to YYYYMMDD",this.selectedItem.wpsenddate_YYYYMMDD,"Payment Rec from YYYYMMDD",this.selectedItem.wpsstartdate_YYYYMMDD,"Works Order Number",this.worksOrderData.wosequence];




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


  SetValuationToZeroPaymentClick(item){

    this.selectedValuationItem = item;

    console.log('valuation selected Ite, ' + JSON.stringify(this.selectedValuationItem));


    var date = new Date(this.selectedValuationItem.wpspaymentdate);
        let startdate = (((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());



     let model = [{
          "wopsequence":this.selectedValuationItem.wopsequence,
       		"wosequence":this.selectedValuationItem.wosequence,
       		"wpspaymentdate":startdate,
       		"assid":this.selectedValuationItem.assid,


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
                  if(resultData.validYN == 'Y'){

                      this.alertService.success(resultData.validationMessage);

                      this.GetWebWorksOrdersAssetValuationTotal();
                      this.GetWebWorksOrdersAssetValuation();

                  }else{
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
  GetWebWorksOrdersAssetValuationTotal(){


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


                   this.AssetValuationTotal =resultData[0];


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

  GetWebWorksOrdersAssetValuation(){


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


 enterValuation(item){

   this.selectedItem =  item;
   this.enterValuationWindow =  true;




  //let startdate =  this.helperService.ddmmyyywithslash(this.selectedItem.wpspaymentdate , true);

// alert(this.selectedItem.wpspaymentdate);
 //this.helperService.getFormattedDate(this.selectedItem.wpspaymentdate);

  var date = new Date(this.selectedItem.wpspaymentdate);
      let startdate = (((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());


      //alert(startdate);



   const params = {
       "WOSEQUENCE": this.selectedItem.wosequence,
       "WPSPAYMENTDATE": startdate,
       "strUser":this.currentUser.userId
   };



     this.subs.add(
         this.worksOrdersService.WorksOrderRefreshAssetValuation(params).subscribe(
             data => {


                  // console.log('WorksOrderRefreshAssetValuation api response ' + JSON.stringify(data));

                 if (data.isSuccess) {

                    let resultData = data.data;

                    // alert(resultData.validYN);

                     if(resultData.validYN == 'Y'){


                         this.alertService.warning(resultData.validationMessage);
                        // this.alertService.success('Payment Requested');

                          this.GetWebWorksOrdersAssetValuationTotal();
                          this.GetWebWorksOrdersAssetValuation();

                     }else{
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


//   console.log('selectedItem  ' + JSON.stringify(this.selectedItem));



 }
 closeEnterValuationWindowWindow(){

   this.enterValuationWindow =  false;




 }



WorksRefreshPaymentSchedule(item){

  this.selectedItem =  item;

  const params = {
      "wosequence": item.wosequence,
      "wprsequence": item.wprsequence,
  };

  const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');



  this.subs.add(
      this.worksOrdersService.WorksRefreshPaymentSchedule(qs).subscribe(
          data => {


                //console.log('WorksRefreshPaymentSchedule api response ' + JSON.stringify(data));

              if (data.isSuccess) {

                 let resultData = data.data;

                  //alert(resultData.validYN);

                if(resultData.validYN == 'Y'){


                   this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();

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


WebWorksOrdersInsertPayment(){


  let paymentDate =  this.todayDate();

  const params = {
      "wosequence": this.selectedItem.wosequence,
      "wprsequence": this.selectedItem.wprsequence,
      "wpspaymentdate":paymentDate,
	     "strUser":this.currentUser.userId
  };



    this.subs.add(
        this.worksOrdersService.WebWorksOrdersInsertPayment(params).subscribe(
            data => {


                //  console.log('WebWorksOrdersInsertPayment api response ' + JSON.stringify(data));

                if (data.isSuccess) {

                   let resultData = data.data;

                    //alert(resultData.validYN);

                    if(resultData.validYN == 'Y'){


                      //  this.alertService.success(resultData.validationMessage);
                        this.alertService.success('Payment Requested');

                        this.GetWEBWorksOrdersPaymentScheduleForWorksOrder();

                    }else{
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

openConfirmationDialog(resp) {

    $('.k-window').css({
        'z-index': 1000
    });
    this.confirmationDialogService.confirm('Please confirm..', `${resp.validationMessage}`)
        .then((confirmed) => (confirmed) ? this.WebWorksOrdersInsertPayment() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
}

WorksOrdersValidateInsertPayment(item){

  this.selectedItem =  item;

  let paymentDate =  this.todayDate();

  const params = {
      "wosequence": this.selectedItem.wosequence,
      "wprsequence": this.selectedItem.wprsequence,
      "wpspaymentdate":paymentDate,
	     "strUser":this.currentUser.userId
  };



  this.subs.add(
      this.worksOrdersService.WorksOrdersValidateInsertPayment(params).subscribe(
          data => {


            //    console.log('WorksOrdersValidateInsertPayment api response ' + JSON.stringify(data));

              if (data.isSuccess) {

                 let resultData = data.data;

                //  alert(resultData.validYN);

                if(resultData.validYN == 'Y'){


                  this.openConfirmationDialog(resultData);

                }else{
                //   this.alertService.error(resultData.validationMessage);

                }

                 this.openConfirmationDialog(resultData);


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


  GetWEBWorksOrdersPaymentScheduleForWorksOrder() {


    const params = {
        "wprsequence": this.worksOrderData.wprsequence,
        "wosequence": this.worksOrderData.wosequence
    };

    const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');



    this.subs.add(
        this.worksOrdersService.GetWEBWorksOrdersPaymentScheduleForWorksOrder(qs).subscribe(
            data => {


            //      console.log('GetWEBWorksOrdersPaymentScheduleForWorksOrder api response ' + JSON.stringify(data));

                if (data.isSuccess) {

                    this.gridView = data.data;


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


    /*
    if (this.dataList.isSuccess) {
      let paymentData = this.dataList.data;
      this.gridView = process(paymentData, this.state);
      //this.loading = false;
    }
    */

    // this.subs.add(
    //   this.worksOrdersService.GetWEBWorksOrdersPaymentScheduleForWorksOrder(wprsequence, wosequence).subscribe(
    //     data => {
    //       if (data.isSuccess) {
    //         this.paymentScheduleData = data.data;
    //         this.gridView = process(this.paymentScheduleData, this.state);
    //         this.loading = false;
    //       } else {
    //         this.alertService.error(data.message);
    //         this.loading = false
    //       }
    //       this.chRef.detectChanges();
    //     },
    //     err => this.alertService.error(err)
    //   )
    // )
  }


  closePaymentScheduleWin() {
    this.openWOPaymentScheduleWindow = false;
    this.closePaymentScheduleWindowEvent.emit(false);
  }

}