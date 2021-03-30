import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';

@Component({
  selector: 'app-worksorders-package-mapping',
  templateUrl: './worksorders-package-mapping.component.html',
  styleUrls: ['./worksorders-package-mapping.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorksordersPackageMappingComponent implements OnInit {
  @Input() packageMappingWindow: boolean = false;
  // @Input() selectedChildRow: any;
  @Output() closePackageMappingEvent = new EventEmitter<boolean>();
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
  title = 'Works Order Package Mapping';
  mappingData:any

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closePackageMappingWindow() {
    this.packageMappingWindow = false;
    this.closePackageMappingEvent.emit(this.packageMappingWindow);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }){
    
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.mappingData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.mappingData, this.state);
  }

}
