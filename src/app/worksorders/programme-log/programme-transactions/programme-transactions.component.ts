import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, WorksOrdersService } from 'src/app/_services';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'app-programme-transactions',
    templateUrl: './programme-transactions.component.html',
    styleUrls: ['./programme-transactions.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})

export class ProgramTransactionsComponent implements OnInit {
    @Input() ProgrammeTransactionWindow: boolean = false;
    @Input() singleWorkOrderInp: any;
    @Input() programLogInp: any;
    @Input() programmeData: any;
    @Input() openedFrom = 'workorder';
    @Input() phaseData: any;
    @Output() ProgramTransactionsWindowEvent = new EventEmitter<boolean>();
    subs = new SubSink();
    selectableSettings: SelectableSettings;
    state: State = {
        skip: 0,
        sort: [],
        take: 25,
        group: [],
        filter: {
            logic: "and",
            filters: []
        }
    }
    pageSize = 25;
    gridLoading = false;
    gridData: any;
    gridView: DataResult;
    title = 'View Programme Transaction';
    transationDetail: any;

    constructor(
        private worksOrdersService: WorksOrdersService,
        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
    ) {
        this.setSelectableSettings();
    }

    setSelectableSettings(): void {
        this.selectableSettings = {
            checkboxOnly: false,
            mode: 'single'
        };
    }

    ngOnInit(): void {
        if (this.openedFrom == 'workorder' || this.openedFrom == 'milestone') {
            const { wprname, wprprogrammetype } = this.programmeData;
            const { woname } = this.singleWorkOrderInp;
            const { wopname, wpltransactiontype, wpldatetime, m_USERNAME, wplsummarymessage } = this.programLogInp;
            this.transationDetail = {
                wprname,
                wprprogrammetype,
                woname,
                wopname,
                wpltransactiontype,
                wpldatetime,
                m_USERNAME,
                wplsummarymessage
            }
        }

        if (this.openedFrom == 'assetchecklist') {
            const { wprname, wprprogrammetype } = this.programmeData;
            const { woname } = this.singleWorkOrderInp;
            const { wopname } = this.phaseData;
            const { wpltransactiontype, wpldtransdatetime, m_USERNAME, wpldmessage } = this.programLogInp;
            this.transationDetail = {
                wprname,
                wprprogrammetype,
                woname,
                wopname,
                wpltransactiontype,
                wpldatetime: wpldtransdatetime,
                m_USERNAME,
                wplsummarymessage: wpldmessage
            }

        }

        if (this.openedFrom == 'programme') {
            const { wprname, wprprogrammetype } = this.programmeData;
            const { woname, wopname, wpltransactiontype, wpldatetime, m_USERNAME, wplsummarymessage } = this.programLogInp;
            this.transationDetail = {
                wprname,
                wprprogrammetype,
                woname,
                wopname,
                wpltransactiontype,
                wpldatetime,
                m_USERNAME,
                wplsummarymessage
            }
        }

        this.WEBWorksOrdersWorksProgrammeLogDetails();
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
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

    WEBWorksOrdersWorksProgrammeLogDetails() {
        const { wprsequence, wplsequence } = this.programLogInp
        this.subs.add(
            this.worksOrdersService.WEBWorksOrdersWorksProgrammeLogDetails(wprsequence, wplsequence).subscribe(
                data => {
                    if (data.isSuccess) {
                        this.gridData = data.data.map(x => {
                            if (x.wpldstatus == "S") x.wpldstatus = "Success";
                            if (x.wpldstatus == "W") x.wpldstatus = "Warning";
                            if (x.wpldstatus == "E") x.wpldstatus = "Error";
                            return x;
                        });
                        this.gridView = process(this.gridData, this.state);
                    } else this.alertService.error(data.message);

                    this.gridLoading = false
                    this.chRef.detectChanges();
                }, err => this.alertService.error(err)
            )
        )

    }


    CloseProgramLogTransactionsWindow() {
        this.ProgrammeTransactionWindow = false;
        this.ProgramTransactionsWindowEvent.emit(this.ProgrammeTransactionWindow);
    }


}
