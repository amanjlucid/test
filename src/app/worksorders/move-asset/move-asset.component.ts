import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService } from '../../_services'

@Component({
  selector: 'app-move-asset',
  templateUrl: './move-asset.component.html',
  styleUrls: ['./move-asset.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MoveAssetComponent implements OnInit {
  @Input() moveAsset: boolean = false;
  @Input() selectedAssetList: any;
  @Output() closeMoveAssetEvent = new EventEmitter<boolean>();
  @Output() refreshWorkOrderDetails = new EventEmitter<boolean>();
  subs = new SubSink();
  title = "Select the new Phase";
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  phaseData: any;
  gridView: DataResult;
  gridLoading = true
  selectedPhase: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  reasonWin: boolean = false;
  reason = '';

  constructor(
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit(): void {
    this.getPhase();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getPhase() {
    const { wosequence, wopsequence, parentWoName } = this.selectedAssetList[0];
    this.subs.add(
      this.worksorderManagementService.getWorksOrderPhaseLevelTwo(wosequence).subscribe(
        async data => {
          if (data.isSuccess) {
            this.phaseData = await data.data.filter(x => x.wopsequence != wopsequence && x.wopname != parentWoName);
            this.gridView = process(this.phaseData, this.state);
          } else this.alertService.error(data.message)

          this.gridLoading = false;
          this.chRef.detectChanges();
        }
      )
    )

  }

  closeMoveAsset() {
    this.moveAsset = false;
    this.closeMoveAssetEvent.emit(false);
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.phaseData, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedPhase = dataItem;
  }

  openReason() {
    if (this.selectedPhase == undefined) {
      this.alertService.error("Please select phase.");
      return;
    }

    $('.reasonOverlay').addClass('ovrlay');
    this.reasonWin = true;
  }

  closeReasonWin() {
    this.reasonWin = false;
    $('.reasonOverlay').removeClass('ovrlay');
  }

  apply(checkOrProcess = "C") {
    const { wosequence, wopsequence, assid } = this.selectedAssetList[0];
    const params = {
      WOSEQUENCE: wosequence,
      WOPSEQUENCE: wopsequence,
      WOPSEQUENCE_New: this.selectedPhase.wopsequence,
      ASSIDLIST: [assid],
      Reason: this.reason,
      UserId: this.currentUser.userId,
      CheckOrProcess: checkOrProcess
    }

    this.subs.add(
      this.worksorderManagementService.worksOrderMoveAssetPhase(params).subscribe(
        data => {

          if (!data.isSuccess) {
            this.alertService.error(data.message);
            return
          }

          let resp: any;
          if (data.data[0] == undefined) {
            resp = data.data;
          } else {
            resp = data.data[0];
          }

          if (checkOrProcess == "C" && (resp.pRETURNSTATUS == "E" || resp.pRETURNSTATUS == "S")) {
            this.openConfirmationDialog(resp)
          } else {
            this.alertService.success(resp.pRETURNMESSAGE)

            this.selectedPhase = undefined;
            this.closeMoveAsset();
            this.refreshWorkOrderDetails.emit(true);
          }

        }
      )
    )

  }



  openConfirmationDialog(res) {
    let checkstatus = "C";
    if (res.pRETURNSTATUS == 'S') {
      checkstatus = "P"
    }

    $('.k-window').css({ 'z-index': 1000 });

    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => {
        if (confirmed) {
          if (res.pRETURNSTATUS == 'E') return
          this.apply(checkstatus);
        }

      }).catch(() => console.log('Attribute dismissed the dialog.'));
  }



}
