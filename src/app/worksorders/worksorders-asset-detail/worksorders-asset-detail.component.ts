import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, LoaderService, PropertySecurityGroupService } from 'src/app/_services';

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
  assetGridData:any;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeAssetDetailWindow() {
    this.assetDetailWindow = false;
    this.closeAssetDetailEvent.emit(this.assetDetailWindow);
  }

}
