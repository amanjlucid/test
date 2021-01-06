import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowClassArgs } from '@progress/kendo-angular-grid';
import { forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { AlertService, WebReporterService } from 'src/app/_services';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ReportsComponent implements OnInit {
  @ViewChild('categoriesMultiSelect') categoriesMultiSelect;
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
  loading = true
  // mySelection: number[] = [];
  selectableSettings: SelectableSettings;
  reportList: any;
  actualReportList: any;
  selectedReport: any;
  categories: any;
  userCategory: any;
  mulitSelectDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    enableCheckAll: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 157,
    itemsShowLimit: 3,
    searchPlaceholderText: '',
    noDataAvailablePlaceholderText: 'No Record',
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false
  }
  categoryDropdownSettings = {
    singleSelection: true,
    idField: 'item_id',
    textField: 'item_text',
    allowSearchFilter: true,
    clearSearchFilter: true,
    maxHeight: 157,
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false
  }
  selectedCategories: any;
  outputColumns: any;
  selectedOutputColumns: Array<string> = [];
  normalizer = (text$: Observable<string>): any => text$.pipe(
    map((userInput: string) => {
      const comparer = (item: string) => userInput.toLowerCase() === item.toLowerCase();
      const matchingValue = this.selectedOutputColumns.find(comparer);
      if (matchingValue) {
        return null;
      }
      const matchingItem = this.outputColumns.find(comparer);
      return matchingItem ? matchingItem : userInput;
    })
  )
  outputColumnvirtual: any = {
    itemHeight: 28
  };
  currentUser: any;
  showColumns = false;
  rowheight = 36;
  reportListFilters = {
    number: '',
    name: '',
    nameMatch: false,
    column: '',
    columnMatch: false,
    columnExactMatch: false,
    all: true,
    lastMonth: false,
    last3Month: false,
    last12Month: false,
    defaultFilter: false
  }
  reportQueryModel = {
    userId: '',
    value: 0,
    Categories: '',
    IsShceduled: false,
    FavouritesOnly: false
  }
  textSearch$ = new Subject<any>();


  constructor(
    private reportService: WebReporterService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.subs.add(
      forkJoin([this.reportService.getCategories(), this.reportService.getUserCategory(), this.reportService.getColumns()]).subscribe(
        res => {
          console.log(res);
          const categoriesData = res[0];
          const userCategoryData = res[1];
          const outputColumnsData = res[2];
          if (categoriesData.isSuccess) {
            this.categories = categoriesData.data.map((x: any) => {
              return { item_id: x.item_text, item_text: x.item_text }
            });
            this.selectedCategories = [...this.categories];//default select all categories
          } else {
            this.alertService.error(categoriesData.message);
          }

          if (userCategoryData.isSuccess) {
            this.userCategory = userCategoryData.data.map((x: any) => {
              return { item_id: x.name, item_text: x.name }
            });
          } else {
            this.alertService.error(userCategoryData.message);
          }

          if (outputColumnsData.isSuccess) {
            this.outputColumns = outputColumnsData.data.map(x => x.columnName)
          } else {
            this.alertService.error(outputColumnsData.message);
          }

          //set default model value to get report data
          this.reportQueryModel.userId = this.currentUser.userId;
          this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id).toString();
          this.getReportList(this.reportQueryModel);

        }
      )
    )

    // triggr filter on text search
    this.subs.add(
      this.textSearch$
        .pipe(
          debounceTime(1000),
        ).subscribe((searchTerm) => {
          console.log(this.reportListFilters);
          this.filterGrid();
          // this.headerFilters.Textstring = searchTerm;
          // this.searchActionGrid();
        })
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getReportList(params) {
    this.subs.add(
      this.reportService.getReportList(params).subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            this.actualReportList = [...data.data];
            this.filterGrid();
            // this.gridView = process(this.reportList, this.state);
            //this.loading = false;
          }
        }
      )
    )
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  setSeletedRow(dataItem) {
    this.selectedReport = dataItem;
  }

  groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedReport = dataItem;
  }

  onCategoriesSelectionChange(item: any) {
    this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id).toString();
    this.getReportList(this.reportQueryModel);
  }

  onCategorySelectionChange(items: any) {
    console.log(items);
  }

  reqGridSearch(event) {
    this.getReportList(this.reportQueryModel);
  }

  reqGridSearch2(event, month) {
    this.reportQueryModel.value = month;
    if (month == 0) {
      if (this.reportListFilters.all == false) {
        setTimeout(() => {
          this.reportListFilters.all = true
        }, 10);
        return
      }
      this.reportListFilters.lastMonth = false;
      this.reportListFilters.last3Month = false;
      this.reportListFilters.last12Month = false;
    } else if (month == 1) {
      if (this.reportListFilters.lastMonth == false) {
        setTimeout(() => {
          this.reportListFilters.lastMonth = true
        }, 10);
        return
      }
      this.reportListFilters.all = false
      this.reportListFilters.last3Month = false;
      this.reportListFilters.last12Month = false;
    } else if (month == 2) {
      if (this.reportListFilters.last3Month == false) {
        setTimeout(() => {
          this.reportListFilters.last3Month = true
        }, 10);
        return
      }
      this.reportListFilters.all = false
      this.reportListFilters.lastMonth = false;
      this.reportListFilters.last12Month = false;
    } else if (month == 3) {
      if (this.reportListFilters.last12Month == false) {
        setTimeout(() => {
          this.reportListFilters.last12Month = true
        }, 10);
        return
      }
      this.reportListFilters.all = false
      this.reportListFilters.lastMonth = false;
      this.reportListFilters.last3Month = false;
    }

    this.getReportList(this.reportQueryModel);
  }

  onOutPutColumnChange(value) {
    this.selectedOutputColumns = value;
    console.log(this.selectedOutputColumns);
  }

  filterGrid() {
    this.loading = true;
    if (this.reportListFilters.defaultFilter == false) {
      this.reportList = this.actualReportList;
      this.loading = false;
      return
    }

    let gridData: any = [];
    if (this.actualReportList) {
      // for (const element of this.actualReportList) {

      //   if (JSON.stringify(element.reportId).indexOf(this.reportListFilters.number) !== -1) {
      //     gridData.push(element);
      //     break;
      //   }

      //   if (this.reportListFilters.nameMatch) {
      //     if (element.reportName == this.reportListFilters.name) {
      //       gridData.push(element);
      //       break;
      //     }
      //   } else {
      //     if (element.reportName.indexOf(this.reportListFilters.name) !== -1) {
      //       gridData.push(element);
      //       break;
      //     }
      //   }
      // }

    }

    this.reportList = gridData;
    this.loading = false;
  }

  triggerFilter($event, searchType = null) {
    if (!this.reportListFilters.defaultFilter) {
      this.reportListFilters.defaultFilter = true;
    }
    this.textSearch$.next(this.reportListFilters);
  }

  setFavourite(dataItem) {
    this.selectedReport = dataItem;
    this.selectedReport.favourite = !this.selectedReport.favourite;
    console.log(this.selectedReport.favourite);
    // this.getReportList()
  }

  showColFn() {
    this.showColumns = !this.showColumns;
    this.rowheight = this.showColumns ? 70 : 36; // change virtual row height according to show columns
  }


  // ####################### Right sidebar functions start ###################// 

  openSearchBar() {
    let scrollTop = $('.layout-container').height();
    $('.search-container').show();
    $('.search-container').css('height', scrollTop);
    if ($('.search-container').hasClass('dismiss')) {
      $('.search-container').removeClass('dismiss').addClass('selectedcs').show();
    }
  }

  closeSearchBar() {
    if ($('.search-container').hasClass('selectedcs')) {
      $('.search-container').removeClass('selectedcs').addClass('dismiss');
      $('.search-container').animate({ width: 'toggle' });
    }
  }

  clearFilter() {
    this.reportListFilters = {
      number: '',
      name: '',
      nameMatch: false,
      column: '',
      columnMatch: false,
      columnExactMatch: false,
      all: true,
      lastMonth: false,
      last3Month: false,
      last12Month: false,
      defaultFilter: false
    }

    this.showColumns = false;
    this.textSearch$.next(this.reportListFilters);
  }

  // ####################### Right sidebar functions end ###################// 
}
