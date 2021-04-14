import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, LoaderService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';

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
    @Input() selectedChildRow: any;
    @Input() selectedParentRow: any;
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

    constructor(
        private worksOrdersService: WorksOrdersService,
        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
        private sharedService: SharedService,
        private confirmationDialogService: ConfirmationDialogService
    ) { }

    ngOnInit(): void {

        this.subs.add(
            this.sharedService.worksOrdersAccess.subscribe(
                data => {
                    this.worksOrderAccess = data;
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



        // console.log('selectedParentRow on aASEET Detaails Page ' + JSON.stringify(this.selectedParentRow));
        //console.log('worksOrderData on asset deatils page ' + JSON.stringify(this.worksOrderData));
        //console.log('selected tRow on asset deatils page ' + JSON.stringify(this.selectedRow));


        //if(this.treelevel == 2)
        //  this.WorkOrderAssetDetailPhases();



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

        let promise = new Promise((resolve, reject) => {
            this.worksOrdersService.WorkOrderAssetDetail(this.selectedRow.wosequence, this.selectedRow.wopsequence, this.selectedRow.assid, 0).subscribe(
                (data) => {

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

    finalremoveAssetFromPhase(dataItem) {
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
            RemoveWorkList: true,
        };

        //console.log('finalremoveAssetFromPhase to dlete ' +  JSON.stringify(params));

        this.worksOrdersService.WorksOrderRemoveWork(params).subscribe(
            (data) => {
                if (data.isSuccess) {
                    let apiData = data.data[0];

                    if (apiData.pRETURNSTATUS == 'E') {
                        this.alertService.error(apiData.pRETURNMESSAGE);
                    } else if (apiData.pRETURNSTATUS == 'S') {
                        this.successDeleteMsg = 'Works Deleted';
                        this.alertService.success(this.successDeleteMsg);
                        this.getData();
                    } else {
                        this.alertService.error(apiData.pRETURNMESSAGE);
                    }

                    // console.log('finalremoveAssetFromPhase api data '+ JSON.stringify(apiData));
                }

            },
            error => {
                this.alertService.error(error);

            }
        )

    }


    finalDeleteWorkConfirmBox(item, msg) {

        $('.k-window').css({
            'z-index': 1000
        });
        this.confirmationDialogService.confirm('Please confirm..', msg)
            .then((confirmed) => (confirmed) ? this.finalremoveAssetFromPhase(item) : console.log(confirmed))
            .catch(() => console.log('Attribute dismissed the dialog.'));
    }


    removeAssetFromPhase(dataItem) {


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
            RemoveWorkList: true,
        };

        //  console.log('Parms to dlete ' +  JSON.stringify(params));

        this.worksOrdersService.WorksOrderRemoveWork(params).subscribe(
            (data) => {
                if (data.isSuccess) {
                    let apiData = data.data[0];
                    if (apiData.pRETURNSTATUS == 'E') {
                        this.alertService.error(apiData.pRETURNMESSAGE);

                    } else if (apiData.pRETURNSTATUS == 'S') {
                        this.finalDeleteWorkConfirmBox(this.selectedItem, apiData.pRETURNMESSAGE);
                    } else {
                        this.alertService.error(apiData.pRETURNMESSAGE);

                    }

                    //   console.log('Delete Data Return '+ JSON.stringify(apiData));

                }



            },
            error => {
                this.alertService.error(error);

            }
        )

        // this.selectedEvent.push(dataItem)
    }

    clearRefusalConfirm(item) {

        this.selectedItem = item;


        $('.k-window').css({
            'z-index': 1000
        });
        this.confirmationDialogService.confirm('Please confirm..', 'Clear Refusal')
            .then(
                (confirmed) => {

                    if (confirmed) {

                        this.itemData.refusal_code = '';

                        this.SetToRefusalSave();


                    }

                }


                //(confirmed) ? this.finalremoveAssetFromPhase(item) : console.log(confirmed)
            )
            .catch(() => console.log('Attribute dismissed the dialog.'));



    }

    openSwapPackage(item) {

        this.selectedItem = item;
        this.SwapPackageWindow = true;
        this.itemData.assid = item.assid;
        this.itemData.wocheckname = item.wocheckname;
        this.itemData.woname = this.selectedRow.woname;


        //console.log('selectedItem'+ JSON.stringify(this.selectedItem));
        //console.log('worksOrderData'+ JSON.stringify(this.worksOrderData));




        let paramsTosend = {
            'ASSID': this.selectedItem.assid,
            'CTTSURCDE': this.worksOrderData.cttsurcde,
            'PLANYEAR': this.selectedItem.wlplanyear,
            'WOSEQUENCE': this.selectedItem.wosequence,
            'WOCHECKSURCDE': this.selectedItem.wochecksurcde,
            'ATAID': this.selectedItem.wlataid,

        };



        this.worksOrdersService.GetWorksPackagesForAssets(paramsTosend).subscribe(
            (data) => {

                //  console.log('openSwapPackage item  api reponse'+ JSON.stringify(data));



                if (data.isSuccess) {
                    this.SwapPackagesForAssetsDataGrid = data.data

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




    }

    closeSwapPackageWindow() {

        this.SwapPackageWindow = false;



    }

    openSetToRefusalWindow(item) {

        //  console.log('item  api reponse'+ JSON.stringify(item));
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

                    console.log('WorkOrderRefusalCodes api reponse' + JSON.stringify(data));
                },
                err => this.alertService.error(err)
            )
        )



    }

    SetToRefusalSave() {

        console.log('SetToRefusalSave itemDat' + JSON.stringify(this.itemData));




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
                        let success_msg = "Save successfully";
                        this.alertService.success(success_msg);
                        this.loading = false;
                        this.getData();

                        this.closeSetToRefusalWindow();
                    } else {
                        this.alertService.error(data.message);
                        this.loading = false
                    }

                    this.chRef.detectChanges();

                    // console.log('WorkOrderUpdateCommentForAttribute api reponse'+ JSON.stringify(data));
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
                        let success_msg = "Save successfully";
                        this.alertService.success(success_msg);
                        this.loading = false;
                        this.getData();

                        this.closeEditCommentForWoAssetWindow();
                    } else {
                        this.alertService.error(data.message);
                        this.loading = false
                    }

                    this.chRef.detectChanges();

                    // console.log('WorkOrderUpdateCommentForAttribute api reponse'+ JSON.stringify(data));
                },
                err => this.alertService.error(err)
            )
        )
        //console.log(input);

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
                    //console.log('costData'+ JSON.stringify(costData));
                    this.itemData.wo_forcast = costData.soR_RATE;
                    //this.itemData.work_cost =  costData.cost;
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

        this.selectedItem = item;
        this.EditWorkPackageQtyCostWindow = true;

        this.itemData.wlcomppackage = item.wlcomppackage;
        this.itemData.wphname = item.wphname;
        this.itemData.atadescription = item.atadescription;
        this.itemData.asaquantity = item.asaquantity;
        this.itemData.asauom = item.asauom;
        this.itemData.woadforecast = item.woadforecast;
        this.itemData.woadcomment = item.woadcomment;

        let params = {
            "WLCode": this.selectedItem.wlcode,
            "WLATAId": this.selectedItem.wlataid,
            "WLAssid": this.selectedItem.assid,
            "WLPlanYear": this.selectedItem.wlplanyear,
            "WOSequence": this.selectedItem.wosequence
        };

        await this.GetDefaultCostForAssetWork(params);

        //console.log('costData'+ JSON.stringify(this.itemData));
        //this.itemData.work_cost = (  this.itemData.wo_forcast * item.asaquantity) ;
        //this.itemData.cost_override = (  this.itemData.wo_forcast * item.asaquantity) ;


    }
    
    editWorkPackageQtyCostSave() {

        this.loading = true;
        console.log('this.itemData values ' + JSON.stringify(this.itemData));


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




        //console.log('Parms to WOEditWorkPackageTablet ' +  JSON.stringify(params));

        this.worksOrdersService.WOEditWorkPackageTablet(params).subscribe(
            (data) => {


                /// console.log('WOEditWorkPackageTablet Api Response '+ JSON.stringify(data));

                if (data.isSuccess) {
                    let success_msg = "Save successfully";
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
        this.chRef.detectChanges();

    }


    rechargeToggle(item) {

        this.selectedItem = item;

        this.loading = true;
        //  console.log('this.itemData values '+ JSON.stringify(this.itemData));


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


        //console.log('Parms to WOEditWorkPackageTablet ' +  JSON.stringify(params));

        this.worksOrdersService.RechargeToggle(params).subscribe(
            (data) => {


                /// console.log('WOEditWorkPackageTablet Api Response '+ JSON.stringify(data));

                if (data.isSuccess) {
                    let success_msg = "Saved successfully";
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
        // this.selectedEvent.push(dataItem)
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

}
