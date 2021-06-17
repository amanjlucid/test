import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, SharedService, WorksOrdersService } from 'src/app/_services';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-manage-milestones',
  templateUrl: './manage-milestones.component.html',
  styleUrls: ['./manage-milestones.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class ManageMilestonesComponent implements OnInit {
  @Input() openManageMilestone: boolean = false;
  @Input() worksOrderData: any;
  @Output() closeManageMilestoneEvent = new EventEmitter<boolean>();
  @Input() predecessors = false;
  @Input() selectedMilestoneInp: any;
  openPredecessors = false;
  openMilestoneEdit: boolean;
  title = 'Work Order Milestones';
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

  gridView: DataResult;
  loading = true
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  filterToggle = false;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  milestonesData: any;
  singleMilestone: any;

  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];

  openMilestoneNotes = false;
  documentWindow = false;
  woName = '';

  constructor(
    private chRef: ChangeDetectorRef,
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private sharedService: SharedService

  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.subs.add(
      combineLatest([
        this.sharedService.worksOrdersAccess,
        this.sharedService.woUserSecObs,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          this.worksOrderAccess = data[0];
          this.worksOrderUsrAccess = data[1];
          this.userType = data[2][0];
        }
      )
    )

    this.woName = this.worksOrderData?.woname ?? this.worksOrderData?.name;
    this.getMilestoneChecklist();
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

  cellClickHandler({ dataItem }) {
    this.singleMilestone = dataItem;
  }


  closeManageMilestones() {
    this.openManageMilestone = false;
    this.closeManageMilestoneEvent.emit(false);
  }


  getMilestoneChecklist() {
    const { wosequence } = this.worksOrderData;
    let wopSeq = 0;
    let wochecksurcde = 0;
    if (this.predecessors) {
      this.title = 'Work Order Milestones Predecessors';
      wopSeq = this.selectedMilestoneInp.wopsequence;
      wochecksurcde = this.selectedMilestoneInp.wochecksurcde;
    }
    this.subs.add(
      this.worksOrdersService.getMilestoneChecklist(wosequence, wopSeq, wochecksurcde).subscribe(
        data => {
          if (data.isSuccess) {
            this.milestonesData = data.data;
            this.gridView = process(this.milestonesData, this.state);
          } else this.alertService.error(data.message);

          this.loading = false;
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )
  }



  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.milestonesData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.milestonesData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.milestonesData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.milestonesData.length
    };
  }


  openMilestonesEdit(item) {
    this.singleMilestone = item;
    $('.milestoneOverlay').addClass('ovrlay');
    this.openMilestoneEdit = true;
    this.chRef.detectChanges();
  }

  closeMilestoneEdit($event) {
    this.openMilestoneEdit = $event;
    $('.milestoneOverlay').removeClass('ovrlay');
    this.getMilestoneChecklist();
  }

  openPredecessorsMethod(item) {
    this.singleMilestone = item;
    $('.milestonePredecessorsOverlay').addClass('ovrlay');
    this.openPredecessors = true;

  }

  closePredecessors(eve) {
    this.openPredecessors = false;
    $('.milestonePredecessorsOverlay').removeClass('ovrlay');
  }


  woMenuAccess(menuName: string) {
    if (this.userType == undefined) return true;

    if (this.userType?.wourroletype == "Dual Role") {
      return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    }
    return this.worksOrderUsrAccess.indexOf(menuName) != -1
  }


  openMilestoneNotesMethod(item) {
    this.singleMilestone = item;
    $('.milestoneOverlay').addClass('ovrlay');
    this.openMilestoneNotes = true;
  }


  closeMilestoneNotes($event) {
    this.openMilestoneNotes = $event;
    $('.milestoneOverlay').removeClass('ovrlay');
    this.getMilestoneChecklist();
  }

  openDocumentWindow(item) {
    this.singleMilestone = item;
    $('.milestoneOverlay').addClass('ovrlay');
    this.documentWindow = true;
  }

  closeDocument($event) {
    this.documentWindow = $event;
    $('.milestoneOverlay').removeClass('ovrlay');
    this.getMilestoneChecklist();
  }

}
