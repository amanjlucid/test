import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, LoaderService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'app-wo-pm-instruction-assets-detail',
    templateUrl: './wo-pm-instruction-assets-detail.component.html',
    styleUrls: ['./wo-pm-instruction-assets-detail.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoPmInstructionAssetsDetailComponent implements OnInit {
    @Input() instructionAssetsDetailWindow: boolean = false;
    @Output() instructionAssetsDetailEvent = new EventEmitter<boolean>();


    @Input() selectedInstructionAssetRow: any;
    @Input() selectedInstructionRow: any;
    @Input() worksOrderData: any;
    @Input() programmeData: any;
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
    title = 'Work Order Instruction Detail';

    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    loading = false;

    gridData: any;
    gridView: DataResult;
    selectedItem: any;


    constructor(
        private worksOrdersService: WorksOrdersService,
        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
        private sharedService: SharedService,
        private confirmationDialogService: ConfirmationDialogService
    ) { }

    ngOnInit(): void {
        this.GetWOInstructionAssetsDetails();
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

  GetWOInstructionAssetsDetails() {


      const params = {
          "WOSEQUENCE": this.selectedInstructionAssetRow.wosequence,
          "WOISEQUENCE": this.selectedInstructionAssetRow.woisequence,
      };

      const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');



      this.subs.add(
          this.worksOrdersService.GetWOInstructionAssetsDetails(qs).subscribe(
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

  closeInstructionAssetsDetailWindow() {
      this.instructionAssetsDetailWindow = false;
      this.instructionAssetsDetailEvent.emit(this.instructionAssetsDetailWindow);
  }


  openAcceptInstruction(item) {

      this.selectedItem = item;

      //console.log("WorksOrderAcceptAsset item " + JSON.stringify(item))


      let strCheckOrProcess = 'C';

      let strASSID = [item.assid];

      let params = {
          strCheckOrProcess: strCheckOrProcess,
          WOSEQUENCE: item.wosequence,
          WOPSEQUENCE: item.wopsequence,
          strASSID: strASSID,
          strUserId: this.currentUser.userId
      }

      this.worksOrdersService.WorksOrderAcceptAsset(params).subscribe(
          (data) => {

            //  console.log("WorksOrderAcceptAsset response " + JSON.stringify(data))

              if (!data.isSuccess) {
                  this.alertService.error(data.message)
                  return
              }
              if (strCheckOrProcess == "C" && data.data[0].pRETURNSTATUS == "S") {
                  this.openConfirmationDialog(data.data)
              } else if (strCheckOrProcess == "P" && data.data[0].pRETURNSTATUS == "S") {
                  this.alertService.success(data.data[0].pRETURNMESSAGE);
                  //   this.refreshWorkOrderDetails.emit(true);
                  //   this.searchGrid();
              } else if (data.data[0].pRETURNSTATUS != "S") {
                  this.alertService.error(data.data[0].pRETURNMESSAGE)
              }


          },
          error => {
              this.alertService.error(error);

          }
      )

  }


  openConfirmationDialog(resp) {
      let strCheckOrProcess = "N";
      let res = resp[0]
      if (res.pRETURNSTATUS == "S" && res.pWPLSEQUENCE == 0 && res.pWPRSEQUENCE == 0) {
          strCheckOrProcess = "P"
      }
      $('.k-window').css({
          'z-index': 1000
      });
      this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
          .then((confirmed) => (confirmed) ? this.AcceptInstructionFinal(strCheckOrProcess) : console.log(confirmed))
          .catch(() => console.log('Attribute dismissed the dialog.'));
  }


  AcceptInstructionFinal(strCheckOrProcess = "C") {

    //  console.log("this.selectedItem in PRocess " + JSON.stringify(this.selectedItem))

      if (strCheckOrProcess != "C" && strCheckOrProcess != "P") {
          return
      }

      let strASSID = [this.selectedItem.assid];
      let params = {
          strCheckOrProcess: strCheckOrProcess,
          WOSEQUENCE: this.selectedItem.wosequence,
          WOPSEQUENCE: this.selectedItem.wopsequence,
          strASSID: strASSID,
          strUserId: this.currentUser.userId
      }

      this.subs.add(
          this.worksOrdersService.WorksOrderAcceptAsset(params).subscribe(
              data => {
                  if (!data.isSuccess) {
                      this.alertService.error(data.message)
                      return
                  }
                  if (strCheckOrProcess == "C" && data.data[0].pRETURNSTATUS == "S") {
                      this.openConfirmationDialog(data.data)
                  } else if (strCheckOrProcess == "P" && data.data[0].pRETURNSTATUS == "S") {
                      this.alertService.success(data.data[0].pRETURNMESSAGE);
                      //  this.refreshWorkOrderDetails.emit(true);
                      this.GetWOInstructionAssetsDetails();
                  } else if (data.data[0].pRETURNSTATUS != "S") {
                      this.alertService.error(data.data[0].pRETURNMESSAGE)
                  }
              },
              err => this.alertService.error(err)
          )
      )


  }

  }
