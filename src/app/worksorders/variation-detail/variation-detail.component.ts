import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-detail',
  templateUrl: './variation-detail.component.html',
  styleUrls: ['./variation-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationDetailComponent implements OnInit {
  @Input() openVariationDetail: boolean = false;
  @Input() openedFrom = 'worksorder';
  @Input() openedFor = 'details';
  @Input() singleVariationAsset: any = [];
  @Input() singleVariation: any = []; // for edit bulk variation
  @Output() closeVariationDetailEvent = new EventEmitter<boolean>();
  title = 'Works Order Variation Detail';
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
  variationDetailData: any;
  gridView: DataResult;
  loading = true
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  filterToggle = false;
  worksOrderData: any;
  phaseData: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    // console.log(this.singleVariationAsset)
    if (this.openedFor == "details") {
      this.getVariationPageDataWithGrid();
    }

    if (this.openedFor == "EBR") {
      this.getVariationAssetDetails();
    }
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

  closeVariationDetail() {
    this.openVariationDetail = false;
    this.closeVariationDetailEvent.emit(false);
  }

  slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-variationalldetail-header').slideToggle();
    this.chRef.detectChanges();
  }

  getVariationAssetDetails() {
    const { wosequence, wopsequence, woisequence } = this.singleVariation;
    this.subs.add(
      this.workOrderProgrammeService.getWEBWorksOrdersPhaseDetailAndVariation(wosequence, wopsequence, woisequence).subscribe(
        data => {
          console.log(data)
          if (data.isSuccess) {
            this.variationDetailData = data.data;
            this.gridView = process(this.variationDetailData, this.state);
          } else this.alertService.error(data.message);

          this.loading = false;
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )
  }

  getVariationPageDataWithGrid() {
    const { wosequence, wopsequence, woisequence, assid } = this.singleVariationAsset;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
        this.workOrderProgrammeService.getPhase(wosequence, wopsequence),
        this.workOrderProgrammeService.getWOInstructionSpecificAssetsDetails(wosequence, woisequence, assid),

      ]).subscribe(
        data => {
          // console.log(data);
          this.worksOrderData = data[0].data;
          this.phaseData = data[1].data;

          const variationData = data[2];

          if (variationData.isSuccess) {
            this.variationDetailData = variationData.data;
            this.gridView = process(this.variationDetailData, this.state);
          } else this.alertService.error(variationData.message);

          this.loading = false;
          this.chRef.detectChanges();

        }, err => this.alertService.error(err)
      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.variationDetailData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.variationDetailData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.variationDetailData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.variationDetailData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // this.selectedSingleVarWorkList = dataItem;
  }



}
