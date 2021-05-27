import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, LoaderService, WorksorderManagementService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'app-wo-pm-instruction-assets',
    templateUrl: './wo-pm-instruction-assets.component.html',
    styleUrls: ['./wo-pm-instruction-assets.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoPmInstructionAssetsComponent implements OnInit {
    @Input() woPmInstructionAssetsWindow: boolean = false;
    @Output() woPmInstructionAssetsEvent = new EventEmitter<boolean>();

    @Input() selectedInstructionRow: any;
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
    title = 'Work Order Instruction Assets';

    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    loading = false;

    gridData: any;
    programmeData: any;
    gridView: DataResult;
    selectedItem: any;
    instructionAssetsDetailWindow = false;
    selectedInstructionAssetRow: any;

    worksOrderAccess = [];
    worksOrderUsrAccess: any = [];
    userType: any = [];


    constructor(
        private worksOrdersService: WorksOrdersService,
        private worksorderManagementService: WorksorderManagementService,

        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
        private sharedService: SharedService,
        private confirmationDialogService: ConfirmationDialogService
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


        this.programmeData = {
            wprname: ''

        };
        this.GetWOProgramme();
        this.GetWOInstructionAssets();
        //console.log('worksOrderData 1 ' + JSON.stringify(this.worksOrderData));
        //   console.log('selectedInstructionRow ' + JSON.stringify(this.selectedInstructionRow));
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
        isEditedselectedInstructionRow
    }) {
        this.selectedItem = dataItem;
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




    GetWOInstructionAssets() {

        const params = {
            "WOSEQUENCE": this.selectedInstructionRow.wosequence,
            "WOISEQUENCE": this.selectedInstructionRow.woisequence,
        };

        const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');

        this.subs.add(
            this.worksOrdersService.GetWOInstructionAssets(qs).subscribe(
                data => {


                    //console.log('GetWOInstructionAssets api data '+ JSON.stringify(data));

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

    closeInstructionAssetsWindow() {
        this.woPmInstructionAssetsWindow = false;
        $('.woassetdetailoverlay').removeClass('ovrlay');
        this.woPmInstructionAssetsEvent.emit(this.woPmInstructionAssetsWindow);
    }

    openShowInstAssetsDetail(item) {
        this.selectedInstructionAssetRow = item;
        this.instructionAssetsDetailWindow = true;
        $('.woassetdetailoverlay').addClass('ovrlay');
    }


    closeInstructionAssetsDetailWindow(eve) {
        this.instructionAssetsDetailWindow = eve;
        $('.woassetdetailoverlay').removeClass('ovrlay');

    }

    woMenuAccess(menuName) {
        if (this.userType == undefined) return true;

        if (this.userType?.wourroletype == "Dual Role") {
            return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
        }

        return this.worksOrderUsrAccess.indexOf(menuName) != -1

    }

}
