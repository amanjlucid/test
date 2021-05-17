import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
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

  title = 'Variation Assets';
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
  woAsset: any;
  selectedSingleVariation: any;
  openVariationWorkList: boolean = false;
  openNewVariation: boolean = false;
  formMode = 'new'
  openedFor = 'details'

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private helperService: HelperService,

  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    // console.log(this.selectedAsset);
    this.getVariationPageDataWithGrid();
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
        this.workOrderProgrammeService.getWEBWorksOrdersVariationList(wosequence, wopsequence, assid),
        this.workOrderProgrammeService.specificWorkOrderAssets(wosequence, assid, wopsequence),
      ]).subscribe(
        data => {
          // console.log(data)

          this.worksOrderData = data[0].data;
          this.phaseData = data[1].data;
          this.assetDetails = data[2].data[0];
          const variationData = data[3];
          this.woAsset = data[4].data[0];


          if (variationData.isSuccess) {
            this.variationData = variationData.data;
            this.gridView = process(this.variationData, this.state);
          } else this.alertService.error(variationData.message);

          this.loading = false;
          this.chRef.detectChanges();

        }, err => this.alertService.error(err)
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

  newVariation() {
    this.formMode = 'new';
    this.openNewVariation = true;
    $('.variationListOverlay').addClass('ovrlay');
    setTimeout(() => {
      this.chRef.detectChanges();
    }, 100);
  }

  closeNewVariation(eve) {
    this.openNewVariation = eve;
    $('.variationListOverlay').removeClass('ovrlay');
  }

  getVariationReason(reason) {
    if (reason != "") {
      if (this.openedFrom == "assetchecklist" && this.formMode == "new") {
        this.openedFor = 'edit';
        this.openVariationDetails(undefined);
      }

    }
  }

  editVariation(item) {
    this.formMode = 'edit';
    this.selectedSingleVariation = item;
    this.openNewVariation = true;
    $('.variationListOverlay').addClass('ovrlay');
  }

  disableVariationBtns(btnType, item) {
    if (btnType == 'Edit') {
      return item.woiissuestatus == 'New' ? false : true;
    } else if (btnType == 'Customer') {
      return item.woiissuestatus == 'New' ? false : true;
    } else if (btnType == 'Contractor' || btnType == 'Issue') {
      return item.woiissuestatus == 'Customer Review' || item.woiissuestatus == 'New' ? false : true;
    }
    
  }



}
