import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerDashboardService, EventManagerService, HelperService } from '../../_services'

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [{ field: 'busAreaDesc' }],
    filter: {
      logic: "or",
      filters: []
    }
  }
  tempstate: State = {
    skip: 0,
    sort: [],
    group: [{ field: 'busAreaDesc' }],
    filter: {
      logic: "or",
      filters: []
    }
  }

  allowUnsort = true;
  multiple = false;
  public gridView: DataResult;
  pageSize = 25;
  taskDetails: any;
  taskDetailsTemp: any
  selectedEvent: any;

  constructor(
    private eventManagerService: EventManagerService
  ) { }

  ngOnInit(): void {
    this.getEventData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  getEventData() {
    this.subs.add(
      this.eventManagerService.getEventTypeList().subscribe(
        data => {
          if (data.isSuccess) {
            this.taskDetails = data.data;
            this.taskDetailsTemp = Object.assign([], data.data);
            // if (this.taskDetailsTemp.length > 0) {
            //   this.taskDetailsTemp.map(x => {
            //     x.eventCreatedDate = this.helperService.checkValidDateR(x.eventCreatedDate)
            //     x.eventPlannedDate = this.helperService.checkValidDateR(x.eventPlannedDate)
            //     x.eventUpdateDate = this.helperService.checkValidDateR(x.eventUpdateDate)
            //   })
            // }

            console.log(this.taskDetails)
            this.gridView = process(this.taskDetailsTemp, this.tempstate);
            this.gridView.total = this.gridView.data.length
            console.log(this.gridView)

          }
        }
      )
    )
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.resetGrid()
    this.state.group = groups;
    this.tempstate.group = groups
    setTimeout(() => {
      this.gridView = process(this.taskDetailsTemp, this.tempstate);
      this.taskDetails = this.gridView.data;
      this.gridView.total = this.gridView.data.length
    }, 100);
  }


  public sortChange(sort: SortDescriptor[]): void {
    this.tempstate.sort = sort;
    this.tempstate.skip = 0;
    this.tempstate.group = []
    let tempData: any = process(this.taskDetailsTemp, this.tempstate);
   

    this.state.sort = sort;
    this.state.skip = 0;
    
    if (this.state.group.length > 0) {
      this.tempstate.group = this.state.group;
      this.gridView = process(tempData.data, this.tempstate);
      this.taskDetails = this.gridView.data;
      this.gridView.total = this.gridView.data.length
    } else {
      this.gridView = process(tempData.data, this.state);
      this.taskDetails = tempData.data;
      this.gridView.total = tempData.total
    }
    
  }

  public filterChange(filter: any): void {
    this.resetGrid()
    this.tempstate.filter = filter;
    this.tempstate.group = [];
    let tempData = process(this.taskDetailsTemp, this.tempstate);

    this.state.filter = filter;
    if (this.state.group.length > 0) {
      this.tempstate.group = this.state.group;
      setTimeout(() => {
        this.gridView = process(tempData.data, this.tempstate);
        this.taskDetails = this.gridView.data;
        this.gridView.total = this.gridView.data.length
      }, 200);
    } else {
      setTimeout(() => {
        this.gridView = process(tempData.data, this.state);
        this.taskDetails = tempData.data;
        this.gridView.total = tempData.total
      }, 200);
    }

    // this.taskDetails = tempData.data;
    // this.renderGrid(tempData, 200)
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedEvent = dataItem;
    if (columnIndex > 1) {

    }
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.taskDetails.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.taskDetails.length
    };
  }

  resetGrid() {
    this.state.skip = 0;
  }

  renderGrid(tempGrid: any, timer = 20) {
    setTimeout(() => {
      this.gridView = process(tempGrid.data, this.state)
      // this.chRef.detectChanges();
    }, timer);
  }


}
