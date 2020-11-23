import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';

import { AlertService, EventManagerService, HelperService } from '../../_services'
import { tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Subject, forkJoin } from 'rxjs';
import { EventTask } from 'src/app/_models/event-task.model';

@Component({
  selector: 'app-user-task-data',
  templateUrl: './user-task-data.component.html',
  styleUrls: ['./user-task-data.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTaskDataComponent implements OnInit {
  @Output() closeTaskData = new EventEmitter<boolean>();
  @Input() taskData: boolean = false;
  @Input() selectedEvent: any;
  headerFilters: EventTask = new EventTask();
  title = 'Event Tasks';
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
  public loading: boolean;
  public query: any;
  private stateChange = new BehaviorSubject<any>(this.headerFilters);
  totalCount: any = 0;
  columns: any = [];
  filters: any = [];
  mySelection: number[] = [];
  pushClickedData: any = [];
  selectedData: any = [];
  currentUser: any;

  constructor(
    private eveneManagerService: EventManagerService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.selectedEvent = this.selectedEvent[0]
    this.headerFilters.EventSequence = this.selectedEvent.eventSequence;

    if (this.selectedEvent.unprocessedCount == 0) {
      this.headerFilters.EventDataStatus = "P";
    }

    this.getUsereventList(this.selectedEvent.eventSequence)
    this.markViewd(this.selectedEvent.eventSequence, this.currentUser.userId);
    this.userEventByseq(this.selectedEvent.eventSequence, this.currentUser.userId);
  }

  getUsereventList(seq) {
    this.subs.add(
      this.eveneManagerService.getFirstRecordOfEventData(seq).subscribe(
        data => {
          if (data.isSuccess) {
            let columns = data.data[0];
            for (let cl in columns) {
              if (columns[cl] != "#!" && cl != "eventdatastatus" && cl != "eventsequence" && cl != "eventdatastatusname") {
                if (cl == "eventdatasequence") {
                  columns[cl] = "Sequence"
                }
                this.columns.push({ key: cl, val: columns[cl] });
              }
            }

            // console.log(this.columns)

            this.query = this.stateChange.pipe(
              tap(state => {
                this.headerFilters = state;
                this.loading = true;
              }),
              switchMap(state => this.eveneManagerService.getListOfEventData(state)),
              tap((res) => {
                // console.log(res)
                this.totalCount = (res.total != undefined) ? res.total : 0;
                this.loading = false;
              })
            );

            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  pageChange(state: PageChangeEvent): void {
    // let total = this.totalCount - state.take
    // if (this.headerFilters.CurrentPage < total) {
    //   this.headerFilters.CurrentPage = state.skip;
    // } else {
    //   this.headerFilters.CurrentPage = total;
    // }
    this.headerFilters.CurrentPage = state.skip;
    this.headerFilters.PageSize = state.take;
    this.stateChange.next(this.headerFilters);

  }

  filterChange(filter: any): void {
    //this.headerFilters.IsFilter = false;
    this.state.filter = filter;

    // this.filters = [];

    if (this.state.filter) {
      this.headerFilters.IsFilter = true;
      if (this.state.filter.filters.length > 0) {
        let distincFitler = this.changeFilterState(this.state.filter.filters);
        distincFitler.then(filter => {
          if (filter.length > 0) {
            this.resetGridFilter()
            for (let ob of filter) {
              this.setGridFilter(ob);
            }
            setTimeout(() => {
              this.searchGrid()
            }, 500);
          }
        })
      } else {
        this.resetGridFilter()
        this.searchGrid()
      }
    } else {
      this.resetGridFilter()
      this.searchGrid()
    }

  }


  changeFilterState(obj) {
    return Promise.resolve().then(x => {
      for (let f of obj) {
        if (f.hasOwnProperty("field")) {
          if (this.containsObject(f, this.filters) == false) {
            this.filters.push(f);
          }

        } else if (f.hasOwnProperty("filters")) {
          this.changeFilterState(f.filters)
        }
      }
      return this.filters
    })
  }

  containsFilterObject(obj, list) {
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i].field === obj.field && list[i].operator === obj.operator) {
        return true;
      }
    }

    return false;
  }

  containsObject(obj, list) {
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === obj) {
        return true;
      }
    }

    return false;
  }


  setGridFilter(obj) {
    if (this.headerFilters[obj.field] != undefined) {
      this.headerFilters[obj.field] = obj.value
    }
  }


  sortChange(sort: SortDescriptor[]): void {
    if (sort.length > 0) {
      if (sort[0].dir == undefined) {
        sort[0].dir = "asc";
      }

      if (sort[0].dir == "asc") {
        this.headerFilters.OrderType = "Ascending";
      } else {
        this.headerFilters.OrderType = "descending";
      }
      this.headerFilters.OrderBy = sort[0].field.toUpperCase();
      this.state.sort = sort;
      this.searchGrid()
    }

  }


  resetGridFilter() {
    this.headerFilters.eventfielD1 = '';
    this.headerFilters.eventfielD2 = '';
    this.headerFilters.eventfielD3 = '';
    this.headerFilters.eventfielD4 = '';
    this.headerFilters.eventfielD5 = '';
    this.headerFilters.eventfielD6 = '';
    this.headerFilters.eventfielD7 = '';
    this.headerFilters.eventfielD8 = '';
    this.headerFilters.eventfielD9 = '';
    this.headerFilters.eventfielD10 = '';
    this.headerFilters.eventfielD11 = '';
    this.headerFilters.eventfielD12 = '';
    this.headerFilters.eventfielD13 = '';
    this.headerFilters.eventfielD14 = '';
    this.headerFilters.eventfielD15 = '';
    this.headerFilters.eventfielD16 = '';
    this.headerFilters.eventfielD17 = '';
    this.headerFilters.eventfielD18 = '';
    this.headerFilters.eventfielD19 = '';
    this.headerFilters.eventfielD20 = '';

  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {

    this.selectedData = [];
    this.pushClickedData.push({ row: rowIndex, data: dataItem });

    for (let ind of this.mySelection) {
      let findVal = this.pushClickedData.find(x => x.row == ind)
      if (findVal) {
        this.selectedData.push(findVal.data)
      }
    }

  }

  searchGrid() {
    this.headerFilters.CurrentPage = 0;
    this.state.skip = 0;
    this.stateChange.next(this.headerFilters);
  }

  onChange(eve) {
    if (eve == "A") {
      this.headerFilters.IsFilter = false;
    } else {
      this.headerFilters.IsFilter = true;
    }
    this.headerFilters.EventDataStatus = eve
    this.searchGrid()
  }

  closeWin() {
    this.taskData = false
    this.closeTaskData.emit(this.taskData);
  }

  updateEvent(type) {
    if (this.selectedData.length > 0) {
      if ((this.selectedEvent.eventProcessedCount != this.selectedEvent.eventRowCount) && (this.selectedEvent.eventAssignUser == this.currentUser.userId)) {
        let req = [];
        let failsRecord = [];
        let successRecord = [];
        for (let eventData of this.selectedData) {
          if (eventData.eventDataStatus != type) {
            req.push(this.eveneManagerService.UpdateProcessed(this.selectedEvent.eventSequence, eventData.eventdatasequence, type, this.currentUser.userId));
            successRecord.push(eventData.eventdatasequence)
          } else {
            failsRecord.push(eventData.eventdatasequence)
          }
        }

        let msg = '';
        if (req.length > 0) {
          this.subs.add(
            forkJoin(req).subscribe(
              data => {
                // console.log(data);
                msg = `Event Number ${this.selectedEvent.eventSequence}, data item ${successRecord.toString()} status request is updated.`
                this.alertService.success(msg);
                this.mySelection = []
                this.selectedData = [];
                this.userEventByseq(this.selectedEvent.eventSequence, this.currentUser.userId);
                this.searchGrid()
              }
            )
          )
        } else {
          msg = `Event Number ${this.selectedEvent.eventSequence}, data item ${failsRecord.toString()} status request is the same as current ${type}`
          this.alertService.error(msg);
        }

      } else {
        this.alertService.error("The is no record to update")
      }
    }
  }


  userEventByseq(seq, userId) {
    this.subs.add(
      this.eveneManagerService.getListOfUserEventBySequence(seq, userId).subscribe(
        data => {
          // console.log(data.data[0]);
          this.selectedEvent = data.data[0]
        }
      )
    )
  }

  markViewd(seq, userId) {
    this.subs.add(
      this.eveneManagerService.markViewed(seq, userId).subscribe(
        data => {
          // console.log(data);
        }
      )
    )
  }

  export() {
    let tempFilters = Object.assign({}, this.headerFilters);
    tempFilters.IsExport = true;
    tempFilters.EventDataStatus = "A";

    this.subs.add(
      this.eveneManagerService.exportListOfEventData(tempFilters).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data != undefined) {
              let tempdata = data.data.eventDataList
              if (tempdata.length > 0) {
                let label = {};
                for (let cl of this.columns) {
                  label[cl.key] = cl.val
                }
                this.helperService.exportAsExcelFile(tempdata, 'Event Tasks', label)
              } else {
                this.alertService.error("There is no record to import")

              }
            }

          }
        }
      )

    )

  }

  checkShowAssetBtn() {
    let findAssetKey = this.columns.find(x => x.val == "Asset");
    if (findAssetKey) {
      return true
    }
    return false

  }

  showAssets() {
    const host = window.location.hostname;
    let siteUrl = "";
    // if (host == "localhost") {
    //   siteUrl = "http://localhost:4200"
    // } else {
    //   siteUrl = "http://104.40.138.8/rowanwood"
    // }

    siteUrl = "http://104.40.138.8/rowanwood"

    if (this.selectedData.length == 1) {
      let findAssetKey = this.columns.find(x => x.val == "Asset");
      siteUrl = `${siteUrl}/asset-list?assetid=${this.selectedData[0][findAssetKey.key]}`
    } else {
      return
    }

    window.open(siteUrl, "_blank");

  }

}
