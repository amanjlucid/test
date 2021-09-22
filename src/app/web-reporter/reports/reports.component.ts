import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
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
      logic: "and",
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
  categoryPopupSettings = {
    animate: true,
    width: 'auto',
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
    Categories: [],
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
  filter: CompositeFilterDescriptor;
  gridHeight = 750;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateGridHeight();
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

  updateGridHeight() {
    const innerHeight = window.innerHeight; 
    if(innerHeight < 754 ){
      this.gridHeight = innerHeight - 300;
    } else {
      this.gridHeight = innerHeight - 230;
    }
   
   }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.updateGridHeight();

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
          // this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id).toString();
          this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id);

          this.getReportList(this.reportQueryModel);
          this.getRportCount(this.reportQueryModel);

        }
      )
    )

    // triggr filter on right side bar search
    this.subs.add(
      this.textSearch$
        .pipe(
          debounceTime(1000),
          distinctUntilChanged(),
        ).subscribe((val) => {
          this.filterGrid();
        })
    );

    // subscribe for grid filter with api
/*     this.subs.add(
      this.waitForApiSearch$.pipe(
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe(val => {
        this.loading = true
        this.getReportList(this.reportQueryModel)
      })
    ); */

    this.subs.add(
      this.waitForApiSearch$.pipe(
        debounceTime(1000),
        distinctUntilChanged(),
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
    this.loading = true;
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


  public selectedCallback = (args) => args.dataItem;

  showColFn() {
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

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedReport = dataItem;
  }

  onCategoriesSingleSelectionChange(item: any) {
    // this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id).toString();
    this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id);

    this.waitForApiSearch$.next(this.reportQueryModel.Categories)
  }

  onCategoriesSelectionAllChange(items: any) {
    this.selectedCategories = items;
    // this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id).toString();
    this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id);
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
    this.loading = true;
    this.mySelection = [];
    if ((this.reportListFilters.frontFilter == false) || (this.reportListFilters.number == "" && this.reportListFilters.name == "" && this.reportListFilters.selectedOutputColumns.length == 0)) {
      this.reportList = this.actualReportList;
      setTimeout(() => { this.loading = false }, 100);
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
          var searchColumns = this.reportListFilters.selectedOutputColumns.map((a) => { return a.toLowerCase() })
          reportColFilter = false;
          const splitColumns = element.xport_Col.trim() != "" ? element.xport_Col.split(',') : [];
          var xportColumns = splitColumns.map((a) => { return a.toLowerCase() })
          if (xportColumns.length > 0) {
            if (this.reportListFilters.columnMatchAll) {
                for (var searchIndex in searchColumns) {
                  reportColFilter = false;
                  for (var col in xportColumns) {
          if (this.reportListFilters.columnExactMatch) {
                        if (xportColumns[col] == searchColumns[searchIndex]){
                          reportColFilter = true;
                          break;
                        }
                      } else {
                        if (xportColumns[col].includes(searchColumns[searchIndex])){
                          reportColFilter = true;
                          break;
                        }
                      }
                    }
                    if (!reportColFilter) {
                      break;
                    }                      
                  }
            } else {
              if (this.reportListFilters.columnExactMatch) {
                reportColFilter = searchColumns.every(x => xportColumns.includes(x));
              } else {
                for (var searchIndex in searchColumns) {
                  for (var col in xportColumns) {
                      if (xportColumns[col].includes(searchColumns[searchIndex])){
                        reportColFilter = true;
                        break;
                      }
                    }
                    if (reportColFilter) {
                      break;
                    }                      
                  }
              }
            }
          } else {
            reportColFilter = false;
          }







/*           if (this.reportListFilters.columnExactMatch) {
            if (element.xport_Col.trim() != "") {
              reportColFilter = element.xport_Col.trim() == this.reportListFilters.selectedOutputColumns.toString();
            } else {
              reportColFilter = false;
            }
          } else {
            const splitColumns = element.xport_Col.trim() != "" ? element.xport_Col.split(',') : [];
            if (this.reportListFilters.columnMatchAll) {
              if (splitColumns.length > 0) {
                reportColFilter = this.reportListFilters.selectedOutputColumns.every(x => splitColumns.includes(x))
              } else {
                reportColFilter = false;
              }
            } else {
              if (splitColumns.length > 0) {
                reportColFilter = splitColumns.some(x => this.reportListFilters.selectedOutputColumns.some(y => x.toLowerCase().indexOf(y.toLocaleLowerCase()) !== -1))
              }
              else{
                reportColFilter = false;
            }
          }
          } */




        }

        return (reportNumberFilter && reportNameFilter && reportColFilter);

      })

    }

    this.reportList = gridData;
    setTimeout(() => { this.loading = false }, 100);

  }

  reqGridSearch2(event, month) {
    this.mySelection = [];
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
    let lstParamNameValue: string[] = [''];
    const exportId = this.selectedReport.reportId;
    this.subs.add(
      this.reportService.checkParameters(exportId).subscribe(
        data => {
          if (data.isSuccess) {


    this.openPreviewReport = true;
    $('.reportParamOverlay').addClass('ovrlay');


          } else{
            
            if (data.message.toLowerCase().includes('parameter')){
              this.alertService.error(data.message.replace("substitute","set"));
              this.openParameterWindow(this.selectedReport);
                  return;
            } else {
              this.alertService.error(data.message);
            }
          }
        }
      )
    )






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
                lstParamNameValue = paramArr;

                if (checkValueSet != '') {
                  this.alertService.error(`Missing Parameters: ${checkValueSet}`);
                  this.openParameterWindow(this.selectedReport);
                  return;
                }
              }

              // run report 
              this.alertService.success(`Report ${exportId} - ${this.selectedReport.reportName} has started.`);
              this.reportingGrpService.runReport(exportId, lstParamNameValue, this.currentUser.userId, "EXCEL", this.pivot, true).subscribe(
                data => {
                  if (data.isSuccess) {
                    const linkSource = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + data.data;
                  const downloadLink = document.createElement("a");
                  const fileName = `Xport_${exportId}.xlsx`;
                  downloadLink.href = linkSource;
                  downloadLink.download = fileName;
                  downloadLink.click();
                  } else {
                    if (data.message.toLowerCase().includes("parameter")) {
                      this.alertService.error(data.message.replace("substitute","set"));
                      this.openParameterWindow(this.selectedReport);
                    } else {
                        this.alertService.error(data.message);
                    }
                  }
                },
                err => {
                  
                  this.alertService.error(err);

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
    this.alertService.success(`Multiple reports have started.`);
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
        lstParamNameValue = paramArr;

        if (checkValueSet != '') {
          this.alertService.error(`${exportId} Report missing Parameters: ${checkValueSet}`);
          continue;
        }
      }

      let reportData = await this.reportingGrpService.runReport(exportId, lstParamNameValue, this.currentUser.userId, "EXCEL", this.pivot, true ).toPromise();
      if (reportData.isSuccess) {
        const linkSource = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + reportData.data;
      const downloadLink = document.createElement("a");
      const fileName = `Xport_${exportId}.xlsx`;
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
      } else {
        if (reportData.message.toLowerCase().includes("parameter")) {
          this.alertService.error(reportData.message.replace("substitute","set"));
          this.openParameterWindow(this.selectedReport);
        } else {
            this.alertService.error(reportData.message);
        }
      }






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


    var isChange : boolean = true;
    if (this.reportListFilters.number == '' && this.reportListFilters.name == '' && !this.reportListFilters.nameMatchAll && this.reportListFilters.nameMatchAny && 
    this.reportListFilters.selectedOutputColumns.length == 0 && !this.reportListFilters.columnMatchAll && this.reportListFilters.columnMatchAny && 
    !this.reportListFilters.columnExactMatch && this.reportListFilters.all && !this.reportListFilters.lastMonth && !this.reportListFilters.last3Month && 
    !this.reportListFilters.last12Month && !this.reportListFilters.frontFilter && !this.showColumns && !this.reportQueryModel.FavouritesOnly &&
    !this.reportQueryModel.IsShceduled) {
      isChange = false;
    }

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
    this.reportQueryModel.FavouritesOnly = false;
    this.reportQueryModel.IsShceduled = false;
    this.reportQueryModel.value = 0;

/*     const objectStr = JSON.stringify(this.reportListFilters);//pass object string just to check object has changed
    this.textSearch$.next(objectStr); */

    if (isChange) {
          this.getReportList(this.reportQueryModel);
    }

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

  clearAllFilters() {

    var isChange : boolean = true;
    if (this.reportListFilters.number == '' && this.reportListFilters.name == '' && !this.reportListFilters.nameMatchAll && this.reportListFilters.nameMatchAny && 
    this.reportListFilters.selectedOutputColumns.length == 0 && !this.reportListFilters.columnMatchAll && this.reportListFilters.columnMatchAny && 
    !this.reportListFilters.columnExactMatch && this.reportListFilters.all && !this.reportListFilters.lastMonth && !this.reportListFilters.last3Month && 
    !this.reportListFilters.last12Month && !this.reportListFilters.frontFilter && !this.showColumns && !this.reportQueryModel.FavouritesOnly &&
    !this.reportQueryModel.IsShceduled) {
      isChange = false;
    }

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
    this.reportQueryModel.FavouritesOnly = false;
    this.reportQueryModel.IsShceduled = false;
    this.reportQueryModel.value = 0;

    this.selectedCategories = [...this.categories];
    this.reportQueryModel.Categories = this.selectedCategories.map(x => x.item_id);
    this.reportQueryModel.XportCategory='';
    this.selectedCategory = '';
    this.state.filter = {
      logic: 'and',
      filters: []
    };
    this.getReportList(this.reportQueryModel);

  }

}
