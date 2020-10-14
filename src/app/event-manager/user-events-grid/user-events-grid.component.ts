import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerDashboardService, HelperService } from '../../_services'


@Component({
  selector: 'app-user-events-grid',
  templateUrl: './user-events-grid.component.html',
  styleUrls: ['./user-events-grid.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEventsGridComponent implements OnInit {
  subs = new SubSink();
  allowUnsort = true;
  multiple = false;
  @Input() userEvents: boolean = false;
  @Input() selectedBarChartXasis: any;
  usereventData: any;
  userEventTempData: any;
  selectedEvent: any;
  @Output() closeUserEvents = new EventEmitter<boolean>();
  title: any = 'User Events';
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

  tempstate: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  public gridView: DataResult;
  pageSize = 25;

  constructor(
    private chRef: ChangeDetectorRef,
    private dashboardService: EventManagerDashboardService,
    private helperService: HelperService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    console.log(this.selectedBarChartXasis)
    this.getEventData(this.selectedBarChartXasis);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  getEventData(params) {
    this.subs.add(
      this.dashboardService.getListOfUserEventByCriteria(params).subscribe(
        data => {
          if (data.isSuccess) {
            console.log(data);
            this.usereventData = data.data;
            this.userEventTempData = Object.assign([], data.data);
            if (this.userEventTempData.length > 0) {
              this.userEventTempData.map(x => {
                x.eventCreatedDate = this.helperService.checkValidDateR(x.eventCreatedDate)
                x.eventPlannedDate = this.helperService.checkValidDateR(x.eventPlannedDate)
                x.eventUpdateDate = this.helperService.checkValidDateR(x.eventUpdateDate)
              })
            }
            this.gridView = process(this.usereventData, this.state);
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  
  public groupChange(groups: GroupDescriptor[]): void {
    this.resetGrid()
    this.state.group = groups;
    this.tempstate.group = groups;
   
    setTimeout(() => {
      this.gridView = process(this.userEventTempData, this.tempstate);
      this.usereventData = this.gridView.data;
      this.gridView.total = this.gridView.data.length;
      this.chRef.detectChanges();

      // let tempData = process(this.userEventTempData, this.tempstate);
      // console.log(tempData);
      // this.usereventData = tempData.data;
      // this.renderGrid(tempData, 200);
    }, 100);

  }


  public sortChange(sort: SortDescriptor[]): void {
    this.tempstate.sort = sort;
    this.tempstate.skip = 0;
    this.tempstate.group = []
    let tempData = process(this.userEventTempData, this.tempstate);
    //this.usereventData = tempData.data;

    this.state.sort = sort;
    this.state.skip = 0;

    if (this.state.group.length > 0) {
      this.tempstate.group = this.state.group;
      this.gridView = process(tempData.data, this.tempstate);
      this.usereventData = this.gridView.data;
      this.gridView.total = this.gridView.data.length
    } else {
      this.gridView = process(tempData.data, this.state);
      this.usereventData = tempData.data;
      this.gridView.total = tempData.total
    }


   // this.gridView = process(this.usereventData, this.state);

  }

  public filterChange(filter: any): void {
    this.resetGrid()
    this.tempstate.filter = filter;
    this.tempstate.group = [];
    let tempData = process(this.userEventTempData, this.tempstate);
    
    this.state.filter = filter;
    if (this.state.group.length > 0) {
      this.tempstate.group = this.state.group;
      setTimeout(() => {
        this.gridView = process(tempData.data, this.tempstate);
        this.usereventData = this.gridView.data;
        this.gridView.total = this.gridView.data.length
        this.chRef.detectChanges();
      }, 30);
    } else {
      setTimeout(() => {
        this.gridView = process(tempData.data, this.state);
        this.usereventData = tempData.data;
        this.gridView.total = tempData.total
        this.chRef.detectChanges();
      }, 30);
    }

  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedEvent = dataItem;
    if (columnIndex > 1) {

    }
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.usereventData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.usereventData.length
    };
  }

  resetGrid() {
    this.state.skip = 0;
  }

  renderGrid(tempGrid: any, timer = 20) {
    setTimeout(() => {
      this.gridView = process(tempGrid.data, this.state)
      this.chRef.detectChanges();
    }, timer);
  }

  closeGrid() {
    this.userEvents = false;
    this.closeUserEvents.emit(this.userEvents)
  }


  export() {
    // console.log(this.usereventData)
    let label = {
      'eventSequence': 'Seq',
      'busareaName': 'Bus Area',
      'eventTypeCode': 'Code',
      'eventName': 'Event',
      'eventParamCount': 'Record(s)',
      'eventProcessedCount': 'Processed',
      'eventCreatedDate': 'Created',
      'eventNotifyStatusName': 'Status',
      'eventAssignUser': 'Assigned To',
      'eventEscStatusName': 'Esc',
      'eventSevTypeName': 'Severity',
      'eventAskTypeName': 'Action',
      'eventPlannedDate': 'Planned',
      'eventCreatedBy': 'Created By',
      'eventUpdatedBy': 'Updated By',
      'eventUpdateDate': 'Updated',

    }

    if (this.usereventData) {
      this.helperService.exportAsExcelFile(this.usereventData, 'Events', label)
    } else {

    }

  }



}
