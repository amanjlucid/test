import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { HnsResultsService, HelperService, AlertService, SharedService } from '../../_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import * as moment from "moment";

@Component({
  selector: 'app-hns-res-info-edit-ans',
  templateUrl: './hns-res-info-edit-ans.component.html',
  styleUrls: ['./hns-res-info-edit-ans.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsResInfoEditAnsComponent implements OnInit {
  subs = new SubSink();
  title: string = "Change Information Answer";
  @Input() isAssessment: any = false;
  @Input() showInfoEditAns: boolean = false;
  @Input() selectedAction: any;
  @Input() rootAssessment: any;

  @Output() closeInfoChangeAnswer = new EventEmitter<boolean>();
  showImage: boolean = false
  submitted: boolean = false;
  editAnsForm: FormGroup;
  hnsPermission: any = [];
  currentUser: any;
  healthAndSafetyAns: any;
  viewOnly: boolean = false;
  modifiedProp: any = {
    createdBy: '',
    createdDate: '',
    modifiedBy: '',
    modifiedDate: ''
  };
  floorDrp: any;
  readonly: boolean = true;
  openSpellChecker: boolean = false;
  textId: any;
  textString: any;
  charData: any;
  infoType: any = "D";
  answerReadonly = false;
  answerVal: any;
  formErrors: any = {};
  validationMessage = {
    'issue': {
      'invalidInt': 'Answer should be integer.',
      'invalidDecimal': 'Answer should be decimal.',
    },
  }
  fixedTypeValue: any


  constructor(
    private sharedService: SharedService,
    private hnsResultService: HnsResultsService,
    private chRef: ChangeDetectorRef,
    private helperService: HelperService,
    private fb: FormBuilder,
    private alertService: AlertService,

  ) { }

  ngOnInit() {
   
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getFloor();
    this.editAnsForm = this.fb.group({
      answer: [''],
      location: [''],
      floor: [''],
      comments: [''],
      assessor: [''],
      date: [''],
      ref: [''],
      charone: [''],
      chartwo: [''],
      assessmentDate: [''],
      assessmentRef: ['']

    });

    let action:any = this.selectedAction;

    let HnSAnsParam = {
      Assid: action.assid,
      Hascode: action.hascode,
      Hasversion: action.hasversion,
      Hasgroupid: action.hasgroupid,
      Hasheadingid: action.hasheadingid,
      Hasquestionid: action.hasquestionid,
      Hasanswerid: action.hasanswerid,

    }

    //console.log({ root: this.rootAssessment, seleted: this.selectedAction })
    // default latest value check
    let isLatest: any = true;
    if (this.rootAssessment.haslatestassessment != undefined) {
      if (this.rootAssessment.haslatestassessment != "Y") {
        isLatest = false//this.rootAssessment.haslatestassessment;
      }
    }

    if (this.selectedAction.hasalatestassesment != undefined) {
      if (this.selectedAction.hasalatestassesment != "Y") {
        isLatest = false//this.selectedAction.hasalatestassesment
      }
    }
  

    if (!isLatest) {
      let historicParam:any = { Hasarid: action.hasarid, Hasarsequence: action.hasarsequence };
      HnSAnsParam = { ...HnSAnsParam, ...historicParam }
    }

    
    forkJoin([this.hnsResultService.isQuestionCodeOnActiveSurvey(action.hasquestioncode, action.assid), this.hnsResultService.getSpecificAns(HnSAnsParam, isLatest), this.hnsResultService.getCharacteristicData(action.hascode, action.hasversion, action.hasgroupid, action.hasheadingid, action.hasquestionid)]).subscribe(
      data => {
        const quesCodeData = data[0]
        const hnsAnsData = data[1]
        const charData = data[2]
        //console.log({ quesco: quesCodeData, ans: hnsAnsData, char: charData })

        //ques code data
        if (quesCodeData.isSuccess && quesCodeData.data) {
          if (quesCodeData.data != '') {
            // this.questonCode = data.data;
            this.title = `View Information Answer - ${quesCodeData.data}`;
            this.viewOnly = true;
            this.editAnsForm.disable();
            this.chRef.detectChanges();
          }
        }

        // ans data
        if (hnsAnsData.isSuccess && hnsAnsData.data) {
          if (hnsAnsData.data.length > 0) {
            this.healthAndSafetyAns = hnsAnsData.data[0];
          } else {
            this.healthAndSafetyAns = this.selectedAction;
          }

          //console.log(this.healthAndSafetyAns)

          if (this.healthAndSafetyAns != undefined) {
            this.modifiedProp.createdBy = this.healthAndSafetyAns.createdby
            this.modifiedProp.createdDate = this.healthAndSafetyAns.createddate
            this.modifiedProp.modifiedBy = this.healthAndSafetyAns.modifiedby
            this.modifiedProp.modifiedDate = this.healthAndSafetyAns.modifieddate

            if (this.healthAndSafetyAns.hasaassessmentdate instanceof Date) {
              this.healthAndSafetyAns.hasaassessmentdate = this.healthAndSafetyAns.hasaassessmentdate.toString()
            }

            this.editAnsForm.patchValue({
              // answer: this.healthAndSafetyAns.hasaansweritem,
              location: this.healthAndSafetyAns.hasalocation,
              comments: this.healthAndSafetyAns.hasacomments,
              floor: this.healthAndSafetyAns.hasafloor,
              assessor: this.healthAndSafetyAns.hasaassessor,
              assessmentRef: this.healthAndSafetyAns.hasaassessmentref,
              assessmentDate: this.helperService.ngbDatepickerFormat(this.healthAndSafetyAns.hasaassessmentdate)
            });

            // if (this.selectedAction.chacode != "" && this.selectedAction.chacode != null) {
            //   this.title = `View Information Answer (CHARACTERISTIC ANSWER)`;
            // }
          }
        }

        // char data
        if (charData.isSuccess) {
          this.charData = charData.data[0];

          if (this.charData.chaType != "") {
            this.title = `View Information Answer (CHARACTERISTIC ANSWER)`;
          }

          if (this.charData.chaType == "F") {
            this.fixedTypeValue = charData.data;
            this.answerVal = this.healthAndSafetyAns.hasaansweritem;
            this.editAnsForm.patchValue({
              answer: this.answerVal
            })

          } else {
            this.fixedTypeValue = [];
            if (this.charData.infoDataType == "C" || this.charData.infoDataType == "I" || this.charData.infoDataType == "E") {
              this.answerReadonly = false;
            }

            if (this.charData.infoDataType == "D") {
              this.answerVal = this.helperService.ddmmyyywithslash(this.healthAndSafetyAns.hasaansweritem, false)
              this.editAnsForm.patchValue({ answer: this.helperService.ddmmyyywithslash(this.healthAndSafetyAns.hasaansweritem) })
            } else {
              this.editAnsForm.patchValue({ answer: this.healthAndSafetyAns.hasaansweritem })
            }
          }

          this.editAnsForm.patchValue({
            charone: this.charData.chaCode,
            chartwo: this.charData.chaName,
          });
        }


        this.chRef.detectChanges();

      }
    )

    // console.log(this.rootAssessment)
    // console.log(this.selectedAction)
    if (this.rootAssessment.haslatestassessment != undefined) {
      if (this.rootAssessment.haslatestassessment != "Y") {
        this.editAnsForm.disable()
        this.viewOnly = true;
      }
    }

    if (this.selectedAction.hasalatestassesment != undefined) {
      if (this.selectedAction.hasalatestassesment != "Y") {
        this.editAnsForm.disable()
        this.viewOnly = true;
      }
    }

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
        }
      )
    )

    // this.isQuestionCodeOnActiveSurvey(action.hasquestioncode, action.assid);
    // this.getSpecificAssetHealthSafetyAnswer(HnSAnsParam);
    // this.getCharacteristicData(action.hascode, action.hasversion, action.hasgroupid, action.hasheadingid, action.hasquestionid)

    // if (this.rootAssessment.haslatestassessment != undefined || this.selectedAction.hasalatestassesment != undefined) {
    //   if (this.rootAssessment.haslatestassessment != "Y" || this.selectedAction.hasalatestassesment != "Y") {
    //     this.editAnsForm.disable()
    //     this.viewOnly = true;
    //     //this.title = "View Answer";
    //   }
    // }


  }

  closeInfoAns() {
    this.showInfoEditAns = false;
    this.closeInfoChangeAnswer.emit(this.showInfoEditAns);
  }

  isQuestionCodeOnActiveSurvey(hasQuestionCode, assId) {
    this.subs.add(
      this.hnsResultService.isQuestionCodeOnActiveSurvey(hasQuestionCode, assId).subscribe(
        data => {
          if (data.isSuccess && data.data) {
            if (data.data != '') {
              // this.questonCode = data.data;
              this.title = `View Information Answer - ${data.data}`;
              this.viewOnly = true;
              this.editAnsForm.disable();
              this.chRef.detectChanges();
            }
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  getSpecificAssetHealthSafetyAnswer(params) {
    this.subs.add(
      this.hnsResultService.getSpecificAssetHealthSafetyAnswer(params).subscribe(
        data => {
          // console.log(data)
          if (data.isSuccess && data.data) {
            this.healthAndSafetyAns = data.data[0];
            if (this.healthAndSafetyAns != undefined) {
              // this.healthAndSafetyAns.hasaassessor = "test";
              this.modifiedProp.createdBy = this.healthAndSafetyAns.createdby
              this.modifiedProp.createdDate = this.healthAndSafetyAns.createddate
              this.modifiedProp.modifiedBy = this.healthAndSafetyAns.modifiedby
              this.modifiedProp.modifiedDate = this.healthAndSafetyAns.modifieddate

              this.editAnsForm.patchValue({
                answer: this.healthAndSafetyAns.hasaansweritem,
                location: this.healthAndSafetyAns.hasalocation,
                comments: this.healthAndSafetyAns.hasacomments,
                floor: this.healthAndSafetyAns.hasafloor,
                assessor: this.healthAndSafetyAns.hasaassessor,
                assessmentRef: this.healthAndSafetyAns.hasaassessmentref,
                assessmentDate: this.helperService.ngbDatepickerFormat(this.healthAndSafetyAns.hasaassessmentdate)
              });

              //console.log(this.selectedAction)
              if (this.selectedAction.chacode != "" && this.selectedAction.chacode != null) {
                this.title = `View Information Answer (CHARACTERISTIC ANSWER)`;
                // this.editAnsForm.patchValue({
                //   charone: this.selectedAction.chacode,
                //   // chartwo: this.healthAndSafetyAns.hasalocation,
                // });
              }

              this.chRef.detectChanges();

              // if (this.healthAndSafetyAns.hasaassessmentdate != undefined) {
              //   this.healthAndSafetyAns.hasaassessmentdate = this.helperService.ngbDatepickerFormat(this.healthAndSafetyAns.hasaassessmentdate);
              //   this.assessorDate = this.healthAndSafetyAns.hasaassessmentdate
              //   this.chRef.detectChanges();

              // }
            }
            this.chRef.detectChanges();
          }
        }
      )
    )
  }


  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid) {
          const messages = this.validationMessage[key];

          if (abstractControl.errors.hasOwnProperty('ngbDate')) {
            abstractControl.setErrors(null)
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
      'answer': '',
    }
  }


  onSubmit() {
    //console.log(this.editAnsForm)

    // this.formErrorObject();
    // this.logValidationErrors(this.editAnsForm);
    //console.log(this.validateAnswerField());
    if (!this.validateAnswerField()) {
      return;
    }

    let formRawVal = this.editAnsForm.getRawValue();
    let formObj: any = {};
    //formObj.Hasactionyesnona = formRawVal.hasayesnona;

    formObj.Hasaactionrequired = this.healthAndSafetyAns.hasaactionrequired
    formObj.Hasaansweritem = formRawVal.answer
    formObj.HasALocation = formRawVal.location;
    formObj.HasAFloor = formRawVal.floor;
    formObj.Hasaassessmentdate = this.dateFormate(formRawVal.assessmentDate);
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
    formObj.Hasactionyesnona = this.selectedAction.hasiactionstatus


    this.subs.add(
      this.hnsResultService.updateAssetHealtSafetyAnswer(formObj).subscribe(
        data => {
          if (data.isSuccess) {
            if (this.charData.chaType != "") {
              let params: any = {}
              params.Assid = this.healthAndSafetyAns.assid
              params.ChaCode = this.charData.chaCode
              params.ChaType = this.charData.chaType
              params.UserId = this.currentUser.userId

              if (this.charData.chaType == "F" || this.charData.chaType == "C" || this.charData.chaType == "T") {
                params.AscText = formRawVal.answer
                params.AscValue = 0
              } else if (this.charData.chaType == "N") {
                params.AscText = ''
                params.AscValue = formRawVal.answer
              } else if (this.charData.chaType == "V") {
                params.AscText = ''
                params.AscValue = this.charData.infoDataType == "D" ? this.dateStringYMD(formRawVal.answer) : formRawVal.answer;
              }

              this.hnsResultService.updateAssetCharacteristic(params).subscribe(
                data => {
                  if (data.isSuccess) {
                    this.alertService.success("Answer saved successfully.")
                    this.closeInfoAns()
                  } else {
                    this.alertService.success(data.message)
                  }
                }
              )
            } else {
              this.alertService.success("Answer saved successfully.")
              this.closeInfoAns()
            }

          } else {
            this.alertService.error(data.message)
          }
          // console.log(data);
        },
        error => {
          this.alertService.error(error)
        }
      )
    )

  }



  dateFormate(value) {
    return `${value.month}-${value.day}-${value.year}`
  }

  openCalendar(obj, field) {
    if (field == "assessmentDate" && this.readonly) {
      return
    }
    obj.toggle();
  }

  viewImage() {
    //if (this.selectedIssue) {
    this.showImage = true;
    $('.editInfoAnsOvrlay').addClass('ovrlay');
    //  }

  }

  closerImage(event) {
    this.showImage = event;
    $('.editInfoAnsOvrlay').removeClass('ovrlay');
    // this.disableBtn = true
  }


  openSpellingCheck(textId, chtype = null) {
    if (this.viewOnly == false) {
      if (chtype != null && (chtype == "F" || this.charData.infoDataType != "C")) {
        return false
      }
      $('.editInfoAnsOvrlay').addClass('ovrlay');
      this.openSpellChecker = true;
      let formRawVal = this.editAnsForm.getRawValue();
      this.textId = textId;
      this.textString = formRawVal[textId];
    }
  }

  closeSpellChecker($event) {
    this.openSpellChecker = $event
    $('.editInfoAnsOvrlay').removeClass('ovrlay');
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


  getCharacteristicData(HASCODE, HASVERSION, HASGROUPID, HASHEADINGID, HASQUESTIONID) {
    this.subs.add(
      this.hnsResultService.getCharacteristicData(HASCODE, HASVERSION, HASGROUPID, HASHEADINGID, HASQUESTIONID).subscribe(
        data => {
          // console.log({ char: data })
          if (data.isSuccess) {
            this.charData = data.data[0];
            if (this.charData.infoDataType == "C" || this.charData.infoDataType == "I" || this.charData.infoDataType == "E") {
              this.answerReadonly = false;
            }

            if (this.charData.infoDataType == "D") {
              this.answerVal = this.helperService.ddmmyyywithslash(this.healthAndSafetyAns.hasaansweritem, false)
            }

            this.editAnsForm.patchValue({
              charone: this.charData.chaCode,
              chartwo: this.charData.chaName,
            });
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  validateAnswerField() {
    const ans = this.editAnsForm.get('answer');
    let formRawVal = this.editAnsForm.getRawValue();
    if (this.charData.infoDataType == "I") {
      if (!this.isInt(formRawVal.answer)) {
        this.alertService.error("Answer should be integer")
        return false;
      }
    } else if (this.charData.infoDataType == "E") {
      if (!this.isFloat(formRawVal.answer)) {
        this.alertService.error("Answer should be Decimal")
        return false;
      }
    } else if (this.charData.infoDataType == "D") {
      if (!Date.parse(formRawVal.answer)) {
        this.alertService.error("Answer should be date type.")
        return false;
      } else {
        if (!moment(formRawVal.answer, 'DD/MM/YYYY', true).isValid()) {
          this.alertService.error("Date format should be DD/MM/YYYY.")
          return false;
        }
      }
    } else if (this.charData.chaType == "F") {
      if (formRawVal.answer != this.answerVal) {
        this.alertService.error("You must select one of the listed items for a Fixed Condition characteristic.");
        return false
      }
    }

    return true
  }

  setAnsValue(val) {
    let tempval: any;
    if (this.charData.infoDataType == "D") {
      tempval = this.dateFormate2(val)
    } else {
      tempval = val
    }

    this.editAnsForm.patchValue({
      answer: tempval
    })
  }


  dateFormate2(value) {
    if (value) {
      return `${this.helperService.zeorBeforeSingleDigit(value.day)}/${this.helperService.zeorBeforeSingleDigit(value.month)}/${value.year}`
    } else {
      return '';
    }
  }

  isInt(n) {
    const number = parseInt(n)
    return Number(n) === number && number % 1 === 0;
  }

  isFloat(n) {
    const float = parseFloat(n);
    return Number(n) === float && float % 1 !== 0;
  }

  dateStringYMD(val) {
    const splitVal = val.split("/");
    return splitVal[2] + "" + splitVal[1] + "" + splitVal[0];
  }



}
