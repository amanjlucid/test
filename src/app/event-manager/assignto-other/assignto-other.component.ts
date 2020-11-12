import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { forkJoin } from 'rxjs';
import { AlertService, EventManagerService } from '../../_services'

@Component({
  selector: 'app-assignto-other',
  templateUrl: './assignto-other.component.html',
  styleUrls: ['./assignto-other.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigntoOtherComponent implements OnInit {
  subs = new SubSink();
  @Input() assignedToOther = false;
  @Input() selectedEvent: any;
  @Output() closeAssignedTo = new EventEmitter<boolean>();
  @Output() reloadTasks = new EventEmitter<boolean>();
  title = 'Select User to assign to';
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
  pageSize = 25;
  gridView: DataResult;
  allowUnsort = true;
  multiple = false;
  userList: any;
  loading = true;
  selectedItem: any;
  currentUser: any;

  constructor(
    private eventManagerService: EventManagerService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    console.log(this.selectedEvent);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getUserList();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.userList, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.userList, this.state);
  }


  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedItem = dataItem
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.userList.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.userList.length
    };
  }

  closeWin() {
    this.assignedToOther = false;
    this.closeAssignedTo.emit(this.assignedToOther);
  }

  getUserList() {
    this.subs.add(
      this.eventManagerService.getAvailableUser().subscribe(
        data => {
          if (data.isSuccess) {
            this.userList = data.data;
            this.gridView = process(this.userList, this.state);
            this.loading = false;
            this.chRef.detectChanges();
          }
        }
      )
    )
  }


  assignOther() {
    if (this.selectedItem) {
      if (this.selectedEvent.length > 0) {
        let req = [];
        let successData = [];
        for (let userEvent of this.selectedEvent) {
          successData.push(userEvent.eventSequence);
          req.push(this.eventManagerService.transferTo(userEvent.eventSequence, this.selectedItem.mpusid, this.currentUser.userId))
        }

        forkJoin(req).subscribe(
          data => {
            this.alertService.success(`Event number ${successData.join(",")} updated successfully.`);
            this.reloadTasks.emit(true);
            this.closeWin()
            //this.getUserEventsList(this.currentUser.userId, this.hideComplete);
          }
        )
      }
    }
  }


}
