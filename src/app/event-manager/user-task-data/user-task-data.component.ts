import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, SelectAllCheckboxState, RowArgs } from '@progress/kendo-angular-grid';

import { AlertService, EventManagerService, HelperService, LoaderService } from '../../_services'
import { tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Subject, forkJoin } from 'rxjs';
import { EventTask } from 'src/app/_models/event-task.model';
import { appConfig } from '../../app.config';

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
  @Input() hideComplete: any;
  headerFilters: EventTask = new EventTask();
  title = 'Task Data';
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
  public selectAllState: SelectAllCheckboxState = 'unchecked';
  totalCount: any = 0;
  columns: any = [];
  filters: any = [];
  mySelection: number[] = [];
  currentUser: any;
  loadedData: any = [];
  public selectableSettings: SelectableSettings;

  constructor(
    private eveneManagerService: EventManagerService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private helperService: HelperService,
    private loaderService: LoaderService
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.selectedEvent = this.selectedEvent[0]
    // console.log(this.selectedEvent);
    this.headerFilters.EventSequence = this.selectedEvent.eventSequence;

    if (this.selectedEvent.unprocessedCount == 0) {
      this.headerFilters.EventDataStatus = "P";
    }

    this.getUsereventList(this.selectedEvent.eventSequence)
    this.markViewd(this.selectedEvent.eventSequence, this.currentUser.userId);
    this.userEventByseq(this.selectedEvent.eventSequence, this.currentUser.userId);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'multiple'
    };
  }

  getUsereventList(seq) {
    this.subs.add(
      this.eveneManagerService.getFirstRecordOfEventData(seq).subscribe(
        data => {
          if (data.isSuccess) {
            let columns = data.data[0];
            // console.log(columns);
            for (let cl in columns) {
              if (columns[cl] != "#!" && cl != "eventdatastatus" && cl != "eventsequence" && cl != "eventdatastatusname") {
                if (cl == "eventdatasequence") {
                  columns[cl] = "Sequence"
                }
                let width = 170;
                if (cl == "eventdatasequence") {
                  width = 90
                }
                this.columns.push({ key: cl, val: columns[cl], width: width });
              }
            }

            this.query = this.stateChange.pipe(
              tap(state => {
                this.headerFilters = state;
                this.loading = true;
              }),
              switchMap(state => this.eveneManagerService.getListOfEventData(state)),
              tap((res) => {
                // console.log(res)
                this.loadedData = res.data
                this.totalCount = (res.total != undefined) ? res.total : 0;
                this.loading = false;
                this.chRef.detectChanges();
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

  mySelectionKey(context: RowArgs): string {
    return context.dataItem.eventdatasequence;
  }


  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited, originalEvent }) {
    // if (originalEvent.ctrlKey == false) {
    //   if (this.mySelection.length > 0) {
    //     this.mySelection = []; // reset grid selection
    //     this.mySelection.push(dataItem.eventdatasequence);
    //   }
    // }

    if (this.mySelection.indexOf(dataItem.eventdatasequence) == -1) {
      this.mySelection.push(dataItem.eventdatasequence)
    } else {
      this.mySelection = this.mySelection.filter(x => x != dataItem.eventdatasequence)
    }

    this.chRef.detectChanges();
  }

  public onSelectedKeysChange(e) {
    const len = this.mySelection.length;
    if (len === 0) {
      this.selectAllState = 'unchecked';
    } else if (len > 0 && len < this.totalCount) {
      this.selectAllState = 'indeterminate';
    } else {
      this.selectAllState = 'checked';
    }

    this.chRef.detectChanges();
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState) {
    if (checkedState === 'checked') {
      this.selectAllState = 'checked';
      this.mySelection = [];
      let filterModel = Object.assign({}, this.headerFilters);
      filterModel.IsExport = true;
      this.chRef.detectChanges();
      this.subs.add(
        this.eveneManagerService.getListOfEventData(filterModel).subscribe(
          data => {
            this.mySelection = [];
            if (data.total > 0) {
              this.selectAllState = 'checked';
              this.mySelection = data.data.map(x => x.eventdatasequence)
              this.chRef.detectChanges();
            }
          }
        )
      )
    } else {
      this.mySelection = [];
      this.selectAllState = 'unchecked';
      this.chRef.detectChanges();
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
    this.resetGridSelection()
  }

  closeWin() {
    this.taskData = false
    this.closeTaskData.emit(this.taskData);
  }

  updateEvent(type) {
    this.alertService.destroyAlert();

    if (this.mySelection.length == 0) {
      this.alertService.error("No record selected");
      return
    }

    this.mySelection = this.mySelection.filter((val, ind, self) => self.indexOf(val) == ind)//get unique value

    const params = {
      EventSequence: this.selectedEvent.eventSequence,
      EventDataSequence: this.mySelection
    }

    this.loaderService.pageShow()
    this.subs.add(
      this.eveneManagerService.getListOfEventDataByEventDataSequence(params).subscribe(
        selectData => {
          if (selectData.isSuccess) {
            let selectedData = selectData.data
            if (selectedData.length > 0) {
              if ((this.selectedEvent.eventAskType != 'I') && (this.selectedEvent.eventAssignUser == this.currentUser.userId)) {
                //let req = [];
                let failsRecord = [];
                let successRecord = [];
                let msg = '';

                for (let eventData of selectedData) {
                  if (eventData.eventDataStatus != type) {
                    // req.push(this.eveneManagerService.UpdateProcessed(this.selectedEvent.eventSequence, eventData.eventdatasequence, type, this.currentUser.userId));
                    successRecord.push(eventData.eventdatasequence)
                  } else {
                    failsRecord.push(eventData.eventdatasequence)
                  }
                }

                //Check if any data sequence has same status
                if (failsRecord.length > 0) {
                  this.loaderService.pageHide();
                  msg = `${failsRecord.length} data item status request is the same as current ${type}`
                  // msg = `Task Number ${this.selectedEvent.eventSequence}, data item ${failsRecord.toString()} status request is the same as current ${type}`
                  this.alertService.error(msg);
                  return
                }

                //If data sequence is not same then update status
                if (successRecord.length > 0) {
                  const dataSeqParams = {
                    eventSequence: this.selectedEvent.eventSequence,
                    eventDataSequence: successRecord,
                    eventDataStatus: type,
                    userId: this.currentUser.userId
                  }
                  this.subs.add(
                    this.eveneManagerService.updateMultipleProcessed(dataSeqParams).subscribe(
                      data => {
                        // console.log(data);
                        if (data.isSuccess) {
                          const row = successRecord.length > 1 ? 'Rows' : 'Row';
                          const status = type == 'P' ? 'Processed' : 'Unprocessed';
                          msg = `${successRecord.length} ${row} Set To ${status}`
                          this.alertService.success(msg);
                          this.resetGridSelection()
                          this.userEventByseq(this.selectedEvent.eventSequence, this.currentUser.userId);
                          this.searchGrid()
                          this.loaderService.pageHide();
                          this.chRef.detectChanges();
                        } else {
                          this.loaderService.pageHide();
                          this.alertService.error(data.message);
                        }
                      },
                      err => {
                        this.alertService.error(err);
                        this.loaderService.pageHide();
                      }
                    )
                  )

                  // this.subs.add(
                  //   forkJoin(req).subscribe(
                  //     data => {
                  //       // console.log(data);
                  //       // msg = `Task Number ${this.selectedEvent.eventSequence}, data item ${successRecord.toString()} status request is updated.`
                  //       const row = req.length > 1 ? 'Rows' : 'Row';
                  //       const status = type == 'P' ? 'Processed' : 'Unprocessed';
                  //       msg = `${req.length} ${row} Set To ${status}`
                  //       this.alertService.success(msg);

                  //       this.resetGridSelection()
                  //       this.userEventByseq(this.selectedEvent.eventSequence, this.currentUser.userId);
                  //       this.searchGrid()
                  //       this.loaderService.pageHide()
                  //     }
                  //   )
                  // )
                }

              } else {
                this.loaderService.pageHide()
                this.alertService.error("There is no record to update")
              }
            } else {
              this.loaderService.pageHide()
              this.alertService.error("Please select a record.")
            }
          } else {
            this.loaderService.pageHide()
            this.alertService.error(selectData.message)
          }

        }
      )
    )

  }


  userEventByseq(seq, userId) {
    this.subs.add(
      this.eveneManagerService.getListOfSpecificUserEvent(userId, this.hideComplete, seq).subscribe(
        data => {
          // console.log(data)
          this.selectedEvent = data.data[0];
          // console.log(this.selectedEvent);
          this.chRef.detectChanges();
        }
      )
    )

    // if (this.currentUser.admin == "Y") {
    //   this.subs.add(
    //     this.eveneManagerService.GetListOfUserEventByUserIdForAdminUsersSpecificRow(userId, this.hideComplete, this.selectedEvent.rowIndex).subscribe(
    //       data => {
    //         this.selectedEvent = data.data[0];
    //         // console.log(data);
    //         this.chRef.detectChanges();
    //       }
    //     )
    //   )
    // } else {
    //   this.subs.add(
    //     this.eveneManagerService.getListOfUserEventBySequence(seq, userId).subscribe(
    //       data => {
    //         this.selectedEvent = data.data[0];
    //         // console.log(this.selectedEvent);
    //         this.chRef.detectChanges();
    //       }
    //     )
    //   )
    // }

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
                this.helperService.exportAsExcelFile(tempdata, 'Task Data', label)
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
    let findAssetKey = this.columns.find(x => x.val.toLowerCase() == "asset");
    if (findAssetKey) {
      return true
    }
    return false

  }

  resetGridSelection() {
    this.mySelection = [];
    this.selectAllState = 'unchecked';
    // this.selectedData = [];
    // this.pushClickedData = [];
  }

  disableProcessBtn() {
    if (this.selectedEvent.eventAskType == "I") {
      return true;
    }

    // if (this.currentUser.admin != 'Y') {
    if ((this.currentUser.userId != this.selectedEvent.eventAssignUser)) {
      return true
    }
    // }


    return false;

  }

  showAssets() {
    let findAssetKey = this.columns.find(x => x.val.toLowerCase() == "asset");
    if (findAssetKey) {
      const host = window.location.hostname;
      let siteUrl = `${appConfig.appUrl}`;
      // if (host == "localhost") {
      //   siteUrl = "http://localhost:4200"
      // } else {
      //   siteUrl = "http://104.40.138.8/rowanwood"
      // }
      let filterModel = Object.assign({}, this.headerFilters);
      filterModel.IsExport = true;

      this.subs.add(
        this.eveneManagerService.getListOfEventData(filterModel).subscribe(
          selectData => {
            // console.log(selectData);
            if (selectData.total > 0) {
              let selectedData = selectData.data;
              if (selectedData.length > 0) {
                let assetIds = selectedData.map(x => x[findAssetKey.key])
                localStorage.setItem('assetList', btoa(assetIds.toString()));
                siteUrl = `${siteUrl}/asset-list?taskData=true`
                window.open(siteUrl, "_blank");
              }
            }
          }
        )
        // this.eveneManagerService.getListOfEventDataByEventDataSequence(params).subscribe(
        //   selectData => {
        //     if (selectData.isSuccess) {
        //       let selectedData = selectData.data;
        //       if (selectedData.length > 0) {
        //         let assetIds = selectedData.map(x => x[findAssetKey.key])
        //         localStorage.setItem('assetList', btoa(assetIds.toString()));
        //         siteUrl = `${siteUrl}/asset-list?taskData=true`
        //         // window.open(siteUrl, "_blank");
        //         console.log(assetIds);
        //       }
        //     }
        //   }
        // )
      )

    }

    // this.mySelection = this.mySelection.filter((val, ind, self) => self.indexOf(val) == ind)//get unique value
    // const params = {
    //   EventSequence: this.selectedEvent.eventSequence,
    //   EventDataSequence: this.mySelection
    // }






    // siteUrl = "http://104.40.138.8/rowanwood"
    // if (this.mySelection.length == 1) {
    //   let findRow = this.loadedData.find(x => x.eventsequence == this.selectedEvent.eventSequence && this.mySelection.indexOf(x.eventdatasequence) !== -1)
    //   let findAssetKey = this.columns.find(x => x.val == "Asset");
    //   if (findRow) {
    //     siteUrl = `${siteUrl}/asset-list?assetid=${findRow[findAssetKey.key]}`
    //   }
    // } else {
    //   return
    // }

    // window.open(siteUrl, "_blank");

  }

}
