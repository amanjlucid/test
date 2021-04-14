import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerDashboardService, HelperService } from '../../_services'
import { encode } from 'punycode';
import { appConfig } from '../../app.config';

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
  // userEventTempData: any;
  selectedEvent: any;
  @Output() closeUserEvents = new EventEmitter<boolean>();
  title: any = 'Tasks';
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

    const seqCol = this.columnName.find(x => x.val == "Task No.")
    if (seqCol) {
      let seqArr = [];
      if (val == "all") {
        if (this.usereventData.length > 0) {
          seqArr = this.usereventData.map(x => x[seqCol.key])
        } else {
          this.alertService.error("No record selected.")
          return
        }
      } else {
        if (this.mySelection.length > 0) {
          for (let rowSelected of this.mySelection) {
            seqArr.push(this.usereventData[rowSelected][seqCol.key]);
          }
        } else {
          this.alertService.error("No record selected.")
          return
        }
      }

      let siteUrl = `https://apexdevweb.rowanwood.ltd/dev/rowanwood/tasks/tasks?seq=true`
      localStorage.setItem('taskslist', btoa(seqArr.toString()));
      window.open(siteUrl, "_blank");

    } else {
      this.alertService.error('Seq column not found.')
      return
    }

  }


  export() {
    let label = {};
    for (let col of this.columnName) {
      label[col.key] = col.val
    }

    if (this.usereventData) {
      this.helperService.exportAsExcelFile(this.usereventData, 'Tasks', label)
    } else {
      this.alertService.error("There is no record to export.")
    }

  }



}
