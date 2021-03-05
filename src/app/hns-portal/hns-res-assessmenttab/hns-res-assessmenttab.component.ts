import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, RowClassArgs, BaseFilterCellComponent, FilterService } from '@progress/kendo-angular-grid';
import { AssetAttributeService, AlertService, SharedService, HnsResultsService, HelperService } from '../../_services';
import { SubSink } from 'subsink';
import { tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { HnsAssessment } from '../../_models'
import { TextFilterComponent } from '../../kendo-component/text-filter.component';
import { filter } from '@progress/kendo-data-query/dist/npm/transducers';

@Component({
  selector: 'app-hns-res-assessmenttab',
  templateUrl: './hns-res-assessmenttab.component.html',
  styleUrls: ['./hns-res-assessmenttab.component.css']
})
export class HnsResAssessmenttabComponent implements OnInit {

  subs = new SubSink(); // to unsubscribe services
  gridView: DataResult;
  allowUnsort = true;
  multiple = false;
  state: State = {
    sort: [],
    filter: {
      filters: [],
      logic: "or",
    }
  }
  statusArr: any = [{ hasiactionstatus: "Outstanding" }, { hasiactionstatus: "Resolved" }]
  overDueArr: any = [{ overduepending: "Overdue" }, { overduepending: "Pending" }]
  headerFilters: HnsAssessment = new HnsAssessment();
  gridStatus: any = 'Y';
  gridStat: any = "Y";
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
  showEditAssetText: boolean = false;
  hnsPermission: any = [];
  openBudgetList: boolean = false;
  displayCustCol: any = 'False';
  touchtime = 0;
  dialogOpened: boolean = false;
  validatReportString: string;
  customerStatusFilter = [{ "key": "(Blanks)", "value": " " }, { "key": "BAD", "value": "BAD" }, { "key": "GOOD", "value": "GOOD" }, { "key": "NO RISK", "value": "NO RISK" }];
  customerRiskRatingFilter = [{ "key": "(Blanks)", "value": " " }, { "key": "LOW", "value": "LOW" }, { "key": "MEDIUM", "value": "MEDIUM" }, { "key": "TOLERABLE", "value": "TOLERABLE" }];
  sourceFilter = [{ "key": "Survey", "value": "Survey" }, { "key": "Interface", "value": "Interface" }, { "key": "(blanks)", "value": " " }];
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
    this.sharedService.changeResPageName("Assessments");
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.headerFilters.UserId = this.currentUser.userId;
    this.headerFilters.Textstring = '';
    this.displayCustomerColOnAssessment()

    this.query = this.stateChange.pipe(
      tap(state => {
        this.headerFilters = state;
        this.loading = true;
        //console.log(this.state)
      }),
      switchMap(state => this.hnsResultService.getAssessment(state)),
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
          if (data.length != 0) {
            this.headerFilters.Hittypecode = data.hittypecode;
            this.headerFilters.Hsownassid = data.hsownassid;
            this.headerFilters.AssId = data.assId;
            this.headerFilters.AddressSearch = data.addressSearch;
            this.headerFilters.ActiveInactive = data.status;
            // if (data.LatestAssessment != undefined) {
            //   this.headerFilters.LatestAssessment = data.LatestAssessment;
            // }

          }
        }
      )
    )

    // trigger filter event from hns head
    this.subs.add(
      this.sharedService.filterActionGridEvent.subscribe(
        data => {
          // console.log(data)
          if (data) {
            this.searchActionGrid();
            setTimeout(() => {
              this.sharedService.changeFilterGrid(false);
            }, 2000);
          }
        }
      )
    )

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
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

  
  displayCustomerColOnAssessment() {
    this.subs.add(
      this.hnsResultService.displayCustomerColumnsOnAssessment().subscribe(
        data => {
          if (data.isSuccess) {
            this.displayCustCol = data.data
          }
        }
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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
              setTimeout(() => {
                this.searchActionGrid()
              }, 500);
              return
            }
          })
        } else {
          this.resetGridFilter();
          this.searchActionGrid();
        }
      } else {
        this.resetGridFilter();
        this.searchActionGrid();
      }
      // }

      setTimeout(() => {
        $('.k-clear-button-visible').hide();
      }, 10);
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
        // double click occurred
        $('.actionOverlay').addClass('ovrlay');
        this.selectedAction = dataItem;
        if (this.hnsPermission.indexOf('View Assessment') != -1) {
          this.openAssessment(dataItem);
        }
        // this.definitionDetailIsTrue = true;
        this.touchtime = 0;
      } else {
        // not a double click so set as a new first click
        this.touchtime = new Date().getTime();
      }
    }

  }

  searchActionGrid(reset = true) {
    if (reset) {
      this.resetCurrnetPage();
    }
    // console.log(this.headerFilters);
    this.stateChange.next(this.headerFilters);
  }

  onChange(event) {
    this.gridStat = event
    this.headerFilters.LatestAssessment = event;
    setTimeout(() => {
      this.stateChange.next(this.headerFilters);
    }, 600);

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
    this.showEditAnswer = true;
    $('.actionOverlay').addClass('ovrlay');
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
    //console.log(obj)
    if (obj.field == "assid") {
      this.headerFilters.AssIdFilter = obj.value;
    } else if (obj.field == "astconcataddress") {
      this.headerFilters.Address = obj.value;
    } else if (obj.field == "asspostcode") {
      this.headerFilters.Postcode = obj.value;
    } else if (obj.field == "hascode") {
      this.headerFilters.Definition = obj.value;
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
    } else if (obj.field == "hasasource") {
      this.headerFilters.Source = obj.value
      // if (obj.value.toLocaleLowerCase() == "interface") {
      //   this.headerFilters.Source = "I";
      // } else if (obj.value.toLocaleLowerCase() == "survey") {
      //   this.headerFilters.Source = "S";
      // }

    } else if (obj.field == "supcode") {
      this.headerFilters.Project = obj.value;
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

    } else if (obj.field == "hasscoremax") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.MaxRiskScoreFrom = findObj[0].value;
        } else {
          this.headerFilters.MaxRiskScoreTo = findObj[0].value;
        }
      } else {
        this.headerFilters.MaxRiskScoreFrom = findObj[0].value;
        this.headerFilters.MaxRiskScoreTo = findObj[1].value;
      }

    } else if (obj.field == "hasscoreactual") {
      let findObj = this.filters.filter(x => x.field == obj.field);
      if (findObj.length == 1) {
        if (findObj[0].operator == "lte") {
          this.headerFilters.ScorePercentFrom = findObj[0].value;
        } else {
          this.headerFilters.ScorePercentTo = findObj[0].value;
        }
      } else {
        this.headerFilters.ScorePercentFrom = findObj[0].value;
        this.headerFilters.ScorePercentTo = findObj[1].value;
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
    } else if (obj.field == "hasicomments") {
      this.headerFilters.IssueComments = obj.value;
    } else if (obj.field == "hasassessmentref") {
      this.headerFilters.AssessmentReff = obj.value;
    } else if (obj.field == "hasassessor") {
      this.headerFilters.Assessor = obj.value;
    } else if (obj.field == "hasassessmentdate") {
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

    } else if (obj.field == "hasscorebandname") {
      this.headerFilters.RiskBand = obj.value;
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

    this.headerFilters.CustomerStatus = '';
    this.headerFilters.CustomerRiskRating = '';
    this.headerFilters.CustomerReviewYear = '';
    this.headerFilters.Source = '';
    this.headerFilters.Project = '';
    this.headerFilters.RiskBand = '';
    this.headerFilters.MaxRiskScoreFrom = '';
    this.headerFilters.MaxRiskScoreTo = '';
    this.headerFilters.ScorePercentFrom = '';
    this.headerFilters.ScorePercentTo = '';
    // this.headerFilters.LatestAssessment = '';


  }

  viewImage(data) {
    this.selectedAction = data;
    this.showImage = true;
    $('.actionOverlay').addClass('ovrlay');
  }

  closerImage(event) {
    this.showImage = event;
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
    this.hnsResultService.getAssessment(this.headerFilters).subscribe(
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
                x.hasassessmentdate = this.helperService.formatDateWithoutTime(x.hasassessmentdate)

              })
              //console.log(this.gridView)
              // let ignore = [];
              let label = {
                'assid': 'Asset',
                'astconcataddress': 'Address',

                'asspostcode': 'PostCode',
                'hascode': 'Definition',
                'hasversion': 'Vers',
                'hasassessmentref': 'Assessment Ref',
                'hasassessmentdate': 'Assessment Date',
                'hasassessor': 'Assessor',
                'customerstatus': 'Customer Status',
                'customerriskrating': 'Customer Risk Rating',
                'customerreviewyear': 'Customer Review Year',
                'hasasource': 'Source',
                'supcode': 'Project',
                'hasiriskscore': 'Risk Score',

                'hasscoremax': 'Max Score',
                'hasscoreactual': 'Score %',
                'hasscorebandname': 'Risk Band',

              }

              this.helperService.exportAsExcelFile(tempData, 'HnS Assessment', label)

            }
          } else {
            alert('There is no record to import');
          }

        }
      }
    )



  }


  report(data, reportType) {
    //console.log(this.selectedAction);
    this.selectedAction = data;
    let RequestParameter = "";
    let reportTypeParam = "";
    let validateApi = false;
    if (reportType == "stCD") {
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasassessmentref}|Y|N|N|N`
      // RequestParameter = "01|ACEFRA|1|01-ACEFRA-1-20190301|Y|N|N|N"
      reportTypeParam = "Standard"
    } else if (reportType == "stCDR") {
      reportTypeParam = "Standard"
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasassessmentref}|Y|Y|N|N`
    } else if (reportType == "stOD") {
      reportTypeParam = "Standard"
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasassessmentref}|N|N|N|N`
    } else if (reportType == "paCd") {
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasassessmentref}|Y|N|Y|N`
    } else if (reportType == "paOD") {
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasassessmentref}|N|N|Y|N`
    } else if (reportType == "parCD") {
      validateApi = true;
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasassessmentref}|Y|N|Y|Y`
    } else if (reportType == "parOD") {
      validateApi = true;
      RequestParameter = `${this.selectedAction.assid}|${this.selectedAction.hascode}|${this.selectedAction.hasversion}|${this.selectedAction.hasassessmentref}|N|N|Y|Y`
    }

    let reportParams = {
      UserId: this.currentUser.userId,
      RequestType: "ShowPropertyReport",
      RequestParameter: RequestParameter,
      SessionId: "",
      ReportType: reportTypeParam
    }

    if (validateApi) {
      this.hnsResultService.validateReportForRedaction(this.selectedAction.assid, this.selectedAction.hascode, this.selectedAction.hasversion, this.selectedAction.hasassessmentref, this.selectedAction.haslatestassessment).subscribe(
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


  viewEditAssetText(dataitem) {
    this.selectedAction = dataitem;
    this.showEditAssetText = true
    $('.actionOverlay').addClass('ovrlay');
  }

  closeEditAssetText($event) {
    this.showEditAssetText = false;
    $('.actionOverlay').removeClass('ovrlay');

  }

  recalculateScore() {
    if (this.selectedAction) {
      this.subs.add(
        this.hnsResultService.recalculateScore(this.selectedAction.hascode, this.selectedAction.hasversion, this.selectedAction.assid, this.selectedAction.hasassessmentref).subscribe(
          data => {
            if (data.isSuccess) {
              this.searchActionGrid(false)
              this.alertService.success(
                `Scores recalculated for Assessment (${this.selectedAction.hasassessmentref})`
              )
            }
          }
        )
      )
    }
  }


  budgetList() {
    this.openBudgetList = true;
    $('.actionOverlay').addClass('ovrlay');
  }

  closeBudgetList($event) {
    //this.getHealtSafetyDefinatonList(this.definitionGridModel);
    this.openBudgetList = $event;
    $('.actionOverlay').removeClass('ovrlay');
  }

  rowCallback(context: RowClassArgs) {
    if (context.dataItem.haslatestassessment == "N") {   // change this condition as you need
      return {
        historyRow: true
      };
    }
  }


  closeDialog() {
    this.validatReportString = '';
    this.dialogOpened = false;
  }

}
