import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService } from '../../_services'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  allowUnsort = true;
  multiple = false;
  gridView: DataResult;
  checkboxOnly = false;
  mode: any = 'multiple';
  mySelection: number[] = [];
  selectableSettings: SelectableSettings;
  selectedEvent: any = [];
  touchtime = 0;
  currentUser: any;
  hideComplete = true;
  assignedTome = false;
  userEventList: any

  constructor(
    private eveneManagerService: EventManagerService
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getUserEventsList(this.currentUser.userId, this.hideComplete);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    setTimeout(() => {
      this.gridView = process(this.userEventList, this.state);
    }, 100);
  }


  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.userEventList, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.userEventList, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {

  }

  getUserEventsList(userId, hideComplete) {
    this.subs.add(
      this.eveneManagerService.getListOfUserEventByUserId(userId, hideComplete).subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            this.userEventList = data.data;
            this.gridView = process(this.userEventList, this.state);
          }
        }
      )
    )
  }

  hideCompletedFilter($event) {
    this.hideComplete = !this.hideComplete;
    this.getUserEventsList(this.currentUser.userId, this.hideComplete);
  }

  assignedTomeFilter($event) {
    this.assignedTome = !this.assignedTome;
  }

}
