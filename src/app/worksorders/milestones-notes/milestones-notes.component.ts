import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, WorksOrdersService } from 'src/app/_services';

@Component({
  selector: 'app-milestones-notes',
  templateUrl: './milestones-notes.component.html',
  styleUrls: ['./milestones-notes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class MilestonesNotesComponent implements OnInit {
  @Input() openMilestoneNotes = false;
  @Input() selectedMilestoneInp: any;
  @Output() closeMilestoneEvent = new EventEmitter<boolean>();
  title = 'Milestone Notes';
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
  gridData: any
  note = '';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private chRef: ChangeDetectorRef,
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.getMilestoneNotes();
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


  closeMilestoneNotes() {
    this.openMilestoneNotes = false;
    this.closeMilestoneEvent.emit(false);
  }

  getMilestoneNotes() {
    const { wosequence, wopsequence, wochecksurcde } = this.selectedMilestoneInp;
    this.subs.add(
      this.worksOrdersService.getWEBWorksOrdersMilestoneNote(wosequence, wopsequence, wochecksurcde).subscribe(
        data => {
          if (data.isSuccess) {
            this.gridData = data.data;
            this.gridView = process(this.gridData, this.state);
          } else this.alertService.error(data.message);

          this.loading = false;
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )
  }

  cellClickHandler({ dataItem }) {
    // this.singleMilestone = dataItem;
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

  addNotes() {
    if (this.note == '') {
      this.alertService.error("Please enter note.");
      return;
    }

    const { wosequence, wopsequence, wochecksurcde } = this.selectedMilestoneInp;
    const params = {
      WOSEQUENCE: wosequence,
      WOPSEQUENCE: wopsequence,
      WOCHECKSURCDE: wochecksurcde,
      strNote: this.note,
      strUserId: this.currentUser.userId,
    }

    this.subs.add(
      this.worksOrdersService.wEBWorksOrdersInsertMilestoneNote(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.note = '';
            this.getMilestoneNotes();
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )

  }


}
