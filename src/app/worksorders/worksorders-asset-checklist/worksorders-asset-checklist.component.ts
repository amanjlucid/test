import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, SharedService, WorksorderManagementService } from '../../_services'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-worksorders-asset-checklist',
  templateUrl: './worksorders-asset-checklist.component.html',
  styleUrls: ['./worksorders-asset-checklist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class WorksordersAssetChecklistComponent implements OnInit {
  @Input() assetchecklistWindow: boolean = false;
  @Input() selectedChildRow: any;
  @Output() closeAssetchecklistEvent = new EventEmitter<boolean>();
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
  assetCheckListData: any;
  gridView: DataResult;
  gridLoading = true
  pageSize = 25;
  title = 'Works Orders Asset Checklist';
  mySelection = [];
  selectedChecklist = [];
  loading = true;

  programmeData: any;
  worksOrderData: any;
  phaseData: any;
  gridHeight = 680;
  filterToggle = false;
  readonly = true;

  checklistDocWindow = false;


  constructor(
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
    
  ) { }

  ngOnInit(): void {
    console.log(this.selectedChildRow);
    this.worksOrderDetailPageData();
  }

  worksOrderDetailPageData() {
    const wprsequence = this.selectedChildRow.wprsequence;
    const intWOSEQUENCE = this.selectedChildRow.wosequence;

    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorkProgrammesByWprsequence(wprsequence),
        this.worksorderManagementService.getWorksOrderByWOsequence(intWOSEQUENCE),
        this.worksorderManagementService.getPhase(this.selectedChildRow.wosequence, this.selectedChildRow.wopsequence),

      ]).subscribe(
        data => {
          console.log(data)
          const programmeData = data[0];
          const worksOrderData = data[1];
          const phaseData = data[1];

          if (programmeData.isSuccess) this.programmeData = programmeData.data[0];
          if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;
          if (phaseData.isSuccess) this.phaseData = phaseData.data;

          this.checkListGridData();

        }
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  checkListGridData() {
    this.subs.add(
      this.worksorderManagementService.assetChecklistGridData(this.selectedChildRow.wosequence, this.selectedChildRow.assid, this.selectedChildRow.wopsequence).subscribe(
        data => {
          console.log(data)
          if (data.isSuccess) {
            this.assetCheckListData = data.data;
            this.gridView = process(this.assetCheckListData, this.state);
          } else {
            this.alertService.error(data.message);
          }
          this.loading = false
          this.chRef.detectChanges();
        }
      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.assetCheckListData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.assetCheckListData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.assetCheckListData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.assetCheckListData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // this.selectedDefinition = dataItem;
    // if (columnIndex > 1) {
    //   this.openDefinitionDetailPopUp(dataItem)
    // }
  }


  closeAssetcheckListWindow() {
    this.assetchecklistWindow = false;
    this.closeAssetchecklistEvent.emit(this.assetchecklistWindow);
  }

  public slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-assetchecklist-header').slideToggle();
    if (this.filterToggle) this.gridHeight = 400;
    else this.gridHeight = 680;
    this.chRef.detectChanges();

  }

  openChecklistDoc() {
    $('.checklistOverlay').addClass('ovrlay');
    this.checklistDocWindow = true;
  }

  closeChecklistDoc() {
    $('.checklistOverlay').removeClass('ovrlay');
    this.checklistDocWindow = false;
  }

  setSeletedRow(dataItem) {
    this.mySelection = [];
    this.selectedChecklist = [];
    // this.mySelection.push(dataItem.eventSequence)
    this.selectedChecklist.push(dataItem)
  }

}
