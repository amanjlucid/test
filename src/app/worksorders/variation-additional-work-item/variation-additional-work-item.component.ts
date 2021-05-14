import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-additional-work-item',
  templateUrl: './variation-additional-work-item.component.html',
  styleUrls: ['./variation-additional-work-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationAdditionalWorkItemComponent implements OnInit {
  @Input() openadditionalWork: boolean = false;
  @Input() openedFrom = 'assetchecklist';
  @Input() openedFor = 'details';
  @Output() closeAdditionalWorkEvent = new EventEmitter<boolean>();
  title = 'Choose Work Packages';
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  additionalWorkData: any;
  gridView: DataResult;
  loading = true;
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];


  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeAdditionalWork() {
    this.openadditionalWork = false;
    this.closeAdditionalWorkEvent.emit(false);
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'single'
    };
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.additionalWorkData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.additionalWorkData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.additionalWorkData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.additionalWorkData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // this.selectedSingleVarWorkList = dataItem;
  }

}
