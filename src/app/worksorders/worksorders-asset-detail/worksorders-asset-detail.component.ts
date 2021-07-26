import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, LoaderService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';

@Component({
    selector: 'app-worksorders-asset-detail',
    templateUrl: './worksorders-asset-detail.component.html',
    styleUrls: ['./worksorders-asset-detail.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersAssetDetailComponent implements OnInit {
    @Input() assetDetailWindow: boolean = false;
    @Output() closeAssetDetailEvent = new EventEmitter<boolean>();
    @Input() selectedRow: any;
    @Input() treelevel: any;
    @Input() worksOrderData: any;
    @Input() selectedChecklist: any = [];
    @Input() wodDetailType: string = 'all';
    @Input() selectedChildRow: any;
    @Input() selectedParentRow: any;


    subs = new SubSink();

    state: State = {
        skip: 0,
        sort: [],
        group: [],
        filter: {
            logic: "and",
            filters: []
        }
    }
    gridView: DataResult;
    gridLoading = true
    pageSize = 25;
    title = 'Works Order Asset Detail';
    selectedItem: any;
    assetDetailsGridData: any;
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    woFormDeleteWindow = false;
    errorDeleteMsg = '';
    successDeleteMsg = '';
    EditCommentForWoAssetWindow = false;
    EditWorkPackageQtyCostWindow = false;
    attrDesc = '';
    edit_comment_input = "";
    loading = false;
    itemData: any;
    assetDetailsGridDataPhase: any;
    SetToRefusalWindow = false;
    refusalCodeList: any;
    SwapPackageWindow = false;
    SwapPackagesForAssetsDataGrid: any

    worksOrderAccess: any = []
    worksOrderUsrAccess: any = [];

    userType: any = []

    constructor(
        private worksOrdersService: WorksOrdersService,
        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
        private sharedService: SharedService,
        private confirmationDialogService: ConfirmationDialogService,
        private helperService: HelperService,
    ) { }

    ngOnInit(): void {

        //works order security access
        this.subs.add(
            combineLatest([
                this.sharedService.woUserSecObs,
                this.sharedService.worksOrdersAccess,
                this.sharedService.userTypeObs
            ]).subscribe(
                data => {
                    this.worksOrderUsrAccess = data[0];
                    this.worksOrderAccess = data[1];
                    this.userType = data[2][0];
                }
            )
        )

        this.itemData = {
            wlcomppackage: '',
            wphname: '',
            atadescription: '',
            asaquantity: 0,
            asauom: '',
            woadforecast: 0,
            work_cost: 0,
            cost_override: 0,
            woadcomment: '',
            wo_forcast: 0,
            refusal_code: '',
            assid: '',
            wocheckname: '',
            woname: '',
        };


        this.getData();

    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    async getData() {

        if (this.treelevel == 3) {
            await this.WorkOrderAssetDetail();
            await this.WorkOrderAssetDetailPhases();
        }

        if (this.treelevel == 2) {
            this.WorkOrderAssetDetailPhases();
        }

    }


    async WorkOrderAssetDetail() {
        const checkSrc = this.wodDetailType == "single" ? this.selectedChecklist.wochecksurcde : 0;
        let promise = new Promise((resolve, reject) => {
            this.worksOrdersService.WorkOrderAssetDetail(this.selectedRow.wosequence, this.selectedRow.wopsequence, this.selectedRow.assid, checkSrc).subscribe(
                (data) => {
                    // console.log(data)
                    if (data.isSuccess) {
                        this.assetDetailsGridData = data.data
                        resolve(true);
                    } else {

                        this.alertService.error(data.message);

                    }

                    this.chRef.detectChanges();

                },
                error => {
                    this.alertService.error(error);
                    this.chRef.detectChanges();

                }
            )
        });
        return promise;

    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }


    WorkOrderAssetDetailPhases() {
        let promise = new Promise((resolve, reject) => {
            this.worksOrdersService.WorkOrderAssetDetailPhases(this.selectedRow.wosequence, this.selectedRow.wopsequence).subscribe(
                (data) => {
                    // console.log(data);
                    if (data.isSuccess) {

                        if (this.treelevel == 2)
                            this.assetDetailsGridData = data.data

                        if (this.treelevel == 3) {
                            this.assetDetailsGridDataPhase = data.data
                        }

                        resolve(true);
                    } else {

                        this.alertService.error(data.message);

                    }

                    this.chRef.detectChanges();

                },
                error => {
                    this.alertService.error(error);
                    this.chRef.detectChanges();

                }
            )
        });
        return promise;




    }

    finalremoveAssetFromPhase(dataItem, action) {
        if (dataItem.woadstatus == 'Issued' || dataItem.woadstatus == 'Released') {
            return
        }

        this.selectedItem = dataItem;
        let wosequence = this.selectedItem.wosequence;
        let wopsequence = this.selectedItem.wopsequence;
        let assid = this.selectedItem.assid;
        let wlcode = this.selectedItem.wlcode;
        let wlataid = this.selectedItem.wlataid;
        let wlplanyear = this.selectedItem.wlplanyear;

        let params = {
            wosequence: wosequence,
            wopsequence: wopsequence,
            assid_wlcode: [assid, wlcode, wlataid, wlplanyear],
            userid: this.currentUser.userId,
            strCheckOrProcess: 'P',
            RemoveWorkList: action,
        };

        this.worksOrdersService.WorksOrderRemoveWork(params).subscribe(
            (data) => {
                if (data.isSuccess) {
                    let apiData = data.data[0];

                    if (apiData.pRETURNSTATUS == 'E') {
                        this.alertService.error(apiData.pRETURNMESSAGE);
                    } else if (apiData.pRETURNSTATUS == 'S') {
                        this.successDeleteMsg = 'Works Deleted Successfully';
                        if (!action) {
                            this.successDeleteMsg = 'Works Removed Successfully';
                        }
                        this.alertService.success(this.successDeleteMsg);
                        this.getData();
                    } else {
                        this.alertService.error(apiData.pRETURNMESSAGE);
                    }

                }

            },
            error => {
                this.alertService.error(error);

            }
        )

    }


    finalDeleteWorkConfirmBox(item, msg, action) {

        $('.k-window').css({
            'z-index': 1000
        });
        this.confirmationDialogService.confirm('Please confirm..', msg)
            .then((confirmed) => (confirmed) ? this.finalremoveAssetFromPhase(item, action) : console.log(confirmed))
            .catch(() => console.log('Attribute dismissed the dialog.'));
    }


    removeAssetFromPhase(dataItem, action) {


        this.selectedItem = dataItem;

        this.errorDeleteMsg = '';
        this.successDeleteMsg = '';

        let wosequence = this.selectedItem.wosequence;
        let wopsequence = this.selectedItem.wopsequence;


        let assid = this.selectedItem.assid;
        let wlcode = this.selectedItem.wlcode;
        let wlataid = this.selectedItem.wlataid;
        let wlplanyear = this.selectedItem.wlplanyear;


        let params = {
            wosequence: wosequence,
            wopsequence: wopsequence,
            assid_wlcode: [assid, wlcode, wlataid, wlplanyear],
            userid: this.currentUser.userId,
            strCheckOrProcess: 'C',
            RemoveWorkList: action,
        };

        this.worksOrdersService.WorksOrderRemoveWork(params).subscribe(
            (data) => {
                if (data.isSuccess) {
                    let apiData = data.data[0];
                    if (apiData.pRETURNSTATUS == 'E') {
                        this.alertService.error(apiData.pRETURNMESSAGE);

                    } else if (apiData.pRETURNSTATUS == 'S') {
                        this.finalDeleteWorkConfirmBox(this.selectedItem, apiData.pRETURNMESSAGE, action);
                    } else {
                        this.alertService.error(apiData.pRETURNMESSAGE);

                    }



                }



            },
            error => {
                this.alertService.error(error);

            }
        )

        // this.selectedEvent.push(dataItem)
    }

    clearRefusalConfirm(item) {
        if (item.woadstatus != 'New') {
            return
        }

        this.selectedItem = item;


        $('.k-window').css({
            'z-index': 1000
        });

        this.confirmationDialogService.confirm('Please confirm..', 'Clear Refusal')
            .then(
                (confirmed) => {

                    if (confirmed) {

                        this.itemData.refusal_code = '';

                        this.SetToRefusalSave(false);


                    }

                }


            )
            .catch(() => console.log('Attribute dismissed the dialog.'));



    }

    openSwapPackage(item) {
        if (item.woadstatus != 'New') {
            return
        }

        $('.woassetdetailoverlay').addClass('ovrlay');
        this.SwapPackageWindow = true;

    }


    closeSwapPackageWindow(eve) {
        this.SwapPackageWindow = false;
        $('.woassetdetailoverlay').removeClass('ovrlay');
        this.getData();
    }

    openSetToRefusalWindow(item) {

        if (item.woadstatus != 'New') {
            return
        }

        this.selectedItem = item;
        this.SetToRefusalWindow = true;

        const params = {
            "ClearRefusal": false,
        };

        const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');



        this.subs.add(
            this.worksOrdersService.WorkOrderRefusalCodes(qs).subscribe(
                data => {

                    if (data.isSuccess) {

                        this.refusalCodeList = data.data;

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

    SetToRefusalSave(clear = false) {

        const params = {
            "WOSEQUENCE": this.selectedItem.wosequence,
            "assid": this.selectedItem.assid,
            "WOPSEQUENCE": this.selectedItem.wopsequence,
            "WLCODE": this.selectedItem.wlcode,
            "ATAID": this.selectedItem.wlataid,
            "PlanYear": this.selectedItem.wlplanyear,
            "Refusal": this.itemData.refusal_code,
            "UserID": this.currentUser.userId,
        };




        this.subs.add(
            this.worksOrdersService.SetRefusal(params).subscribe(
                data => {

                    if (data.isSuccess) {
                        let success_msg = "Refusal Successfully Set";
                        if (!clear) {
                            success_msg = "Refusal Successfully Cleared";
                        }

                        this.alertService.success(success_msg);
                        this.loading = false;
                        this.getData();

                        this.closeSetToRefusalWindow();
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


    closeSetToRefusalWindow() {
        this.SetToRefusalWindow = false;
    }

    openEditCommentForWoAssetWindow(item) {
        this.selectedItem = item;
        this.EditCommentForWoAssetWindow = true;
        this.attrDesc = item.atadescription;

        this.edit_comment_input = this.selectedItem.woadcomment;
    }

    closeEditCommentForWoAssetWindow() {
        this.EditCommentForWoAssetWindow = false;
    }

    editCommentSave(input) {

        this.loading = true;

        const params = {
            "pWOSEQUENCE": this.selectedItem.wosequence,
            "pASSID": this.selectedItem.assid,
            "pWOPSEQUENCE": this.selectedItem.wopsequence,
            "pWLCODE": this.selectedItem.wlcode,
            "pWLATAID": this.selectedItem.wlataid,
            "pWLPLANYEAR": this.selectedItem.wlplanyear,
            "pWOADComment": input,
            "pUserId": this.currentUser.userId,
        };

        const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');


        this.subs.add(
            this.worksOrdersService.WorkOrderUpdateCommentForAttribute(params).subscribe(
                data => {

                    if (data.isSuccess) {
                        let success_msg = "Comment Updated Successfully";
                        this.alertService.success(success_msg);
                        this.loading = false;
                        this.getData();

                        this.closeEditCommentForWoAssetWindow();
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

    modelChanged(newObj) {
        this.itemData.asaquantity = newObj;
        this.itemData.cost_override = this.itemData.asaquantity * this.itemData.wo_forcast;
        this.itemData.work_cost = this.itemData.asaquantity * this.itemData.wo_forcast;
    }


    async GetDefaultCostForAssetWork(params) {
        let promise = new Promise((resolve, reject) => {
            this.worksOrdersService.GetDefaultCostForAssetWork(params).subscribe(
                (data) => {
                    let costData = data.data[0];

                    this.itemData.wo_forcast = costData.soR_RATE;

                    this.itemData.work_cost = this.itemData.asaquantity * this.itemData.wo_forcast;
                    this.itemData.cost_override = costData.overridE_COST;
                    this.chRef.detectChanges();
                    resolve(true);
                },
                error => {
                    this.alertService.error(error);
                    this.chRef.detectChanges();
                }
            )
        });
        return promise;
    }

    async openEditWorkPackageQtyCostWindow(item) {

        if (item.woadstatus != 'New') {
            return
        }

        $('.woassetdetailoverlay').addClass('ovrlay');

        this.selectedItem = item;
        this.EditWorkPackageQtyCostWindow = true;


    }

    editWorkPackageQtyCostSave() {
        this.loading = true;

        let params = {
            "PWOSEQUENCE": this.selectedItem.wosequence,
            "PWOPSEQUENCE": this.selectedItem.wopsequence,
            "PASSID": this.selectedItem.assid,
            "PWLCODE": this.selectedItem.wlcode,
            "PATAID": this.selectedItem.wlataid,
            "PWLPLANYEAR": this.selectedItem.wlplanyear,
            "PASAQUANTITY": this.itemData.asaquantity,
            "PWORKCOST": this.itemData.work_cost,
            "PWOIADCOMMENT": this.itemData.woadcomment,
            "RECHARGE": this.selectedItem.woadrechargeyn,
            "PREFUSAL": this.selectedItem.woadrefusal,
            "PUSERID": this.currentUser.userId,
        };


        this.worksOrdersService.WOEditWorkPackageTablet(params).subscribe(
            (data) => {


                if (data.isSuccess) {
                    let success_msg = "Work Updated Successfully";
                    this.alertService.success(success_msg);
                    this.loading = false;
                    this.closeEditWorkPackageQtyCostWindow();
                    this.getData();


                } else {
                    this.alertService.error(data.message);
                    this.loading = false
                }


                this.chRef.detectChanges();

            },
            error => {
                this.alertService.error(error);

            }
        )


    }

    closeEditWorkPackageQtyCostWindow() {
        this.EditWorkPackageQtyCostWindow = false;
        $('.woassetdetailoverlay').removeClass('ovrlay');
        this.getData();
        this.chRef.detectChanges();

    }


    refreshAssetDetailGrid(eve) {
        // if (eve) this.getData()
    }


    rechargeToggle(item, recharge) {

        if (item.woadstatus != 'New') {
            return
        }

        this.selectedItem = item;

        this.loading = true;

        let params = {
            "WOSEQUENCE": this.selectedItem.wosequence,
            "WOPSEQUENCE": this.selectedItem.wopsequence,
            "assid": this.selectedItem.assid,
            "WLCODE": this.selectedItem.wlcode,
            "ATAID": this.selectedItem.wlataid,
            "Recharge": this.selectedItem.woadrechargeyn == 'N' ? 'Y' : 'N',
            "UserID": this.currentUser.userId,
            "PlanYear": this.selectedItem.wlplanyear,
        };

        this.worksOrdersService.RechargeToggle(params).subscribe(
            (data) => {

                if (data.isSuccess) {
                    let success_msg = "Recharge Successfully Set";
                    if (!recharge) {
                        success_msg = "Recharge Successfully Cleared";
                    }
                    this.alertService.success(success_msg);
                    this.loading = false;

                    this.getData();


                } else {
                    this.alertService.error(data.message);
                    this.loading = false
                }


                this.chRef.detectChanges();

            },
            error => {
                this.alertService.error(error);

            }
        )

    }



    setSeletedRow(dataItem) {
        this.selectedItem = dataItem;

    }



    cellClickHandler({
        sender,
        column,
        rowIndex,
        columnIndex,
        dataItem,
        isEdited
    }) {
        this.selectedItem = dataItem;
    }

    closeAssetDetailWindow() {
        this.assetDetailWindow = false;
        this.closeAssetDetailEvent.emit(this.assetDetailWindow);
    }


    woMenuBtnSecurityAccess(menuName) {
        return this.helperService.checkWorkOrderAreaAccess(this.worksOrderUsrAccess, menuName)
    }

}
