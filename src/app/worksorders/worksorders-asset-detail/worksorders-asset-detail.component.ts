import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, LoaderService, WorksOrdersService, PropertySecurityGroupService } from 'src/app/_services';

@Component({
  selector: 'app-worksorders-asset-detail',
  templateUrl: './worksorders-asset-detail.component.html',
  styleUrls: ['./worksorders-asset-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersAssetDetailComponent implements OnInit {
  @Input() assetDetailWindow: boolean = false;
  @Output() closeAssetDetailEvent = new EventEmitter<boolean>();
  @Input() selectedParentRow: any;
  @Input() worksOrderData: any;
  @Input() selectedChildRow: any;
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
  selectedItem:any;
  assetDetailsGridData:any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  woFormDeleteWindow = false;
  errorDeleteMsg   = '';
  successDeleteMsg = '';

  constructor(
        private worksOrdersService: WorksOrdersService,
        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
        private helperService: HelperService,
  ) { }

  ngOnInit(): void {

    console.log('worksOrderData on asset deatils page ' + JSON.stringify(this.worksOrderData));



    this.WorkOrderAssetDetailPhases();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  WorkOrderAssetDetailPhases(){


    this.worksOrdersService.WorkOrderAssetDetailPhases(this.selectedParentRow.wosequence , this.selectedParentRow.wopsequence).subscribe(
        (data) => {

          if (data.isSuccess) this.assetDetailsGridData = data.data
          else this.alertService.error(data.message);

//this.assetDetailsGridData;
        //  console.log('assetDetailsGridData ' + JSON.stringify(this.assetDetailsGridData));


          //  this.WorkOrderContractListData = data.data;
            this.chRef.detectChanges();

        },
        error => {
            this.alertService.error(error);
            this.chRef.detectChanges();

        }
    )



  }

  finalremoveAssetFromPhase(dataItem) {
      this.selectedItem = dataItem;
      let wosequence   =  this.selectedItem.wosequence;
      let wopsequence  =   this.selectedItem.wopsequence;
      let assid =  this.selectedItem.assid;
      let wlcode =  this.selectedItem.wlcode;
      let wlataid =  this.selectedItem.wlataid;
      let wlplanyear =  this.selectedItem.wlplanyear;

      let params = {
        wosequence   :  wosequence,
         wopsequence  :    wopsequence,
         assid_wlcode : [assid,wlcode,wlataid,wlplanyear],
         userid      :    this.currentUser.userId,
         strCheckOrProcess :   'P',
         RemoveWorkList :    true,
      };

    //console.log('finalremoveAssetFromPhase to dlete ' +  JSON.stringify(params));

    this.worksOrdersService.WorksOrderRemoveWork(params).subscribe(
        (data) => {
            if (data.isSuccess) {
                  let apiData   =   data.data[0];

                 if(apiData.pRETURNSTATUS == 'E'){
                     this.alertService.error(apiData.pRETURNMESSAGE);
                 }

                 else if(apiData.pRETURNSTATUS == 'S'){
                      this.alertService.success(this.successDeleteMsg);
                 }
                 else
                 {
                     this.alertService.error(apiData.pRETURNMESSAGE);
                 }
            }
            //console.log('Delete Data Return '+ JSON.stringify(apiData));
        },
        error => {
            this.alertService.error(error);

        }
    )

  }

  removeAssetFromPhase(dataItem) {


       this.selectedItem = dataItem;

       this.errorDeleteMsg   = '';
       this.successDeleteMsg = '';

      let wosequence   =  this.selectedItem.wosequence;
      let wopsequence  =   this.selectedItem.wopsequence;


      let assid =  this.selectedItem.assid;
      let wlcode =  this.selectedItem.wlcode;
      let wlataid =  this.selectedItem.wlataid;
      let wlplanyear =  this.selectedItem.wlplanyear;


    let params = {
        wosequence   :  wosequence,
         wopsequence  :    wopsequence,
         assid_wlcode : [assid,wlcode,wlataid,wlplanyear],
         userid      :    this.currentUser.userId,
         strCheckOrProcess :   'C',
         RemoveWorkList :    true,
    };

    console.log('Parms to dlete ' +  JSON.stringify(params));

    this.worksOrdersService.WorksOrderRemoveWork(params).subscribe(
        (data) => {
            if (data.isSuccess) {
                  let apiData   =   data.data[0];
                 if(apiData.pRETURNSTATUS == 'E'){
                     this.alertService.error(apiData.pRETURNMESSAGE);
                       this.finalremoveAssetFromPhase(this.selectedItem);
                 }
                 else if(apiData.pRETURNSTATUS == 'S'){
                      this.successDeleteMsg = 'Works Deleted';
                      this.alertService.success(this.successDeleteMsg);

                 }
                 else
                 {
                      this.alertService.error(apiData.pRETURNMESSAGE);

                 }

                 console.log('Delete Data Return '+ JSON.stringify(apiData));

            }



        },
        error => {
            this.alertService.error(error);

        }
    )

    // this.selectedEvent.push(dataItem)
  }






  setSeletedRow(dataItem) {
    this.selectedItem = dataItem;
    // this.selectedEvent.push(dataItem)
  }



    cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
      this.selectedItem = dataItem;
    }

  closeAssetDetailWindow() {
    this.assetDetailWindow = false;
    this.closeAssetDetailEvent.emit(this.assetDetailWindow);
  }

}
