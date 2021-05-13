import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-list',
  templateUrl: './variation-list.component.html',
  styleUrls: ['./variation-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationListComponent implements OnInit {
  @Input() openVariationList: boolean = false;
  @Input() openedFrom = 'assetchecklist';
  @Input() selectedAsset: any = [];
  @Output() closeVariationListEvent = new EventEmitter<boolean>();

  title = 'List Variations';
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
  variationData: any;
  gridView: DataResult;
  loading = true
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];

  filterToggle = false;
  worksOrderData: any;
  phaseData: any;
  assetDetails: any;
  selectedSingleVariation: any;
  openVariationWorkList: boolean = false;



  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    // private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
    // private sharedService: SharedService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    console.log(this.selectedAsset);
    this.getVariationPageDataWithGrid();
    // this.getGridData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'multiple'
    };
  }


  closeVariationList() {
    this.openVariationList = false;
    this.closeVariationListEvent.emit(false);
  }

  slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-variation-header').slideToggle();
    this.chRef.detectChanges();
  }

  getVariationPageDataWithGrid() {
    const { wosequence, assid, wopsequence } = this.selectedAsset;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
        this.workOrderProgrammeService.getPhase(wosequence, wopsequence),
        this.workOrderProgrammeService.getAssetAddressByAsset(assid),
        this.workOrderProgrammeService.getWEBWorksOrdersVariationList(wosequence, wopsequence, assid)
      ]).subscribe(
        data => {
          console.log(data)

          this.worksOrderData = data[0].data;
          this.phaseData = data[1].data;
          this.assetDetails = data[2].data[0];

          const variationData = data[3];

          if (variationData.isSuccess) {
            this.variationData = variationData.data;
            this.gridView = process(this.variationData, this.state);
          } else this.alertService.error(variationData.message);

          this.loading = false;
          this.chRef.detectChanges();

        }
      )
    )
  }


  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.variationData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.variationData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.variationData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.variationData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedSingleVariation = dataItem;
  }

  openVariationDetails(item) {
    this.selectedSingleVariation = item;
    this.openVariationWorkList = true;
    $('.variationListOverlay').addClass('ovrlay');
  }

  closeVariationDetails(eve) {
    this.openVariationWorkList = eve;
    $('.variationListOverlay').removeClass('ovrlay');
  }



}
