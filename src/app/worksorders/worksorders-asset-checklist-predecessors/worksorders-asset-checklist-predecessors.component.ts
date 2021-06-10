import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, SharedService, WorksorderManagementService } from '../../_services'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-worksorders-asset-checklist-predecessors',
  templateUrl: './worksorders-asset-checklist-predecessors.component.html',
  styleUrls: ['./worksorders-asset-checklist-predecessors.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorksordersAssetChecklistPredecessorsComponent implements OnInit {
  @Input() predecessors: boolean = false;
  @Input() predecessorsWindowFrom: string = 'assetchecklist';
  @Input() selectedChecklist: any;
  @Output() closePredecessorsEvent = new EventEmitter<boolean>();
  @Output() closeInnerPredecessorsEvent = new EventEmitter<boolean>();

  @Input() predecessorsInner = false


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
  loading = true;
  pageSize = 25;
  title = 'Works Order Asset Checklist Predecessors';
  worksOrderData: any;
  programmeData: any;
  phaseData: any;

  commonParams: any;
  predecessorsData: any;
  gridView: DataResult;
  readonly = true;
  innerselectedChecklist: any;


  constructor(
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    // console.log(this.selectedChecklist)
    // console.log(this.predecessorsWindowFrom)
    // this.commonParams = this.selectedChecklist;
    if (this.predecessorsWindowFrom == 'inner') {
      this.commonParams = this.selectedChecklist;
    } else {
      this.commonParams = this.selectedChecklist[0]
    }
    
    let params = {
      WOSEQUENCE: this.commonParams.wosequence,
      ASSID: this.commonParams.assid,
      WOPSEQUENCE: this.commonParams.wopsequence,
      WOCHECKSURCDE: this.commonParams.wochecksurcde
    }
    this.getPredecessorData(params);
    this.worksOrderDetailPageData();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  worksOrderDetailPageData() {
    // const wprsequence = this.commonParams.wprsequence;
    const intWOSEQUENCE = this.commonParams.wosequence;

    this.subs.add(
      forkJoin([
        // this.worksorderManagementService.getWorkProgrammesByWprsequence(wprsequence),
        this.worksorderManagementService.getWorksOrderByWOsequence(intWOSEQUENCE),
        this.worksorderManagementService.getPhase(this.commonParams.wosequence, this.commonParams.wopsequence),
        this.worksorderManagementService.specificWorkOrderAssets(this.commonParams.wosequence, this.commonParams.assid, this.commonParams.wopsequence),

      ]).subscribe(
        data => {
          // console.log(data)
          // const programmeData = data[0];
          const worksOrderData = data[0];
          const phaseData = data[1];

          // if (programmeData.isSuccess) this.programmeData = programmeData.data[0];
          if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;
          if (phaseData.isSuccess) this.phaseData = phaseData.data;



        }
      )
    )
  }

  getPredecessorData(params) {
    this.subs.add(
      this.worksorderManagementService.getPredecessors(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.predecessorsData = data.data;
            this.gridView = process(this.predecessorsData, this.state);
          } else {
            this.alertService.error(data.message);
          }
          this.loading = false
          this.chRef.detectChanges();
        }
      )
    )
  }

  closepredecessors() {
    if (this.predecessorsWindowFrom == "inner") {
      this.predecessorsInner = false;
      this.closeInnerPredecessorsEvent.emit(this.predecessorsInner);
    } else {
      this.predecessors = false;
      this.closePredecessorsEvent.emit(this.predecessors);
    }

  }

  closeInnerPredessor(eve) {
    this.predecessorsInner = false;
    $('.predecessorsOverlay').removeClass('ovrlay');
  }


  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // this.selectedDefinition = dataItem;
    // if (columnIndex > 1) {
    //   this.openDefinitionDetailPopUp(dataItem)
    // }
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.predecessorsData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.predecessorsData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.predecessorsData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.predecessorsData.length
    };
  }

  openPredecessors(item) {
    $('.predecessorsOverlay').addClass('ovrlay');
    this.predecessorsInner = true;
    this.innerselectedChecklist = item
  }
}
