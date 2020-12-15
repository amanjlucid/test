import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerService, HelperService } from '../../_services'
import { SelectableSettings, SelectAllCheckboxState, PageChangeEvent, GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { BehaviorSubject } from 'rxjs';
import { EventParameterList } from 'src/app/_models/event-parameter-list.model';
import { tap, switchMap, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-event-parameters-list',
  templateUrl: './event-parameters-list.component.html',
  styleUrls: ['./event-parameters-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventParametersListComponent implements OnInit {
  subs = new SubSink();
  @Input() eventParamList = false;
  @Input() selectedEvent: any;
  @Input() selectedParam: any;
  @Output() closeEventParamList = new EventEmitter<boolean>();
  @Output() changeSelectedParams = new EventEmitter<any>();
  title = 'Task Parameters';
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  // public gridView: DataResult;
  allowUnsort = true;
  multiple = false;
  eventParamHeading = '';
  parameterList: any;
  columnName = [];
  eventParameters: any;

  totalCount: any = 0;
  loading: boolean = true;
  query: any;
  headerFilters: EventParameterList = new EventParameterList();
  stateChange = new BehaviorSubject<any>(this.headerFilters);
  filters: any = [];

  public checkboxOnly = true;
  public mode: any = 'multiple';
  public mySelection: number[] = [];
  public selectableSettings: SelectableSettings;
  public selectAllState: SelectAllCheckboxState = 'unchecked';
  @ViewChild(GridComponent) public grid: GridComponent;
  allColumnName: any;
  selectedParamCopy: any;
  // holdMySeletion: any = [];

  constructor(
    private eventManagerService: EventManagerService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private helperService: HelperService

  ) {

  }

  ngOnInit(): void {
    this.eventParamHeading = '';
    // console.log(this.selectedParam);
    if (this.selectedParam.eventTypeParamType == "P") {
      this.mode = "single"
    } else {
      this.mode = "multiple"
    }

    this.setSelectableSettings();
    this.selectedParamCopy = Object.assign({}, this.selectedParam);
    this.headerFilters.eventTypeSequence = this.selectedEvent.eventTypeSequence;
    this.headerFilters.eventTypeParmSequence = this.selectedParam.eventTypeParamSequence;

    this.getEventParameterList(this.selectedEvent.eventTypeSequence, this.selectedParam.eventTypeParamSequence)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getEventParameterList(eSeq, epSeq) {
    this.subs.add(
      this.eventManagerService.GetListOfEventTypeParameterSelectionFirstRow(eSeq, epSeq).subscribe(
        data => {
          if (data.isSuccess) {
            // console.log(data);
            let col = data.data;
            this.allColumnName = data.data
            for (let cl in col) {
              if (col[cl] != '' && col[cl] != 0 && cl != "selectionType" && cl != null && cl != "currentPage" && cl != "isFilter" && cl != "orderBy" && cl != "orderType" && cl != "pageSize")
                this.columnName.push({ 'key': cl, 'val': col[cl] })
            }

            this.query = this.stateChange.pipe(
              debounceTime(20),
              tap(state => {
                this.headerFilters = state;
                this.loading = true;
              }),
              switchMap(state => this.eventManagerService.GetListOfEventTypeParameterSelectionPagination(state)),
              tap((res) => {
                // console.log(res)
                this.totalCount = (res.total != undefined) ? res.total : 0;
                this.loading = false;
                this.setDefaultSelectedValues(this.selectedParam.eventTypeParamSqlValue);
                this.chRef.detectChanges();
              })
            );

            this.chRef.detectChanges();
          }
        },
        err => {
          this.alertService.error(err);
        }
      )
    )
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.mySelection = [];
    if (sort.length > 0) {
      if (sort[0].dir == undefined) {
        sort[0].dir = "asc";
      }

      if (sort[0].dir == "asc") {
        this.headerFilters.orderType = "Ascending";
      } else {
        this.headerFilters.orderType = "descending";
      }

      if (this.allColumnName.selectionType == "NUM" && sort[0].field == "selectionChar") {
        this.headerFilters.orderBy = "selectiionNum";
      } else {
        this.headerFilters.orderBy = sort[0].field;
      }


      this.state.sort = sort;
      this.searchGrid()
    }

  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.mySelection = [];

    if (this.state.filter) {
      this.headerFilters.isFilter = true;
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
        this.headerFilters.isFilter = false;
        this.resetGridFilter()
        this.searchGrid()
      }
    } else {
      this.headerFilters.isFilter = false;
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
      if (this.allColumnName.selectionType == "NUM" && obj.field == "selectionChar") {
        this.headerFilters['selectiionNum'] = obj.value
      } else {
        this.headerFilters[obj.field] = obj.value
      }
    }
  }

  pageChange(state: PageChangeEvent): void {
    // console.log(state);
    this.headerFilters.currentPage = state.skip;
    this.headerFilters.pageSize = state.take;
    this.stateChange.next(this.headerFilters);
  }


  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: this.checkboxOnly,
      mode: this.mode
    };
  }


  resetGridFilter() {
    this.headerFilters.selectionChar = '';
    this.headerFilters.selectiionNum = 0;
    this.headerFilters.selectionString1 = '';
    this.headerFilters.selectionString2 = '';
    this.headerFilters.selectionString3 = '';
    this.headerFilters.selectionString4 = '';
    this.headerFilters.selectionString5 = '';
    this.headerFilters.selectionString6 = '';
    this.headerFilters.selectionString7 = '';
    this.headerFilters.selectionString8 = '';
    this.headerFilters.selectionString9 = '';
    this.headerFilters.selectionString10 = '';

  }

  searchGrid() {
    this.headerFilters.currentPage = 0;
    this.state.skip = 0;
    this.stateChange.next(this.headerFilters);
  }




  mySelectionKey(context: RowArgs): string {
    return context.dataItem.selectionSeq;
  }


  public cellClickHandler(eve) {
    this.selectedParam.eventTypeParamSqlValue = '';// reset parent component selection
    if (this.mode == "single") {
      this.mySelection = []; // reset grid selection
      this.mySelection.push(eve.dataItem.selectionSeq);
    } else {
      if (this.mySelection.indexOf(eve.dataItem.selectionSeq) == -1) {
        this.mySelection.push(eve.dataItem.selectionSeq)
      } else {
        this.mySelection = this.mySelection.filter(x => x != eve.dataItem.selectionSeq)
      }

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
      filterModel.isPagination = false;
      this.chRef.detectChanges();
      this.subs.add(
        this.eventManagerService.GetListOfEventTypeParameterSelectionPagination(filterModel).subscribe(
          data => {
            this.mySelection = [];
            if (data.total > 0) {
              this.selectAllState = 'checked';
              this.mySelection = data.data.map(x => x.selectionSeq)
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
    // console.log({'sel':this.mySelection})

  }

  closeParameterWindow() {
    this.eventParamList = false
    if (this.selectedParam.eventTypeParamSqlValue == "") {
      this.selectedParam.eventTypeParamSqlValue = this.selectedParamCopy.eventTypeParamSqlValue
    }
    this.closeEventParamList.emit(this.eventParamList);
  }


  getSelectedData() {
    if (this.mySelection.length == 0) {
      this.alertService.error("No record selected");
      return
    }

    this.mySelection = this.mySelection.filter((val, ind, self) => self.indexOf(val) == ind)//get unique value

    const params = {
      eventTypeSequence: this.selectedEvent.eventTypeSequence,
      eventTypeParmSequence: this.selectedParam.eventTypeParamSequence,
      selectedSeq: this.mySelection
    }

    this.subs.add(
      this.eventManagerService.getSelectedTaskData(params).subscribe(
        data => {
          if (data.isSuccess) {
            const paramlist = data.data
            let pstring = '';
            let valArr = [];
            if (paramlist) {
              for (let plist of paramlist) {
                if (plist.selectiionNum != undefined) {
                  if (plist.selectionChar == "") {
                    valArr.push(plist.selectiionNum);
                  } else {
                    if (this.selectedParam.eventTypeParamType == "I") {
                      valArr.push(`'${plist.selectionChar}'`);
                    } else {
                      valArr.push(plist.selectionChar);
                    }
                  }
                } else {
                  if (this.selectedParam.eventTypeParamType == "I") {
                    valArr.push(`'${plist.selectionChar}'`);
                  } else {
                    valArr.push(plist.selectionChar);
                  }

                }
              }


              if (valArr.length > 0) {
                pstring = valArr.toString();
              }

              // this.selectedParam.eventTypeParamSqlValue = pstring;
              // this.changeParams();
              // this.closeParameterWindow();
              this.subs.add(
                this.eventManagerService.updateListOfEventTypeParameter(this.selectedEvent.eventTypeSequence, this.selectedParam.eventTypeParamSequence, pstring).subscribe(
                  data => {
                    if (data.isSuccess) {
                      this.selectedParam.eventTypeParamSqlValue = pstring;
                      this.changeParams()
                      this.closeParameterWindow()
                    } else {
                      this.alertService.error(data.message)
                    }
                  },
                  err => {
                    this.alertService.error(err);
                  }
                )
              )

            }

          } else {
            this.alertService.error("Something went wrong.")
          }
        },
        err => {
          this.alertService.error(err)
        }
      )
    )

  }




  setDefaultSelectedValues(string) {
    setTimeout(() => {
      if (string != "") {
        let splitStr = string.split(",");
        if (splitStr) {
          splitStr = splitStr.map(x => this.helperService.replaceAll(x, "'", "").toUpperCase());
        }

        let list: any = this.grid.data;//current grid data


        // if (list.data.lenght > 0) {
        for (let plist of list.data) {
          if (plist.selectiionNum != undefined && plist.selectionChar == "") {
            if (splitStr.indexOf(plist.selectiionNum.toString()) !== -1) {
              if (this.mySelection.indexOf(plist.selectionSeq) == -1) {
                this.mySelection.push(plist.selectionSeq)
              }
            }
          } else {
            if (splitStr.indexOf(plist.selectionChar) !== -1) {
              if (this.mySelection.indexOf(plist.selectionSeq) == -1) {
                this.mySelection.push(plist.selectionSeq)
              }
            }
            // else {
            //   if (this.selectedParam.eventTypeParamSqlValue.indexOf(plist.selectionChar) !== -1) {
            //     if (this.mySelection.indexOf(plist.selectionSeq) == -1) {
            //       this.mySelection.push(plist.selectionSeq)
            //     }
            //   }
            // }
          }
        }

      }

      this.chRef.detectChanges();
      // }
    }, 300);

  }

  changeParams() {
    this.changeSelectedParams.emit(this.selectedParam)
  }


}
