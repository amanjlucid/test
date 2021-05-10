import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService } from '../../_services'


@Component({
  selector: 'app-no-access-history',
  templateUrl: './no-access-history.component.html',
  styleUrls: ['./no-access-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NoAccessHistoryComponent implements OnInit {
  @Input() noaccessHistory: boolean = false;
  @Input() selectedChecklistsingleItem: any;
  @Output() closeNoAccessHistoryEve = new EventEmitter<boolean>();
  subs = new SubSink();
  title = "No Access Records For Asset";
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  noAccessData: any;
  gridView: DataResult;
  gridLoading = true
  selectedSingleNoAccessData: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
  ) { }

  ngOnInit(): void {
    this.getNoAccessData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getNoAccessData() {
    const { wosequence, wopsequence, assid } = this.selectedChecklistsingleItem;
    this.subs.add(
      this.worksorderManagementService.getNoAccessHistory(wosequence, wopsequence, assid).subscribe(
        data => {
          if (data.isSuccess) {
            this.noAccessData = data.data;
            this.gridView = process(this.noAccessData, this.state);
          } else this.alertService.error(data.message)

          this.gridLoading = false;
          this.chRef.detectChanges();
        }
      )
    )
  }

  closeNoAccessHistory() {
    this.noaccessHistory = false;
    this.closeNoAccessHistoryEve.emit(false);
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.noAccessData, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedSingleNoAccessData = dataItem;
  }

  delete(checkOrProcess = "C") {
    const { wosequence, wopsequence, assid, wochecksurcde, wostagesurcde, woacnasequence } = this.selectedSingleNoAccessData;
    
    let params = {
      WOSEQUENCE: wosequence,
      WOPSEQUENCE: wopsequence,
      ASSID: assid,
      WOCheckCode: wochecksurcde,
      WOStageCode: wostagesurcde,
      WOACNASEQUENCE: woacnasequence,
      UserId: this.currentUser.userId,
      CheckProcess: checkOrProcess
    }

    this.subs.add(
      this.worksorderManagementService.deleteNoAccessRecord(params).subscribe(
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
            this.getNoAccessData();
            this.selectedSingleNoAccessData = undefined;
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
          this.delete(checkstatus);
        }

      }).catch(() => console.log('Attribute dismissed the dialog.'));
  }




}
