import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { HnsResultsService, HelperService, HnsPortalService, AlertService, SharedService, LoaderService } from '../../_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trim } from 'jquery';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-hns-res-add-edit-issue',
  templateUrl: './hns-res-add-edit-issue.component.html',
  styleUrls: ['./hns-res-add-edit-issue.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HnsResAddEditIssueComponent implements OnInit {
  subs = new SubSink();
  title: string = "Add/Edit Issue";
  @Input() selectedAction: any;
  @Input() rootAssessment: any;
  @Input() isAssessment: boolean = false;
  @Input() showIssue: boolean = false;
  @Output() closeIssueEvt = new EventEmitter<boolean>();
  @Input() issueFormMode: string;
  @Input() selectedIssue: any = [];
  showImage: boolean = false;
  editIssueForm: FormGroup;
  currentUser: any;
  floorDrp: any;
  maxTodayDate = undefined;
  priority: any;
  budget: any;
  readonly: boolean = true;
  ifNotResolved: boolean = true;
  editIssueData: any;
  viewOnly: boolean = false;
  scoreType: any;
  @Input() fromAns: boolean = false;
  @Input() allIssuesList: any = [];
  templateIssueOpen: boolean = false;
  templateActionOpen: boolean = false;
  hnsPermission: any = [];
  tempIssueObj: any;
  formErrors: any = {};
  validationMessage = {
    'issue': {
      'required': 'Issue is required.',
    },
    'targetDate': {
      'required': 'Target Date is required.',
    },
    'resolution': {
      'required': 'Resolution is required.'
    },
    'resDate': {
      'required': 'Resolution Date is required.'
    },
    'proposedAction': {
      'required': 'Proposed Action is required.'
    },
    'date': {
      'required': 'Assessment Date is required.'
    },
    'severity': {
      'required': 'Severity is required.'
    },
    'probability': {
      'required': 'Probability is required.'
    },
    'priority': {
      'required': 'Priority is required.'
    }
  };
  openSpellChecker: boolean = false;
  textId: any;
  textString: any;
  remedialCost: any;
  severity: any
  probability: any
  headingValues: any = {};
  pageLoaded = false

  constructor(
    private fb: FormBuilder,
    private actionService: HnsResultsService,
    private hnsService: HnsPortalService,
    private helperService: HelperService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private sharedService: SharedService,
    private loaderService: LoaderService
  ) {
    const current = new Date();
    this.maxTodayDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnInit() {

    this.setHeadingValues()
    this.getFloor();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.setTempIssueObj();
    this.editIssueForm = this.fb.group({
      location: [''],
      floor: [''],
      issue: ['', [Validators.required]],
      proposedAction: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      targetDate: ['', [Validators.required]],
      status: [''],
      resDate: [''],
      resolution: [''],
      budget: [''],
      remedialCost: [''],
      comments: [''],
      assessor: [''],
      date: [null, [Validators.required]],
      workStatus: [''],
      workRef: [''],
      workAuthDate: [null],
      workAuthUser: [''],
      workSchedDate: [null],
      workCompDate: [null],
      workNotes: [''],
      severity: [''],
      probability: ['']
    });

    let params = {
      hasCode: this.selectedAction.hascode,
      hasVersion: this.selectedAction.hasversion,
    }


    let action = this.selectedAction;
    // let paramChanges: any = {};
    // console.log(this.isAssessment);

    // if (this.isAssessment) {
    //   paramChanges.hasaassessmentref = action.assessmentRef
    // } else {
    //   paramChanges.hasaassessmentref = action.hasaassessmentref
    // }

    let params2 = {
      Assid: action.assid,
      Hascode: action.hascode,
      Hasversion: action.hasversion,
      Hasgroupid: action.hasgroupid,
      Hasheadingid: action.hasheadingid,
      Hasquestionid: action.hasquestionid,
      Hasanswerid: action.hasanswerid,
    }

    // let hnsIParam = {
    //   Hasarid: this.isAssessment ? action.hasarid : 0,
    //   AssessmentRef: paramChanges.hasaassessmentref,
    // }

    //let multipleHnsIssParam = { ...params2, ...hnsIParam }
    // this.getScoreTypeForDefinition(action.hascode, action.hasversion)
    this.loaderService.pageShow()

    forkJoin([this.actionService.getScoreTypeForDefinition(action.hascode, action.hasversion), this.hnsService.getPriorityList(params), this.hnsService.getSeverityList(params), this.hnsService.getProbabilityList(params), this.hnsService.getbudgetList(params)]).subscribe(
      data => {

        const scoreTypeDate = data[0]
        const priorityData = data[1];
        const severityData = data[2];
        const probabilityData = data[3];
        const budgetData = data[4];

        // console.log({ score: scoreTypeDate, sev: severityData, prob: probabilityData, prior: priorityData });
        //score data
        if (scoreTypeDate.isSuccess && scoreTypeDate.data != "") {
          this.scoreType = scoreTypeDate.data;
          this.chRef.detectChanges();
        }

        //priority data
        if (priorityData.isSuccess && priorityData.data) {
          this.priority = priorityData.data
          this.chRef.detectChanges();
        }

        // check if assessment uses risk matrix
        if (this.scoreType == 2) {
          //severity data
          if (severityData.isSuccess && severityData.data.length > 0) {
            this.severity = severityData.data
            if (this.severity) {
              const severityField = this.editIssueForm.get('severity');
              severityField.setValidators([Validators.required]);
              this.chRef.detectChanges();
            }
          }

          //probability data
          if (probabilityData.isSuccess && probabilityData.data.length > 0) {
            this.probability = probabilityData.data;
            if (this.probability) {
              const probabilityField = this.editIssueForm.get('probability');
              probabilityField.setValidators([Validators.required]);
              this.chRef.detectChanges();
            }
          }
        }


        //budget data
        if (budgetData.isSuccess && budgetData.data) {
          this.budget = budgetData.data
          this.chRef.detectChanges();
        }


        if (this.issueFormMode == "edit") {
          let tempspecificIssParam = {
            Hasissueid: action.hasissueid
          }
          let specificIssParam = { ...params2, ...tempspecificIssParam }

          // if edit answer is opened from assessment hasimodifiedby
          if (this.isAssessment) {
            //console.log(this.selectedIssue)
            this.editIssueData = this.selectedIssue
            this.populateIssueForm(this.selectedIssue, false)
            // let pr = {
            //   Assid: this.selectedIssue.assid,
            //   Hascode: this.selectedIssue.hascode,
            //   Hasversion: this.selectedIssue.hasversion,
            //   Hasgroupid: this.selectedIssue.hasgroupid,
            //   Hasheadingid: this.selectedIssue.hasheadingid,
            //   Hasquestionid: this.selectedIssue.hasquestionid,
            //   Hasanswerid: this.selectedIssue.hasanswerid,
            // }

            // let tempspecificIssPa = {
            //   Hasissueid: this.selectedIssue.hasissueid
            // }
            // let spcPrm = { ...pr, ...tempspecificIssPa }
            //this.getSpecificAssetHealtSafetyIssue(spcPrm);
          } else {
            this.getSpecificAssetHealtSafetyIssue(specificIssParam);
          }

        } else {
          this.editIssueForm.patchValue({
            status: "O",
            assessor: this.currentUser.userId,
            severity: "",
            probability: "",
            date: this.maxTodayDate
          })
          if (this.selectedAction.hasrepeatable == "Y") {

            this.editIssueForm.patchValue({
              location: this.selectedAction.hasALocation,
              floor: this.selectedAction.hasAFloor
            });
            this.editIssueForm.controls['location'].disable();
            this.editIssueForm.controls['floor'].disable();
          }
        }
        this.pageLoaded = true
        this.loaderService.pageHide()
        this.chRef.detectChanges();
      },
      error => {
        this.loaderService.pageHide();
        this.alertService.error(error)
      }
    )

    // this.getHnsPriority(params)
    // this.getHnsSeverity(params)
    // this.getHnsProbability(params)
    // this.getHnsBudget(params)

    //this.getMultipleAssetHealthSafetyIssue(multipleHnsIssParam);


    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
          if (this.checkWorkFieldOnly()) {
            this.editIssueForm.controls['location'].disable();
            this.editIssueForm.controls['floor'].disable();
            this.editIssueForm.controls['issue'].disable();
            this.editIssueForm.controls['proposedAction'].disable();
            this.editIssueForm.controls['priority'].disable();
            this.editIssueForm.controls['targetDate'].disable();
            this.editIssueForm.controls['status'].disable();
            this.editIssueForm.controls['resDate'].disable();
            this.editIssueForm.controls['resolution'].disable();
            this.editIssueForm.controls['budget'].disable();
            this.editIssueForm.controls['remedialCost'].disable();
            this.editIssueForm.controls['comments'].disable();
            this.editIssueForm.controls['assessor'].disable();
            this.editIssueForm.controls['date'].disable();
            this.editIssueForm.controls['severity'].disable();
            this.editIssueForm.controls['probability'].disable();

          }
        }
      )
    )

    this.isQuestionCodeOnActiveSurvey(action.hasquestioncode, action.assid);

    if (this.rootAssessment.haslatestassessment != undefined && this.selectedAction.haslatestassessment != null) {
      if (this.rootAssessment.haslatestassessment != "Y") {
        this.editIssueForm.disable()
        this.viewOnly = true;
        this.title = "View Issue";
      }
    }

    if (this.selectedAction.hasalatestassesment != undefined && this.selectedAction.hasalatestassesment != null) {
      if (this.selectedAction.hasalatestassesment != "Y") {
        this.editIssueForm.disable()
        this.viewOnly = true;
        this.title = "View Issue";
      }
    }



  }

  checkWorkFieldOnly() {
    if (this.hnsPermission.includes("Edit Issue (Work Fields Only)") && this.currentUser.admin != "Y") {
      return true
    }
    return false;
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid) {
          const messages = this.validationMessage[key];
          if (abstractControl.errors != null && abstractControl.errors.hasOwnProperty('ngbDate')) {
            abstractControl.setErrors(null)
            if (key == "targetDate") {
              if (abstractControl.value == "") {
                abstractControl.setErrors({ required: true });
              }
            }

            if (key == "date") {
              if (abstractControl.value == "") {
                abstractControl.setErrors({ required: true });
              }
            }

            //delete abstractControl.errors['ngbDate'];
            this.chRef.detectChanges();

          }


          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    })
  }

  formErrorObject() {
    this.formErrors = {
      'issue': '',
      'targetDate': '',
      'resDate': '',
      'resolution': '',
      'proposedAction': '',
      'date': '',
      'severity': '',
      'probability': '',
      'priority': '',

    }
  }

  onSubmit() {
    if (this.checkWorkFieldOnly() == false) {
      this.formErrorObject();
      this.logValidationErrors(this.editIssueForm);
      // console.log(this.formErrors);
      this.chRef.detectChanges();
      if (this.editIssueForm.invalid) {
        return;
      }
    }


    if (this.fromAns) {
      let msg = "";
      let tempObj = Object.assign([], this.allIssuesList)
      if (this.issueFormMode == "add") {
        let tobj = this.setTempIssueObj(true);
        tempObj.push(tobj);
        msg = "Issue Added Successfully, Please press ok button to save it."
      } else {
        tempObj = tempObj.map(
          x => {
            if (x == this.selectedIssue) {
              x = this.setTempIssueObj(true)
            }
            return x
          }
        )
        msg = "Issue Updated Successfully, Please press ok button to update it."
      }

      //console.log(tempObj);
      this.sharedService.changeissueList(tempObj);
      this.loaderService.pageShow();
      setTimeout(() => {
        this.loaderService.pageHide();
      }, 1000);
      this.alertService.success(msg);
      this.closeIssue()

    } else {
      let formRawVal = this.editIssueForm.getRawValue();
      let formObj: any = {};

      formObj.Hasiissue = formRawVal.issue;
      formObj.Hasiproposedaction = formRawVal.proposedAction;

      formObj.Hasitargetdate = this.dateFormate(formRawVal.targetDate);
      formObj.Hasiassessmentdate = this.dateFormate(formRawVal.date);
      formObj.Hasiassessor = formRawVal.assessor;
      formObj.Hasiresolution = formRawVal.resolution;
      formObj.Hasiresolutiondate = this.dateFormate(formRawVal.resDate);
      formObj.Hasiactionstatus = (formRawVal.status == "" || formRawVal.status == null) ? "O" : formRawVal.status;
      formObj.Hasibudgetcode = formRawVal.budget;
      formObj.Hasiremedialcost = formRawVal.remedialCost;
      formObj.Hasicomments = formRawVal.comments;
      formObj.Createdby = this.currentUser.userId;//formRawVal.comments;
      // formObj.Createddate = formRawVal.comments;
      formObj.Modifiedby = this.currentUser.userId;//formRawVal.comments;
      //formObj.Modifieddate = formRawVal.comments;
      formObj.Hasiworkstatus = formRawVal.workStatus;
      formObj.Hasiworkauthoriseddate = this.dateFormate(formRawVal.workAuthDate);
      formObj.Hasiworkauthoriseduser = formRawVal.workAuthUser;
      formObj.Hasiworkreference = formRawVal.workRef;
      formObj.Hasiworkscheduledate = this.dateFormate(formRawVal.workSchedDate);
      formObj.Hasiworknotes = formRawVal.workNotes;
      formObj.Hasiworkcompletiondate = this.dateFormate(formRawVal.workCompDate);
      formObj.HasILocation = formRawVal.location;
      formObj.HasIFloor = formRawVal.floor;
      formObj.Hasquestioncode = this.selectedAction.hasquestioncode;

      // formObj.Hasiseverity = this.selectedAction.hasiseverity;
      // formObj.Hasiprobability = this.selectedAction.hasiprobability;
      if (formObj.severity == 0) {
        formObj.Hasiseverity = this.selectedAction.hasiseverity;
      } else {
        formObj.Hasiseverity = formRawVal.severity;
      }
      if (formObj.probability == 0) {
        formObj.Hasiprobability = this.selectedAction.hasiseverity;
      } else {
        formObj.Hasiprobability = formRawVal.probability;
      }

      //check if severity and probability exist then change priority
      if (this.severity || this.probability) {
        let prior = this.priority.find(x => x.hasprioritydescription == formRawVal.priority);
        if (prior) {
          formObj.Hasipriority = prior.haspriority
        } else {
          formObj.Hasipriority = "";
        }

      } else {
        formObj.Hasipriority = formRawVal.priority;
      }

      formObj.Hasiriskscore = this.selectedAction.hasiriskscore

      formObj.Assid = this.selectedAction.assid;
      formObj.Hascode = this.selectedAction.hascode;
      formObj.Hasversion = this.selectedAction.hasversion;
      formObj.Hasgroupid = this.selectedAction.hasgroupid;
      formObj.Hasheadingid = this.selectedAction.hasheadingid;
      formObj.Hasquestionid = this.selectedAction.hasquestionid;
      formObj.Hasanswerid = this.selectedAction.hasanswerid;


      let saveIssue: any
      if (this.issueFormMode == "add") {
        formObj.Hasissueid = '';
        saveIssue = this.actionService.addAssetHealtSafetyIssueForSingleRecord(formObj);
      } else {
        formObj.Hasissueid = this.selectedAction.hasissueid;
        saveIssue = this.actionService.updateAssetHealtSafetyIssue(formObj);
      }

      saveIssue.subscribe(
        data => {
          if (data.isSuccess) {
            if (this.issueFormMode == "add") {
              this.alertService.success("Issue Added Successfully.");
            } else {
              this.alertService.success("Issue Updated Successfully.");
            }
            this.archiveIssueUpdate()

          }
        },
        error => {
          this.alertService.error(error);
        }
      )
    }

  }

  archiveIssueUpdate() {
    const params = {
      Assid: this.selectedAction.assid,
      Hascode: this.selectedAction.hascode,
      Hasversion: this.selectedAction.hasversion,
      Hasgroupid: this.selectedAction.hasgroupid,
      Hasheadingid: this.selectedAction.hasheadingid,
      Hasquestionid: this.selectedAction.hasquestionid,
      Hasanswerid: this.selectedAction.hasanswerid
    }

    this.subs.add(
      this.actionService.initiateIssueArchiveUpdate(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.closeIssue();
          } else {
            this.alertService.error(data.message)
          }
        }
      )
    )

  }


  getHnsPriority(params) {
    this.subs.add(
      this.hnsService.getPriorityList(params).subscribe(
        data => {
          if (data.isSuccess && data.data) {
            this.priority = data.data
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  dateFormate(value) {
    if (value) {
      return `${value.month}-${value.day}-${value.year}`
    } else {
      return '1753-01-01 00:00:00.000';
    }

  }

  dateFormate2(value) {
    if (value) {
      return `${value.year}-${value.month}-${value.day}`
    } else {
      return '1753-01-01 00:00:00.000';
    }

  }


  getHnsProbability(params) {
    this.subs.add(
      this.hnsService.getProbabilityList(params).subscribe(
        data => {
          if (data.isSuccess && data.data.length > 0) {
            this.probability = data.data;
            if (this.probability) {
              let probabilityField = this.editIssueForm.get('probability');
              probabilityField.setValidators([Validators.required]);
              this.chRef.detectChanges();
            }

          }
        }
      )
    )
  }


  getHnsSeverity(params) {
    this.subs.add(
      this.hnsService.getSeverityList(params).subscribe(
        data => {
          if (data.isSuccess && data.data.length > 0) {
            this.severity = data.data
            if (this.severity) {
              const severityField = this.editIssueForm.get('severity');
              severityField.setValidators([Validators.required]);
              this.chRef.detectChanges();
            }

          }
        }
      )
    )
  }



  getHnsBudget(params) {
    this.subs.add(
      this.hnsService.getbudgetList(params).subscribe(
        data => {
          //console.log(data)
          if (data.isSuccess && data.data) {
            this.budget = data.data
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  getMultipleAssetHealthSafetyIssue(params) {
    this.subs.add(
      this.actionService.getMultipleAssetHealthSafetyIssue(params).subscribe(
        data => {
          //console.log(data)
          let today = new Date();
          let todayn = this.helperService.ddmmyyFormat(today, true)
          this.editIssueForm.patchValue({
            date: this.helperService.ngbDatepickerFormat(todayn)
          })
          this.chRef.detectChanges();
          if (data.isSuccess && data.data) {
            // this.healthAndSafetyIss = data.data
            // this.gridView = process(this.healthAndSafetyIss, this.state);
            // this.chRef.detectChanges();
          }
        }
      )
    )
  }

  getSpecificAssetHealtSafetyIssue(params) {
    this.subs.add(
      this.actionService.getSpecificAssetHealtSafetyIssue(params).subscribe(
        data => {
          if (data.isSuccess && data.data.length > 0) {
            this.editIssueData = data.data[0];
            // console.log(this.editIssueData);
            this.editIssueForm.patchValue(
              {
                location: this.editIssueData.hasilocation,
                floor: this.editIssueData.hasifloor,
                issue: this.editIssueData.hasiissue,
                proposedAction: this.editIssueData.hasiproposedaction,
                priority: '',
                targetDate: this.helperService.ngbDatepickerFormat(this.editIssueData.hasitargetdate),
                status: this.editIssueData.hasiactionstatus == "" || this.editIssueData.hasiactionstatus == null ? "O" : this.editIssueData.hasiactionstatus,
                resDate: this.helperService.ngbDatepickerFormat(this.editIssueData.hasiresolutiondate),
                resolution: this.editIssueData.hasiresolution,
                budget: this.editIssueData.hasibudgetcode,
                remedialCost: this.editIssueData.hasiremedialcost,
                comments: this.editIssueData.hasicomments,
                assessor: this.editIssueData.hasiassessor,
                date: this.helperService.ngbDatepickerFormat(this.editIssueData.hasiassessmentdate),
                workStatus: this.editIssueData.hasiworkstatus,
                workRef: this.editIssueData.hasiworkreference,
                workAuthDate: this.helperService.ngbDatepickerFormat(this.editIssueData.hasiworkauthoriseddate),
                workAuthUser: this.editIssueData.hasiworkauthoriseduser,
                workSchedDate: this.helperService.ngbDatepickerFormat(this.editIssueData.hasiworkscheduledate),
                workCompDate: this.helperService.ngbDatepickerFormat(this.editIssueData.hasiworkcompletiondate),
                workNotes: this.editIssueData.hasiworknotes,
                // severity: this.editIssueData.hasiseverity,
                // probability: this.editIssueData.hasiprobability

              }
            )

            this.setResolutionFields(this.editIssueData.hasiactionstatus);


            //set severity and probability
            if (this.severity || this.probability) {
              setTimeout(() => {
                this.editIssueForm.patchValue({
                  severity: this.editIssueData.hasiseverity,
                  probability: this.editIssueData.hasiprobability
                })
                this.setPriorityValueDefault(false)
                this.chRef.detectChanges();
              }, 200);


              // if (this.priority) {
              //   let prior = this.priority.find(x => x.haspriority.toLocaleLowerCase() == this.editIssueData.hasipriority.toLocaleLowerCase());
              //   if (prior) {
              //     this.editIssueForm.patchValue({ priority: prior.hasprioritydescription });
              //   }
              // }

            } else {
              this.editIssueForm.patchValue({ priority: this.editIssueData.hasipriority })
            }

            this.chRef.detectChanges();
            //console.log(this.editIssueData)
          }
        }
      )
    )
  }

  getScoreTypeForDefinition(hasCode, hasVer) {
    this.subs.add(
      this.actionService.getScoreTypeForDefinition(hasCode, hasVer).subscribe(
        data => {
          if (data.isSuccess && data.data != "") {
            this.scoreType = data.data;
          }
        }
      )
    )
  }


  isQuestionCodeOnActiveSurvey(hasQuestionCode, assId) {
    this.subs.add(
      this.actionService.isQuestionCodeOnActiveSurvey(hasQuestionCode, assId).subscribe(
        data => {
          if (data.isSuccess && data.data) {
            if (data.data != '') {
              this.title = `Add/Edit Issue - ${data.data}`;
              this.viewOnly = true;
              this.editIssueForm.disable();
            }
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  closeIssue() {
    this.showIssue = false;
    this.closeIssueEvt.emit(this.showIssue);
  }


  viewImage() {
    this.showImage = true;
    $('.editIssOvrlay').addClass('ovrlay');
  }

  closerImage(event) {
    this.showImage = event;
    $('.editIssOvrlay').removeClass('ovrlay');

  }

  openCalendar(obj, field = null) {
    if (field == null) {
      obj.toggle()
      return
    }

    if (field == "rsDate" && this.ifNotResolved) {
      return false;
    } else {
      obj.toggle();
    }

  }

  openTemplateIssue() {
    if (!this.viewOnly) {
      this.templateIssueOpen = true;
      $('.editIssOvrlay').addClass('ovrlay');
    }
  }

  closeTemplateIssue($event) {
    this.templateIssueOpen = $event
    $('.editIssOvrlay').removeClass('ovrlay');
  }

  selectTempIssue($event) {
    if (!this.viewOnly) {
      this.editIssueForm.patchValue({
        issue: $event.hasissuetext
      })
    }
  }


  openTemplateAction() {
    if (!this.viewOnly) {
      this.templateActionOpen = true;
      $('.editIssOvrlay').addClass('ovrlay');
    }
  }

  closeTemplateAction($event) {
    this.templateActionOpen = $event
    $('.editIssOvrlay').removeClass('ovrlay');
  }

  selectTempAction($event) {
    this.editIssueForm.patchValue({
      proposedAction: $event.hasactiontext
    })
  }

  setTempIssueObj(set = false) {
    if (set) {
      let formRawVal = this.editIssueForm.getRawValue();
      this.tempIssueObj.assid = this.selectedAction.assid;
      this.tempIssueObj.hasiissue = formRawVal.issue;
      this.tempIssueObj.hasILocation = formRawVal.location;
      this.tempIssueObj.hasiproposedaction = formRawVal.proposedAction;
      this.tempIssueObj.hasipriority = formRawVal.priority;
      this.tempIssueObj.hasitargetdate = this.dateFormate2(formRawVal.targetDate);
      this.tempIssueObj.hasiassessmentdate = this.dateFormate2(formRawVal.date);
      this.tempIssueObj.hasiassessor = formRawVal.assessor;

      this.tempIssueObj.hasiresolution = formRawVal.resolution;
      this.tempIssueObj.hasiresolutiondate = this.dateFormate2(formRawVal.resDate);
      this.tempIssueObj.hasiactionstatus = (formRawVal.status == "" || formRawVal.status == null) ? "O" : formRawVal.status;
      this.tempIssueObj.hasibudgetcode = formRawVal.budget;

      if (this.budget) {
        let budgetName = this.budget.find(x => x.hasbudgetcode == formRawVal.budget)
        if (budgetName) {
          this.tempIssueObj.hasBudgetName = budgetName.hasbudgetdesc;
        }
      }

      //this.tempIssueObj.hasBudgetName = formRawVal.budget;


      this.tempIssueObj.hasicomments = formRawVal.comments;
      this.tempIssueObj.createdby = this.currentUser.userId;
      this.tempIssueObj.hasimodifiedby = this.currentUser.userId;
      this.tempIssueObj.hasiworkstatus = formRawVal.workStatus;

      this.tempIssueObj.hasiworkauthoriseddate = this.dateFormate2(formRawVal.workAuthDate);
      this.tempIssueObj.hasiworkauthoriseduser = formRawVal.workAuthUser;
      this.tempIssueObj.hasiworkreference = formRawVal.workRef;
      this.tempIssueObj.hasiworkscheduledate = this.dateFormate2(formRawVal.workSchedDate);
      this.tempIssueObj.hasiworknotes = formRawVal.workNotes;
      this.tempIssueObj.hasiworkcompletiondate = this.dateFormate2(formRawVal.workCompDate);
      this.tempIssueObj.hasIFloor = formRawVal.floor;
      this.tempIssueObj.hasquestioncode = this.selectedAction.hasquestioncode;
      this.tempIssueObj.hasiseverity = formRawVal.severity;

      this.tempIssueObj.hasiprobability = formRawVal.probability//this.selectedAction.hasiseverity;
      this.tempIssueObj.hasiriskscore = this.selectedAction.hasiriskscore;
      this.tempIssueObj.hascode = this.selectedAction.hascode;
      this.tempIssueObj.hasversion = this.selectedAction.hasversion;
      this.tempIssueObj.hasgroupid = this.selectedAction.hasgroupid;
      this.tempIssueObj.hasheadingid = this.selectedAction.hasheadingid;
      this.tempIssueObj.hasquestionid = this.selectedAction.hasquestionid;
      this.tempIssueObj.hasanswerid = this.selectedAction.hasanswerid;
      if (this.issueFormMode == "add") {
        this.tempIssueObj.hasissueid = '';
      } else {
        this.tempIssueObj.hasissueid = this.selectedIssue.hasissueid;
      }

      return this.tempIssueObj;

    } else {
      this.tempIssueObj = {
        addressSearch: null,
        all: null,
        assessmentRef: null,
        assid: "",
        astconcateaddress: null,
        bIncludeIssueID: false,
        bLatest: false,
        chacode: null,
        concateheading: null,
        concatgroup: null,
        concatquestion: null,
        createdby: "",
        createddate: "",
        groupName: null,
        groupnumber: null,
        hasAFloor: null,
        hasALocation: null,
        hasBudgetName: "",
        hasIFloor: "",
        hasILocation: "",
        hasaactionrequired: null,
        hasaansweritem: null,
        hasaassessmentdate: null,
        hasaassessor: null,
        hasacomment: null,
        hasacomments: null,
        hasactionifno: null,
        hasactionifyes: null,
        hasactionyesnona: null,
        hasalatestassesment: null,
        hasanswerid: "",
        hasardate: null,
        hasaremedialcost: 0,
        hasarid: 0,
        hasarsequence: 0,
        hascode: "",
        hasgroupid: 1,
        hasgroupseq: null,
        hasheadingid: 1,
        hasheadingname: null,
        hasheadingseq: null,
        hasiactionstatus: "O",
        hasiassessmentdate: "",
        hasiassessor: "",
        hasibudgetcode: "",
        hasicomments: "",
        hasiissue: "",
        hasimodifiedby: null,
        hasimodifieddate: null,
        hasipriority: "",
        hasiprobability: 0,
        hasiproposedaction: "",
        hasiremedialcost: 0,
        hasiresolution: "",
        hasiresolutiondate: "",
        hasiriskscore: 0,
        hasiseverity: 0,
        hasissueid: 1,
        hasitargetdate: "",
        hasiworkauthoriseddate: "1753-01-01",
        hasiworkauthoriseduser: "",
        hasiworkcompletiondate: "1753-01-01",
        hasiworknotes: "",
        hasiworkreference: "",
        hasiworkscheduledate: "1753-01-01",
        hasiworkstatus: "",
        hasphoto: null,
        hasquestioncode: "",
        hasquestionid: 3,
        hasquestionseq: null,
        hasquestiontext: null,
        hasquestiontype: null,
        hasrepeatable: null,
        hasscoreactual: null,
        hasscoremax: null,
        hasversion: 1,
        headingNumber: null,
        info: null,
        issueandanswer: null,
        latestAssessment: null,
        modifiedby: "",
        modifieddate: "",
        none: null,
        ntpSequence: null,
        outstanding: null,
        overdue: null,
        overduepending: null,
        pictureCount: 0,
        questionnumber: null,
        resolved: null,
        scoringruletext: null,
        textSearch: null,
        userid: this.currentUser.userId,
        viewType: "CURRENT"
      }
    }

  }

  openSpellingCheck(textId) {
    if (this.viewOnly == false) {
      $('.editIssOvrlay').addClass('ovrlay');
      this.openSpellChecker = true;
      let formRawVal = this.editIssueForm.getRawValue();
      this.textId = textId;
      this.textString = formRawVal[textId];
    }
  }

  closeSpellChecker($event) {
    this.openSpellChecker = $event
    $('.editIssOvrlay').removeClass('ovrlay');
  }

  textStringReturn(text) {
    let tempText = {}
    tempText[this.textId] = text;
    this.editIssueForm.patchValue(tempText)
  }

  ValidateNumberOnly(event): boolean {
    return true;

    console.log(event)

    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46) {
      console.log('inc')
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        console.log('inf')
        return false;
      }
    }

    setTimeout(() => {
      let targetVal = event.target.value;
      let valLength = event.target.value.toString().length;
      console.log(valLength)
      console.log(targetVal)

      if (targetVal != 0 && trim(targetVal) != "") {
        console.log('in')
        console.log(valLength)
        console.log(targetVal)
        if (targetVal.indexOf('.') === -1) {
          console.log('in');
          if (valLength > 9) {
            console.log('gr')
          } else {
            console.log('lo')
          }
          if (valLength > 9) {
            return this.remedialCost//false;
          } else {
            this.remedialCost = targetVal;
            targetVal = parseFloat(targetVal).toFixed(2);
          }
        }

        console.log(targetVal);
        let splitVal = targetVal.split(".");
        console.log(splitVal);

        if (splitVal[0].length > 9) {

        }

        if (splitVal[0].length > 9 || splitVal[1].length > 2) {
          return this.remedialCost//false;
        }


        return true;
      }
    }, 100);



    // return false

  }

  getFloor() {
    this.subs.add(
      this.actionService.getFloorDropDownList().subscribe(
        data => {
          if (data.isSuccess) {
            this.floorDrp = data.data;
            this.chRef.detectChanges();
          }
        }
      )
    )
  }


  setTargetDate(event, key = null) {
    const targetVal = event.target.value;
    this.changeTargetDate(targetVal);
  }

  changeTargetDate(targetVal, key = null) {
    const selectedPriority = (key == null) ? this.priority.find(x => x.haspriority == targetVal) : this.priority.find(x => x.hasprioritydescription == targetVal);
    if (this.issueFormMode == "edit") {
      if (selectedPriority && (this.editIssueData.hasiassessmentdate != "" || this.editIssueData.hasiassessmentdate != null)) {
        let assessDate = new Date(this.editIssueData.hasiassessmentdate);
        if (assessDate.getFullYear() == 1753) {
          assessDate = new Date();
        }
        assessDate.setDate(assessDate.getDate() + selectedPriority.hasdaystoresolve);
        this.editIssueForm.patchValue({
          targetDate: this.helperService.setNgbDate2(assessDate),
        })
        this.chRef.detectChanges();

      }
    } else {
      if (selectedPriority) {
        let assessDate: any;
        if (this.selectedAction.hasiassessmentdate == "" || this.selectedAction.hasiassessmentdate == null) {
          assessDate = new Date();
        } else {
          assessDate = new Date(this.selectedAction.hasiassessmentdate);
          if (assessDate.getFullYear() == 1753) {
            assessDate = new Date();
          }
        }

        assessDate.setDate(assessDate.getDate() + selectedPriority.hasdaystoresolve);
        this.editIssueForm.patchValue({
          targetDate: this.helperService.setNgbDate2(assessDate),
        })
        this.chRef.detectChanges();

      }
    }

  }

  changeSeverity(event) {
    const targetVal = event.target.value;
    const formRawVal = this.editIssueForm.getRawValue();
    const prob = (formRawVal.probability == "") ? 1 : formRawVal.probability;
    const riskVal = targetVal * prob;
    const prior = this.priority.find(x => {
      if (riskVal >= x.hasrisklower && riskVal <= x.hasriskupper) {
        return x;
      }
    });

    this.editIssueForm.patchValue({
      priority: prior.hasprioritydescription
    });
    setTimeout(() => {
      this.changeTargetDate(prior.hasprioritydescription, "val");
    }, 10);

  }

  changeProbability(event) {
    const targetVal = event.target.value;
    let formRawVal = this.editIssueForm.getRawValue();
    const sev = (formRawVal.severity == "") ? 1 : formRawVal.severity;
    const riskVal = targetVal * sev;
    const prior = this.priority.find(x => {
      if (riskVal >= x.hasrisklower && riskVal <= x.hasriskupper) {
        return x;
      }
    });
    this.editIssueForm.patchValue({
      priority: prior.hasprioritydescription
    })
    setTimeout(() => {
      this.changeTargetDate(prior.hasprioritydescription, "val");
    }, 10);

  }

  setPriorityValueDefault(setTarget = true) {

    let formRawVal = this.editIssueForm.getRawValue();
    const sev = (formRawVal.severity == "") ? 0 : formRawVal.severity;
    const prob = (formRawVal.probability == "") ? 0 : formRawVal.probability;
    const riskVal = prob * sev;
    if (riskVal == 0) {
      this.editIssueForm.patchValue({
        priority: this.editIssueData.hasipriority
      })
    } else {
      const prior = this.priority.find(x => {
        if (riskVal >= x.hasrisklower && riskVal <= x.hasriskupper) {
          return x;
        }
      });
      this.editIssueForm.patchValue({
        priority: prior.hasprioritydescription
      })
      setTimeout(() => {
        if (setTarget) {
          this.changeTargetDate(prior.hasprioritydescription, "val");
        }

      }, 10);
    }

  }

  onStatusChange(event) {
    const targetVal = event.target.value;
    this.setResolutionFields(targetVal);
  }

  setResolutionFields(targetVal) {
    const resolution = this.editIssueForm.get('resolution');
    const resolutionDate = this.editIssueForm.get('resDate');
    if (targetVal == "R") {
      this.ifNotResolved = false;
      resolution.setValidators([Validators.required]);
      resolutionDate.setValidators([Validators.required]);
    } else {
      this.ifNotResolved = true;
      resolution.clearValidators();
      resolutionDate.clearValidators();
    }
    resolution.updateValueAndValidity();
    resolutionDate.updateValueAndValidity();
  }


  selectAction(event) {
    if (!this.viewOnly) {
      this.editIssueForm.patchValue({ proposedAction: event.hasactiontext });
    }
  }

  populateIssueForm(formData, targetDt = true) {
    this.editIssueForm.patchValue({
      location: formData.hasILocation,
      floor: formData.hasIFloor,
      issue: formData.hasiissue,
      proposedAction: formData.hasiproposedaction,
      priority: "",
      targetDate: this.helperService.ngbDatepickerFormat(formData.hasitargetdate),
      status: formData.hasiactionstatus == "" || formData.hasiactionstatus == null ? "O" : formData.hasiactionstatus,
      resDate: this.helperService.ngbDatepickerFormat(formData.hasiresolutiondate),
      resolution: formData.hasiresolution,
      budget: formData.hasibudgetcode,
      remedialCost: formData.hasiremedialcost,
      comments: formData.hasicomments,
      assessor: formData.hasiassessor,
      date: this.helperService.ngbDatepickerFormat(formData.hasiassessmentdate),
      workStatus: formData.hasiworkstatus,
      workRef: formData.hasiworkreference,
      workAuthDate: this.helperService.ngbDatepickerFormat(formData.hasiworkauthoriseddate),
      workAuthUser: formData.hasiworkauthoriseduser,
      workSchedDate: this.helperService.ngbDatepickerFormat(formData.hasiworkscheduledate),
      workCompDate: this.helperService.ngbDatepickerFormat(formData.hasiworkcompletiondate),
      workNotes: formData.hasiworknotes,
    })

    this.setResolutionFields(formData.hasiactionstatus);

    if (this.severity || this.probability) {
      this.editIssueForm.patchValue({
        severity: formData.hasiseverity,
        probability: formData.hasiprobability
      })
      this.setPriorityValueDefault(targetDt)
    } else {
      this.editIssueForm.patchValue({
        priority: this.editIssueData.hasipriority
      })
    }

    this.chRef.detectChanges();

  }



}
