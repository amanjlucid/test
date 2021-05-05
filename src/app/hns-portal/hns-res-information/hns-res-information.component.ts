import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, RowClassArgs, BaseFilterCellComponent, FilterService } from '@progress/kendo-angular-grid';
import { AssetAttributeService, AlertService, SharedService, HnsResultsService, HelperService } from '../../_services';
import { SubSink } from 'subsink';
import { tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { HnsInfo } from '../../_models'
import { TextFilterComponent } from '../../kendo-component/text-filter.component';
import { filter } from '@progress/kendo-data-query/dist/npm/transducers';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-hns-res-information',
  templateUrl: './hns-res-information.component.html',
  styleUrls: ['./hns-res-information.component.css'],
  // encapsulation: ViewEncapsulation.None
})
export class HnsResInformationComponent implements OnInit {

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
  // statusArr: any = [{ hasiactionstatus: "Outstanding" }, { hasiactionstatus: "Resolved" }]
  // overDueArr: any = [{ overduepending: "Overdue" }, { overduepending: "Pending" }]
  headerFilters: HnsInfo = new HnsInfo();
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
  showInfoEditAns: boolean = false;
  textSearch$ = new Subject<string>();
  touchtime = 0;
  dialogOpened: boolean = false;
  validatReportString: string;
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
    this.sharedService.changeResPageName("Information");
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.headerFilters.UserId = this.currentUser.userId;

    this.query = this.stateChange.pipe(
      tap(state => {
        this.headerFilters = state;
        this.loading = true;
      }),
      switchMap(state => this.hnsResultService.getInformationGrid(state)),
      tap((res) => {
        this.totalCount = (res.total != undefined) ? res.total : 0;
        this.loading = false;
      })
    );


    // get filter head data
    this.subs.add(
      this.sharedService.resultHeaderFiltersList.subscribe(
        data => {
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

    // Definition and Characteristic Column filter data
    this.subs.add(
      this.hnsResultService.definitionOrCharFilterCol().subscribe(
        data => {
          if (data.isSuccess) this.apiColFilter = data.data
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
  //   public dataStateChange(state: DataStateChangeEvent): void {
  //     // this.state = state;
  //     // this.gridData = process(sampleProducts, this.state);
  //     console.log(state)
  // }


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
      //if (filter.filters.length > 0) {
      this.headerFilters.IsFilter = true;
      // this.state.filter.filters.push(...filter.filters);

      if (this.state.filter) {
        if (this.state.filter.filters.length > 0) {
          console.log(this.state.filter);
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
        } else {
          this.resetGridFilter()
          this.searchActionGrid()
        }
      } else {
        this.resetGridFilter()
        this.searchActionGrid()
      }

      setTimeout(() => {
        $('.k-clear-button-visible').hide();
      }, 10);
    }


  }

  removeLastCommaFromString() {
    if (this.headerFilters.Definition != "") {
      this.headerFilters.Definition = this.headerFilters.Definition.replace(/,\s*$/, "");
    }
    if (this.headerFilters.Chacode != "") {
      this.headerFilters.Chacode = this.headerFilters.Chacode.replace(/,\s*$/, "");
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

  filterGrid(filter: CompositeFilterDescriptor) {
    this.state.filter = filter;
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
    if (columnIndex > 1) {
      this.handleDoubleClick(dataItem)
    }
  }

  handleDoubleClick(dataItem, clickEv = false) {
    if (this.touchtime == 0) {
      // set first click
      this.touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - this.touchtime) < 400) {
        if(this.hnsPermission.indexOf('Edit Answer') != -1)
        {
        // double click occurred
        $('.actionOverlay').addClass('ovrlay');
        this.selectedAction = dataItem;
        this.openEditAnswer(dataItem);
        }

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
    if (this.selectedAction.hasayesnona == "I" && this.selectedAction.hasiactionstatus == "I") {
      this.showInfoEditAns = true;
    } else {
      this.showEditAnswer = true;
    }
    $('.actionOverlay').addClass('ovrlay');
  }

  closeInfoChangeAnswer(event) {
    this.showInfoEditAns = false;
    $('.actionOverlay').removeClass('ovrlay');
    this.searchActionGrid();
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
    } else if (obj.field == "chacode") {
      this.headerFilters.Chacode += obj.value + ',';
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
      this.headerFilters.Priority = obj.value;
    } else if (obj.field == "hasibudgetcode") {
      this.headerFilters.Budget = obj.value;
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
      this.headerFilters.Status = obj.value;
    } else if (obj.field == "hasalocation") {
      this.headerFilters.Location = obj.value;
    } else if (obj.field == "hasafloor") {
      this.headerFilters.Floor = obj.value;
    } else if (obj.field == "hasacomments") {
      this.headerFilters.AnswerComments = obj.value;
    } else if (obj.field == "hasacomments") {
      this.headerFilters.AnswerComments = obj.value;
    } else if (obj.field == "hasaansweritem") {
      this.headerFilters.Answer = obj.value;
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
      this.headerFilters.WorkStatus = obj.value;
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
    } else if (obj.field == "WorkAuthRef") {
      this.headerFilters.WorkAuthUser = obj.value;
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

    } else if (obj.WorkNotes == "hasiworknotes") {
      this.headerFilters.WorkAuthUser = obj.value;
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
    this.headerFilters.Chacode = '';
    this.headerFilters.Answer = '';



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
    this.hnsResultService.getInformationGrid(this.headerFilters).subscribe(
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
                x.hasaassessmentdate = this.helperService.formatDateWithoutTime(x.hasaassessmentdate)
              })
              //console.log(this.gridView)
              // let ignore = [];
              let label = {
                'assid': 'Asset',
                'astconcataddress': 'Address',
                'asspostcode': 'Post Code',
                'hascode': 'Definition',
                'hasversion': 'Vers',
                'hasquestioncode': 'Question Code',
                'hasquestiontext': 'Question',
                'hasaansweritem': 'Answer',
                'hasalocation': 'Location',
                'hasafloor': 'Floor',
                'hasacomments': 'Comments',
                'hasaassessor': 'Assessor',
                'hasaassessmentdate': 'Assessment Date',

              }

              this.helperService.exportAsExcelFile(tempData, 'HnS Information', label)

            }
          } else {
            alert('There is no record to import');
          }

        }
      }
    )



  }

  report(data, reportType) {
    let validateApi = false;
    this.selectedAction = data;
    let reportTypeParam = "";
    let RequestParameter = "";
    if (reportType == "stCD") {
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasaassessmentref}|Y|N|N|N`
      // RequestParameter = "01|ACEFRA|1|01-ACEFRA-1-20190301|Y|N|N|N"
      reportTypeParam = "Standard";
    } else if (reportType == "stCDR") {
      reportTypeParam = "Standard";
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasaassessmentref}|Y|Y|N|N`
    } else if (reportType == "stOD") {
      reportTypeParam = "Standard";
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

                  if (data.isSuccess && data.data && data.data.length > 0) {
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
            if (data.isSuccess && data.data && data.data.length > 0) {
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
                      const fileName = `PropertyReport_${this.selectedAction.hasaassessmentref}_${this.selectedAction.hasversion}_${this.selectedAction.assid}. `;
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
