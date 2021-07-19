import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { HnsResultsService, HelperService, AlertService, SharedService, LoaderService, HnsPortalService } from '../../_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-hns-res-edit-answer',
  templateUrl: './hns-res-edit-answer.component.html',
  styleUrls: ['./hns-res-edit-answer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsResEditAnswerComponent implements OnInit {
  subs = new SubSink();
  title: string = "Edit Answer";
  @Input() selectedAction: any;
  @Input() rootAssessment: any;
  @Input() isAssessment: boolean = false;
  @Input() isHistorical: boolean = false;
  @Input() showEditAnswer: boolean = false;
  @Output() closeEditAnswer = new EventEmitter<boolean>();
  public gridData: any[] = [];
  healthAndSafetyAns: any;
  healthAndSafetyIss: any;
  questonCode: any;
  readonly: boolean = true;
  assessorDate: any = ''
  state: State = {
    skip: 0,
    sort: [],

    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  public gridView: DataResult;
  selectedIssue: any;
  disableBtn: boolean = false
  disableIssBtn: boolean = false;
  showImage: boolean = false
  submitted: boolean = false;
  editAnsForm: FormGroup;
  currentUser: any;
  floorDrp: any;
  viewOnly: boolean = false;
  issueFormMode: string;
  showIssue: boolean = false;
  multipleHnsIssParam: any;
  hnsPermission: any = [];
  openSpellChecker: boolean = false;
  textId: any;
  textString: any;
  touchtime = 0;
  issueBtnString: any = "Edit Issue";
  headingValues: any = {};
  budget: any;
  actualAnsIssueList: any;
  formDateError = '';


  constructor(
    private hnsResultService: HnsResultsService,
    private chRef: ChangeDetectorRef,
    private helperService: HelperService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private sharedService: SharedService,
    private loaderService: LoaderService,
    private hnsService: HnsPortalService,
  ) { }

  ngOnInit() {

    this.sharedService.changeissueList([])
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.setHeadingValues()

    this.getFloor();

    this.editAnsForm = this.fb.group({
      answer: [''],
      location: [''],
      floor: [''],
      comments: [''],
      assessor: [''],
      date: [''],
      ref: [''],
    });

    let params = {
      hasCode: this.selectedAction.hascode,
      hasVersion: this.selectedAction.hasversion,
    }

    this.getHnsBudget(params)

    let action = this.selectedAction;
    let paramChanges: any = {};
    if (this.isAssessment) {
      paramChanges.hasaassessmentref = action.assessmentRef
    } else {
      paramChanges.hasaassessmentref = action.hasaassessmentref
    }

    let HnSAnsParam = {
      Assid: action.assid,
      Hascode: action.hascode,
      Hasversion: action.hasversion,
      Hasgroupid: action.hasgroupid,
      Hasheadingid: action.hasheadingid,
      Hasquestionid: action.hasquestionid,
      Hasanswerid: action.hasanswerid,
    }


    // console.log(action)

    //hasalatestassessment hasalatestassesment
    const isLatest = this.isAssessment ? this.selectedAction.hasalatestassesment : this.selectedAction.hasalatestassessment;
    let hnsIParam = {
      Hasarid: isLatest == "Y" ? 0 : action.hasarid,
      AssessmentRef: paramChanges.hasaassessmentref,
    }

    this.multipleHnsIssParam = { ...HnSAnsParam, ...hnsIParam }

    this.isQuestionCodeOnActiveSurvey(action.hasquestioncode, action.assid);

    if (this.isAssessment) {
      if (isLatest == "Y") {
        this.getSpecificAssetHealthSafetyAnswer(HnSAnsParam);
      } else {
        const historicParam = { Hasarid: action.hasarid, Hasarsequence: action.hasarsequence };
        const historicPamas = { ...HnSAnsParam, ...historicParam }
        this.getSpecificAssetHealthSafetyAnswer(historicPamas, true);
      }
    } else {
      this.getSpecificAssetHealthSafetyAnswer(HnSAnsParam);
    }



    // this.getMultipleAssetHealthSafetyIssue(this.multipleHnsIssParam);

    this.subs.add(
      this.sharedService.issueObs.subscribe(
        data => {
          this.healthAndSafetyIss = data;
          this.gridView = process(this.healthAndSafetyIss, this.state);
          this.chRef.detectChanges();
        }
      )
    )

    // refresh issue list from upoload image
    this.subs.add(
      this.sharedService.refreshEditAnsObs.subscribe(
        data => {
          if (data) {
            this.getHnsBudget(params)
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



    if (this.rootAssessment.haslatestassessment != undefined && this.selectedAction.haslatestassessment != null) {
      if (this.rootAssessment.haslatestassessment != "Y") {
        this.editAnsForm.disable()
        this.viewOnly = true;
        this.disableBtn = true;
        this.disableIssBtn = true;
        this.issueBtnString = "View Issue";
        this.title = "View Answer";
      }
    }

    if (this.selectedAction.hasalatestassesment != undefined && this.selectedAction.hasalatestassesment != null) {
      if (this.selectedAction.hasalatestassesment != "Y") {
        this.editAnsForm.disable()
        this.viewOnly = true;
        this.disableBtn = true;
        this.disableIssBtn = true;
        this.issueBtnString = "View Issue";
        this.title = "View Answer";
      }
    }

    if(this.isHistorical){
      this.editAnsForm.disable()
      this.viewOnly = true;
      this.disableBtn = true;
      this.disableIssBtn = true;
      this.issueBtnString = "View Issue";
      this.title = "View Answer";
    }

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setHeadingValues() {
    if (this.rootAssessment.assid != undefined) {
      this.headingValues.assid = this.rootAssessment.assid
    } else {
      this.headingValues.assid = this.selectedAction.assid
    }

    if (this.rootAssessment.astconcataddress != undefined) {
      this.headingValues.astconcataddress = this.rootAssessment.astconcataddress
    } else {
      this.headingValues.astconcataddress = this.selectedAction.astconcateaddress
    }

    if (this.isAssessment) {
      if (this.selectedAction.hasrepeatable == "Y") {
        this.headingValues.hasgroupname = `${this.selectedAction.groupName} (${this.selectedAction.hasALocation}) (${this.selectedAction.hasAFloor})`
        this.headingValues.hasheadingname = this.selectedAction.hasheadingname
      } else {
        this.headingValues.hasgroupname = this.selectedAction.groupName
        this.headingValues.hasheadingname = this.selectedAction.hasheadingname
      }
      // this.headingValues.hasgroupname = this.selectedAction.groupName
      // this.headingValues.hasheadingname = this.selectedAction.hasheadingname

    } else {
      if (this.rootAssessment.hasgroupname != undefined) {
        this.headingValues.hasgroupname = this.rootAssessment.hasgroupname
      } else {
        this.headingValues.hasgroupname = this.selectedAction.groupName

      }

      if (this.rootAssessment.hasheadingname != undefined) {
        this.headingValues.hasheadingname = this.rootAssessment.hasheadingname
      } else {
        this.headingValues.hasheadingname = this.selectedAction.hasheadingname
      }
    }




    if (this.rootAssessment.asspostcode != undefined) {
      this.headingValues.asspostcode = this.rootAssessment.asspostcode
    } else {
      this.headingValues.asspostcode = '';
    }

    if (this.rootAssessment.hasquestioncode != undefined) {
      this.headingValues.hasquestioncode = this.rootAssessment.hasquestioncode
    } else {
      this.headingValues.hasquestioncode = this.selectedAction.hasquestioncode
    }

    if (this.rootAssessment.hasquestiontext != undefined) {
      this.headingValues.hasquestiontext = this.rootAssessment.hasquestiontext
    } else {
      this.headingValues.hasquestiontext = this.selectedAction.hasquestiontext
    }


  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.healthAndSafetyIss, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.healthAndSafetyIss, this.state);

  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedIssue = dataItem;
    if (columnIndex > 1) {
      this.disableIssBtn = false;
      this.handleDoubleClick()
    }
  }

  handleDoubleClick() {
    if (this.touchtime == 0) {
      // set first click
      this.touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - this.touchtime) < 400) {
        // double click occurred
        this.openIssue("edit")
        this.touchtime = 0;
      } else {
        // not a double click so set as a new first click
        this.touchtime = new Date().getTime();
      }
    }

  }

  closeEditAnswerMethod() {
    this.showEditAnswer = false;
    this.closeEditAnswer.emit(this.showEditAnswer);
  }


  isQuestionCodeOnActiveSurvey(hasQuestionCode, assId) {
    this.subs.add(
      this.hnsResultService.isQuestionCodeOnActiveSurvey(hasQuestionCode, assId).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess && data.data) {
            if (data.data != '') {
              this.questonCode = data.data;
              this.title = `Edit Answer - ${this.questonCode}`;
              this.viewOnly = true;
              this.editAnsForm.disable();
            }
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  getSpecificAssetHealthSafetyAnswer(params, historic = false) {
    let answerSubcribe: any;
    if (historic) {
      answerSubcribe = this.hnsResultService.getSpecificAssetHealthSafetyAnswerArchive(params);
    } else {
      answerSubcribe = this.hnsResultService.getSpecificAssetHealthSafetyAnswer(params);
    }
    this.subs.add(
      answerSubcribe.subscribe(
        data => {
          // console.log(data)
          if (data.isSuccess && data.data) {
            this.healthAndSafetyAns = data.data[0];

            if (this.healthAndSafetyAns != undefined) {
             // this.healthAndSafetyAns.hasaassessor = "test";
              this.editAnsForm.patchValue({
                answer: this.healthAndSafetyAns.hasayesnona,
                location: this.healthAndSafetyAns.hasalocation,
                comments: this.healthAndSafetyAns.hasacomments,
                floor: this.healthAndSafetyAns.hasafloor,
                assessor: this.healthAndSafetyAns.hasaassessor,

              })

              if (this.healthAndSafetyAns.hasaassessmentdate != undefined) {
                this.healthAndSafetyAns.hasaassessmentdate = this.helperService.ngbDatepickerFormat(this.healthAndSafetyAns.hasaassessmentdate);
                this.assessorDate = this.healthAndSafetyAns.hasaassessmentdate
                this.chRef.detectChanges();

              }
            } else {
              // console.log(this.selectedAction)
              this.editAnsForm.patchValue({
                answer: this.selectedAction.hasactionyesnona,
                assessor: this.selectedAction.hasaassessor,
                location: this.selectedAction.hasALocation,
                comments: this.selectedAction.hasacomment,
                floor: this.selectedAction.hasAFloor,
              })

              if (this.selectedAction.hasaassessmentdate instanceof Date) {
                let assDate = this.selectedAction.hasaassessmentdate.toString();
                this.editAnsForm.patchValue({ date: this.helperService.ngbDatepickerFormat(assDate) })
              }

              this.healthAndSafetyAns = {}
              this.healthAndSafetyAns.hasaassessmentref = (this.selectedAction.assessmentRef != undefined) ? this.selectedAction.assessmentRef : "";
              this.healthAndSafetyAns.createdby = (this.selectedAction.createdby != undefined ? this.selectedAction.createdby : "")
              this.healthAndSafetyAns.createddate = (this.selectedAction.createddate != undefined) ? this.selectedAction.createddate : "";
              this.healthAndSafetyAns.modifieddate = (this.selectedAction.createddate != undefined) ? this.selectedAction.createddate : ""
              this.healthAndSafetyAns.modifiedby = (this.selectedAction.modifiedby != undefined) ? this.selectedAction.modifiedby : "";

            }

            if (this.selectedAction.hasrepeatable == "Y") {
              this.editAnsForm.controls['location'].disable();
              this.editAnsForm.controls['floor'].disable();
            }

            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  getMultipleAssetHealthSafetyIssue(params, budget) {
    this.subs.add(
      this.hnsResultService.getMultipleAssetHealthSafetyIssue(params).subscribe(
        data => {

          if (data.isSuccess && data.data) {
            if (budget) {
              const budgetArr = budget.map(x => { return x.hasbudgetdesc.toLocaleLowerCase() });
              const issuleList = data.data.filter(x => x.hasibudgetcode == "" || budgetArr.indexOf(x.hasBudgetName.toLocaleLowerCase()) != -1);
              this.actualAnsIssueList = issuleList
              this.healthAndSafetyIss = issuleList

            } else {
              this.actualAnsIssueList = data.data
              this.healthAndSafetyIss = data.data
            }

            this.sharedService.changeissueList(this.healthAndSafetyIss)
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  onSubmit() {
    //console.log(this.editAnsForm)

    // if (this.editAnsForm.invalid) {
    //   return;
    // }

    this.submitted = true;
    this.formDateError = '';

    let formRawVal = this.editAnsForm.getRawValue();
    let formObj: any = {};
    formObj.Hasactionyesnona = formRawVal.answer;
    formObj.Hasaactionrequired = this.healthAndSafetyAns.hasaactionrequired
    formObj.Hasaansweritem = this.healthAndSafetyAns.hasaansweritem
    formObj.HasALocation = formRawVal.location;
    formObj.HasAFloor = formRawVal.floor;
    let v = formRawVal.date
    if (v== undefined || v == "")
    {
      this.formDateError = 'Invalid Assessment Date';
      return
    }
    formObj.Hasaassessmentdate = this.dateFormate(formRawVal.date);
    formObj.Hasaassessor = formRawVal.assessor;
    formObj.Hasalatestassesment = this.healthAndSafetyAns.hasalatestassessment;
    formObj.Hasaremedialcost = this.healthAndSafetyAns.hasaremedialcost;
    formObj.Hasacomments = formRawVal.comments;
    formObj.AssessmentRef = this.healthAndSafetyAns.hasaassessmentref;
    // formObj.Createdby = this.healthAndSafetyAns.createdby;
    // formObj.Createddate = this.healthAndSafetyAns.createddate;
    formObj.Modifiedby = this.currentUser.userId;
    // formObj.Modifieddate = formRawVal.answer;
    formObj.Hasquestioncode = this.healthAndSafetyAns.hasquestioncode;

    formObj.Assid = this.healthAndSafetyAns.assid;
    formObj.Hascode = this.healthAndSafetyAns.hascode;
    formObj.Hasversion = this.healthAndSafetyAns.hasversion;
    formObj.Hasgroupid = this.healthAndSafetyAns.hasgroupid;
    formObj.Hasheadingid = this.healthAndSafetyAns.hasheadingid;
    formObj.Hasquestionid = this.healthAndSafetyAns.hasquestionid;
    formObj.Hasanswerid = this.healthAndSafetyAns.hasanswerid;



    this.subs.add(
      this.hnsResultService.updateAssetHealtSafetyAnswer(formObj).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Answer saved successfully.")
            this.closeEditAnswerMethod()
          } else {
            this.alertService.error(data.message)
          }
        },
        error => {
          this.alertService.error(error)
        }
      )
    )

  }

  dateFormate(value) {
    // return `${value.month}-${value.day}-${value.year}`
    return `${value.year}-${value.month}-${value.day}`
  }


  openCalendar(obj) {
    obj.toggle();
  }

  viewImage() {
    //if (this.selectedIssue) {
    this.showImage = true;
    $('.editAnsOvrlay').addClass('ovrlay');
    //  }

  }

  closerImage(event) {
    this.showImage = false;
    $('.editAnsOvrlay').removeClass('ovrlay');
    // this.disableBtn = true
  }

  openIssue(mode) {
    if (this.selectedIssue || mode == "add") {
      this.issueFormMode = mode;
      this.showIssue = true;
      $('.editAnsOvrlay').addClass('ovrlay');
    } else {
      this.alertService.error("Please select one issue from the list")
    }
  }

  closeIssue(event) {
    this.showIssue = false;
    $('.editAnsOvrlay').removeClass('ovrlay');
    //this.getMultipleAssetHealthSafetyIssue(this.multipleHnsIssParam);
  }

  saveUpdateIssue() {
    // if issue exist then update only answer

    if (this.healthAndSafetyIss.length > 0) {
      // console.log(this.actualAnsIssueList);
      // console.log(this.healthAndSafetyIss)
      let issueListChangedData = {
        issueToAdd: [],
        issueToUpdate: []
      }

      const findChangesInIssueList = () => {
        return new Promise((resolve, reject) => {
          let i;
          for (i = 0; i < this.healthAndSafetyIss.length; i++) {
            if (this.actualAnsIssueList[i] == undefined) {
              issueListChangedData.issueToAdd.push(this.healthAndSafetyIss[i]);
            }

            if (this.actualAnsIssueList[i] != undefined) {
              if (JSON.stringify(this.actualAnsIssueList[i]) != JSON.stringify(this.healthAndSafetyIss[i])) {
                issueListChangedData.issueToUpdate.push(this.healthAndSafetyIss[i]);
              }
            }
          }
          resolve(issueListChangedData)
        })
      }

      findChangesInIssueList().then((res: any) => {
        if (res.issueToAdd.length > 0 || res.issueToUpdate.length > 0) {
          const issueSaveNUpdatePromise = () => {
            return new Promise((resolve, reject) => {
              let added = 0
              let updated = 0

              if (res.issueToAdd.length > 0) {
                this.loaderService.pageShow()
                let addissueArr = this.populateIssueForadd(res.issueToAdd);
                this.hnsResultService.AddAssetHealtSafetyIssueFromAnswer(addissueArr).subscribe(
                  async issd => {
                    if (issd.isSuccess) {
                      added = res.issueToAdd.length
                      // console.log(addissueArr);
                      // console.log(addissueArr[0]);
                      //await this.updateIssueArchive(res.issueToAdd[0])
                      //console.log({ add: added, resadd: res.issueToAdd.length, upda: updated, resup: res.issueToUpdate.length })
                      if (added == res.issueToAdd.length && updated == res.issueToUpdate.length) {
                        // console.log('in')
                        resolve(true)
                      }
                    }
                  }
                )
                // res.issueToAdd.forEach(async element => {
                //   await this.updateSaveIssue(element, "add");
                //   //await this.updateIssueArchive(element)
                //   added++
                //   console.log({ add: added, resadd: res.issueToAdd.length, upda: updated, resup: res.issueToUpdate.length })
                //   if (added == res.issueToAdd.length && updated == res.issueToUpdate.length) {
                //     await this.updateIssueArchive(element)
                //     resolve(true)
                //   }
                // });
              }

              if (res.issueToUpdate.length > 0) {
                this.loaderService.pageShow()
                res.issueToUpdate.forEach(async element => {
                  await this.updateSaveIssue(element, "edit");
                  //await this.updateIssueArchive(element)
                  updated++
                  //console.log({ add: added, resadd: res.issueToAdd.length, upda: updated, resup: res.issueToUpdate.length })
                  if (added == res.issueToAdd.length && updated == res.issueToUpdate.length) {
                    resolve(true)
                  }
                });
              }

            })
          }

          issueSaveNUpdatePromise().then(async x => {
            if (x) {
              this.onSubmit(); //  save answer

              if (res.issueToAdd.length > 0) {
                //await this.updateIssueArchive()
              }

              this.loaderService.pageHide()
            }
          })
        } else {

          this.onSubmit(); //  save answer

        }

      })

      // this.subs.add(
      //   this.hnsResultService.addAssetHealtSafetyIssue(this.healthAndSafetyIss).subscribe(
      //     data => {
      //       if (data.isSuccess) {
      //         this.loaderService.pageShow()
      //         this.onSubmit(); //  save answer
      //         this.loaderService.pageHide()
      //       } else {
      //         this.alertService.error(data.message);
      //       }
      //     }
      //   )
      // )
    } else {

      let formRawVal = this.editAnsForm.getRawValue();
      if (this.selectedAction.hasactionifno != undefined && this.selectedAction.hasactionifyes != undefined) {
        if (this.selectedAction.hasactionifno == "Y" && formRawVal.answer == "N") {
          this.alertService.error("Answer given requires at least one issue to be entered.")
          return
        }

        if (this.selectedAction.hasactionifyes == "Y" && formRawVal.answer == "Y") {
          this.alertService.error("Answer given requires at least one issue to be entered.")
          return
        }
      }

      this.onSubmit(); //  save answer
    }

  }


  updateSaveIssue(formRawVal, type) {
    //let formRawVal = this.editIssueForm.getRawValue();
    return new Promise((resove, reject) => {
      let formObj: any = {};
      formObj.Hasiissue = formRawVal.hasiissue;
      formObj.Hasiproposedaction = formRawVal.hasiproposedaction;
      formObj.Hasitargetdate = formRawVal.hasitargetdate;
      formObj.Hasiassessmentdate = formRawVal.hasiassessmentdate;
      formObj.Hasiassessor = formRawVal.hasiassessor;
      formObj.Hasiresolution = formRawVal.hasiresolution;
      formObj.Hasiresolutiondate = formRawVal.hasiresolutiondate;
      formObj.Hasiactionstatus = (formRawVal.hasiactionstatus == "" || formRawVal.hasiactionstatus == null) ? "O" : formRawVal.hasiactionstatus;
      formObj.Hasibudgetcode = formRawVal.hasibudgetcode;
      formObj.Hasiremedialcost = formRawVal.hasiremedialcost;
      formObj.Hasicomments = formRawVal.hasicomments;
      formObj.Createdby = formRawVal.createdby;
      formObj.Modifiedby = formRawVal.hasimodifiedby;
      formObj.Hasiworkstatus = formRawVal.hasiworkstatus;
      formObj.Hasiworkauthoriseddate = formRawVal.hasiworkauthoriseddate;
      formObj.Hasiworkauthoriseduser = formRawVal.hasiworkauthoriseduser;
      formObj.Hasiworkreference = formRawVal.hasiworkreference;
      formObj.Hasiworkscheduledate = formRawVal.hasiworkscheduledate;
      formObj.Hasiworknotes = formRawVal.hasiworknotes;
      formObj.Hasiworkcompletiondate = formRawVal.hasiworkcompletiondate;
      formObj.HasILocation = formRawVal.hasILocation;
      formObj.HasIFloor = formRawVal.hasIFloor;
      formObj.Hasquestioncode = formRawVal.hasquestioncode;
      formObj.Hasiseverity = formRawVal.hasiseverity;
      formObj.Hasiprobability = formRawVal.hasiprobability;
      formObj.Hasipriority = formRawVal.hasipriority;
      formObj.Hasiriskscore = formRawVal.hasiriskscore;
      formObj.Assid = formRawVal.assid;
      formObj.Hascode = formRawVal.hascode;
      formObj.Hasversion = formRawVal.hasversion;
      formObj.Hasgroupid = formRawVal.hasgroupid;
      formObj.Hasheadingid = formRawVal.hasheadingid;
      formObj.Hasquestionid = formRawVal.hasquestionid;
      formObj.Hasanswerid = formRawVal.hasanswerid;


      let saveIssue: any
      if (type == "add") {
        formObj.Hasissueid = '';
        saveIssue = this.hnsResultService.addAssetHealtSafetyIssueForSingleRecord(formObj);
      } else {
        formObj.Hasissueid = formRawVal.hasissueid;
        saveIssue = this.hnsResultService.updateAssetHealtSafetyIssue(formObj);
      }


      this.subs.add(
        saveIssue.subscribe(
          data => {
            if (data.isSuccess) {
              resove(true)
            } else {
              this.alertService.error("The updated Issue was not saved: " +  data.message);
              this.loaderService.pageHide()
            }
          },
          error => {
            this.alertService.error(error);
            this.loaderService.pageHide()
          }
        )
      )
    })

  }

  updateIssueArchive(formRawVal = null) {
    return new Promise((resolve, reject) => {
      // let params = {
      //   Assid: formRawVal.assid,
      //   Hascode: formRawVal.hascode,
      //   Hasversion: formRawVal.hasversion,
      //   Hasgroupid: formRawVal.hasgroupid,
      //   Hasheadingid: formRawVal.hasheadingid,
      //   Hasquestionid: formRawVal.hasquestionid,
      //   Hasanswerid: formRawVal.hasanswerid
      // }

      let params = {
        Assid: this.selectedAction.assid,
        Hascode: this.selectedAction.hascode,
        Hasversion: this.selectedAction.hasversion,
        Hasgroupid: this.selectedAction.hasgroupid,
        Hasheadingid: this.selectedAction.hasheadingid,
        Hasquestionid: this.selectedAction.hasquestionid,
        Hasanswerid: this.selectedAction.hasanswerid
      }

      this.subs.add(
        this.hnsResultService.initiateIssueArchiveUpdate(params).subscribe(
          data => {
            if (data.isSuccess) {
              resolve(true)
            } else {
              this.alertService.error(data.message)
              this.loaderService.pageHide()
            }
          },
          error => {
            this.loaderService.pageHide()
          }
        )
      )

    })

  }


  populateIssueForadd(issueArr) {
    let tempArr = [];
    issueArr.forEach(formRawVal => {
      let formObj: any = {};
      formObj.Hasiissue = formRawVal.hasiissue;
      formObj.Hasiproposedaction = formRawVal.hasiproposedaction;
      formObj.Hasitargetdate = formRawVal.hasitargetdate;
      formObj.Hasiassessmentdate = formRawVal.hasiassessmentdate;
      formObj.Hasiassessor = formRawVal.hasiassessor;
      formObj.Hasiresolution = formRawVal.hasiresolution;
      formObj.Hasiresolutiondate = formRawVal.hasiresolutiondate;
      formObj.Hasiactionstatus = (formRawVal.hasiactionstatus == "" || formRawVal.hasiactionstatus == null) ? "O" : formRawVal.hasiactionstatus;
      formObj.Hasibudgetcode = formRawVal.hasibudgetcode;
      formObj.Hasiremedialcost = formRawVal.hasiremedialcost;
      formObj.Hasicomments = formRawVal.hasicomments;
      formObj.Createdby = formRawVal.createdby;
      formObj.Modifiedby = formRawVal.hasimodifiedby;
      formObj.Hasiworkstatus = formRawVal.hasiworkstatus;
      formObj.Hasiworkauthoriseddate = formRawVal.hasiworkauthoriseddate;
      formObj.Hasiworkauthoriseduser = formRawVal.hasiworkauthoriseduser;
      formObj.Hasiworkreference = formRawVal.hasiworkreference;
      formObj.Hasiworkscheduledate = formRawVal.hasiworkscheduledate;
      formObj.Hasiworknotes = formRawVal.hasiworknotes;
      formObj.Hasiworkcompletiondate = formRawVal.hasiworkcompletiondate;
      formObj.HasILocation = formRawVal.hasILocation;
      formObj.HasIFloor = formRawVal.hasIFloor;
      formObj.Hasquestioncode = formRawVal.hasquestioncode;
      formObj.Hasiseverity = formRawVal.hasiseverity;
      formObj.Hasiprobability = formRawVal.hasiprobability;
      formObj.Hasipriority = formRawVal.hasipriority;
      formObj.Hasiriskscore = formRawVal.hasiriskscore;
      formObj.Assid = formRawVal.assid;
      formObj.Hascode = formRawVal.hascode;
      formObj.Hasversion = formRawVal.hasversion;
      formObj.Hasgroupid = formRawVal.hasgroupid;
      formObj.Hasheadingid = formRawVal.hasheadingid;
      formObj.Hasquestionid = formRawVal.hasquestionid;
      formObj.Hasanswerid = formRawVal.hasanswerid;
      formObj.Hasissueid = '';
      tempArr.push(formObj);
    });

    return tempArr;
  }

  openSpellingCheck(textId) {
    if (this.viewOnly == false) {
      $('.editAnsOvrlay').addClass('ovrlay');
      this.openSpellChecker = true;
      let formRawVal = this.editAnsForm.getRawValue();
      this.textId = textId;
      this.textString = formRawVal[textId];
    }
  }

  closeSpellChecker($event) {
    this.openSpellChecker = $event
    $('.editAnsOvrlay').removeClass('ovrlay');
  }

  textStringReturn(text) {
    let tempText = {}
    tempText[this.textId] = text;
    this.editAnsForm.patchValue(tempText)
  }

  getFloor() {
    this.subs.add(
      this.hnsResultService.getFloorDropDownList().subscribe(
        data => {
          if (data.isSuccess) {
            this.floorDrp = data.data;
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  getHnsBudget(params) {
    this.subs.add(
      this.hnsService.getbudgetList(params).subscribe(
        data => {
          if (data.isSuccess && data.data) {
            this.budget = data.data;
            this.getMultipleAssetHealthSafetyIssue(this.multipleHnsIssParam, this.budget)
            //  this.chRef.detectChanges();
          }
        }
      )
    )
  }

}
