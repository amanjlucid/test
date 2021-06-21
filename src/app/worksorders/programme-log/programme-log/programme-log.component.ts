import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { forkJoin, Observable } from 'rxjs';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'app-programme-log',
    templateUrl: './programme-log.component.html',
    styleUrls: ['./programme-log.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})

export class ProgramLogComponent implements OnInit {
    @Output() ProgrammeLogWindowEvent = new EventEmitter<boolean>();
    @Input() ProgrammeLogWindow: boolean = false;
    @Input() openedFrom = 'workorder';
    @Input() singleWorkOrderInp: any = [];
    @Input() singleWorkOrderAssetInp: any;
    subs = new SubSink();
    title = 'View Programme Log';
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
    pageSize = 25;
    gridData: any;
    gridView: DataResult;
    gridLoading = false;
    selectableSettings: SelectableSettings;
    touchtime = 0;
    programmeData: any;
    ProgrammeTransactionWindow = false;
    selectedItem: any;
    phaseData: any;


    constructor(
        private worksOrdersService: WorksOrdersService,
        private worksorderManagementService: WorksorderManagementService,
        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
        private helper: HelperService,
    ) {
        this.setSelectableSettings();
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    ngOnInit(): void {
        // console.log({ openedFrom: this.openedFrom, workorder: this.singleWorkOrderInp, asset: this.singleWorkOrderAssetInp })

        if (this.openedFrom == "assetchecklist" && this.singleWorkOrderAssetInp != undefined) {
            this.title = "View Programme Log for Asset";
            const { wprsequence, wosequence, wopsequence } = this.singleWorkOrderAssetInp;
            const pageService = [
                this.worksorderManagementService.getWorkProgrammesByWprsequence(wprsequence),
                this.worksorderManagementService.getPhase(wosequence, wopsequence),
            ];
            this.requiredPageData(pageService);
            this.getAssetProgrammeLog();

        }

        if (this.openedFrom == "workorder" && this.singleWorkOrderInp != undefined) {
            const { wprsequence } = this.singleWorkOrderInp;
            const pageService = [
                this.worksorderManagementService.getWorkProgrammesByWprsequence(wprsequence),
            ];
            this.requiredPageData(pageService);
            this.WEBWorksOrdersWorksProgrammeLog();
        }

    }

    workOrderName() {
        return this.singleWorkOrderInp?.woname ?? this.singleWorkOrderInp?.name;
    }

    setSelectableSettings(): void {
        this.selectableSettings = {
            checkboxOnly: false,
            mode: 'single'
        };
    }

    requiredPageData(pageService) {
        this.subs.add(
            forkJoin(pageService).subscribe(
                data => {
                    const programmeData: any = data[0];
                    this.programmeData = programmeData.data[0];

                    if (this.openedFrom == "assetchecklist") {
                        const phaseData: any = data[1];
                        this.phaseData = phaseData.data;
                    }

                    this.chRef.detectChanges();
                }, err => this.alertService.error(err)
            )
        )
    }

    WEBWorksOrdersWorksProgrammeLog() {
        const { wosequence, wprsequence } = this.singleWorkOrderInp;
        this.subs.add(
            this.worksOrdersService.WEBWorksOrdersWorksProgrammeLog(wosequence, wprsequence, 0).subscribe(
                data => {
                    if (data.isSuccess) {
                        this.gridData = data.data;
                        this.gridView = process(this.gridData, this.state);
                    } else this.alertService.error(data.message);

                    this.gridLoading = false
                    this.chRef.detectChanges();
                }, err => this.alertService.error(err)
            )
        )

    }

    getAssetProgrammeLog() {
        const { wprsequence, wosequence, wopsequence, assid } = this.singleWorkOrderAssetInp;
        this.subs.add(
            this.worksOrdersService.WEBWorksOrdersWorksProgrammeLogForAsset(wprsequence, wosequence, wopsequence, assid).subscribe(
                data => {
                    if (data.isSuccess) {
                        this.gridData = data.data;
                        this.gridView = process(this.gridData, this.state);
                    } else this.alertService.error(data.message);

                    this.gridLoading = false
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

    cellClickHandler({ columnIndex, dataItem }) {
        this.selectedItem = dataItem;
        if (columnIndex > 0) {
            if (this.touchtime == 0) {
                this.touchtime = new Date().getTime();
            } else {
                if (((new Date().getTime()) - this.touchtime) < 400) {
                    this.openProgramLogTransactionsWindow(dataItem);
                    this.touchtime = 0;
                } else {
                    // not a double click so set as a new first click
                    this.touchtime = new Date().getTime();
                }
            }
        }
    }

    closeProgrammeLogWindow() {
        this.ProgrammeLogWindow = false;
        this.ProgrammeLogWindowEvent.emit(this.ProgrammeLogWindow);
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


    programmeLog(reportType) {
        if (this.openedFrom == "assetchecklist") {
            this.setParamsForAssetReport(reportType);
        } else if (this.openedFrom == "workorder") {
            this.setParamsForWOReport(reportType);
        }
    }

    setParamsForAssetReport(reportType) {
        //Summary by Date = 1, Summary by Order/Phase and Date = 2, Detail by Date = 3, Detail by Order/Phase and Date = 4, 
        const { wprsequence, wosequence, wopsequence, } = this.singleWorkOrderAssetInp;
        let params: any = {};

        if (reportType == 1) {
            params.WPRSEQUENCE = wprsequence;
            params.WOSEQUENCE = wosequence;
            params.WOPSEQUENCE = wopsequence;
            params.ReportLevel = 4;
            params.OrderBy = "logdatetime";
        }

        if (reportType == 2) {
            params.WPRSEQUENCE = wprsequence;
            params.WOSEQUENCE = wosequence;
            params.WOPSEQUENCE = 0;
            params.ReportLevel = 5;
            params.OrderBy = "logdatetime";
        }

        if (reportType == 3) {
            params.WPRSEQUENCE = wprsequence;
            params.WOSEQUENCE = 0;
            params.WOPSEQUENCE = 0;
            params.ReportLevel = 6;
            params.OrderBy = "logdatetime";
        }

        if (reportType == 4) {
            params.WPRSEQUENCE = 0;
            params.WOSEQUENCE = 0;
            params.WOPSEQUENCE = 0;
            params.ReportLevel = 7;
            params.OrderBy = "logdatetime";
        }

        this.worksOrdersService.GetVW_WOReportingProgrammeLog(params).subscribe(
            data => {
                if (data.isSuccess) this.exportData(data.data);
                else this.alertService.error(data.message);
            }, err => this.alertService.error(err)
        )

    }

    setParamsForWOReport(reportType) {
        //Summary by Date = 1, Summary by Order/Phase and Date = 2, Detail by Date = 3, Detail by Order/Phase and Date = 4, 
        const { wprsequence } = this.singleWorkOrderInp;

        let params = {
            "WPRSEQUENCE": wprsequence,
            "WOSEQUENCE": 0,
            "WOPSEQUENCE": 0,
            "ReportLevel": 1,
            "OrderBy": ""
        };

        if (reportType == 1) params.OrderBy = "logdatetime";

        if (reportType == 2) params.OrderBy = "order";

        if (reportType == 3) params.OrderBy = "logdatetime";

        if (reportType == 4) params.OrderBy = "order";

        this.generateProgrammeReportWO(reportType, params);

    }

    generateProgrammeReportWO(reportType, params) {
        let apiCall: Observable<any>;
        if (reportType == 1 || reportType == 2) {
            apiCall = this.worksOrdersService.GetVW_WOReportingProgrammeLog(params)
        } else if (reportType == 3 || reportType == 4) {
            apiCall = this.worksOrdersService.WOReportingProgrammeLogDetail(params)
        }

        this.subs.add(
            apiCall.subscribe(
                data => {
                    if (data.isSuccess) this.exportData(data.data);
                    else this.alertService.error(data.message);
                }, err => this.alertService.error(err)
            )
        )
    }


    exportData(data): void {
        if (data.length != undefined && data.length > 0) {
            const tempData = [...data];
            tempData.map(x => x.log_DateTime = this.helper.formatDateWithoutTime(x.log_DateTime));
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
        } else this.alertService.error('There is no record to import');

    }




}
