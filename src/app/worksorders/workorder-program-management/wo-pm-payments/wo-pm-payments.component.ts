import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService,WorksorderReportService, LoaderService, WorksorderManagementService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'app-wo-pm-payments',
    templateUrl: './wo-pm-payments.component.html',
    styleUrls: ['./wo-pm-payments.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoPmPaymentsComponent implements OnInit {
    @Input() WOPaymentsWindow: boolean = false;
    @Output() woPmPaymentsEvent = new EventEmitter<boolean>();
    @Input() worksOrderData: any;
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

    public filter: CompositeFilterDescriptor;
    pageSize = 25;
    title = 'Work Order Payment';

    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    loading = false;

    gridData: any;
    gridView: DataResult;
    selectedItem: any;
    instructionAssetsDetailWindow = false;
    selectedInstructionAssetRow: any;

    userType: any = [];
    DisplayPaymentSummaryWindow = false;
   DisplayPaymentSummaryData :any;

    constructor(
        private worksOrdersService: WorksOrdersService,
        private worksorderManagementService: WorksorderManagementService,

        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
        private sharedService: SharedService,
        private confirmationDialogService: ConfirmationDialogService,
          private helperService: HelperService,
          private worksOrderReportService: WorksorderReportService,

    ) { }

    ngOnInit(): void {

        this.GetWebWorksOrdersPaymentsForWorksOrderCall();


        this.DisplayPaymentSummaryData = {
              "programme": "",
              "contract_Code": "",
              "contractor": "",
              "works_Order": "",
              "order_Status": "",
              "wosequence": 0,
              "wprsequence": 0,
              "wpysequence": 0,
              "contract_Payment_Type": "",
              "contract_DLP": "N",
              "contract_DLP_Days": 0,
              "payment_Date": "31 Jan 2021",
              "payment_Period_Start_Date": "01 Jan 2021",
              "payment_Period_End_Date": "31 Jan 2021",
              "target_Assets_in_Period": 0,
              "target_Work_Costs_in_Period": "£0.00",
              "planned_Assets_in_Period": 0,
              "planned_Work_Costs_in_Period": "£0.00",
              "actual_Assets_in_Period": 0,
              "actual_Work_Costs_in_Period": "£0.00",
              "contract_Fees_Count": 1,
              "contract_Fees_in_Period": "£1.00",
              "fixed_Work_Costs_in_Period": "£0.00",
              "est___Act_Payment_Costs": "£1.00",
              "payment_Schedule_Status": "",
              "work_Retention___in_Period": 0,
              "fixed_Retention_Value_in_Period": "£0.00",
              "est___Act_Retention_Value_in_Period": "£0.00",
              "est___Act_Released_Retention_in_Period": "£0.00",
              "payment_Schedule_Updated_by": "",
              "payment_Schedule_updated_on": "27 May 2021 15:29:18",
              "contractor_Code": "",
              "consultant_Code": "",
              "external_organisation": "",
              "payment_Type": "Contractor",
              "date_of_Payment": "31 Jan 2021",
              "request_User": "",
              "payment_Request_Date": "16 Jun 2021 14:13:28",
              "payment_Value": "£1.00",
              "payment_Value_VAT": "£0.20",
              "payment_VAT_Rate": "20.00",
              "payment_Status": "",
              "total_Payment_Value": "£1.20",
              "payment_Approval_User": "",
              "payment_Approval_Date": "21 Jun 2021 06:40:40"
        }




      //  console.log('worksOrderData 1 ' + JSON.stringify(this.worksOrderData));
    }


    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    sortChange(sort: SortDescriptor[]): void {
        this.state.sort = sort;
        this.gridView = process(this.gridData, this.state);
        this.chRef.detectChanges();
    }

    filterChange(filter: any): void {
        this.state.filter = filter;
        this.gridView = process(this.gridData, this.state);
        this.chRef.detectChanges();
    }

    pageChange(event: PageChangeEvent): void {
        this.state.skip = event.skip;
        this.gridView = {
            data: this.gridData.slice(this.state.skip, this.state.skip + this.pageSize),
            total: this.gridData.length
        };
        this.chRef.detectChanges();
    }

    cellClickHandler({
        sender,
        column,
        rowIndex,
        columnIndex,
        dataItem,
        isEditedselectedpaymentRow
    }) {
        this.selectedItem = dataItem;
    }


      WOCreateXportOutputReport(xPortId, reportName, item) {



        let params = {
          "intXportId": xPortId,
          "lstParamNameValue": ["Works Order Number", this.worksOrderData.wosequence],
          "lngMaxRows": 40000
        };

        if (xPortId == 526) {
          params.lstParamNameValue = ["Work Order Number",this.worksOrderData.wosequence,"Work Order Payment Number",item.wpysequence];
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


AuthorisePaymentFinalCall(){


 let wpspaymentdate =   this.helperService.formatDateWithoutTime(this.selectedItem.wpspaymentdate);

  const params = {
  "WPRSEQUENCE":this.selectedItem.wprsequence,
  	"WOSEQUENCE":this.selectedItem.wosequence,
  	"WPSPAYMENTDATE":"4/30/2021",
  	"strUser":this.currentUser.userId,
  	"strRequestUser":this.selectedItem.requestusername,
  	"WONAME":this.selectedItem.woname,
  	"WPYSEQUENCE":this.selectedItem.wpysequence
  };


  this.subs.add(
      this.worksOrdersService.AuthorisePayment(params).subscribe(
          data => {


              console.log('AuthorisePayment api response '+ JSON.stringify(data));

              if (data.isSuccess) {

                                     let resultData = data.data;
                                     if(resultData.validYN == 'Y'){
                                           this.alertService.error('Authorised');
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
autthorisePaymentClick(item){


  this.selectedItem = item;

  const params = {

     "WOSEQUENCE": item.wosequence,
     "WPRSEQUENCE": item.wprsequence,
     "WPYSEQUENCE": item.wpysequence,
     	"strUser":this.currentUser.userId,
  };


  this.subs.add(
      this.worksOrdersService.ValidateAuthorisePayment(params).subscribe(
          data => {


              console.log('ValidateAuthorisePayment api response '+ JSON.stringify(data));

              if (data.isSuccess) {

                                    let resultData = data.data;
                                     if(resultData.validYN == 'Y'){
                                         this.AuthorisePaymentFinalCall();
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
    GetWebWorksOrdersPaymentsForWorksOrderCall() {

        const params = {
           "wosequence": this.worksOrderData.wosequence,
           "wprsequence": this.worksOrderData.wprsequence,
        };

        const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');

        this.subs.add(
            this.worksOrdersService.GetWebWorksOrdersPaymentsForWorksOrder(qs).subscribe(
                data => {


                    console.log('GetWebWorksOrdersPaymentsForWorksOrderCall api data '+ JSON.stringify(data));

                    if (data.isSuccess) {

                        this.gridData = data.data;


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

    closePaymentsWindowList() {
        this.WOPaymentsWindow = false;
        $('.woassetdetailoverlay').removeClass('ovrlay');
        this.woPmPaymentsEvent.emit(this.WOPaymentsWindow);
    }

    openDisplayPaymentSummary(item) {
        this.selectedItem = item;

//paymentdate=31 Jan 2021



let startdate =  this.helperService.formatDateTimeSpace(item.wpspaymentdate);


console.log('startdate '+ startdate);
item.wpspaymentdate
        const params = {
           "wosequence": this.worksOrderData.wosequence,
           "wprsequence": this.worksOrderData.wprsequence,
           "wpysequence": item.wpysequence,
           "paymentdate": startdate,
        };

        const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');

        this.subs.add(
            this.worksOrdersService.GetWorksOrderReportingPayment(qs).subscribe(
                data => {


                    console.log('GetWorksOrderReportingPayment api data '+ JSON.stringify(data));

                    if (data.isSuccess) {

                        this.DisplayPaymentSummaryData = data.data[0];


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


        this.DisplayPaymentSummaryWindow = true;
    }


    closeDisplayPaymentSummary() {
        this.DisplayPaymentSummaryWindow = false;

    }



}
