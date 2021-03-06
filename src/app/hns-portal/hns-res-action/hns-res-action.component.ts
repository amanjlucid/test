import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, RowClassArgs, BaseFilterCellComponent, FilterService } from '@progress/kendo-angular-grid';
import { AssetAttributeService, AlertService, SharedService, HnsResultsService, HelperService } from '../../_services';
import { SubSink } from 'subsink';
import { tap, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { HnsAction } from '../../_models'
// import { TextFilterComponent } from '../../kendo-component/text-filter.component';
// import { filter } from '@progress/kendo-data-query/dist/npm/transducers';


@Component({
  selector: 'app-hns-res-action',
  templateUrl: './hns-res-action.component.html',
  styleUrls: ['./hns-res-action.component.css'],

})
export class HnsResActionComponent implements OnInit {
  subs = new SubSink(); // to unsubscribe services
  gridView: DataResult;
  allowUnsort = true;
  multiple = false;
  state: State = {
    sort: [],
    filter: {
      filters: [],
      logic: "and",
    }
  }
  statusArr: any = [{ hasiactionstatus: "Outstanding" }, { hasiactionstatus: "Resolved" }]
  overDueArr: any = [{ overduepending: "Overdue" }, { overduepending: "Pending" }]
  headerFilters: HnsAction = new HnsAction();
  gridStatus: any = 'Y';
  public loading: boolean;
  public query: any;
  private stateChange = new BehaviorSubject<any>(this.headerFilters);
  currentUser: any;
  selectedAction: any;
  showAssessment: boolean = false;
  showEditAnswer: boolean = false;
  issueFormMode: string = "";
  showIssue: boolean = false;
  filters: any = [];
  showImage: boolean = false;
  showDoc: boolean = false;
  totalCount: any = 0;
  hnsPermission: any = [];
  touchtime = 0;
  showInfoEditAns: boolean = false;
  textSearch$ = new Subject<string>();
  dialogOpened: boolean = false;
  validatReportString: string;
  columnFiltersOpt: any = [];
  apiColFilter: any = [];

  constructor(
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private sharedService: SharedService,
    private hnsResultService: HnsResultsService,
    private helperService: HelperService

  ) { }

  public distinctPrimitive(fieldName: string, arr): any {
    return distinct(arr, fieldName).map(item => item[fieldName]);
  }

  ngOnInit() {
    //update notification on top
    this.helperService.updateNotificationOnTop();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.headerFilters.UserId = this.currentUser.userId;
    this.sharedService.changeResPageName("Actions");

    this.query = this.stateChange.pipe(
      tap(state => {
        this.headerFilters = state;
        this.loading = true;

      }),
      switchMap(state => this.hnsResultService.getActionGrid(state)),
      tap((res) => {
        //console.log(res);
        this.totalCount = (res.total != undefined) ? res.total : 0;
        this.loading = false;
      })
    );


    // get filter head data
    this.subs.add(
      this.sharedService.resultHeaderFiltersList.subscribe(
        data => {
          //console.log(data)
          if (data.length != 0) {
            this.headerFilters.Hittypecode = data.hittypecode
            this.headerFilters.Hsownassid = data.hsownassid
            this.headerFilters.AssId = data.assId
            this.headerFilters.AddressSearch = data.addressSearch
            this.headerFilters.ActiveInactive = data.status

          }
        }
      )
    )

    // trigger filter event from hns head
    this.subs.add(
      this.sharedService.filterActionGridEvent.subscribe(
        data => {
          if (data) {
            this.searchActionGrid();
            setTimeout(() => {
              this.sharedService.changeFilterGrid(false);
            }, 2000);
          }
        }
      )
    )

    // triggr filter on text search
    this.subs.add(
      this.textSearch$
        .pipe(
          debounceTime(1000),
          distinctUntilChanged()
        ).subscribe((searchTerm) => {
          this.headerFilters.Textstring = searchTerm;
          this.searchActionGrid();
        })
    )


    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
        }
      )
    )

    //Grid filter column values
    this.subs.add(
      this.hnsResultService.gridFilterColumn().subscribe(
        data => {
          if (data.isSuccess) {
            this.columnFiltersOpt = data.data
          }

        }
      )
    )

    // Definition Column filter data
    this.subs.add(
      this.hnsResultService.definitionOrCharFilterCol('Definition').subscribe(
        data => {
          if (data.isSuccess) this.apiColFilter = data.data
          //  console.log(data)
        }
      )
    )


  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  setTextSearch($event) {
    this.textSearch$.next($event.target.value);
  }

  public pageChange(state: PageChangeEvent): void {
    this.headerFilters.CurrentPage = state.skip;
    this.headerFilters.PageSize = state.take;
    this.stateChange.next(this.headerFilters);

  }

  public sortChange(sort: SortDescriptor[]): void {
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
      this.searchActionGrid()
    }

  }

  public filterChange(filter: any): void {
    this.headerFilters.IsFilter = false;
    this.state.filter = filter;
    this.filters = [];

    if (filter) {
      // if (filter.filters.length > 0) {
      this.headerFilters.IsFilter = true;

      // this.state.filter.filters.push(...filter.filters);
      if (this.state.filter) {
        if (this.state.filter.filters.length > 0) {
          let distincFitler = this.changeFilterState(this.state.filter.filters);

          distincFitler.then(filter => {
            if (filter.length > 0) {
              this.resetGridFilter()
              for (let ob of filter) {
                this.setGridFilter(ob);
              }

              this.removeLastCommaFromString()// remove comma from some filters
              setTimeout(() => {
                this.searchActionGrid()
              }, 500);
              return
            }
          })
        }
      }
      this.resetGridFilter()
      this.searchActionGrid()
      // else {
      //   this.resetGridFilter()
      //   this.searchActionGrid()
      // }
      // } else {
      //   this.state.filter = filter;
      //   this.resetGridFilter()
      //   this.searchActionGrid()
      // }

      setTimeout(() => {
        $('.k-clear-button-visible').hide();
      }, 10);
    }


  }

  removeLastCommaFromString() {
    if (this.headerFilters.Definition != "") {
      this.headerFilters.Definition = this.headerFilters.Definition.replace(/,\s*$/, "");
    }
    if (this.headerFilters.Priority != "") {
      this.headerFilters.Priority = this.headerFilters.Priority.replace(/,\s*$/, "");
    }
    if (this.headerFilters.Budget != "") {
      this.headerFilters.Budget = this.headerFilters.Budget.replace(/,\s*$/, "");
    }
    if (this.headerFilters.OverdueFilter != "") {
      this.headerFilters.OverdueFilter = this.headerFilters.OverdueFilter.replace(/,\s*$/, "");
    }
    if (this.headerFilters.Status != "") {
      this.headerFilters.Status = this.headerFilters.Status.replace(/,\s*$/, "");
    }
    if (this.headerFilters.WorkStatus != "") {
      this.headerFilters.WorkStatus = this.headerFilters.WorkStatus.replace(/,\s*$/, "");
    }
  }

  changeFilterState(obj) {
    return Promise.resolve().then(x => {
      for (let f of obj) {
        if (f.hasOwnProperty("field")) {
          if (f.field == "hasiresolutiondate" || f.field == "hasitargetdate" || f.field == "hasaassessmentdate" || f.field == "hasimodifieddate" || f.field == "hasiworkauthoriseddate" || f.field == "hasiworkscheduledate" || f.field == "hasiworkcompletiondate" || f.field == "hasversion" || f.field == "hasiseverity" || f.field == "hasiprobability" || f.field == "hasiriskscore") {
            if (this.containsFilterObject(f, this.filters) == false) {
              this.filters.push(f);
            }
          } else {
            if (this.containsObject(f, this.filters) == false) {
              this.filters.push(f);
            }
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



  filterGrid(event) {
    if (event) {
      // console.log(this.state.filter)
      this.filterChange(this.state.filter)
    }
    //this.state.filter = filter;
    //console.log(this.state)
    // this.tempState.filter = filter;
    // this.resetGrid()
    // let tempGrid = process(this.definitionListsData, this.tempState);
    // this.definitionTempData = tempGrid.data;
    // this.renderGrid(tempGrid);
    //this.gridView = process(this.definitionTempData, this.state);
    //console.log(this.gridView);
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedAction = dataItem;
    // console.log(this.selectedAction)
    if (columnIndex > 1) {
      this.openIssueOrAnser(dataItem)
    }
  }


  openIssueOrAnser(dataItem, clickEv = false) {
    if (this.touchtime == 0) {
      // set first click
      this.touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - this.touchtime) < 400) {
        // double click occurred
        this.selectedAction = dataItem;
        if (this.selectedAction.hasiactionstatus == "R" || this.selectedAction.hasiactionstatus == "O" || this.selectedAction.hasiactionstatus == "Y")
        {
          if (this.hnsPermission.indexOf('Edit Issue') != -1)
          {
        $('.actionOverlay').addClass('ovrlay');
            this.openIssue("edit", dataItem)
          }
          else{
            this.alertService.error("You do not have permission to access the Edit Issue panel!");
          }
        }
        else
        {
          if (this.hnsPermission.indexOf('Edit Answer') != -1) {
            $('.actionOverlay').addClass('ovrlay');
            this.openEditAnswer(dataItem);
          }
          else{
            this.alertService.error("You do not have permission to access the Edit Answer panel!");
          }

        }
        // this.definitionDetailIsTrue = true;
        this.touchtime = 0;
      } else {
        // not a double click so set as a new first click
        this.touchtime = new Date().getTime();
      }
    }

  }

  searchActionGrid() {
    this.resetCurrnetPage();
    // console.log(this.headerFilters);
    this.stateChange.next(this.headerFilters);
  }

  onChange(event) {
    this.headerFilters.All = '';
    this.headerFilters.Outstanding = '';
    this.headerFilters.Overdue = '';
    this.headerFilters.Resolved = '';
    this.headerFilters.None = '';
    if (event == "A") {
      this.headerFilters.All = "Y";
    } else if (event == "Y") {
      this.headerFilters.Outstanding = "Y";
    } else if (event == "O") {
      this.headerFilters.Overdue = "Y";
    } else if (event == "R") {
      this.headerFilters.Resolved = "Y";
    } else if (event == "N") {
      this.headerFilters.None = "Y";
    }
  }


  openAssessment(dataItem) {
    this.selectedAction = dataItem;
    this.showAssessment = true;
    $('.actionOverlay').addClass('ovrlay');

  }

  closeAssessment(event) {
    this.showAssessment = false;
    $('.actionOverlay').removeClass('ovrlay');
    this.stateChange.next(this.headerFilters);


  }

  resetCurrnetPage() {
    this.headerFilters.CurrentPage = 0;
    this.state.skip = 0;
  }

  openEditAnswer(dataItem) {
    this.selectedAction = dataItem;

    // if (this.selectedAction.hasayesnona == "I" && this.selectedAction.hasiactionstatus == "I") {
    if (this.selectedAction.hasquestiontype == "Info") {
      this.showInfoEditAns = true;
    } else {
      this.showEditAnswer = true;
    }

    $('.actionOverlay').addClass('ovrlay');
  }

  closeInfoChangeAnswer(event) {
    this.showInfoEditAns = false;
    $('.actionOverlay').removeClass('ovrlay');
  }

  closeEditAnswer(event) {
    this.showEditAnswer = false;
    $('.actionOverlay').removeClass('ovrlay');
    this.stateChange.next(this.headerFilters);
  }

  openIssue(mode, data) {
    this.selectedAction = data
    this.issueFormMode = mode;
    this.showIssue = true;
    $('.actionOverlay').addClass('ovrlay');
  }

  closeIssue(event) {
    this.showIssue = false;
    $('.actionOverlay').removeClass('ovrlay');
    this.stateChange.next(this.headerFilters);
  }


  setGridFilter(obj) {
    if (obj.field == "assid") {
      this.headerFilters.AssIdFilter = obj.value;
    } else if (obj.field == "astconcataddress") {
      this.headerFilters.Address = obj.value;
    } else if (obj.field == "hasiactionstatus") {
      let status = "O"
      if (obj.value.toLocaleLowerCase() == "outstanding") {
        status = "O";
      } else if (obj.value.toLocaleLowerCase() == "resolved") {
        status = "R";
      } else if (obj.value.toLocaleLowerCase() == "no issue") {
        status = "I";
      } else if (obj.value.toLocaleLowerCase() == "overdue") {
        status = "Y";
      }
      //else {
      //   this.headerFilters.Status = obj.value.toLocaleLowerCase();
      // }
      this.headerFilters.Status += status+',';

    } else if (obj.field == "asspostcode") {
      this.headerFilters.Postcode = obj.value;
    } else if (obj.field == "hascode") {
      this.headerFilters.Definition += obj.value + ',';
    } else if (obj.field == "hasversion") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.VersionTo = findObj[0].value;
        } else {
          this.headerFilters.VersionFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.VersionFrom = findObj[0].value;
        this.headerFilters.VersionTo = findObj[1].value;
      }

    } else if (obj.field == "hasquestioncode") {
      this.headerFilters.QuestionCode = obj.value;
    } else if (obj.field == "hasquestiontext") {
      this.headerFilters.Question = obj.value;
    } else if (obj.field == "hasiissue") {
      this.headerFilters.Issue = obj.value;
    } else if (obj.field == "hasiproposedaction") {
      this.headerFilters.ProposedAction = obj.value;
    } else if (obj.field == "hasiresolution") {
      this.headerFilters.Resolution = obj.value;
    } else if (obj.field == "hasiresolutiondate") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.ResolutionDateTo = findObj[0].value;
        } else {
          this.headerFilters.ResolutionDateFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.ResolutionDateFrom = findObj[0].value;
        this.headerFilters.ResolutionDateTo = findObj[1].value;
      }

    } else if (obj.field == "hasiseverity") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.SeverityTo = findObj[0].value;
        } else {
          this.headerFilters.SeverityFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.SeverityFrom = findObj[0].value;
        this.headerFilters.SeverityTo = findObj[1].value;
      }

    } else if (obj.field == "hasiprobability") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.ProbabilityTo = findObj[0].value;
        } else {
          this.headerFilters.ProbabilityFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.ProbabilityFrom = findObj[0].value;
        this.headerFilters.ProbabilityTo = findObj[1].value;
      }

    } else if (obj.field == "hasiriskscore") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.RiskScoreTo = findObj[0].value;
        } else {
          this.headerFilters.RiskScoreFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.RiskScoreFrom = findObj[0].value;
        this.headerFilters.RiskScoreTo = findObj[1].value;
      }

    } else if (obj.field == "hasipriority") {
      this.headerFilters.Priority += obj.value + ',';
    } else if (obj.field == "hasibudgetcode") {
      this.headerFilters.Budget += obj.value+',';
    } else if (obj.field == "hasitargetdate") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.TargetDateTo = findObj[0].value;
        } else {
          this.headerFilters.TargetDateFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.TargetDateFrom = findObj[0].value;
        this.headerFilters.TargetDateTo = findObj[1].value;
      }

    } else if (obj.field == "overduepending") {
      this.headerFilters.OverdueFilter += obj.value+',';
    } else if (obj.field == "hasalocation") {
      this.headerFilters.Location = obj.value;
    } else if (obj.field == "hasafloor") {
      this.headerFilters.Floor = obj.value;
    } else if (obj.field == "hasacomments") {
      this.headerFilters.AnswerComments = obj.value;
    } else if (obj.field == "hasicomments") {
      this.headerFilters.IssueComments = obj.value;
    } else if (obj.field == "hasaassessmentref") {
      this.headerFilters.AssessmentReff = obj.value;
    } else if (obj.field == "hasaassessor") {
      this.headerFilters.Assessor = obj.value;
    } else if (obj.field == "hasaassessmentdate") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.AssessmentDateTo = findObj[0].value;
        } else {
          this.headerFilters.AssessmentDateFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.AssessmentDateFrom = findObj[0].value;
        this.headerFilters.AssessmentDateTo = findObj[1].value;
      }

    } else if (obj.field == "hasimodifiedby") {
      this.headerFilters.IssueModifiedBy = obj.value;
    } else if (obj.field == "hasimodifieddate") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.IssueModifiedDateTo = findObj[0].value;
        } else {
          this.headerFilters.IssueModifiedDateFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.IssueModifiedDateFrom = findObj[0].value;
        this.headerFilters.IssueModifiedDateTo = findObj[1].value;
      }

    } else if (obj.field == "hasiworkstatus") {
      this.headerFilters.WorkStatus += obj.value+',';
    } else if (obj.field == "hasiworkauthoriseddate") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.WorkAuthDateTo = findObj[0].value;
        } else {
          this.headerFilters.WorkAuthDateFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.WorkAuthDateFrom = findObj[0].value;
        this.headerFilters.WorkAuthDateTo = findObj[1].value;
      }

    } else if (obj.field == "hasiworkauthoriseduser") {
      this.headerFilters.WorkAuthUser = obj.value;
    } else if (obj.field == "hasiworkreference") {
      this.headerFilters.WorkAuthRef = obj.value;
    } else if (obj.field == "hasiworkscheduledate") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.WorkShcduleDateTo = findObj[0].value;
        } else {
          this.headerFilters.WorkShcduleDateFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.WorkShcduleDateFrom = findObj[0].value;
        this.headerFilters.WorkShcduleDateTo = findObj[1].value;
      }

    } else if (obj.field == "hasiworknotes") {
      this.headerFilters.WorkNotes = obj.value;
    } else if (obj.field == "hasiworkreference") {
      this.headerFilters.WorkNotes = obj.value;
    } else if (obj.field == "hasiworkcompletiondate") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.WorkCompletionDateTo = findObj[0].value;
        } else {
          this.headerFilters.WorkCompletionDateFrom = findObj[0].value;
        }
      } else {
        this.headerFilters.WorkCompletionDateFrom = findObj[0].value;
        this.headerFilters.WorkCompletionDateTo = findObj[1].value;
      }

    }
  }

  resetGridFilter() {
    this.headerFilters.AssIdFilter = '';
    this.headerFilters.Address = '';
    this.headerFilters.Postcode = '';
    this.headerFilters.Definition = '';
    this.headerFilters.VersionFrom = 0;
    this.headerFilters.VersionTo = 0;
    this.headerFilters.QuestionCode = '';
    this.headerFilters.Question = '';
    this.headerFilters.Issue = '';
    this.headerFilters.ProposedAction = '';
    this.headerFilters.Resolution = '';
    this.headerFilters.ResolutionDateFrom = '';
    this.headerFilters.ResolutionDateTo = '';
    this.headerFilters.SeverityFrom = 0;
    this.headerFilters.SeverityTo = 0;
    this.headerFilters.ProbabilityFrom = 0;
    this.headerFilters.ProbabilityTo = 0;
    this.headerFilters.RiskScoreFrom = 0;
    this.headerFilters.RiskScoreTo = 0;
    this.headerFilters.Priority = '';
    this.headerFilters.Budget = '';
    this.headerFilters.TargetDateFrom = '';
    this.headerFilters.TargetDateTo = '';
    this.headerFilters.Status = '';
    this.headerFilters.Location = '';
    this.headerFilters.Floor = '';
    this.headerFilters.AnswerComments = '';
    this.headerFilters.IssueComments = '';
    this.headerFilters.AssessmentReff = '';
    this.headerFilters.Assessor = '';
    this.headerFilters.AssessmentDateFrom = '';
    this.headerFilters.AssessmentDateTo = '';
    this.headerFilters.IssueModifiedBy = '';
    this.headerFilters.IssueModifiedDateFrom = '';
    this.headerFilters.IssueModifiedDateTo = '';
    this.headerFilters.WorkStatus = '';
    this.headerFilters.WorkAuthDateFrom = '';
    this.headerFilters.WorkAuthDateTo = '';
    this.headerFilters.WorkAuthUser = '';
    this.headerFilters.WorkAuthRef = '';
    this.headerFilters.WorkShcduleDateFrom = '';
    this.headerFilters.WorkShcduleDateTo = '';
    this.headerFilters.WorkNotes = '';
    this.headerFilters.WorkCompletionDateFrom = '';
    this.headerFilters.WorkCompletionDateTo = '';
    this.headerFilters.OverdueFilter = '';


  }

  viewImage(data) {
    this.selectedAction = data;
    this.showImage = true;
    $('.actionOverlay').addClass('ovrlay');
  }

  closerImage(event) {
    this.showImage = false;
    $('.actionOverlay').removeClass('ovrlay');
    // this.disableBtn = true
  }

  opneDocList(data) {
    this.selectedAction = data;
    $('.actionOverlay').addClass('ovrlay');
    this.showDoc = true;
  }

  closeDocList(event) {
    this.showDoc = event;
    $('.actionOverlay').removeClass('ovrlay');
  }

  exportToExcelTop(): void {
    this.headerFilters.IsExport = true;
    this.hnsResultService.getActionGrid(this.headerFilters).subscribe(
      data => {
        ///console.log(data);
        this.headerFilters.IsExport = false;
        if (data.data.length > 0) {
          let fileExt = "xlsx"
          let dataToExport = data.data;
          if (dataToExport.length != undefined && dataToExport.length > 0) {
            if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx') {
              let tempData = Object.assign([], dataToExport);
              // modify export data
              tempData.map((x: any) => {
                x.amend = this.helperService.formatDateWithoutTime(x.hasimodifieddate)
                x.hasscoremax1 = x.hasscoremax
                x.hasactionyesnona = x.hasscoremax == "N" ? "No" : x.hasscoremax == "Y" ? "Yes" : x.hasscoremax == "X" ? "N/A" : "";
                x.hasalatestassesment = x.hasalatestassesment == "N" ? "Historical" : x.hasalatestassesment == "Y" ? "Current" : "";
                x.hasiactionstatus = x.hasiactionstatus == "O" ? "Outstanding" : x.hasiactionstatus == "R" ? "Resolved" : "";
                x.amend = this.helperService.formatDateWithoutTime(x.hasimodifieddate)
                x.hasitargetdate = x.hasitargetdate == "1753-01-01T00:00:00" ? "":this.helperService.formatDateWithoutTime(x.hasitargetdate)
                x.hasiresolutionDate = ''
                x.hasaassessmentdate = x.hasaassessmentdate == "1753-01-01T00:00:00" ? "":this.helperService.formatDateWithoutTime(x.hasaassessmentdate)
                x.hasimodifieddate = x.hasimodifieddate == "1753-01-01T00:00:00" ? "":this.helperService.formatDateWithoutTime(x.hasimodifieddate)
                x.hasiworkauthoriseddate = x.hasiworkauthoriseddate == "1753-01-01T00:00:00" ? "":this.helperService.formatDateWithoutTime(x.hasiworkauthoriseddate)
                x.hasiworkscheduledate = x.hasiworkscheduledate == "1753-01-01T00:00:00" ? "":this.helperService.formatDateWithoutTime(x.hasiworkscheduledate)
                x.hasiworkcompletiondate  = x.hasiworkcompletiondate == "1753-01-01T00:00:00" ? "": this.helperService.formatDateWithoutTime(x.hasiworkcompletiondate)
              })

              let label = {
                'assid': 'Asset',
                'astconcataddress': 'Address',
                'asspostcode': 'Post Code',
                'hascode': 'Defintion',
                'hasversion': 'Version',
                'hasquestioncode': 'Question Code',
                'hasquestiontext': 'Question',
                'hasiissue': 'Answer/Issue',
                'hasiproposedaction': 'Proposed Action',
                'hasiresolution': 'Resolution',
                'hasiresolutionDate': 'Resolution Date',
                'hasiseverity': 'Severity',
                'hasiprobability': 'Probability',
                'hasiriskscore': 'Risk Score',
                'hasipriority': 'Priority',
                'hasibudgetcode': 'Budget',
                'hasitargetdate': 'Target Date',
                'overduepending': 'Overdue',
                'hasiactionstatus': 'Status',
                'hasalocation': 'Location',
                'hasafloor': 'Floor',
                'hasacomments': 'Answer Comments',
                'hasicomments': 'Issue Comments',
                'hasaassessmentref': 'Assessment Ref',
                'hasaassessor': 'Assessor',
                'hasaassessmentdate': 'Assessment Date',
                'hasimodifiedby': 'Issue Updated By',
                'hasimodifieddate': 'Issue Updated Date',
                'hasiworkstatus': 'Work Status',
                'hasiworkauthoriseddate': 'Work Auth Date',
                'hasiworkauthoriseduser': 'Work Auth User',
                'hasiworkreference': 'Work Ref',
                'hasiworkscheduledate': 'Work Schedule Date',
                'hasiworknotes': 'Work Notes',
                'hasiworkcompletiondate': 'Work Completion Date',
              }

              this.helperService.exportAsExcelFile(tempData, 'HnS Action', label)

            }
          } else {
            alert('There is no record to import');
          }

        }
      }
    )



  }


  report(data, reportType) {
    this.selectedAction = data;
    let RequestParameter = "";
    let reportTypeParam = "";
    let validateApi = false;

    if (reportType == "stCD") {
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasaassessmentref}|Y|N|N|N`
      // RequestParameter = "01|ACEFRA|1|01-ACEFRA-1-20190301|Y|N|N|N"
      reportTypeParam = "Standard"
    } else if (reportType == "stCDR") {
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasaassessmentref}|Y|Y|N|N`
      reportTypeParam = "Standard"
    } else if (reportType == "stOD") {
      reportTypeParam = "Standard"
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasaassessmentref}|N|N|N|N`
    } else if (reportType == "paCd") {
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasaassessmentref}|Y|N|Y|N`
    } else if (reportType == "paOD") {
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasaassessmentref}|N|N|Y|N`
    } else if (reportType == "parCD") {
      validateApi = true;
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasaassessmentref}|Y|N|Y|Y`
    } else if (reportType == "parOD") {
      validateApi = true;
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasaassessmentref}|N|N|Y|Y`
    }

    let reportParams = {
      UserId: this.currentUser.userId,
      RequestType: "ShowPropertyReport",
      RequestParameter: RequestParameter,
      SessionId: "",
      ReportType: reportTypeParam
    }

    if (validateApi) {
      this.hnsResultService.validateReportForRedaction(this.selectedAction.assid, this.selectedAction.hascode, this.selectedAction.hasversion, this.selectedAction.hasaassessmentref, this.selectedAction.hasalatestassessment).subscribe(
        data => {
          if (data.isSuccess && data.data != "") {
            this.dialogOpened = true;
            this.validatReportString = data.data;
          } else {
            this.subs.add(
              this.hnsResultService.runReport(reportParams).subscribe(
                data => {
                  if (data.isSuccess && data.data.length > 0) {


                    let fileExt = "pdf";
                    this.assetAttributeService.getMimeType(fileExt).subscribe(
                      mimedata => {
                        if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
                          var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
                          if (mimedata.data.openWindow) {
                            var byteCharacters = atob(data.data[0].pdFbyte);
                            var byteNumbers = new Array(byteCharacters.length);
                            for (var i = 0; i < byteCharacters.length; i++) {
                              byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            var byteArray = new Uint8Array(byteNumbers);
                            var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
                            var fileURL = URL.createObjectURL(file);
                            let newPdfWindow = window.open(fileURL);

                            // let newPdfWindow = window.open("",this.selectedNotes.fileName);
                            // let iframeStart = "<\iframe title='Notepad' width='100%' height='100%' src='data:" + mimedata.data.mimeType1 + ";base64, ";
                            // let iframeEnd = "'><\/iframe>";
                            // newPdfWindow.document.write(iframeStart + filedata + iframeEnd);
                            // newPdfWindow.document.title = this.selectedNotes.fileName;
                          }
                          else {
                            linkSource = linkSource + data.data[0].pdFbyte;;
                            const downloadLink = document.createElement("a");
                            const fileName = `PropertyReport_${this.selectedAction.hasaassessmentref}_${this.selectedAction.hasversion}_${this.selectedAction.assid}.pdf`;
                            downloadLink.href = linkSource;
                            downloadLink.download = fileName;
                            downloadLink.click();
                          }
                        }
                        else {
                          this.alertService.error("This file format is not supported.");
                        }
                      }
                    )
                  }
                }
              )
            )
          }
        }
      )
    } else {
      this.subs.add(
        this.hnsResultService.runReport(reportParams).subscribe(
          data => {
            if (data.isSuccess && data.data.length > 0) {
              let fileExt = "pdf";
              this.assetAttributeService.getMimeType(fileExt).subscribe(
                mimedata => {
                  if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
                    var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
                    if (mimedata.data.openWindow) {
                      var byteCharacters = atob(data.data[0].pdFbyte);
                      var byteNumbers = new Array(byteCharacters.length);
                      for (var i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      var byteArray = new Uint8Array(byteNumbers);
                      var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
                      var fileURL = URL.createObjectURL(file);
                      let newPdfWindow = window.open(fileURL);

                      // let newPdfWindow = window.open("",this.selectedNotes.fileName);
                      // let iframeStart = "<\iframe title='Notepad' width='100%' height='100%' src='data:" + mimedata.data.mimeType1 + ";base64, ";
                      // let iframeEnd = "'><\/iframe>";
                      // newPdfWindow.document.write(iframeStart + filedata + iframeEnd);
                      // newPdfWindow.document.title = this.selectedNotes.fileName;
                    }
                    else {
                      linkSource = linkSource + data.data[0].pdFbyte;;
                      const downloadLink = document.createElement("a");
                      const fileName = `PropertyReport_${this.selectedAction.hasaassessmentref}_${this.selectedAction.hasversion}_${this.selectedAction.assid}.pdf`;
                      downloadLink.href = linkSource;
                      downloadLink.download = fileName;
                      downloadLink.click();
                    }
                  }
                  else {
                    this.alertService.error("This file format is not supported.");
                  }
                }
              )
            }
          }
        )
      )
    }



  }



  closeDialog() {
    this.validatReportString = '';
    this.dialogOpened = false;
  }




}
