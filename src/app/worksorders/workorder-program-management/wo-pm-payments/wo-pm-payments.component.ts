import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, ConfirmationDialogService, WorksOrdersService, SharedService } from 'src/app/_services';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { combineLatest } from 'rxjs';

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

    DisplayPaymentSummaryWindow = false;
    DisplayPaymentSummaryData: any;

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
    ) { }

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

    cellClickHandler({ dataItem }) {
        this.selectedItem = dataItem;
    }


    autthorisePaymentClick(item, checkProcess = "C") {
        const params = {
            "WOSEQUENCE": item.wosequence,
            "WPRSEQUENCE": item.wprsequence,
            "WPYSEQUENCE": item.wpysequence,
            "strUser": this.currentUser.userId,
        };


        this.subs.add(
            this.worksOrdersService.ValidateAuthorisePayment(params).subscribe(
                data => {
                    console.log(data)
                    if (data.isSuccess) {
                        let resultData = data.data;
                        if (resultData.validYN == 'Y' && checkProcess == "C") {
                            this.authorisedConfirmation(resultData, item)
                        } else if (resultData.validYN == 'Y' && checkProcess == "P") {
                            this.alertService.success(resultData.validationMessage);
                            this.GetWebWorksOrdersPaymentsForWorksOrderCall();
                        } else {
                            this.alertService.error(resultData.validationMessage);
                        }
                    } else {
                        this.alertService.error(data.message);
                    }

                    this.chRef.detectChanges();

                }, err => this.alertService.error(err)
            )
        )



    }

    authorisedConfirmation(resultData, item) {
        $('.k-window').css({ 'z-index': 1000 });
        this.confirmationDialogService.confirm('Please confirm..', `${resultData.validationMessage}`)
            .then((confirmed) => this.autthorisePaymentClick(item, "P"))
            .catch(() => console.log('Attribute dismissed the dialog.'));
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
                    if (data.isSuccess) {
                        this.gridData = data.data;
                    } else {
                        this.alertService.error(data.message);
                        this.loading = false
                    }

                    this.chRef.detectChanges();

                }, err => this.alertService.error(err)
            )
        )




    }

    closePaymentsWindowList() {
        this.WOPaymentsWindow = false;
        $('.woassetdetailoverlay').removeClass('ovrlay');
        this.woPmPaymentsEvent.emit(this.WOPaymentsWindow);
    }

    openDisplayPaymentSummary(item) {
        $('.woassetdetailoverlay').addClass('ovrlay');
        let startdate = this.helperService.formatDateTimeSpace(item.wpspaymentdate);
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
                    // console.log(data)
                    if (data.isSuccess) {
                        this.DisplayPaymentSummaryData = data.data[0];
                        this.DisplayPaymentSummaryWindow = true;
                    } else {
                        this.alertService.error(data.message);
                        $('.woassetdetailoverlay').removeClass('ovrlay');
                    }
                    this.chRef.detectChanges();
                }, err => {
                    this.alertService.error(err);
                    $('.woassetdetailoverlay').removeClass('ovrlay');
                }
            )
        )


        
    }


    closeDisplayPaymentSummary() {
        $('.woassetdetailoverlay').removeClass('ovrlay');
        this.DisplayPaymentSummaryWindow = false;
    }

    woMenuAccess(menuName) {
        return this.helperService.checkWorkOrderAreaAccess(this.userType, this.worksOrderAccess, this.worksOrderUsrAccess, menuName)
    }

}
