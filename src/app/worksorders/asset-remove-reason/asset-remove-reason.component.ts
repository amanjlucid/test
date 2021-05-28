import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';

@Component({
  selector: 'app-asset-remove-reason',
  templateUrl: './asset-remove-reason.component.html',
  styleUrls: ['./asset-remove-reason.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetRemoveReasonComponent implements OnInit {
  @Input() openAssetRemoveReason: boolean = false;
  @Input() reasonType: string = 'REMOVE';
  @Output() closeReasonEvent = new EventEmitter<false>();
  @Output() outputReason = new EventEmitter<string>();
  reason: string = '';

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
  reasonData: any;
  title = "Enter Reason For Removing Asset(s)"

  constructor(
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
  ) { }

  ngOnInit(): void {
    if (this.reasonType == 'CANCEL') {
      this.getReasonData();
      this.title = 'Select the Cancellation Reason'
    }
  }

  getReasonData() {
    this.subs.add(
      this.worksorderManagementService.workOrderRefusalCodes(false).subscribe(
        data => {
          // console.log(data)
          if (data.isSuccess) {
            this.reasonData = data.data;
            this.gridView = process(this.reasonData, this.state);
          } else this.alertService.error(data.message)

          this.gridLoading = false;
          this.chRef.detectChanges();
        }
      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.reasonData, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // this.selectedSingleNoAccessData = dataItem;
    this.reason = dataItem.woadrefusal
  }

  closeReason() {
    this.openAssetRemoveReason = false;
    this.closeReasonEvent.emit(false);
  }


  apply() {
    if (this.reason == "") {
      this.alertService.error("Please enter reason");
      return
    }

    this.closeReason();
    this.outputReason.emit(this.reason);

  }


}
