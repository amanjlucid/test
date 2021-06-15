import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, State } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { forkJoin, Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { AlertService, ReportingGroupService, SharedService, WebReporterService } from 'src/app/_services';
import { Router } from '@angular/router';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ReportsComponent implements OnInit {
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
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
  mySelection: number[] = [];
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
    unSelectAllText: 'Unselect All',
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
  selectedCategories: any = [];
  selectedCategory: any = [];
  outputColumns: any;
  outputColumnvirtual: any = {
    itemHeight: 28
  };
  currentUser: any;
  showColumns = false;
  rowheight = 36;
  reportListFilters = {
    number: '',
    name: '',
    nameMatchAll: false,
    nameMatchAny: true,
    selectedOutputColumns: [],
    columnMatchAll: false,
    columnMatchAny: true,
    columnExactMatch: false,
    all: true,
    lastMonth: false,
    last3Month: false,
    last12Month: false,
    frontFilter: false
  }
  reportQueryModel = {
    userId: '',
    value: 0,
    Categories: '',
    IsShceduled: false,
    FavouritesOnly: false,
    XportCategory: ''
  }
  normalizer = (text$: Observable<string>): any => text$.pipe(
    map((userInput: string) => {
      const comparer = (item: string) => userInput.toLowerCase() === item.toLowerCase();
      const matchingValue = this.reportListFilters.selectedOutputColumns.find(comparer);
      if (matchingValue) {
        return null;
      }
      const matchingItem = this.outputColumns.find(comparer);
      return matchingItem ? matchingItem : userInput;
    })
  )
  textSearch$ = new Subject<any>();
  reportCount = 0;
  waitForApiSearch$ = new Subject<any>();
  openReportParameter: boolean = false;
  openSetUserCategory: boolean = false;
  openPreviewReport: boolean = false;
  openScheduleReport: boolean = false;
  reporterPortalPermission = [];
  manageUsrCategory = false;
  toolTipData = { innerText: '', dataLoaded: false };
  pivot = false;
  @HostListener("click")
  clicked() {
    this.toolTipData.dataLoaded = false;
    this.tooltipDir.hide();
  }

  constructor(
    private reportService: WebReporterService,
    private reportingGrpService: ReportingGroupService,
    private alertService: AlertService,
    private sharedService: SharedService,
    private router: Router,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.subs.add(
      forkJoin([this.reportService.getCategories(), this.reportService.getUserCategory(), this.reportService.getColumns()]).subscribe(
        res => {
          // console.log(res);
          const categoriesData = res[0];
          const userCategoryData = res[1];
          const outputColumnsData = res[2];
          if (categoriesData.isSuccess) {
            this.categories = categoriesData.data.map((x: any) => {
              return { item_id: x.item_text, item_text: x.item_text }
            });
            this.selectedCategories = [...this.categories];//default select all categories
          } else this.alertService.error(categoriesData.message);

          if (userCategoryData.isSuccess) {
            this.userCategory = userCategoryData.data.map((x: any) => {
              return { item_id: x.name, item_text: x.name }
            });
          } else this.alertService.error(userCategoryData.message);

          if (outputColumnsData.isSuccess) {
            this.outputColumns = outputColumnsData.data.map(x => x.columnName)
          } else this.alertService.error(outputColumnsData.message);

          //set default model value to get report data
          this.reportQueryModel.userId = this.currentUser.userId;
          this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id).toString();
          this.getReportList(this.reportQueryModel);
          this.getRportCount(this.reportQueryModel);

        }
      )
    )

    // triggr filter on right side bar search
    this.subs.add(
      this.textSearch$
        .pipe(
          tap(x => this.loading = true),
          debounceTime(1000),
          distinctUntilChanged()
        ).subscribe((val) => {
          this.filterGrid();
        })
    );

    // subscribe for grid filter with api
    this.subs.add(
      this.waitForApiSearch$.pipe(
        tap(x => this.loading = true),
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe(val => {
        this.getReportList(this.reportQueryModel)
      })
    );

    this.subs.add(
      this.sharedService.webReporterObs.subscribe(
        data => {
          this.reporterPortalPermission = data;
          if (this.reporterPortalPermission.length > 0) {
            this.sharedService.modulePermission.subscribe(
              modules => {
                if (modules.length > 0) {
                  if (this.reporterPortalPermission.indexOf("Reports") == -1 || modules.indexOf("Web Reporter Portal Access") == -1) {
                    this.router.navigate(['/dashboard']);
                  }
                }
              }
            )
          }
        }
      )
    )

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  refreshUserCategory() {
    this.subs.add(
      this.reportService.getUserCategory().subscribe(
        data => {
          const userCategoryData = data;
          if (userCategoryData.isSuccess) {
            this.userCategory = userCategoryData.data.map((x: any) => {
              return { item_id: x.name, item_text: x.name }
            });
          } else this.alertService.error(userCategoryData.message);
        }
      )
    )
  }

  getRportCount(params) {
    this.subs.add(
      this.reportService.reportCount(params).subscribe(res => this.reportCount = res.data)
    )
  }

  getReportList(params): any {
    this.subs.add(
      this.reportService.getReportList(params).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            this.actualReportList = [...data.data];
            this.filterGrid();
          } else {
            this.alertService.error(data.message);
            this.loading = false;
          }
        },
        err => this.alertService.error(err)
      )
    )
  }

  showColFn() {
    this.showColumns = !this.showColumns;
    this.rowheight = this.showColumns ? 56 : 36; // change virtual row height according to show columns
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'multiple'
    };
  }

  setSeletedRow(dataItem) {
    this.selectedReport = dataItem;
  }

  groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited, originalEvent }) {
    if (originalEvent.ctrlKey == false) {
      if (this.mySelection.length > 0) {
        this.mySelection = [dataItem.reportId];
        // this.chRef.detectChanges();
      }
    }
    this.selectedReport = dataItem;
    // console.log(this.mySelection);
  }

  onCategoriesSingleSelectionChange(item: any) {
    this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id).toString();
    this.waitForApiSearch$.next(this.reportQueryModel.Categories)
  }

  onCategoriesSelectionAllChange(items: any) {
    this.selectedCategories = items;
    this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id).toString();
    this.waitForApiSearch$.next(this.reportQueryModel.Categories)
  }

  onCategorySingleSelectionChange(item: any) {
    this.reportQueryModel.XportCategory = this.selectedCategory.map(x => x.item_id).toString();
    this.waitForApiSearch$.next(this.reportQueryModel.XportCategory)
  }

  onCategorySelectionAllChange(items: any) {
    this.selectedCategory = items;
    this.reportQueryModel.XportCategory = this.selectedCategory.map(x => x.item_id).toString();
    this.waitForApiSearch$.next(this.reportQueryModel.XportCategory)
  }

  reqGridSearch(event) {
    this.loading = true;//start grid loader
    this.getReportList(this.reportQueryModel);
  }

  triggerFilter($event, searchType = null) {
    if (!this.reportListFilters.frontFilter) this.reportListFilters.frontFilter = true;

    if (searchType == 'nameall' || searchType == 'nameany') {
      this.reportListFilters.nameMatchAll = !this.reportListFilters.nameMatchAll;
      this.reportListFilters.nameMatchAny = !this.reportListFilters.nameMatchAny;
    }

    if (searchType == 'columnall' || searchType == 'columnany') {
      this.reportListFilters.columnMatchAll = !this.reportListFilters.columnMatchAll;
      this.reportListFilters.columnMatchAny = !this.reportListFilters.columnMatchAny;
    }

    const objectStr = JSON.stringify(this.reportListFilters);//pass object string just to check object has changed
    this.textSearch$.next(objectStr);

  }

  onOutPutColumnChange(value) {
    if (!this.reportListFilters.frontFilter) this.reportListFilters.frontFilter = true;

    this.reportListFilters.selectedOutputColumns = value;
    const objectStr = JSON.stringify(this.reportListFilters);//pass object string just to check object has changed
    this.textSearch$.next(objectStr);
  }

  filterGrid() {

    if ((this.reportListFilters.frontFilter == false) || (this.reportListFilters.number == "" && this.reportListFilters.name == "" && this.reportListFilters.selectedOutputColumns.length == 0)) {
      this.reportList = this.actualReportList;
      setTimeout(() => { this.loading = false }, 400);
      return
    }

    let gridData = [];
    if (this.actualReportList) {
      let reportNumberFilter = true;
      let reportNameFilter = true;
      let reportColFilter = true;
      gridData = this.actualReportList.filter(element => {
        //filter report number
        if (this.reportListFilters.number != "") {
          reportNumberFilter = (JSON.stringify(element.reportId).indexOf(this.reportListFilters.number) !== -1);
        }

        //filter report name
        if (this.reportListFilters.name !== "") {
          const enteredNamed = this.reportListFilters.name.toLowerCase();
          const reportName = element.reportName.trim().toLowerCase();
          const splitEnteredName = enteredNamed.split(',');

          if (splitEnteredName.length > 0) {
            if (this.reportListFilters.nameMatchAll) {
              reportNameFilter = splitEnteredName.every(splitReport => reportName.includes(splitReport.trim()));
            } else {
              reportNameFilter = splitEnteredName.some(splitReport => reportName.includes(splitReport.trim()));
            }
          }
        }

        //filter report column
        if (this.reportListFilters.selectedOutputColumns.length > 0) {
          if (this.reportListFilters.columnExactMatch) {
            if (element.xport_Col.trim() != "")
              reportColFilter = element.xport_Col.trim() == this.reportListFilters.selectedOutputColumns.toString();
          } else {
            const splitColumns = element.xport_Col.trim() != "" ? element.xport_Col.split(',') : [];
            if (this.reportListFilters.columnMatchAll) {
              if (splitColumns.length > 0) {
                reportColFilter = this.reportListFilters.selectedOutputColumns.every(x => splitColumns.includes(x))
              }
            } else {
              if (splitColumns.length > 0) {
                reportColFilter = splitColumns.some(x => this.reportListFilters.selectedOutputColumns.some(y => x.toLowerCase().indexOf(y.toLocaleLowerCase()) !== -1))
              }
            }
          }

        }

        return (reportNumberFilter && reportNameFilter && reportColFilter);

      })

    }

    this.reportList = gridData;
    setTimeout(() => { this.loading = false }, 400);

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


  setFavourite(dataItem) {
    this.selectedReport = dataItem;
    const fav = dataItem.favourite == 0 ? true : false;
    this.subs.add(
      this.reportService.setFavourite(dataItem.reportId, this.currentUser.userId, fav).subscribe(
        data => {
          if (data.isSuccess) {
            this.selectedReport.favourite = fav;
            this.getReportList(this.reportQueryModel);
          } else this.alertService.error(data.message);
        },
        err => this.alertService.error(err)
      )
    )
  }


  //####################### Parameter window functions start ##########################
  openParameterWindow(item) {
    if (!item.parameterExists) return;
    this.selectedReport = item;
    this.openReportParameter = true;
    $('.reportParamOverlay').addClass('ovrlay');
  }

  closeRportparamWindow(eve) {
    this.openReportParameter = eve;
    $('.reportParamOverlay').removeClass('ovrlay');
    this.getReportList(this.reportQueryModel)
  }

  //####################### Parameter window functions end ##########################


  //####################### Set User Categroy window functions start ##########################
  openSetUserCategoryWindow(item = null, manageUsrCategory) {
    this.selectedReport = item;
    this.manageUsrCategory = manageUsrCategory;
    this.openSetUserCategory = true;
    $('.reportParamOverlay').addClass('ovrlay');
  }

  closeSetUserCategoryWindow(eve) {
    this.openSetUserCategory = eve;
    $('.reportParamOverlay').removeClass('ovrlay');
    this.refreshUserCategory();
  }

  //####################### Set User Categroy functions end ##########################

  //####################### Preview Report functions start ##########################
  previewReport() {
    this.openPreviewReport = true;
    $('.reportParamOverlay').addClass('ovrlay');
  }

  closePreviewReport(eve) {
    this.openPreviewReport = eve;
    $('.reportParamOverlay').removeClass('ovrlay');
  }

  runReport() {
    if (this.mySelection.length > 1) {
      this.runMultipleReport();
    } else {
      let lstParamNameValue: string[] = [''];
      const exportId = this.selectedReport.reportId;
      this.subs.add(
        this.reportService.getListOfScheduledParameters(exportId).subscribe(
          data => {
            if (data.isSuccess) {
              const parameters = data.data;
              // console.log(parameters);
              if (parameters.length > 0) {
                let paramArr: string[] = [];
                let checkValueSet = '';
                parameters.forEach(element => {
                  if (checkValueSet == '' && element.paramvalue == "") {
                    checkValueSet = element.extfield;
                  }
                  paramArr.push(element.extfield)
                  paramArr.push(element.paramvalue)
                });
                lstParamNameValue = [paramArr.toString()];

                if (checkValueSet != '') {
                  this.alertService.error(`Missing Parameters: ${checkValueSet}`);
                  this.openParameterWindow(this.selectedReport);
                  return;
                }
              }

              // run report 
              this.alertService.success(`Report ${exportId} - ${this.selectedReport.reportName} has started.`);
              this.reportingGrpService.runReport(exportId, lstParamNameValue, this.currentUser.userId, "EXCEL", this.pivot).subscribe(
                data => {
                  const linkSource = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + data;
                  const downloadLink = document.createElement("a");
                  const fileName = `Xport_${exportId}.xlsx`;
                  downloadLink.href = linkSource;
                  downloadLink.download = fileName;
                  downloadLink.click();
                },
                err => {
                  this.alertService.error(`Parameters are not set`);
                  this.openParameterWindow(this.selectedReport);
                }
              )
            } else this.alertService.error(data.message);
          },
          err => this.alertService.error(err)
        )
      )
    }



  }

  async runMultipleReport() {
    this.alertService.success(`Multiple report has started.`);
    for (let exportId of this.mySelection) {
      let lstParamNameValue: string[] = [''];
      const data = await this.reportService.getListOfScheduledParameters(exportId, true).toPromise();
      const parameters = data.data;
      if (parameters.length > 0) {
        let paramArr: string[] = [];
        let checkValueSet = '';
        parameters.forEach(element => {
          if (checkValueSet == '' && element.paramvalue == "") {
            checkValueSet = element.extfield;
          }
          paramArr.push(element.extfield)
          paramArr.push(element.paramvalue)
        });
        lstParamNameValue = [paramArr.toString()];

        if (checkValueSet != '') {
          this.alertService.error(`${exportId} Report missing Parameters: ${checkValueSet}`);
          continue;
        }
      }

      let reportData = await this.reportingGrpService.runReport(exportId, lstParamNameValue, this.currentUser.userId, "EXCEL", this.pivot).toPromise();
      const linkSource = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + reportData;
      const downloadLink = document.createElement("a");
      const fileName = `Xport_${exportId}.xlsx`;
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
      // console.log(exportId);
    }

  }

  //####################### Preview Report functions end ##########################

  //####################### Schedule Report functions start ##########################
  scheduleReport(item) {
    this.selectedReport = item;
    this.openScheduleReport = true;
    $('.reportParamOverlay').addClass('ovrlay');
  }

  closeScheduleReportWindow(eve) {
    this.openScheduleReport = eve;
    $('.reportParamOverlay').removeClass('ovrlay');
    this.getReportList(this.reportQueryModel)
  }


  //####################### Schedule Report functions end ##########################

  // ####################### Right sidebar functions start##########################

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
      nameMatchAll: false,
      nameMatchAny: true,
      selectedOutputColumns: [],
      columnMatchAll: false,
      columnMatchAny: true,
      columnExactMatch: false,
      all: true,
      lastMonth: false,
      last3Month: false,
      last12Month: false,
      frontFilter: false
    }

    this.showColumns = false;
    const objectStr = JSON.stringify(this.reportListFilters);//pass object string just to check object has changed
    this.textSearch$.next(objectStr);
  }

  // ####################### Right sidebar functions end ##########################

  showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if (element.className.indexOf('showCol') != -1) {
      const innerTxt = element.innerHTML;
      this.tooltipDir.toggle(element);
      this.toolTipData.dataLoaded = true;
      if (this.toolTipData.innerText != innerTxt) {
        this.toolTipData.innerText = innerTxt.replace(/,/g, ", ");
      }
    }
    // else {
    //   // this.toolTipData.dataLoaded = false;
    //   // this.tooltipDir.hide();
    // }


  }
}
