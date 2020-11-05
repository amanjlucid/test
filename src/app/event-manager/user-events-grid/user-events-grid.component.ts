import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
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
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  mySelection: number[] = [];
  gridView: DataResult;
  columnName = [];

  constructor(
    private chRef: ChangeDetectorRef,
    private dashboardService: EventManagerDashboardService,
    private helperService: HelperService,
    private alertService: AlertService,

  ) { }

  ngOnInit() {

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
            let userEventTempData = Object.assign([], data.data);
            let col = data.data[0];

            for (let cl in col) {
              if (col[cl] != '')
                this.columnName.push({ 'key': `col${cl}`, 'val': col[cl] })
            }

            userEventTempData.shift();
            for (let tmpData of userEventTempData) {
              for (let tindex in tmpData) {
                tmpData[`col${tindex}`] = tmpData[tindex]
                delete tmpData[tindex];
              }
            }

            this.usereventData = Object.assign([], userEventTempData);
            this.renderGrid();

          }
        }
      )
    )
  }


  groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.renderGrid();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.renderGrid();
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.renderGrid();
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedEvent = dataItem;
    if (columnIndex > 1) {

    }
  }

  renderGrid() {
    this.gridView = process(this.usereventData, this.state);
    this.chRef.detectChanges();
  }

  closeGrid() {
    this.userEvents = false;
    this.closeUserEvents.emit(this.userEvents)
  }


  redirectToUserEevnt(val) {
    const host = window.location.hostname;
    let siteUrl = "";
    if (host == "localhost") {
      siteUrl = "http://localhost:4200"
    } else {
      siteUrl = "http://104.40.138.8/rowanwood"
    }


    if (val == "all") {
      siteUrl = `${siteUrl}/tasks/tasks`
    } else {
      if (this.mySelection.length > 0) {
        let seqArr = [];
        let seqCol = this.columnName.find(x => x.val == "Task No.")

        if (seqCol) {
          for (let rowSelected of this.mySelection) {
            seqArr.push(this.usereventData[rowSelected][seqCol.key]);
          }
          siteUrl = `${siteUrl}/tasks/tasks?seq=${seqArr.toString()}`
        } else {
          this.alertService.error('Seq column not found.')
        }
      } else {
        this.alertService.error("No record selected.")
      }

    }

    window.open(siteUrl, "_blank");
  }


  export() {
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
