import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, LoaderService, ConfirmationDialogService ,WorksorderManagementService , WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'app-programme-log',
    templateUrl: './programme-log.component.html',
    styleUrls: ['./programme-log.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProgramLogComponent implements OnInit {
    @Input() ProgrammeLogWindow: boolean = false;
    @Output() ProgrammeLogWindowEvent = new EventEmitter<boolean>();
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


    report_state: State = {
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
    title = 'View Programme Log';

    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    loading = false;

    gridData: any;
    gridView: DataResult;
    selectedItem: any;
    ProgrammeTransactionWindow = false;

    programmeData :any;
    ReportHeaderTitle = '';
    ProgrammLogReportWindow = false;
    ReportGridData :any;
    ReportgridView : DataResult;

        constructor(
            private worksOrdersService: WorksOrdersService,
              private worksorderManagementService: WorksorderManagementService,
            private alertService: AlertService,
            private chRef: ChangeDetectorRef,
            private sharedService: SharedService,
            private confirmationDialogService: ConfirmationDialogService,
            private helper: HelperService,

        ) { }



        ngOnInit(): void {

          this.programmeData = {
              wprname: ''

          };


          if(this.worksOrderData.hasOwnProperty('name'))
          {
            this.worksOrderData.woname = this.worksOrderData.name ;
          }





           this.GetWOProgramme();

            //console.log('WorkOrder Data : '+  JSON.stringify(this.worksOrderData));

            this.WEBWorksOrdersWorksProgrammeLog();
        }





        WOReportingProgrammeLogDetail(params) {

            this.subs.add(
                this.worksOrdersService.WOReportingProgrammeLogDetail(params).subscribe(
                    data => {

                        this.loading = false;

                        if (data.isSuccess) {

                            this.ReportGridData = data.data;

                              this.chRef.detectChanges();
                              this.exportData(data.data);

                        } else {
                            this.alertService.error(data.message);
                            this.loading = false;
                        }

                        this.chRef.detectChanges();

                        // console.log('WorkOrderRefusalCodes api reponse' + JSON.stringify(data));
                    },
                    err => this.alertService.error(err)
                )
            )

        }

        GetVW_WOReportingProgrammeLog(params) {

            this.subs.add(
                this.worksOrdersService.GetVW_WOReportingProgrammeLog(params).subscribe(
                    data => {

                        this.loading = false;
                        //  console.log('GetVW_WOReportingProgrammeLog api data ' + JSON.stringify(data));

                        if (data.isSuccess) {

                            this.ReportGridData = data.data;
                              this.chRef.detectChanges();

                            this.exportData(data.data);

                        } else {
                            this.alertService.error(data.message);
                            this.loading = false;
                        }

                        this.chRef.detectChanges();

                        // console.log('WorkOrderRefusalCodes api reponse' + JSON.stringify(data));
                    },
                    err => this.alertService.error(err)
                )
            )

        }

        exportData(gridDataToexport) {


          //  console.log('ReportGridData export Data' + JSON.stringify(this.ReportGridData));

            //alert('export called');
            if (this.ReportGridData.length != undefined && this.ReportGridData.length > 0) {

            let tempData = Object.assign([], this.ReportGridData);
            tempData.map((x: any) => {
              x.log_DateTime = this.helper.formatDateWithoutTime(x.log_DateTime)
            });



              //  let tempData = this.ReportGridData;
                let label = {
                    'programme': 'Programme',
                    'contract_Code': 'Contract Code',
                    'contractor': 'Contractor',
                    'works_Order': 'Work Order',
                    'order_Status': 'Order Status',
                    'phase_Name': 'Phase',
                    'log_DateTime': 'Log Date Time',
                    'user_Name': 'User Name',
                    'transaction_Type': 'Transaction Type',
                    'log_Status': 'Log Status',
                    'log_Summary': 'Log Summary',
                    'insert_Count': 'Insert Count',
                    'update_Count': 'Update Count',
                    'error_Count': 'Error Count'


                }

                this.helper.exportAsExcelFile(tempData, 'Programme Log Report', label)

            } else {
                alert('There is no record to import');
            }
        }


        summary_by_order_phase_date_report(item) {

            console.log('item  data ' + JSON.stringify(item));

            this.loading = true;
            this.selectedItem = item;
        //    this.ProgrammLogReportWindow = true;
            this.ReportHeaderTitle ="Report: Programme Log Summary by Date";

            $('.woassetdetailoverlay').addClass('ovrlay');

            const params = {
                "WPRSEQUENCE": this.worksOrderData.wprsequence,
                "WOSEQUENCE": 0,
                "WOPSEQUENCE": 0,
                "ReportLevel": 1,
                "OrderBy": "order"
            };

            this.GetVW_WOReportingProgrammeLog(params);

        }
        summary_by_date_report(item) {

            console.log('item  data ' + JSON.stringify(item));

            this.loading = true;
            this.selectedItem = item;
            //this.ProgrammLogReportWindow = true;
               this.ReportHeaderTitle ="Report: Programme Log Summary by Order";
            $('.woassetdetailoverlay').addClass('ovrlay');

            const params = {
                "WPRSEQUENCE": this.worksOrderData.wprsequence,
                "WOSEQUENCE": 0,
                "WOPSEQUENCE": 0,
                "ReportLevel": 1,
                "OrderBy": "logdatetime"
            };

            this.GetVW_WOReportingProgrammeLog(params);

        }

        detail_by_date_report(item) {

            console.log('item  data ' + JSON.stringify(item));

            this.loading = true;
            this.selectedItem = item;
          //  this.ProgrammLogReportWindow = true;
 this.ReportHeaderTitle ="Report: Programme Log Detail by Order";
            $('.woassetdetailoverlay').addClass('ovrlay');

            const params = {
                "WPRSEQUENCE": this.worksOrderData.wprsequence,
                "WOSEQUENCE": 0,
                "WOPSEQUENCE": 0,
                "ReportLevel": 1,
                "OrderBy": "logdatetime"
            };

            this.WOReportingProgrammeLogDetail(params);

        }
        detail_by_order_phase_date_report(item) {

            console.log('item  data ' + JSON.stringify(item));

            this.loading = true;
            this.selectedItem = item;
          //  this.ProgrammLogReportWindow = true;
            this.ReportHeaderTitle ="Report: Programme Log Detail by Order";
            $('.woassetdetailoverlay').addClass('ovrlay');

            const params = {
                "WPRSEQUENCE": this.worksOrderData.wprsequence,
                "WOSEQUENCE": 0,
                "WOPSEQUENCE": 0,
                "ReportLevel": 1,
                "OrderBy": "order"
            };

            this.WOReportingProgrammeLogDetail(params);

        }


        closeProgrammLogReportWindow() {

            this.ProgrammLogReportWindow = false;

            $('.woaProgramLogoverlay').removeClass('ovrlay');

        }


        ngOnDestroy() {
            this.subs.unsubscribe();
        }

        report_sortChange(sort: SortDescriptor[]): void {
            this.report_state.sort = sort;
            this.ReportgridView = process(this.ReportGridData, this.report_state);
            this.chRef.detectChanges();
        }

        report_filterChange(filter: any): void {
            this.report_state.filter = filter;
            this.ReportgridView = process(this.ReportGridData, this.report_state);
            this.chRef.detectChanges();
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
            isEditedselectedInstructionRow
        }) {
            this.selectedItem = dataItem;
        }

        WEBWorksOrdersWorksProgrammeLog() {

            const params = {
                "WOSEQUENCE": this.worksOrderData.wosequence,
                "intWPRSEQUENCE": this.worksOrderData.wprsequence,
                "intWPLSEQUENCE": 0,
            };

            const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');

            this.subs.add(
                this.worksOrdersService.WEBWorksOrdersWorksProgrammeLog(qs).subscribe(
                    data => {

                        //  console.log('GetWOInstructionAssets api data ' + JSON.stringify(data));

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

        closeProgrammeLogWindow() {
            this.ProgrammeLogWindow = false;
            this.ProgrammeLogWindowEvent.emit(this.ProgrammeLogWindow);
        }

        GetWOProgramme() {

            let wprsequence = this.worksOrderData.wprsequence;
            this.subs.add(
                this.worksorderManagementService.getWorkProgrammesByWprsequence(wprsequence).subscribe(
                    data => {
                        //console.log('programmeData api data '+ JSON.stringify(data));
                        if (data.isSuccess) {

                            this.programmeData = data.data[0];

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

        openProgramLogTransactionsWindow(item) {
            this.selectedItem = item;
            this.ProgrammeTransactionWindow = true;

            $('.woaProgramLogoverlay').addClass('ovrlay');
        }

        closeProgramLogTransactionsWindow(eve) {
            this.ProgrammeTransactionWindow = eve;
            $('.woaProgramLogoverlay').removeClass('ovrlay');
        }


}
