import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, WorksOrdersService } from 'src/app/_services';

@Component({
  selector: 'app-manage-milestones',
  templateUrl: './manage-milestones.component.html',
  styleUrls: ['./manage-milestones.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class ManageMilestonesComponent implements OnInit {
  @Input() openManageMilestone: boolean = false;
  @Input() worksOrderData : any;
  @Output() closeManageMilestoneEvent = new EventEmitter<boolean>();

  openMilestoneEdit : boolean;

  title = 'Manage Milestones';
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
  milestonesData : any;
  singleMilestone : any;
  woClientUserList : any;

  editMilestone : boolean = true;

  constructor(
    private chRef: ChangeDetectorRef,
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService

  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.getManageMilestonesList();
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

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }){
    this.editMilestone = false;
    this.singleMilestone = dataItem;
  }


  closeManageMilestones() {
    this.openManageMilestone = false;
    this.closeManageMilestoneEvent.emit(false);
  }

  getManageMilestonesList() {
      const wosequence = this.worksOrderData.wosequence;
      this.subs.add(
          this.worksOrdersService.getManageMilestoneData(wosequence).subscribe(
          data => {
            if (data.isSuccess) {
              this.getWorkOrderClientUserList(wosequence);
              this.milestonesData = [...data.data];
              this.milestonesData.map(x=>{
                x.wocheckspeciaL2 = x.wocheckspeciaL2.trim();
              });
              this.gridView = process(this.milestonesData, this.state);
            } else this.alertService.error(data.message);

            this.loading = false;
            this.chRef.detectChanges();

          }, err => this.alertService.error(err)
        )
      )

  }

  getWorkOrderClientUserList(wosequence:number) {
    this.subs.add(
        this.worksOrdersService.getWorkOrderClientUserNames(wosequence).subscribe(
        data => {
          if (data.isSuccess) {
            this.woClientUserList = [...data.data];
          } else this.alertService.error(data.message);
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

  confirmEditMilestones(){
    if(this.currentUser.userId !== this.singleMilestone.woresponsibleuser){
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', "You are not listed as being responsible for this milestone, do you want to continue and edit it?")
          .then((confirmed) => (confirmed) ? this.openMilestonesEdit() : console.log(confirmed) )
          .catch(() => console.log('Attribute dismissed the dialog.'));
    }else{
      this.openMilestonesEdit();
    }
  }

  openMilestonesEdit(){
    this.openMilestoneEdit = true;
    $('.milestoneOverlay').addClass('ovrlay');
  }

  closeMilestoneEdit($event){
    this.getManageMilestonesList();
    this.openMilestoneEdit = $event;
    $('.milestoneOverlay').removeClass('ovrlay');
  }

}
