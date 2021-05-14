import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-work-list',
  templateUrl: './variation-work-list.component.html',
  styleUrls: ['./variation-work-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationWorkListComponent implements OnInit {
  @Input() openVariationWorkList: boolean = false;
  @Input() openedFrom = 'assetchecklist';
  @Input() openedFor = 'details';
  @Input() singleVariation: any = [];
  @Output() closeWorkListEvent = new EventEmitter<boolean>();
  title = '';
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
  variationWorkListData: any;
  gridView: DataResult;
  loading = true
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  selectedSingleVarWorkList: any;
  openFees = false;
  openadditionalWork = false;


  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {

    if (this.openedFor == "details") {
      this.title = `Variation: ${this.singleVariation?.woiissuereason} (${this.singleVariation?.wopsequence})`;
      this.getVariationWorkList();
    } else {
      console.log('in')
      this.title = `Edit Variation Items`;
      this.loading = false;
      this.chRef.detectChanges();
    }



  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'single'
    };
  }

  getVariationWorkList() {
    const { wosequence, assid, wopsequence } = this.singleVariation;

    this.subs.add(
      this.workOrderProgrammeService.getWEBWorksOrdersAssetDetailAndVariation(wosequence, wopsequence, assid).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            this.variationWorkListData = data.data;
            this.gridView = process(this.variationWorkListData, this.state);
          } else this.alertService.error(data.message);

          this.loading = false;
          this.chRef.detectChanges();

        }, err => this.alertService.error(err)

      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.variationWorkListData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.variationWorkListData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.variationWorkListData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.variationWorkListData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedSingleVarWorkList = dataItem;
  }

  closeWorkList() {
    this.openVariationWorkList = false;
    this.closeWorkListEvent.emit(false);
  }

  openFeesMethod() {
    $('.variationWorkListOverlay').addClass('ovrlay')
    this.openFees = true;
  }

  closeOpenFees(eve) {
    this.openFees = eve;
    $('.variationWorkListOverlay').removeClass('ovrlay')
  }

  openAdditionalWorkItem() {
    $('.variationWorkListOverlay').addClass('ovrlay')
    this.openadditionalWork = true
  }

  closeAdditionalWorkItem(eve) {
    this.openadditionalWork = eve;
    $('.variationWorkListOverlay').removeClass('ovrlay')
  }

}
