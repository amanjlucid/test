import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService } from '../../_services'
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-phase-checklist',
  templateUrl: './phase-checklist.component.html',
  styleUrls: ['./phase-checklist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PhaseChecklistComponent implements OnInit {
  @Input() phaseChecklist: boolean = false;
  @Input() selectedPhase: any;
  @Output() closePhaseChecklistEvent = new EventEmitter<boolean>();
  subs = new SubSink();
  title = "Phase checklist";
  worksOrderData: any;
  // programmeData: any;
  phaseFromApi: any;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  phaseCheckListData: any;
  gridView: DataResult;
  loading = true

  constructor(
    private sharedService: SharedService,
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit(): void {
    this.phaseFromApi = this.selectedPhase;
    this.getProgrammeAndWo();
    this.loading = false;
    console.log(this.selectedPhase)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  getProgrammeAndWo() {
    const { wosequence } = this.selectedPhase;
    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorksOrderByWOsequence(wosequence),
      ]).subscribe(
        data => {
          const wo = data[0];
          if (wo.isSuccess) {
            this.worksOrderData = wo.data;
          } else {
            this.alertService.error(wo.message)
          }
          this.chRef.detectChanges();
          console.log(data);
        }
      )
    )

  }

  closePhaseChecklist() {
    this.phaseChecklist = false;
    this.closePhaseChecklistEvent.emit(false);
  }


  clearFilters() {

  }

}
