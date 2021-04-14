import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { GridComponent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { HnsResultsService, HelperService, SharedService } from '../../_services';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-hns-res-assessment',
    templateUrl: './hns-res-assessment.component.html',
    styleUrls: ['./hns-res-assessment.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class HnsResAssessmentComponent implements OnInit {
    readonly: boolean = true;
    subs = new SubSink();
    title: string = "Health and Safety Assessment (CURRENT)";
    @Input() showAssessment: boolean = false;
    @Input() fromAssessment: boolean = false; // from assessment tab
    @Input() selectedAction: any;
    @Output() closeAssessment = new EventEmitter<boolean>();
    gridStatus: any = 'A';
    lstate: any = 'Y';
    selectQues: any = "";
    state: State = {
        skip: 0,
        group: [{ field: 'concatgroup' }, { field: "concateheading" }, { field: "concatquestion" }],
        filter: {
            logic: "and",
            filters: []
        },
        sort: [{
            field: 'groupnumber',
            dir: 'asc'
        }, {
            field: 'hasheadingid',
            dir: 'asc'
        }, {
            field: 'hasquestionid',
            dir: 'asc'
        }]
    };
    public allowUnsort = true;
    public multiple = false;
    public isHistorical: boolean = false;
    public gridView: DataResult;
    @ViewChild(GridComponent) grid: GridComponent;
    currentUser: any;
    assessmentFilters: any = {
        Assid: '',
        Hascode: '',
        Hasversion: '',
        AssessmentRef: '',
        LatestAssessment: this.lstate,
        TextSearch: '',
        All: 'Y',
        Outstanding: 'N',
        Overdue: 'N',
        Resolved: 'N',
        None: 'N',
        Info: 'N',
        AddressSearch: '',
        Userid: '',
        Hasgroupseq: 0,
        Hasheadingseq: 0,
        Hasquestionseq: 0,
        HasALocation: '',
        HasAFloor: '',
    }
    assessmentDate: any = "";
    questions: any
    assessmentData: any
    selectedAssessment: any
    assessmentScoreData: any;
    searchTerm$ = new Subject<string>();
    answerGridFilter: any = [{ val: "N", text: "No" }, { val: "Y", text: "Yes" }, { val: "X", text: "N/A" }];
    latestGridFilter: any = [{ val: "N", text: "Historical" }, { val: "Y", text: "Current" }];
    statusGridFilter: any = [{ val: "O", text: "Overdue" }, { val: "Y", text: "Outstanding" }, { val: "R", text: "Resolved" }, { val: "N", text: "No Issues" }];
    showEditAnswer: boolean = false;
    disableBtn: boolean = true;
    showImage: boolean = false;
    hnsPermission: any = [];
    showInfoEditAns: boolean = false;
    touchtime = 0;
    editAnsBtnName = "Edit Answer";
    assmQuesParam: any;

    constructor(
        private hnsResultService: HnsResultsService,
        private chRef: ChangeDetectorRef,
        private helperService: HelperService,
        private sharedService: SharedService,
    ) { }

    ngOnInit() {
        //console.log(this.selectedAction)
        // when user comes from assessmenttab
        sessionStorage.removeItem('AssetHSView');

        if (this.selectedAction.haslatestassessment != undefined) {
            if (this.selectedAction.haslatestassessment != "Y") {
                this.editAnsBtnName = "View Answer";
                this.title = "Health and Safety Assessment (HISTORY)"
                this.chRef.detectChanges();
                this.isHistorical = true;
            }
        }

        //when user comes from action
        if (this.selectedAction.hasalatestassessment != undefined) {
            if (this.selectedAction.hasalatestassessment != "Y") {
                this.editAnsBtnName = "View Answer";
                this.title = "Health and Safety Assessment (HISTORY)"
                this.chRef.detectChanges();
                this.isHistorical = true;
            }
        }

        this.subs.add(
            this.searchTerm$
                .pipe(
                    debounceTime(1000),
                    distinctUntilChanged()
                ).subscribe((searchTerm) => {
                    this.assessmentFilters.TextSearch = searchTerm;
                    this.getAssessment(this.assessmentFilters)
                })
        )

        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let assmDateParam: any;


        if (!this.fromAssessment) {
            assmDateParam = {
                Assid: this.selectedAction.assid,
                Hascode: this.selectedAction.hascode,
                Hasversion: this.selectedAction.hasversion,
                AssessmentRef: this.selectedAction.hasaassessmentref,
            }

            this.assmQuesParam = {
                Assid: this.selectedAction.assid,
                Hascode: this.selectedAction.hascode,
                Hasversion: this.selectedAction.hasversion,
                AssessmentRef: this.selectedAction.hasaassessmentref,
                LatestAssessment: this.lstate,
            }


            // user comes from other tab
            this.assessmentFilters.Assid = this.selectedAction.assid;
            this.assessmentFilters.Hascode = this.selectedAction.hascode;
            this.assessmentFilters.Hasversion = this.selectedAction.hasversion;
            this.assessmentFilters.AssessmentRef = this.selectedAction.hasaassessmentref;
            this.assessmentFilters.AddressSearch = '';//this.selectedAction.astconcataddress;
            this.assessmentFilters.Userid = this.currentUser.userId;
        } else {
            // if user comes from assesmment tab
            // console.log(this.selectedAction)
            assmDateParam = {
                Assid: this.selectedAction.assid,
                Hascode: this.selectedAction.hascode,
                Hasversion: this.selectedAction.hasversion,
                AssessmentRef: this.selectedAction.hasassessmentref,
            }

            this.assmQuesParam = {
                Assid: this.selectedAction.assid,
                Hascode: this.selectedAction.hascode,
                Hasversion: this.selectedAction.hasversion,
                AssessmentRef: this.selectedAction.hasassessmentref,
                LatestAssessment: this.lstate,
            }

            this.assessmentFilters.Assid = this.selectedAction.assid;
            this.assessmentFilters.Hascode = this.selectedAction.hascode;
            this.assessmentFilters.Hasversion = this.selectedAction.hasversion;
            this.assessmentFilters.AssessmentRef = this.selectedAction.hasassessmentref;
            this.assessmentFilters.AddressSearch = '';//this.selectedAction.astconcataddress;
            this.assessmentFilters.Userid = this.currentUser.userId;
        }

        this.getAssessmentDate(assmDateParam)
        this.getQuestions(this.assmQuesParam)
        this.getAssessment(this.assessmentFilters)
        this.getLatestScore(this.assmQuesParam);

        this.subs.add(
            this.sharedService.hnsPortalSecurityList.subscribe(
                data => {
                    this.hnsPermission = data;
                }
            )
        )

    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    search($event) {
        this.searchTerm$.next($event.target.value);
    }

    public sortChange(sort: SortDescriptor[]): void {
        this.state.sort = sort;
        // console.log(this.state.sort)
        this.gridView = process(this.assessmentData, this.state);
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        // if (state && state.group) {
        //     state.group.map(group => group.aggregates = this.aggregates);
        // }
        //console.log(this.state)

        //this.state = state;

        //this.gridView = process(this.products, this.state);
    }

    public filterChange(filter: CompositeFilterDescriptor): void {
        // console.log(filter);
        this.state.filter = filter;
        this.gridView = process(this.assessmentData, this.state);
    }

    changeFilterState(obj) {
        return Promise.resolve().then(x => {
            for (let f of obj) {
                if (f.hasOwnProperty("field")) {
                    if (f.field == "modifieddate") {
                        f.value = this.helperService.formatDateWithoutTimeYMD(f.value)
                    }

                } else if (f.hasOwnProperty("filters")) {
                    this.changeFilterState(f.filters)
                }
            }
            return obj
        })
    }

    public groupChange(groups: GroupDescriptor[]): void {
        this.state.group = groups;
        this.gridView = process(this.assessmentData, { group: this.state.group });
    }

    public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
        this.selectedAssessment = dataItem;
        this.disableBtn = false
        this.handleDoubleClick()
        //console.log(this.selectedAssessment)

    }

    handleDoubleClick() {
        if (this.touchtime == 0) {
            // set first click
            this.touchtime = new Date().getTime();
        } else {
            // compare first click to this click and see if they occurred within double click threshold
            if (((new Date().getTime()) - this.touchtime) < 400) {
                // double click occurred
                if (this.hnsPermission.indexOf('Edit Answer') != -1) {
                    this.openEditAnswer()
                }
                this.touchtime = 0;
            } else {
                // not a double click so set as a new first click
                this.touchtime = new Date().getTime();
            }
        }
    }


    closeAssessmentMethod() {
        this.showAssessment = false;
        this.closeAssessment.emit(this.showAssessment);
    }

    heightChanged(event) {
      event;
   }

    onStateChange(event) {
        this.assessmentFilters.LatestAssessment = event;
        this.getAssessment(this.assessmentFilters)
    }

    onChange(event) {
        // console.log(this.gridStatus)
        this.gridStatus = event
        this.assessmentFilters.All = 'N';
        this.assessmentFilters.Outstanding = 'N';
        this.assessmentFilters.Overdue = 'N';
        this.assessmentFilters.Resolved = 'N';
        this.assessmentFilters.None = 'N';
        this.assessmentFilters.Info = 'N';
        if (event == "A") {
            this.assessmentFilters.All = "Y";
        } else if (event == "Y") {
            this.assessmentFilters.Outstanding = "Y";
        } else if (event == "O") {
            this.assessmentFilters.Overdue = "Y";
        } else if (event == "R") {
            this.assessmentFilters.Resolved = "Y";
        } else if (event == "N") {
            this.assessmentFilters.None = "Y";
        } else if (event == "I") {
            this.assessmentFilters.Info = "Y";
        }

        this.getAssessment(this.assessmentFilters)
    }

    onquesChange($event) {
        let ques = this.questions[$event];
        this.assessmentFilters.Hasgroupseq = ques.groupSequence
        this.assessmentFilters.Hasheadingseq = ques.headingSequence
        this.assessmentFilters.Hasquestionseq = ques.questionSequence
        this.assessmentFilters.HasALocation = ques.groupLocation
        this.assessmentFilters.HasAFloor = ques.groupFloor
        this.getAssessment(this.assessmentFilters)
    }


    getAssessmentDate(params) {
        this.subs.add(
            this.hnsResultService.getAssessmentDate(params).subscribe(
                data => {
                    if (data.isSuccess) {
                        this.assessmentDate = data.data; //this.helperService.ddmmyyFormat(data.data, true);
                        this.chRef.detectChanges();

                    }
                }
            )
        )
    }

    getQuestions(params) {
        this.subs.add(
            this.hnsResultService.getAssessmntQuestionNumbers(params).subscribe(
                data => {
                    if (data.isSuccess && data.data) {
                        this.questions = data.data
                        this.chRef.detectChanges();
                        // console.log(this.questions)
                    }
                }
            )
        )
    }

    getAssessment(params) {
        this.subs.add(
            this.hnsResultService.selectHSAssessmentPositioner(params).subscribe(
                data => {

                    if (data.isSuccess && data.data) {
                        let tempData = data.data;
                        // console.log(tempData);
                        // debugger;
                        tempData.map(s => {
                            s.modifieddate = s.modifieddate != null ?  s.modifieddate  : '';
                            s.hasitargetdate = s.hasitargetdate != null ?  s.hasitargetdate  : '';
                            s.hasaassessmentdate = s.hasaassessmentdate != null ?  s.hasaassessmentdate  : '';
                            s.hasimodifieddate = s.hasimodifieddate != null ?  s.hasimodifieddate  : '';
                            s.hasiworkauthoriseddate = s.hasiworkauthoriseddate != null ?  s.hasiworkauthoriseddate  : '';
                            s.hasiworkscheduledate = s.hasiworkscheduledate != null ?  s.hasiworkscheduledate  : '';
                            s.hasiissue = (s.hasquestiontype == "Info") ? s.hasaansweritem : s.hasiissue;
                        });
                        this.assessmentData = tempData
                        // console.log(this.assessmentData);
                        this.gridView = process(this.assessmentData, { group: this.state.group });
                        this.chRef.detectChanges();
                    }
                }
            )
        )
    }

    getLatestScore(params) {
        this.subs.add(
            this.hnsResultService.getLatestScoreForAssessment(params).subscribe(
                data => {
                    if (data.isSuccess && data.data) {
                        this.assessmentScoreData = data.data[0];
                        this.chRef.detectChanges();
                    }
                }
            )
        )
    }

    openEditAnswer() {
        if (this.selectedAssessment) {
            // if (this.selectedAssessment.hasactionyesnona == "I" && this.selectedAssessment.hasiactionstatus == "I") {
            if (this.selectedAssessment.hasquestiontype == "Info") {
                this.showInfoEditAns = true;
            } else {
                this.showEditAnswer = true;
            }

            $('.assessmentOvrlay').addClass('ovrlay');
        }

    }

    closeInfoChangeAnswer(event) {
        this.showInfoEditAns = false;
        $('.assessmentOvrlay').removeClass('ovrlay');
        this.getAssessment(this.assessmentFilters)
        this.getLatestScore(this.assmQuesParam);
    }

    closeEditAnswer(event) {
        this.showEditAnswer = false;
        $('.assessmentOvrlay').removeClass('ovrlay');
        this.disableBtn = true
        let temp = Object.assign({}, this.assessmentFilters)
        temp.Hasgroupseq = 1;
        temp.Hasheadingseq = 1;
        temp.Hasquestionseq = 1;
        this.getAssessment(temp)
        this.getLatestScore(this.assmQuesParam);
    }

    viewImage() {
        if (this.selectedAssessment) {
            this.showImage = true;
            $('.assessmentOvrlay').addClass('ovrlay');
        }
    }

    closerImage(event) {
        this.showImage = false;
        $('.assessmentOvrlay').removeClass('ovrlay');
        this.disableBtn = true
    }

    exportToExcelTop(fileExt): void {
        if (this.assessmentData.length != undefined && this.assessmentData.length > 0) {
            if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx') {
                let tempData = this.assessmentData.concat();//Object.create(this.assessmentData);
                // let tempData = tempData1[0]
                //  console.log(tempData);
                // modify export data
                tempData. map((x: any) => {
                    x.amend = this.helperService.formatDateWithoutTimeWithCheckDateObj(x.modifieddate)
                    x.hasscoremax1 = x.hasscoremax
                    x.hasactionyesnona = x.hasactionyesnona == "N" ? "No" : x.hasactionyesnona == "Y" ? "Yes" : x.hasactionyesnona == "X" ? "N/A" : "";
                    x.hasiactionstatus = x.hasiactionstatus == "O" ? "Outstanding" : x.hasiactionstatus == "R" ? "Resolved" : "";
                    x.hasalatestassesment = x.hasalatestassesment == "N" ? "Historical" : x.hasalatestassesment == "Y" ? "Current" : x.hasalatestassesment == "S" ? "Superseded": "";
                    x.hasiissue = (x.hasquestiontype == "Info") ? x.hasaansweritem : x.hasiissue;
                    x.hasitargetdate = this.helperService.formatDateWithoutTimeWithCheckDateObj(x.hasitargetdate)
                    x.hasiresolutiondate = x.hasiresolutiondate == "01-Jan-1753" ? "" : x.hasiresolutiondate;
                    x.hasaassessmentdate  = x.hasaassessmentdate == "01-Jan-1753" ? "" : x.hasaassessmentdate;
                    x.hasimodifieddate  = x.hasimodifieddate == "01-Jan-1753" ? "" : x.hasimodifieddate;
                    x.hasiworkauthoriseddate  = x.hasiworkauthoriseddate == "01-Jan-1753" ? "" : x.hasiworkauthoriseddate;
                    x.hasiworkscheduledate  = x.hasiworkscheduledate == "01-Jan-1753" ? "" : x.hasiworkscheduledate;
                   // x.questionnumber = x.questionnumber.replace(/0/,"" );
                })
                //console.log(this.gridView)
                // let ignore = [];
                let label = {
                    'assid': 'Asset',
                    'astconcateaddress': 'Address',
                    'questionNo': 'Question Number',
                    'hasquestioncode': 'Question Code',
                    'groupName': 'Group',
                    'hasheadingname': 'Heading',
                    'hasquestiontext': 'Question',
                    'hasactionyesnona': 'Answer',
                    'hasalatestassesment': 'Latest',
                    'amend': 'Amended',
                    'hasiissue': 'Answer/Issue',
                    'hasiproposedaction': 'Proposed Action',
                    'hasiseverity': 'Severity',
                    'hasiprobability': 'Probability',
                    'hasiriskscore': 'Risk Score',
                    'hasipriority': 'Priority',
                    'hasitargetdate': 'Target Date',
                    'overduepending': 'Overdue',
                    'hasiactionstatus': 'Status',
                    'hasiresolution': 'Resolution',
                    'hasiresolutiondate': 'Resolution Date',
                    'hasALocation': 'Location',
                    'hasAFloor': 'Floor',
                    'hasacomment': 'Answer Comments',
                    'hasicomments': 'Issue Comments',
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
                    'hasscoremax': 'Score',
                    'hasscoremax1': 'Max',
                    'scoringruletext': 'Rule',
                }

                this.getAssessment(this.assessmentFilters)
                this.helperService.exportAsExcelFile(tempData, 'Assessment', label)

            }
        } else {
            alert('There is no record to import');
        }
    }




}
