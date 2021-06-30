import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, LoaderService, WorksorderManagementService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
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


    constructor(
        private worksOrdersService: WorksOrdersService,
        private worksorderManagementService: WorksorderManagementService,
        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
        private sharedService: SharedService,
        private confirmationDialogService: ConfirmationDialogService,
          private helperService: HelperService,
    ) { }

    ngOnInit(): void {

        this.GetWebWorksOrdersPaymentsForWorksOrderCall();
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


        this.DisplayPaymentSummaryWindow = true;
    }


    closeDisplayPaymentSummary() {
        this.DisplayPaymentSummaryWindow = false;

    }



}
