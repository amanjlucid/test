import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-list-all',
  templateUrl: './variation-list-all.component.html',
  styleUrls: ['./variation-list-all.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationListAllComponent implements OnInit {
  @Input() openVariationListAll: boolean = false;
  @Input() openedFrom = 'worksorder';
  @Input() singleWorksOrder: any = [];
  @Output() closeVariationAllListEvent = new EventEmitter<boolean>();
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  title = 'Variations';
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

  openVariationList =false;
  opneBlankVariation = false;

  // filterToggle = false;
  // worksOrderData: any;
  // phaseData: any;
  // assetDetails: any;
  // woAsset: any;

  // selectedSingleVariation: any;
  // openVariationWorkList: boolean = false;
  // openNewVariation: boolean = false;
  // formMode = 'new'
  // openedFor = 'details'

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private worksOrderService: WorksOrdersService,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.getAllVariations();
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

  closeVariationListAll() {
    this.openVariationListAll = false;
    this.closeVariationAllListEvent.emit(false);
  }

  // slideToggle() {
  //   this.filterToggle = !this.filterToggle;
  //   $('.worksorder-variationall-header').slideToggle();
  //   this.chRef.detectChanges();
  // }

  getAllVariations() {
    const { wprsequence, wosequence } = this.singleWorksOrder;
    this.subs.add(
      this.worksOrderService.getWEBWorksOrdersInstructionsForUser(wprsequence, wosequence, this.currentUser.userId, true).subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            this.variationData = data.data;
            this.gridView = process(this.variationData, this.state);
          } else this.alertService.error(data.message);

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
    // this.selectedSingleVariation = dataItem;
  }

  disableVariationBtns(btnType, item) {
    if (btnType == 'Edit') {
      return item.woiissuestatus == 'New' ? false : true;
    } else if (btnType == 'Customer') {
      return item.woiissuestatus == 'New' ? false : true;
    } else if (btnType == 'Contractor' || btnType == 'Issue') {
      return item.woiissuestatus == 'Customer Review' || item.woiissuestatus == 'New' ? false : true;
    }
    
    return false
  }


  openVariationlist(){
    $('.variationListAllOverlay').addClass('ovrlay');
    this.openVariationList = true;
  }

  closeVariation(eve){
    this.openVariationList = eve;
    $('.variationListAllOverlay').removeClass('ovrlay');
  }

  newBlankVariation(){
    $('.variationListAllOverlay').addClass('ovrlay');
    this.opneBlankVariation = true;
  }

  closeBlankVariation(eve){
    this.opneBlankVariation = eve;
    $('.variationListAllOverlay').removeClass('ovrlay');
  }

}
