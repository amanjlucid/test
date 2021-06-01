import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-append',
  templateUrl: './variation-append.component.html',
  styleUrls: ['./variation-append.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationAppendComponent implements OnInit {
  @Input() openAppendVariation: boolean = false;
  @Input() openedFrom = 'assetchecklist';
  @Input() openedFor = 'details';
  @Input() selectedAssetInp: any;
  @Output() closeAppendVariation = new EventEmitter<boolean>();
  @Output() appededVariation = new EventEmitter<any>();
  title = 'Select Variation';
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
  gridData: any;
  gridView: DataResult;
  loading = true
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  worksOrderData: any;
  phaseData: any;
  @ViewChild(GridComponent) grid: GridComponent;
  selectedAppendVariation: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings();
  }


  ngOnInit(): void {
    this.getRequiredPageData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  closeAppendVariationMethod() {
    this.openAppendVariation = false;
    this.closeAppendVariation.emit(false);
  }

  getRequiredPageData() {
    const { wosequence, assid, wopsequence } = this.selectedAssetInp;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
        this.workOrderProgrammeService.getPhase(wosequence, wopsequence),
      ]).subscribe(
        data => {
          // console.log(data)
          this.worksOrderData = data[0].data;
          this.phaseData = data[1].data;

          this.getVariation()


        }, err => this.alertService.error(err)
      )
    )
  }

  getVariation() {
    const { wosequence, wopsequence } = this.selectedAssetInp;
    this.subs.add(
      this.workOrderProgrammeService.getAppendVariationList(wosequence, wopsequence).subscribe(
        data => {
          console.log(data)
          if (data.isSuccess) {
            this.gridData = data.data;
            this.gridView = process(this.gridData, this.state);
          } else this.alertService.error(data.message);

          this.grid.autoFitColumns();
          this.loading = false;
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.gridData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.gridData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.gridData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.gridData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedAppendVariation = dataItem;
  }

  setVariation() {
    if (!this.selectedAppendVariation) {
      this.alertService.error("Please select variation.");
      return
    }

    this.closeAppendVariationMethod();
    this.appededVariation.emit(this.selectedAppendVariation)

  }

}
